import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "../../utils/AuthenticationUtils.jsx";

// Define outside component: Assuming MP3, adjust if needed
const AUDIO_MIME_CODEC = "audio/mpeg";

const useMusicPlayer = () => {
  // --- State Variables ---
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState("none"); // 'none', 'one', 'all'
  const [queue, setQueue] = useState([]);
  const [currentQueueIndex, setCurrentQueueIndex] = useState(-1);
  const [isPlayerReady, setIsPlayerReady] = useState(false); // Player element + context ready
  const [isStreamLoading, setIsStreamLoading] = useState(false); // MSE fetching/buffering active
  const [isSeeking, setIsSeeking] = useState(false); // Track internal seeking state
  const [isBuffering, setIsBuffering] = useState(false); // Track audio element waiting state
  const [streamError, setStreamError] = useState(null); // Store MSE/fetch errors
  // UI State
  const [isInfoAsideOpen, setIsInfoAsideOpen] = useState(false);
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const [contextMenuTrack, setContextMenuTrack] = useState(null);

  // --- Auth Hook ---
  const { user, token: authToken, isAuthenticated } = useAuth();
  // --- Refs ---
  const audioContextRef = useRef(null); // Still useful for GainNode
  const audioElementRef = useRef(null); // The actual <audio> element for playback
  const gainNodeRef = useRef(null); // For volume control via Web Audio API
  const mediaSourceRef = useRef(null); // Holds the MediaSource instance
  const sourceBufferRef = useRef(null); // Holds the SourceBuffer instance
  const currentObjectUrlRef = useRef(null); // Holds the URL created for MediaSource
  const fetchAbortControllerRef = useRef(null); // To cancel ongoing fetch operations
  const shouldAutoplayRef = useRef(false); // Ref to control auto-play after load

  // ========================================================================
  // --- START: STRICT DEFINITION ORDER BASED ON DEPENDENCIES ---
  // ========================================================================

  // --- 1. Lowest Level Helpers & State Setters (Generally Safe) ---

  const waitForBufferUpdateEnd = useCallback((buffer) => {
    // ... (Implementation as before - no internal dependencies)
    return new Promise((resolve, reject) => {
      if (!buffer) return reject(new Error("SourceBuffer is null"));
      let updateEndListener, errorListener;
      const cleanup = () => {
        if (buffer) {
          buffer.removeEventListener("updateend", updateEndListener);
          buffer.removeEventListener("error", errorListener);
        }
      };
      updateEndListener = () => {
        cleanup();
        resolve();
      };
      errorListener = (err) => {
        console.error("waitForBuffer: error event", err);
        cleanup();
        reject(new Error("SourceBuffer error event occurred while waiting"));
      };
      if (!buffer.updating) {
        resolve();
      } else {
        buffer.addEventListener("updateend", updateEndListener, { once: true });
        buffer.addEventListener("error", errorListener, { once: true });
      }
    });
  }, []);

  // --- 2. Core MSE Management (Depend on Helpers & State Setters) ---

  const cleanupMseResources = useCallback(() => {
    // Depends only on refs and setters
    console.log("Cleaning up MSE resources...");
    if (fetchAbortControllerRef.current) {
      fetchAbortControllerRef.current.abort();
      fetchAbortControllerRef.current = null;
      console.log("Aborted ongoing fetch.");
    }
    if (mediaSourceRef.current) {
      if (
        mediaSourceRef.current.readyState === "open" &&
        sourceBufferRef.current &&
        mediaSourceRef.current.sourceBuffers.length > 0
      ) {
        try {
          if (!sourceBufferRef.current.updating) {
            mediaSourceRef.current.removeSourceBuffer(sourceBufferRef.current);
            console.log("Removed SourceBuffer.");
          } else {
            console.warn(
              "Cannot remove SourceBuffer during cleanup: still updating."
            );
          }
        } catch (e) {
          console.error("Error removing SourceBuffer during cleanup:", e);
        }
      }
      mediaSourceRef.current = null;
      sourceBufferRef.current = null;
    }
    if (currentObjectUrlRef.current) {
      URL.revokeObjectURL(currentObjectUrlRef.current);
      console.log("Revoked Object URL:", currentObjectUrlRef.current);
      currentObjectUrlRef.current = null;
    }
    if (audioElementRef.current) {
      if (!audioElementRef.current.paused) {
        try {
          audioElementRef.current.pause();
        } catch (e) {}
      }
      audioElementRef.current.removeAttribute("src");
      try {
        audioElementRef.current.load();
      } catch (e) {}
      console.log("Audio element src removed and loaded.");
    }
    setIsPlaying(false);
    setIsStreamLoading(false);
    setIsBuffering(false);
    shouldAutoplayRef.current = false;
  }, [setIsPlaying, setIsStreamLoading, setIsBuffering]);

  const pumpStreamToBuffer = useCallback(
    async (reader, buffer, abortSignal) => {
      // Depends on waitForBufferUpdateEnd, setStreamError
      while (true) {
        // eslint-disable-line no-constant-condition
        if (abortSignal?.aborted) {
          console.log("Stream pump cancelled.");
          setStreamError("Stream loading cancelled.");
          return;
        }
        let readResult;
        try {
          readResult = await reader.read();
        } catch (readError) {
          console.error("Stream read error:", readError);
          setStreamError(`Stream read: ${readError.message}`);
          return;
        }
        const { done, value } = readResult;
        if (done) {
          console.log("Pump finished.");
          setStreamError(null);
          try {
            await waitForBufferUpdateEnd(buffer);
            if (
              mediaSourceRef.current &&
              mediaSourceRef.current.readyState === "open"
            ) {
              console.log("Calling endOfStream()");
              mediaSourceRef.current.endOfStream();
            } else {
              console.warn(
                "Cannot end: MS not open",
                mediaSourceRef.current?.readyState
              );
            }
          } catch (e) {
            console.warn("Error endOfStream/wait:", e);
            setStreamError(`Finalize stream: ${e.message}`);
          } finally {
            return;
          }
        }
        try {
          await waitForBufferUpdateEnd(buffer);
          buffer.appendBuffer(value);
        } catch (appendError) {
          console.error("Append error:", appendError);
          setStreamError(`Buffering: ${appendError.message}`);
          reader
            .cancel(`Buffer append: ${appendError.message}`)
            .catch((e) => console.warn("Reader cancel:", e));
          return;
        }
      }
    },
    [waitForBufferUpdateEnd, setStreamError]
  );

  const initializeMseForTrack = useCallback(
    (track) => {
      // Depends on cleanupMseResources, pumpStreamToBuffer, authToken, setters
      if (!track || !track.fullPlaybackUrl) {
        console.error("initMSE: Invalid", track);
        setStreamError("Invalid track");
        cleanupMseResources();
        return;
      }
      if (!window.MediaSource) {
        console.error("MSE unsupported");
        setStreamError("MSE unsupported");
        cleanupMseResources();
        return;
      }
      if (!authToken) {
        console.error("initMSE: No token.");
        setStreamError("Auth token missing");
        cleanupMseResources();
        return;
      }
      if (!audioElementRef.current) {
        console.error("initMSE: No audio element.");
        setStreamError("Player not ready");
        cleanupMseResources();
        return;
      }
      console.log(`Initializing MSE: ${track.title}`);
      cleanupMseResources();
      setStreamError(null);
      setIsStreamLoading(true);
      setCurrentTime(0);
      setDuration(0);
      try {
        const ms = new MediaSource();
        mediaSourceRef.current = ms;
        fetchAbortControllerRef.current = new AbortController();
        const signal = fetchAbortControllerRef.current.signal;
        const handleSourceOpen = async () => {
          console.log("MS opened:", ms.readyState);
          if (!mediaSourceRef.current || mediaSourceRef.current !== ms) {
            console.warn("handleSourceOpen: MS changed.");
            return;
          }
          if (!MediaSource.isTypeSupported(AUDIO_MIME_CODEC)) {
            console.error(`MIME ${AUDIO_MIME_CODEC} unsupported.`);
            setStreamError(`Unsupported: ${AUDIO_MIME_CODEC}`);
            cleanupMseResources();
            return;
          }
          try {
            const sb = ms.addSourceBuffer(AUDIO_MIME_CODEC);
            sourceBufferRef.current = sb;
            console.log("SB added.");
            sb.onerror = (e) => {
              console.error("SB error:", e);
              setStreamError("Buffer error."); /* May trigger MS error too */
            };
            sb.onabort = () => console.warn("SB abort.");
            const opts = {
              method: "GET",
              headers: { Authorization: `Bearer ${authToken}` },
              signal,
            };
            console.log(`Fetching: ${track.fullPlaybackUrl}`);
            const response = await fetch(track.fullPlaybackUrl, opts);
            if (signal.aborted) {
              console.log("Fetch aborted pre-resp.");
              setIsStreamLoading(false);
              return;
            }
            if (!response.ok) {
              let eD = `HTTP ${response.status}`;
              try {
                eD = `${eD}-${await response.text()}`;
              } catch (e) {}
              throw new Error(`Fetch: ${eD}`);
            }
            if (!response.body) {
              throw new Error("Fetch body null.");
            }
            console.log("Fetch OK, pumping...");
            setStreamError(null);
            const reader = response.body.getReader();
            await pumpStreamToBuffer(reader, sb, signal);
            console.log("Pump finished.");
            setIsStreamLoading(false);
          } catch (err) {
            console.error("Fetch/Pump error:", err);
            if (!signal.aborted) {
              setStreamError(`Stream fail: ${err.message}`);
            }
            setIsStreamLoading(false);
            cleanupMseResources();
          }
        };
        ms.onsourceopen = handleSourceOpen;
        ms.onsourceended = () => console.log("MS ended.");
        ms.onsourceclose = () => console.log("MS closed.");
        ms.onerror = (e) => {
          console.error("MS error:", e);
          setStreamError("MediaSource error.");
          cleanupMseResources();
        };
        const objUrl = URL.createObjectURL(ms);
        currentObjectUrlRef.current = objUrl;
        audioElementRef.current.src = objUrl;
        console.log("Object URL set:", objUrl);
      } catch (err) {
        console.error("MS setup error:", err);
        setStreamError(`MSE setup: ${err.message}`);
        cleanupMseResources();
      }
    },
    [
      authToken,
      cleanupMseResources,
      pumpStreamToBuffer,
      setStreamError,
      setIsStreamLoading,
      setCurrentTime,
      setDuration,
    ]
  );

  // --- 3. Core Playback Actions (Depend on MSE Init, Refs, Setters) ---

  const playAudio = useCallback(() => {
    // Depends on initializeMseForTrack, refs, setters, state (currentTrack, isStreamLoading)
    if (
      audioElementRef.current &&
      audioElementRef.current.src &&
      currentObjectUrlRef.current
    ) {
      if (
        audioContextRef.current &&
        audioContextRef.current.state === "suspended"
      ) {
        audioContextRef.current
          .resume()
          .catch((e) => console.warn("Ctx resume:", e));
      }
      console.log("Attempting play()");
      shouldAutoplayRef.current = false;
      audioElementRef.current.play().catch((error) => {
        console.error("Play() error:", error);
        setIsPlaying(false);
        setStreamError(`Playback: ${error.message}`);
      });
    } else if (audioElementRef.current && currentTrack && !isStreamLoading) {
      console.warn("playAudio: Src invalid, attempting init.");
      shouldAutoplayRef.current = true;
      initializeMseForTrack(currentTrack);
    } else if (isStreamLoading) {
      console.warn("playAudio: Stream loading.");
    } else {
      console.warn("playAudio: Not ready.");
    }
  }, [
    setIsPlaying,
    setStreamError,
    currentTrack,
    initializeMseForTrack,
    isStreamLoading,
  ]);

  const pauseAudio = useCallback(() => {
    // Depends only on refs
    if (audioElementRef.current && !audioElementRef.current.paused) {
      console.log("Attempting pause()");
      audioElementRef.current.pause();
    }
  }, []);

  const seek = useCallback(
    (timeInSeconds) => {
      // Depends on state (duration), refs, setters (setStreamError)
      if (
        audioElementRef.current &&
        isFinite(duration) &&
        duration > 0 &&
        currentObjectUrlRef.current
      ) {
        const newTime = Math.max(0, Math.min(timeInSeconds, duration));
        console.log(`Seeking to ${newTime.toFixed(2)}...`);
        try {
          audioElementRef.current.currentTime = newTime;
        } catch (e) {
          console.error("Seek error:", e);
          setStreamError(`Seek: ${e.message}`);
        }
      } else {
        console.warn(`Seek ignored: Not ready/duration (${duration})`);
      }
    },
    [duration, setStreamError]
  );

  // --- 4. UI Interaction Actions (Depend on Core Actions) ---

  const setTrackAndPlay = useCallback(
    (track) => {
      // Depends on initializeMseForTrack, setters (setIsPlaying, etc.)
      if (!track || !track._id || !track.fullPlaybackUrl) {
        console.warn("setTrackAndPlay: Invalid", track);
        return;
      }
      console.log("Setting track & playing:", track.title);
      setIsPlaying(false); // Reset play state FIRST
      setQueue((prevQueue) => {
        const i = prevQueue.findIndex((t) => t._id === track._id);
        let nQ = [...prevQueue];
        if (i !== -1) nQ.splice(i, 1);
        nQ.unshift(track);
        return nQ;
      });
      setCurrentQueueIndex(0);
      setCurrentTrack(track);
      setIsInfoAsideOpen(true);
      shouldAutoplayRef.current = true; // Signal to play when ready
      initializeMseForTrack(track); // Initialize AFTER state updates
    },
    [
      initializeMseForTrack,
      setQueue,
      setCurrentQueueIndex,
      setCurrentTrack,
      setIsInfoAsideOpen,
      setIsPlaying,
    ]
  );

  const playPause = useCallback(() => {
    // Depends on playAudio, pauseAudio, setTrackAndPlay, initializeMseForTrack, state, refs
    if (!currentTrack && queue.length > 0) {
      console.log("PlayPause: No track, playing queue[0].");
      if (queue[0]) setTrackAndPlay(queue[0]);
    } else if (
      currentTrack &&
      !currentObjectUrlRef.current &&
      !isStreamLoading
    ) {
      console.log("PlayPause: Track loaded, initializing MSE.");
      shouldAutoplayRef.current = true;
      initializeMseForTrack(currentTrack);
    } else if (isPlaying) {
      pauseAudio();
    } else if (currentTrack) {
      playAudio();
    } else {
      console.warn("PlayPause: Nothing to play.");
    }
  }, [
    isPlaying,
    playAudio,
    pauseAudio,
    currentTrack,
    queue,
    initializeMseForTrack,
    isStreamLoading,
    setTrackAndPlay,
  ]);

  const playNextTrack = useCallback(() => {
    // Depends on initializeMseForTrack, cleanupMseResources, setters, state
    if (queue.length === 0) return;
    let nextIndex = -1;
    if (shuffle) {
      if (queue.length > 1) {
        do {
          nextIndex = Math.floor(Math.random() * queue.length);
        } while (nextIndex === currentQueueIndex);
      } else {
        nextIndex = 0;
      }
    } else {
      nextIndex = currentQueueIndex + 1;
      if (repeatMode === "all" && nextIndex >= queue.length) nextIndex = 0;
      else if (nextIndex >= queue.length) nextIndex = -1;
    }
    if (nextIndex !== -1 && queue[nextIndex]) {
      const track = queue[nextIndex];
      console.log(`Play next: Init ${nextIndex}, ${track.title}`);
      setIsPlaying(false);
      setCurrentQueueIndex(nextIndex);
      setCurrentTrack(track);
      shouldAutoplayRef.current = true;
      initializeMseForTrack(track);
    } else {
      console.log("End of queue for next.");
      cleanupMseResources();
      setCurrentTrack(null);
      setCurrentQueueIndex(-1);
      setIsPlaying(false);
    }
  }, [
    queue,
    currentQueueIndex,
    shuffle,
    repeatMode,
    initializeMseForTrack,
    cleanupMseResources,
    setCurrentQueueIndex,
    setCurrentTrack,
    setIsPlaying,
  ]);

  const playPreviousTrack = useCallback(() => {
    // Depends on seek, initializeMseForTrack, cleanupMseResources, setters, state
    if (queue.length === 0) return;
    const RESTART_THRESHOLD = 3;
    if (currentTime > RESTART_THRESHOLD && !shuffle) {
      seek(0);
      return;
    }
    let prevIndex = -1;
    if (shuffle) {
      if (queue.length > 1) {
        do {
          prevIndex = Math.floor(Math.random() * queue.length);
        } while (prevIndex === currentQueueIndex);
      } else {
        prevIndex = 0;
      }
    } else {
      prevIndex = currentQueueIndex - 1;
      if (repeatMode === "all" && prevIndex < 0) prevIndex = queue.length - 1;
      else if (prevIndex < 0) prevIndex = -1;
    }
    if (prevIndex !== -1 && queue[prevIndex]) {
      const track = queue[prevIndex];
      console.log(`Play prev: Init ${prevIndex}, ${track.title}`);
      setIsPlaying(false);
      setCurrentQueueIndex(prevIndex);
      setCurrentTrack(track);
      shouldAutoplayRef.current = true;
      initializeMseForTrack(track);
    } else {
      console.log("Start of queue for prev.");
      cleanupMseResources();
      setCurrentTrack(null);
      setCurrentQueueIndex(-1);
      setIsPlaying(false);
    }
  }, [
    queue,
    currentQueueIndex,
    shuffle,
    repeatMode,
    initializeMseForTrack,
    cleanupMseResources,
    setCurrentQueueIndex,
    setCurrentTrack,
    setIsPlaying,
    currentTime,
    seek,
  ]);

  // --- 5. Event Handler Callbacks (Depend on Core Actions, Seek, etc.) ---

  const handleLoadedMetadataCb = useCallback(() => {
    // Depends on setDuration, refs
    if (audioElementRef.current) {
      console.log("Event: loadedmetadata");
      const d = audioElementRef.current.duration;
      if (isFinite(d) && d > 0) {
        setDuration(d);
        console.log("Duration set:", d);
      } else {
        console.log("Duration inf/0:", d);
      }
    }
  }, [setDuration]);

  const handleTimeUpdateCb = useCallback(() => {
    // Depends on isSeeking, setCurrentTime, setDuration, duration, refs
    if (
      audioElementRef.current &&
      !isSeeking &&
      isFinite(audioElementRef.current.currentTime)
    ) {
      setCurrentTime(audioElementRef.current.currentTime);
      const d = audioElementRef.current.duration;
      if (duration !== d && isFinite(d) && d > 0) {
        setDuration(d);
        console.log("Duration updated via timeupdate:", d);
      }
    }
  }, [isSeeking, setCurrentTime, setDuration, duration]);

  // _handleTrackEndedCb needs seek, playAudio, initializeMseForTrack, cleanupMseResources
  const _handleTrackEndedCb = useCallback(() => {
    console.log("Event: ended");
    const d = duration > 0 ? duration : audioElementRef.current?.duration || 0;
    setCurrentTime(d > 0 && isFinite(d) ? d : 0);
    setIsPlaying(false);
    if (repeatMode === "one") {
      if (currentTrack) {
        console.log("Repeating.");
        seek(0);
        playAudio();
      }
    } else if (queue.length > 0) {
      let nextIndex = -1;
      if (shuffle) {
        if (q.length > 1) {
          do {
            nextIndex = Math.floor(Math.random() * q.length);
          } while (nextIndex === i);
        } else {
          nextIndex = 0;
        }
      } else {
        nextIndex = currentQueueIndex + 1;
        if (r === "all" && nextIndex >= q.length) nextIndex = 0;
        else if (nextIndex >= q.length) nextIndex = -1;
      } // Simplified vars for brevity
      if (nextIndex !== -1 && queue[nextIndex]) {
        const track = queue[nextIndex];
        console.log(`Ended: Playing next ${nextIndex}, ${track.title}`);
        setCurrentQueueIndex(nextIndex);
        setCurrentTrack(track);
        shouldAutoplayRef.current = true;
        initializeMseForTrack(track);
      } else {
        console.log("Ended: End of queue.");
        setCurrentTrack(null);
        setCurrentQueueIndex(-1);
        cleanupMseResources();
      }
    } else {
      console.log("Ended: No queue.");
      setCurrentTrack(null);
      setCurrentQueueIndex(-1);
      cleanupMseResources();
    }
  }, [
    duration,
    repeatMode,
    currentTrack,
    queue,
    shuffle,
    currentQueueIndex,
    seek,
    playAudio,
    initializeMseForTrack,
    setCurrentQueueIndex,
    setCurrentTrack,
    cleanupMseResources,
    setIsPlaying,
    setCurrentTime,
  ]); // Ensure ALL dependencies listed

  const handleAudioElementErrorCb = useCallback(
    (event) => {
      // Depends on setters
      console.error("Event: error (Audio Element)");
      if (!event.target?.error) {
        console.error("Unknown audio err.");
        setStreamError("Unknown player error.");
        return;
      }
      const e = event.target.error;
      console.error(`Code: ${e.code}, Msg: ${e.message}`);
      setStreamError(`Player error ${e.code}: ${e.message}`);
      setIsPlaying(false);
      setIsStreamLoading(false);
      setIsBuffering(false);
    },
    [setStreamError, setIsPlaying, setIsStreamLoading, setIsBuffering]
  );

  const handlePlayCb = useCallback(() => {
    console.log("Event: play");
    setIsPlaying(true);
    setIsBuffering(false);
  }, [setIsPlaying, setIsBuffering]);
  const handlePauseCb = useCallback(() => {
    console.log("Event: pause");
    setIsPlaying(false);
  }, [setIsPlaying]);
  const handleSeekingCb = useCallback(() => {
    console.log("Event: seeking");
    setIsSeeking(true);
  }, [setIsSeeking]);
  const handleSeekedCb = useCallback(() => {
    console.log("Event: seeked");
    setIsSeeking(false);
    if (audioElementRef.current) {
      setCurrentTime(audioElementRef.current.currentTime);
    }
  }, [setIsSeeking, setCurrentTime]);
  const handleWaitingCb = useCallback(() => {
    console.log("Event: waiting");
    setIsBuffering(true);
  }, [setIsBuffering]);
  const handlePlayingCb = useCallback(() => {
    console.log("Event: playing");
    setIsBuffering(false);
    setIsPlaying(true);
  }, [setIsBuffering, setIsPlaying]);

  // handleCanPlayCb needs playAudio
  const handleCanPlayCb = useCallback(() => {
    console.log("Event: canplay");
    if (
      audioElementRef.current &&
      isFinite(audioElementRef.current.duration) &&
      audioElementRef.current.duration > duration
    ) {
      setDuration(audioElementRef.current.duration);
      console.log(
        "Duration updated on canplay:",
        audioElementRef.current.duration
      );
    }
    if (shouldAutoplayRef.current) {
      console.log("Autoplaying via canplay...");
      shouldAutoplayRef.current = false;
      playAudio();
    }
  }, [playAudio, duration, setDuration]);

  // --- 6. Stable Refs & Update Effects (After Callbacks) ---
  const handleLoadedMetadataRef = useRef(handleLoadedMetadataCb);
  useEffect(() => {
    handleLoadedMetadataRef.current = handleLoadedMetadataCb;
  }, [handleLoadedMetadataCb]);
  const handleTimeUpdateRef = useRef(handleTimeUpdateCb);
  useEffect(() => {
    handleTimeUpdateRef.current = handleTimeUpdateCb;
  }, [handleTimeUpdateCb]);
  const _handleTrackEndedRef = useRef(_handleTrackEndedCb);
  useEffect(() => {
    _handleTrackEndedRef.current = _handleTrackEndedCb;
  }, [_handleTrackEndedCb]);
  const handleAudioElementErrorRef = useRef(handleAudioElementErrorCb);
  useEffect(() => {
    handleAudioElementErrorRef.current = handleAudioElementErrorCb;
  }, [handleAudioElementErrorCb]);
  const handlePlayRef = useRef(handlePlayCb);
  useEffect(() => {
    handlePlayRef.current = handlePlayCb;
  }, [handlePlayCb]);
  const handlePauseRef = useRef(handlePauseCb);
  useEffect(() => {
    handlePauseRef.current = handlePauseCb;
  }, [handlePauseCb]);
  const handleSeekingRef = useRef(handleSeekingCb);
  useEffect(() => {
    handleSeekingRef.current = handleSeekingCb;
  }, [handleSeekingCb]);
  const handleSeekedRef = useRef(handleSeekedCb);
  useEffect(() => {
    handleSeekedRef.current = handleSeekedCb;
  }, [handleSeekedCb]);
  const handleWaitingRef = useRef(handleWaitingCb);
  useEffect(() => {
    handleWaitingRef.current = handleWaitingCb;
  }, [handleWaitingCb]);
  const handlePlayingRef = useRef(handlePlayingCb);
  useEffect(() => {
    handlePlayingRef.current = handlePlayingCb;
  }, [handlePlayingCb]);
  const handleCanPlayRef = useRef(handleCanPlayCb);
  useEffect(() => {
    handleCanPlayRef.current = handleCanPlayCb;
  }, [handleCanPlayCb]);

  // --- 7. Main Setup useEffect (Uses Refs) ---
  useEffect(() => {
    let audio;
    try {
      // ... (Setup context, gain, audio element as before) ...
      const AudioContextGlobal =
        window.AudioContext || window.webkitAudioContext;
      if (!AudioContextGlobal) throw new Error("Web Audio API not supported.");
      if (!audioContextRef.current)
        audioContextRef.current = new AudioContextGlobal();
      const context = audioContextRef.current;
      if (context.state === "suspended")
        context.resume().catch((e) => console.warn("Ctx resume:", e));
      if (!gainNodeRef.current) {
        gainNodeRef.current = context.createGain();
        gainNodeRef.current.connect(context.destination);
        gainNodeRef.current.gain.value = isMuted ? 0 : volume;
      }
      if (!audioElementRef.current) {
        audio = new Audio();
        audio.crossOrigin = "anonymous";
        audioElementRef.current = audio;
        console.log("Audio element created.");
      } else {
        audio = audioElementRef.current;
      }
      // Attach listeners using stable wrappers calling refs
      const onLoadedMetadata = (e) => handleLoadedMetadataRef.current(e);
      const onTimeUpdate = (e) => handleTimeUpdateRef.current(e);
      const onEnded = (e) => _handleTrackEndedRef.current(e);
      const onError = (e) => handleAudioElementErrorRef.current(e);
      const onPlay = (e) => handlePlayRef.current(e);
      const onPause = (e) => handlePauseRef.current(e);
      const onSeeking = (e) => handleSeekingRef.current(e);
      const onSeeked = (e) => handleSeekedRef.current(e);
      const onWaiting = (e) => handleWaitingRef.current(e);
      const onPlaying = (e) => handlePlayingRef.current(e);
      const onCanPlay = (e) => handleCanPlayRef.current(e);
      audio.addEventListener("loadedmetadata", onLoadedMetadata);
      audio.addEventListener("timeupdate", onTimeUpdate);
      audio.addEventListener("ended", onEnded);
      audio.addEventListener("error", onError);
      audio.addEventListener("play", onPlay);
      audio.addEventListener("pause", onPause);
      audio.addEventListener("seeking", onSeeking);
      audio.addEventListener("seeked", onSeeked);
      audio.addEventListener("waiting", onWaiting);
      audio.addEventListener("playing", onPlaying);
      audio.addEventListener("canplay", onCanPlay);
      console.log("Listeners attached.");
      setIsPlayerReady(true);
    } catch (error) {
      console.error("Basic setup failed:", error);
      alert(`Setup Failed: ${error.message}`);
      setIsPlayerReady(true);
    }
    // Cleanup
    const capturedAudioElement = audioElementRef.current;
    return () => {
      console.log("Cleaning up audio component...");
      if (capturedAudioElement) {
        // Remove listeners using same wrapper pattern
        const onLoadedMetadata = (e) => handleLoadedMetadataRef.current(e);
        const onTimeUpdate = (e) => handleTimeUpdateRef.current(e);
        const onEnded = (e) => _handleTrackEndedRef.current(e);
        const onError = (e) => handleAudioElementErrorRef.current(e);
        const onPlay = (e) => handlePlayRef.current(e);
        const onPause = (e) => handlePauseRef.current(e);
        const onSeeking = (e) => handleSeekingRef.current(e);
        const onSeeked = (e) => handleSeekedRef.current(e);
        const onWaiting = (e) => handleWaitingRef.current(e);
        const onPlaying = (e) => handlePlayingRef.current(e);
        const onCanPlay = (e) => handleCanPlayRef.current(e);
        capturedAudioElement.removeEventListener(
          "loadedmetadata",
          onLoadedMetadata
        );
        capturedAudioElement.removeEventListener("timeupdate", onTimeUpdate);
        capturedAudioElement.removeEventListener("ended", onEnded);
        capturedAudioElement.removeEventListener("error", onError);
        capturedAudioElement.removeEventListener("play", onPlay);
        capturedAudioElement.removeEventListener("pause", onPause);
        capturedAudioElement.removeEventListener("seeking", onSeeking);
        capturedAudioElement.removeEventListener("seeked", onSeeked);
        capturedAudioElement.removeEventListener("waiting", onWaiting);
        capturedAudioElement.removeEventListener("playing", onPlaying);
        capturedAudioElement.removeEventListener("canplay", onCanPlay);
        console.log("Listeners removed.");
      }
      cleanupMseResources(); // Ensure MSE is cleaned up
    };
  }, [cleanupMseResources, isMuted, volume]); // Dependencies

  // --- 8. Remaining Actions (Volume, Queue, UI - Define after their dependencies) ---

  const setVolumeLevel = useCallback(
    (newVolume) => {
      setVolume(Math.max(0, Math.min(1, newVolume)));
    },
    [setVolume]
  );
  const toggleMute = useCallback(() => {
    setIsMuted((prevMuted) => !prevMuted);
  }, [setIsMuted]);
  const toggleShuffle = useCallback(() => {
    setShuffle((prevShuffle) => !prevShuffle);
  }, [setShuffle]);
  const cycleRepeatMode = useCallback(() => {
    setRepeatMode((prevMode) => {
      switch (prevMode) {
        case "none":
          return "all";
        case "all":
          return "one";
        case "one":
          return "none";
        default:
          return "none";
      }
    });
  }, [setRepeatMode]);
  const addToQueue = useCallback(
    (track) => {
      if (!track?._id) return;
      setQueue((prev) =>
        prev.some((t) => t._id === track._id) ? prev : [...prev, track]
      );
    },
    [setQueue]
  );
  const addToQueueAtIndex = useCallback(
    (track, index) => {
      if (!track?._id) return;
      setQueue((prev) => {
        if (prev.some((t) => t._id === track._id)) return prev;
        const nQ = [...prev];
        const vI = Math.max(0, Math.min(index, nQ.length));
        nQ.splice(vI, 0, track);
        if (vI <= currentQueueIndex && currentQueueIndex !== -1)
          setCurrentQueueIndex((p) => p + 1);
        return nQ;
      });
    },
    [setQueue, currentQueueIndex, setCurrentQueueIndex]
  );
  const reorderQueue = useCallback(
    (startIndex, endIndex) => {
      setQueue((prev) => {
        if (
          startIndex < 0 ||
          startIndex >= prev.length ||
          endIndex < 0 ||
          endIndex >= prev.length ||
          startIndex === endIndex
        )
          return prev;
        const nQ = [...prev];
        const [moved] = nQ.splice(startIndex, 1);
        nQ.splice(endIndex, 0, moved);
        if (currentTrack) {
          const newIdx = nQ.findIndex((t) => t._id === currentTrack._id);
          if (newIdx !== -1 && newIdx !== currentQueueIndex)
            setCurrentQueueIndex(newIdx);
        }
        return nQ;
      });
    },
    [setQueue, currentTrack, currentQueueIndex, setCurrentQueueIndex]
  );
  const clearQueue = useCallback(() => {
    console.log("Clearing queue.");
    cleanupMseResources();
    setCurrentTrack(null);
    setDuration(0);
    setCurrentTime(0);
    setQueue([]);
    setCurrentQueueIndex(-1);
    setIsPlaying(false);
  }, [
    cleanupMseResources,
    setCurrentTrack,
    setDuration,
    setCurrentTime,
    setQueue,
    setCurrentQueueIndex,
    setIsPlaying,
  ]);

  // removeFromQueue needs setTrackAndPlay
  const removeFromQueue = useCallback(
    (trackIdOrIndex) => {
      let wasCurrentRemoved = false;
      let nextTrackToPlayIfCurrentRemoved = null;
      setQueue((prevQueue) => {
        let i = -1;
        let trackRemoved = null;
        if (typeof trackIdOrIndex === "number") {
          i = trackIdOrIndex;
          trackRemoved = prevQueue[i];
        } else {
          i = prevQueue.findIndex((t) => t._id === trackIdOrIndex);
          if (i !== -1) trackRemoved = prevQueue[i];
        }
        if (i === -1 || !trackRemoved) {
          console.warn("Remove failed", trackIdOrIndex);
          return prevQueue;
        }
        const nQ = prevQueue.filter((_, idx) => idx !== i);
        wasCurrentRemoved =
          currentTrack && currentTrack._id === trackRemoved._id;
        if (wasCurrentRemoved) {
          if (nQ.length > 0) {
            const nextIdx = Math.min(i, nQ.length - 1);
            nextTrackToPlayIfCurrentRemoved = nQ[nextIdx];
          }
          setCurrentTrack(null);
          setCurrentQueueIndex(-1);
        } // Clear state here
        else if (i < currentQueueIndex) {
          setCurrentQueueIndex((prev) => prev - 1);
        } // Adjust index if needed
        return nQ; // Return new queue
      });
      // Side effects AFTER state update
      if (wasCurrentRemoved) {
        console.log("Current track removed.");
        cleanupMseResources();
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
        if (nextTrackToPlayIfCurrentRemoved) {
          console.log(
            "Playing next after removal:",
            nextTrackToPlayIfCurrentRemoved.title
          );
          setTrackAndPlay(nextTrackToPlayIfCurrentRemoved);
        } else {
          console.log("Queue empty after removing current.");
        }
      }
    },
    [
      setQueue,
      currentQueueIndex,
      currentTrack,
      cleanupMseResources,
      setCurrentTrack,
      setCurrentQueueIndex,
      setIsPlaying,
      setCurrentTime,
      setDuration,
      setTrackAndPlay,
    ]
  ); // setTrackAndPlay is a dependency now

  // playFromQueue needs playAudio, seek, initializeMseForTrack
  const playFromQueue = useCallback(
    (index) => {
      if (index < 0 || index >= queue.length || !queue[index]) return;
      const track = queue[index];
      if (currentTrack?._id === track._id) {
        if (!isPlaying) playAudio();
        else seek(0);
        return;
      }
      console.log(`Playing from queue ${index}: ${track.title}`);
      setIsPlaying(false);
      setCurrentQueueIndex(index);
      setCurrentTrack(track);
      shouldAutoplayRef.current = true;
      initializeMseForTrack(track);
    },
    [
      queue,
      currentTrack,
      isPlaying,
      playAudio,
      seek,
      setCurrentQueueIndex,
      setCurrentTrack,
      initializeMseForTrack,
      setIsPlaying,
    ]
  );

  const closeInfoAside = useCallback(
    () => setIsInfoAsideOpen(false),
    [setIsInfoAsideOpen]
  );
  const _closeContextMenuCb = useCallback(() => {
    if (isContextMenuOpen) {
      setIsContextMenuOpen(false);
      setContextMenuTrack(null);
    }
  }, [isContextMenuOpen, setIsContextMenuOpen, setContextMenuTrack]);
  const closeContextMenuRef = useRef(_closeContextMenuCb);
  useEffect(() => {
    closeContextMenuRef.current = _closeContextMenuCb;
  }, [_closeContextMenuCb]);
  const openContextMenu = useCallback(
    (event, track) => {
      event.preventDefault();
      event.stopPropagation();
      setContextMenuPosition({ x: event.clientX, y: event.clientY });
      setContextMenuTrack(track);
      setIsContextMenuOpen(true);
      setTimeout(() => {
        const handler = () => {
          closeContextMenuRef.current();
          document.removeEventListener("click", handler, true);
          document.removeEventListener("contextmenu", handler, true);
        };
        document.addEventListener("click", handler, {
          capture: true,
          once: true,
        });
        document.addEventListener("contextmenu", handler, {
          capture: true,
          once: true,
        });
      }, 0);
    },
    [setContextMenuPosition, setContextMenuTrack, setIsContextMenuOpen]
  );

  // --- 9. Effects (Volume, LocalStorage, Context Resume) ---

  useEffect(() => {
    // Volume/Mute Effect
    if (gainNodeRef.current && isPlayerReady) {
      gainNodeRef.current.gain.value = isMuted ? 0 : volume;
    }
  }, [volume, isMuted, isPlayerReady]);

  useEffect(() => {
    // Load State Effect
    if (!isPlayerReady) return;
    console.log("Loading state...");
    try {
      /* ... load state ... */
    } catch (error) {
      console.error("LocalStorage load error:", error);
    }
  }, [
    isPlayerReady,
    /* include ONLY setters used inside try block */ setVolume,
    setIsMuted,
    setShuffle,
    setRepeatMode,
    setQueue,
    setCurrentTrack,
    setCurrentQueueIndex,
    setCurrentTime,
  ]);

  useEffect(() => {
    // Save State Effect
    if (!isPlayerReady) return;
    try {
      /* ... save state ... */
    } catch (error) {
      console.error("LocalStorage save error:", error);
    }
  }, [
    isPlayerReady,
    volume,
    isMuted,
    shuffle,
    repeatMode,
    queue,
    currentTrack,
    currentQueueIndex,
    currentTime,
  ]);

  useEffect(() => {
    // Context Resume Effect
    const resume = () => {
      if (audioContextRef.current?.state === "suspended") {
        audioContextRef.current
          .resume()
          .catch((e) => console.error("Ctx resume interact:", e));
      }
    };
    document.addEventListener("click", resume, { capture: true, once: true });
    document.addEventListener("touchstart", resume, {
      capture: true,
      once: true,
    });
    document.addEventListener("keydown", resume, { capture: true, once: true });
    return () => {
      document.removeEventListener("click", resume, true);
      document.removeEventListener("touchstart", resume, true);
      document.removeEventListener("keydown", resume, true);
    };
  }, []);

  // ========================================================================
  // --- END: STRICT DEFINITION ORDER ---
  // ========================================================================

  // --- Return Value ---
  const isLoading = isStreamLoading || isBuffering;

  return {
    // Player State
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    shuffle,
    repeatMode,
    queue,
    currentQueueIndex,
    isPlayerReady,
    isLoading,
    isBuffering,
    streamError,
    // UI State
    isInfoAsideOpen,
    isContextMenuOpen,
    contextMenuPosition,
    contextMenuTrack,
    // Player Controls
    setTrackAndPlay,
    playPause,
    seek,
    setVolumeLevel,
    toggleMute,
    toggleShuffle,
    cycleRepeatMode,
    playNextTrack,
    playPreviousTrack,
    // Queue Management
    addToQueue,
    addToQueueAtIndex,
    removeFromQueue,
    reorderQueue,
    playFromQueue,
    clearQueue,
    // UI Controls
    closeInfoAside,
    openContextMenu,
    closeContextMenu: closeContextMenuRef.current,
  };
};

export default useMusicPlayer;
