// src/hooks/useMusicPlayer.js
import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "../../utils/AuthenticationUtils.jsx";

const AUDIO_MIME_CODEC = "audio/mpeg";

const useMusicPlayer = () => {
  const { token: authToken } = useAuth();

  // --- Core Player State ---
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(
    () => parseFloat(localStorage.getItem("sonifyPlayerVolume")) || 1
  );
  const [isMuted, setIsMuted] = useState(
    () => localStorage.getItem("sonifyPlayerMuted") === "true"
  );
  const [shuffle, setShuffle] = useState(
    () => localStorage.getItem("sonifyPlayerShuffle") === "true"
  );
  const [repeatMode, setRepeatMode] = useState(
    () => localStorage.getItem("sonifyPlayerRepeatMode") || "none"
  );
  const [queue, setQueue] = useState(
    () => JSON.parse(localStorage.getItem("sonifyPlayerQueue")) || []
  );
  const [currentQueueIndex, setCurrentQueueIndex] = useState(
    () => parseInt(localStorage.getItem("sonifyPlayerQueueIndex")) || -1
  );

  // --- MSE & Loading State ---
  const [isPlayerElementReady, setIsPlayerElementReady] = useState(false);
  const [isLoadingTrack, setIsLoadingTrack] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [streamError, setStreamError] = useState(null);

  // --- UI State ---
  const [isInfoAsideOpen, setIsInfoAsideOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    item: null,
    itemType: null,
    actions: [],
  });

  // --- Refs ---
  const audioContextRef = useRef(null);
  const audioElementRef = useRef(null);
  const gainNodeRef = useRef(null);
  const mediaSourceRef = useRef(null);
  const sourceBufferRef = useRef(null);
  const fetchAbortControllerRef = useRef(null);
  const pendingTrackLoadRef = useRef(null);
  const shouldAutoplayNextRef = useRef(false);

  // --- Refs for Event Handler Callbacks (These MUST be defined before the main useEffect that uses them) ---
  const onLoadedMetadataRef = useRef(() => {});
  const onTimeUpdateRef = useRef(() => {});
  const onEndedRef = useRef(() => {}); // <<< DEFINED HERE
  const onErrorRef = useRef(() => {});
  const onPlayRef = useRef(() => {});
  const onPauseRef = useRef(() => {});
  const onSeekingRef = useRef(() => {});
  const onSeekedRef = useRef(() => {});
  const onWaitingRef = useRef(() => {});
  const onPlayingRef = useRef(() => {});
  const onCanPlayRef = useRef(() => {});

  // --- Event Handler Implementations (useCallback for memoization) ---
  const handleLoadedMetadataImpl = useCallback(() => {
    if (audioElementRef.current) {
      const newDuration = audioElementRef.current.duration;
      if (isFinite(newDuration) && newDuration > 0) setDuration(newDuration);
    }
  }, []);

  const handleTimeUpdateImpl = useCallback(() => {
    if (audioElementRef.current && !audioElementRef.current.seeking) {
      setCurrentTime(audioElementRef.current.currentTime);
      const newDuration = audioElementRef.current.duration;
      if (duration <= 0 && isFinite(newDuration) && newDuration > 0)
        setDuration(newDuration);
    }
  }, [duration]);

  const handlePlayImpl = useCallback(() => setIsPlaying(true), []);
  const handlePauseImpl = useCallback(() => setIsPlaying(false), []);
  const handleSeekingImpl = useCallback(() => {}, []);
  const handleSeekedImpl = useCallback(() => {
    if (audioElementRef.current)
      setCurrentTime(audioElementRef.current.currentTime);
  }, []);
  const handleWaitingImpl = useCallback(() => setIsBuffering(true), []);
  const handlePlayingImpl = useCallback(() => {
    setIsPlaying(true);
    setIsBuffering(false);
  }, []);
  const handleCanPlayImpl = useCallback(() => {
    setIsBuffering(false);
    if (shouldAutoplayNextRef.current && audioElementRef.current) {
      audioElementRef.current
        .play()
        .catch((e) => console.error("Autoplay failed in canplay:", e));
      shouldAutoplayNextRef.current = false;
    }
  }, []);
  const handleAudioErrorImpl = useCallback((event) => {
    const error = event.target?.error;
    console.error("Audio Element Error:", error || event);
    setStreamError(
      error ? `Code ${error.code}: ${error.message}` : "Unknown player error"
    );
    setIsPlaying(false);
    setIsLoadingTrack(false);
    setIsBuffering(false);
  }, []);

  // --- Update refs with the latest handler implementations ---
  useEffect(() => {
    onLoadedMetadataRef.current = handleLoadedMetadataImpl;
  }, [handleLoadedMetadataImpl]);
  useEffect(() => {
    onTimeUpdateRef.current = handleTimeUpdateImpl;
  }, [handleTimeUpdateImpl]);
  useEffect(() => {
    onErrorRef.current = handleAudioErrorImpl;
  }, [handleAudioErrorImpl]);
  useEffect(() => {
    onPlayRef.current = handlePlayImpl;
  }, [handlePlayImpl]);
  useEffect(() => {
    onPauseRef.current = handlePauseImpl;
  }, [handlePauseImpl]);
  useEffect(() => {
    onSeekingRef.current = handleSeekingImpl;
  }, [handleSeekingImpl]);
  useEffect(() => {
    onSeekedRef.current = handleSeekedImpl;
  }, [handleSeekedImpl]);
  useEffect(() => {
    onWaitingRef.current = handleWaitingImpl;
  }, [handleWaitingImpl]);
  useEffect(() => {
    onPlayingRef.current = handlePlayingImpl;
  }, [handlePlayingImpl]);
  useEffect(() => {
    onCanPlayRef.current = handleCanPlayImpl;
  }, [handleCanPlayImpl]);

  // --- MSE and Playback Logic ---
  const cleanupMseAndAudio = useCallback((resetPlayerState = false) => {
    if (fetchAbortControllerRef.current) {
      fetchAbortControllerRef.current.abort("cleanup");
      fetchAbortControllerRef.current = null;
    }
    const ms = mediaSourceRef.current;
    if (ms) {
      ms.onsourceopen = null;
      ms.onsourceended = null;
      ms.onsourceclose = null;
      ms.onerror = null;
      if (ms.readyState === "open" && sourceBufferRef.current) {
        try {
          if (ms.sourceBuffers.length > 0 && !sourceBufferRef.current.updating)
            ms.removeSourceBuffer(sourceBufferRef.current);
        } catch (e) {
          console.error("Error removing SourceBuffer:", e);
        }
      }
      mediaSourceRef.current = null;
    }
    sourceBufferRef.current = null;
    if (audioElementRef.current) {
      const audio = audioElementRef.current;
      if (!audio.paused) audio.pause();
      const oldSrc = audio.getAttribute("src");
      if (oldSrc && oldSrc.startsWith("blob:")) URL.revokeObjectURL(oldSrc);
      audio.removeAttribute("src");
      audio.load();
    }
    setIsLoadingTrack(false);
    setIsBuffering(false);
    if (resetPlayerState) {
      setCurrentTrack(null);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setCurrentQueueIndex(-1);
    }
  }, []);

  const initializeMseAndLoadTrack = useCallback(
    async (trackToLoad, autoplay) => {
      if (
        !trackToLoad?.fullPlaybackUrl ||
        !authToken ||
        !audioElementRef.current
      ) {
        setStreamError("Player not ready or track/auth invalid.");
        cleanupMseAndAudio(true);
        return;
      }
      if (
        !window.MediaSource ||
        !MediaSource.isTypeSupported(AUDIO_MIME_CODEC)
      ) {
        setStreamError("MediaSource or codec not supported.");
        cleanupMseAndAudio(true);
        return;
      }
      console.log(
        `Initialize MSE: ${trackToLoad.title}, Autoplay: ${autoplay}`
      );
      cleanupMseAndAudio();
      setIsLoadingTrack(true);
      setStreamError(null);
      setDuration(0);
      setCurrentTime(0);
      pendingTrackLoadRef.current = { track: trackToLoad, autoplay: autoplay };

      const mediaSource = new MediaSource();
      mediaSourceRef.current = mediaSource;
      const audioSrc = URL.createObjectURL(mediaSource);
      audioElementRef.current.src = audioSrc;

      mediaSource.onsourceopen = async () => {
        console.log("MediaSource opened for", trackToLoad.title);
        URL.revokeObjectURL(audioSrc);
        if (
          pendingTrackLoadRef.current?.track?._id !== trackToLoad._id ||
          mediaSource !== mediaSourceRef.current
        ) {
          if (mediaSource.readyState === "open")
            try {
              mediaSource.endOfStream("aborted");
            } catch (e) {}
          return;
        }
        try {
          const sourceBuffer = mediaSource.addSourceBuffer(AUDIO_MIME_CODEC);
          sourceBufferRef.current = sourceBuffer;
          let appending = false;
          const appendNextChunk = async (reader, signal) => {
            if (signal.aborted || !sourceBufferRef.current) {
              // Added check for sourceBufferRef
              if (mediaSource.readyState === "open")
                try {
                  mediaSource.endOfStream("aborted");
                } catch (e) {}
              return;
            }
            if (sourceBufferRef.current.updating || appending) return;
            appending = true;
            try {
              const { done, value } = await reader.read();
              if (done) {
                if (
                  mediaSource.readyState === "open" &&
                  !sourceBufferRef.current.updating
                ) {
                  mediaSource.endOfStream();
                } else if (mediaSource.readyState === "open") {
                  sourceBufferRef.current.onupdateend = () => {
                    if (mediaSource.readyState === "open")
                      mediaSource.endOfStream();
                    if (sourceBufferRef.current)
                      sourceBufferRef.current.onupdateend = null;
                  };
                }
                setIsLoadingTrack(false);
                console.log(
                  "Stream finished & endOfStream called for",
                  trackToLoad.title
                );
                if (
                  pendingTrackLoadRef.current?.autoplay &&
                  audioElementRef.current
                ) {
                  audioElementRef.current
                    .play()
                    .catch((e) =>
                      console.error("Autoplay after load failed:", e)
                    );
                }
                pendingTrackLoadRef.current = null;
                return;
              }
              // Ensure sourceBufferRef is still valid before appending
              if (
                sourceBufferRef.current &&
                !sourceBufferRef.current.updating
              ) {
                sourceBufferRef.current.appendBuffer(value);
              } else if (
                sourceBufferRef.current &&
                sourceBufferRef.current.updating
              ) {
                // If it's updating, wait for onupdateend to re-trigger appendNextChunk
                // This case should be covered by the onupdateend handler setting appending = false.
              } else {
                console.warn(
                  "SourceBuffer became invalid or busy before append."
                );
              }
            } catch (err) {
              console.error(
                "Error reading/appending stream for",
                trackToLoad.title,
                err
              );
              if (!signal.aborted)
                setStreamError(`Streaming error: ${err.message}`);
              if (mediaSource.readyState === "open")
                try {
                  mediaSource.endOfStream("network");
                } catch (e) {}
              setIsLoadingTrack(false);
              pendingTrackLoadRef.current = null;
            } finally {
              // appending = false; // This is now handled by onupdateend
            }
          };
          sourceBuffer.onupdateend = () => {
            appending = false;
            if (
              fetchAbortControllerRef.current?.reader &&
              !fetchAbortControllerRef.current.signal.aborted
            ) {
              appendNextChunk(
                fetchAbortControllerRef.current.reader,
                fetchAbortControllerRef.current.signal
              );
            }
          };
          sourceBuffer.onerror = (e) => {
            console.error("SourceBuffer error for", trackToLoad.title, e);
            setStreamError("Error during buffering.");
            if (mediaSource.readyState === "open")
              try {
                mediaSource.endOfStream("decode");
              } catch (e) {}
          };
          fetchAbortControllerRef.current = new AbortController();
          const { signal } = fetchAbortControllerRef.current;
          const response = await fetch(trackToLoad.fullPlaybackUrl, {
            headers: { Authorization: `Bearer ${authToken}` },
            signal,
          });
          if (signal.aborted) return;
          if (!response.ok)
            throw new Error(`HTTP error! Status: ${response.status}`);
          if (!response.body) throw new Error("Response body is null.");
          fetchAbortControllerRef.current.reader = response.body.getReader();
          appendNextChunk(fetchAbortControllerRef.current.reader, signal);
        } catch (error) {
          console.error(
            "Error in sourceopen/fetch for",
            trackToLoad.title,
            error
          );
          if (!fetchAbortControllerRef.current?.signal.aborted)
            setStreamError(`Initialization error: ${error.message}`);
          if (mediaSource.readyState === "open")
            try {
              mediaSource.endOfStream("decode");
            } catch (e) {}
          setIsLoadingTrack(false);
          pendingTrackLoadRef.current = null;
        }
      };
      mediaSource.onsourceended = () =>
        console.log("MediaSource ended for", trackToLoad.title);
      mediaSource.onsourceclose = () =>
        console.log("MediaSource closed for", trackToLoad.title);
      mediaSource.onerror = (e) => {
        console.error("MediaSource top-level error for", trackToLoad.title, e);
        setStreamError("A critical MediaSource error occurred.");
        cleanupMseAndAudio();
        pendingTrackLoadRef.current = null;
      };
    },
    [authToken, cleanupMseAndAudio]
  );

  const setTrackAndPlay = useCallback(
    (track) => {
      if (!track?._id) return;
      if (
        currentTrack?._id === track._id &&
        audioElementRef.current?.src?.startsWith("blob:")
      ) {
        if (!isPlaying)
          audioElementRef.current
            ?.play()
            .catch((e) => console.error("Error re-playing current:", e));
        else audioElementRef.current.currentTime = 0;
        setIsInfoAsideOpen(true);
        return;
      }
      setCurrentTrack(track);
      setIsPlaying(false);
      setStreamError(null);
      setQueue((prevQueue) => {
        const existingIndex = prevQueue.findIndex((t) => t._id === track._id);
        if (existingIndex !== -1) {
          setCurrentQueueIndex(existingIndex);
          return prevQueue;
        }
        const newQueue = [
          track,
          ...prevQueue.filter((t) => t._id !== track._id),
        ];
        setCurrentQueueIndex(0);
        return newQueue;
      });
      setIsInfoAsideOpen(true);
      initializeMseAndLoadTrack(track, true);
    },
    [currentTrack, isPlaying, initializeMseAndLoadTrack]
  );

  const playAudio = useCallback(() => {
    if (!audioElementRef.current) return;
    if (currentTrack && audioElementRef.current.src?.startsWith("blob:")) {
      if (audioContextRef.current?.state === "suspended")
        audioContextRef.current
          .resume()
          .catch((e) => console.warn("AudioCtx resume failed", e));
      audioElementRef.current.play().catch((e) => {
        setStreamError(`Playback error: ${e.message}`);
        setIsPlaying(false);
      });
    } else if (currentTrack) {
      initializeMseAndLoadTrack(currentTrack, true);
    } else if (queue.length > 0 && queue[0]) {
      setTrackAndPlay(queue[0]);
    }
  }, [currentTrack, queue, initializeMseAndLoadTrack, setTrackAndPlay]);

  const pauseAudio = useCallback(() => {
    if (audioElementRef.current && !audioElementRef.current.paused)
      audioElementRef.current.pause();
  }, []);

  const playPause = useCallback(() => {
    isPlaying ? pauseAudio() : playAudio();
  }, [isPlaying, playAudio, pauseAudio]);

  const seek = useCallback(
    (time) => {
      if (
        audioElementRef.current &&
        isFinite(time) &&
        duration > 0 &&
        audioElementRef.current.seekable?.length > 0
      ) {
        const newTime = Math.max(0, Math.min(time, duration));
        audioElementRef.current.currentTime = newTime;
        setCurrentTime(newTime);
      }
    },
    [duration]
  );

  const playNextTrack = useCallback(
    (isAutoEnded = false) => {
      if (queue.length === 0) {
        if (isAutoEnded) cleanupMseAndAudio(true);
        return;
      }
      let nextIndex;
      if (shuffle) {
        if (queue.length <= 1)
          nextIndex =
            currentQueueIndex === 0 && queue.length === 1 && isAutoEnded
              ? -1
              : 0;
        else {
          do {
            nextIndex = Math.floor(Math.random() * queue.length);
          } while (nextIndex === currentQueueIndex);
        }
      } else {
        nextIndex = currentQueueIndex + 1;
      }
      if (nextIndex >= 0 && nextIndex < queue.length) {
        setTrackAndPlay(queue[nextIndex]);
      } else if (repeatMode === "all" && queue.length > 0) {
        setTrackAndPlay(queue[0]);
      } else {
        if (isAutoEnded) cleanupMseAndAudio(true);
        else {
          setCurrentTrack(null);
          setIsPlaying(false);
          setCurrentQueueIndex(-1);
          cleanupMseAndAudio();
        }
        console.log("End of queue.");
      }
    },
    [
      queue,
      currentQueueIndex,
      shuffle,
      repeatMode,
      setTrackAndPlay,
      cleanupMseAndAudio,
    ]
  );

  const playPreviousTrack = useCallback(() => {
    if (audioElementRef.current?.currentTime > 3 && !shuffle) {
      seek(0);
      if (!isPlaying) playAudio();
      return;
    }
    let prevIndex;
    if (shuffle) {
      if (queue.length <= 1) prevIndex = 0;
      else {
        do {
          prevIndex = Math.floor(Math.random() * queue.length);
        } while (prevIndex === currentQueueIndex);
      }
    } else {
      prevIndex = currentQueueIndex - 1;
    }
    if (prevIndex >= 0 && prevIndex < queue.length) {
      setTrackAndPlay(queue[prevIndex]);
    } else if (repeatMode === "all" && queue.length > 0) {
      setTrackAndPlay(queue[queue.length - 1]);
    } else {
      if (audioElementRef.current) seek(0);
      if (!isPlaying && currentTrack) playAudio();
    }
  }, [
    queue,
    currentQueueIndex,
    shuffle,
    repeatMode,
    seek,
    playAudio,
    setTrackAndPlay,
    isPlaying,
    currentTrack,
  ]);

  const handleEndedImpl = useCallback(() => {
    setIsPlaying(false);
    const currentAudioDuration = audioElementRef.current?.duration;
    if (isFinite(currentAudioDuration) && currentAudioDuration > 0)
      setCurrentTime(currentAudioDuration);
    if (repeatMode === "one" && currentTrack && audioElementRef.current) {
      audioElementRef.current.currentTime = 0;
      audioElementRef.current
        .play()
        .catch((e) => console.error("Repeat one play failed:", e));
    } else {
      playNextTrack(true);
    }
  }, [repeatMode, currentTrack, playNextTrack]);

  useEffect(() => {
    onEndedRef.current = handleEndedImpl;
  }, [handleEndedImpl]);

  // --- Main Audio Element Setup Effect (MUST BE AFTER HANDLER REFS ARE DEFINED AND UPDATED) ---
  useEffect(() => {
    const audio = new Audio();
    audioElementRef.current = audio;
    audio.crossOrigin = "anonymous";
    setIsPlayerElementReady(true);

    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) {
        const context = new Ctx();
        audioContextRef.current = context;
        const gain = context.createGain();
        gainNodeRef.current = gain;
        const source = context.createMediaElementSource(audio);
        source.connect(gain);
        gain.connect(context.destination);
        const resumeContext = () => {
          if (context.state === "suspended")
            context
              .resume()
              .catch((e) => console.warn("AudioCtx resume interact failed", e));
          document.removeEventListener("click", resumeContext, true); // Use capture: true for early catch
          document.removeEventListener("touchstart", resumeContext, true);
        };
        document.addEventListener("click", resumeContext, {
          once: true,
          capture: true,
        });
        document.addEventListener("touchstart", resumeContext, {
          once: true,
          capture: true,
        });
      }
    } catch (e) {
      console.error("Web Audio API setup failed:", e);
    }

    // Attach event listeners using the stable refs
    const attach = (evt, ref) =>
      audio.addEventListener(evt, () => ref.current && ref.current(event)); // Pass event to handler
    const detach = (evt, ref) =>
      audio.removeEventListener(evt, () => ref.current && ref.current(event));

    attach("loadedmetadata", onLoadedMetadataRef);
    attach("timeupdate", onTimeUpdateRef);
    attach("ended", onEndedRef);
    attach("error", onErrorRef);
    attach("play", onPlayRef);
    attach("pause", onPauseRef);
    attach("seeking", onSeekingRef);
    attach("seeked", onSeekedRef);
    attach("waiting", onWaitingRef);
    attach("playing", onPlayingRef);
    attach("canplay", onCanPlayRef);

    return () => {
      console.log("Cleaning up main audio element effect.");
      detach("loadedmetadata", onLoadedMetadataRef);
      detach("timeupdate", onTimeUpdateRef);
      detach("ended", onEndedRef);
      detach("error", onErrorRef);
      detach("play", onPlayRef);
      detach("pause", onPauseRef);
      detach("seeking", onSeekingRef);
      detach("seeked", onSeekedRef);
      detach("waiting", onWaitingRef);
      detach("playing", onPlayingRef);
      detach("canplay", onCanPlayRef);
      cleanupMseAndAudio(true);
      if (audioContextRef.current?.state !== "closed")
        audioContextRef.current
          ?.close()
          .catch((e) => console.warn("Err closing AudioCtx", e));
      audioElementRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // This effect runs once.

  // --- Other Effects (Volume, LocalStorage) ---
  useEffect(() => {
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.setValueAtTime(
        isMuted ? 0 : volume,
        audioContextRef.current.currentTime
      );
    } else if (audioElementRef.current) {
      audioElementRef.current.volume = volume;
      audioElementRef.current.muted = isMuted;
    }
  }, [volume, isMuted, isPlayerElementReady]);

  useEffect(() => {
    localStorage.setItem("sonifyPlayerVolume", volume.toString());
  }, [volume]);
  useEffect(() => {
    localStorage.setItem("sonifyPlayerMuted", isMuted.toString());
  }, [isMuted]);
  useEffect(() => {
    localStorage.setItem("sonifyPlayerShuffle", shuffle.toString());
  }, [shuffle]);
  useEffect(() => {
    localStorage.setItem("sonifyPlayerRepeatMode", repeatMode);
  }, [repeatMode]);
  useEffect(() => {
    if (JSON.stringify(queue) !== localStorage.getItem("sonifyPlayerQueue")) {
      localStorage.setItem("sonifyPlayerQueue", JSON.stringify(queue));
    }
  }, [queue]);
  useEffect(() => {
    localStorage.setItem(
      "sonifyPlayerQueueIndex",
      currentQueueIndex.toString()
    );
  }, [currentQueueIndex]);

  // --- UI Controls ---
  const setVolumeLevel = useCallback(
    (level) => setVolume(Math.max(0, Math.min(1, level))),
    []
  );
  const toggleMute = useCallback(() => setIsMuted((prev) => !prev), []);
  const toggleShuffle = useCallback(() => setShuffle((prev) => !prev), []);
  const cycleRepeatMode = useCallback(() => {
    setRepeatMode((prev) =>
      prev === "none" ? "all" : prev === "all" ? "one" : "none"
    );
  }, []);
  const addToQueue = useCallback((track) => {
    if (!track?._id) return;
    setQueue((prev) =>
      prev.some((t) => t._id === track._id) ? prev : [...prev, track]
    );
  }, []);
  const clearQueue = useCallback(() => {
    cleanupMseAndAudio(true);
  }, [cleanupMseAndAudio]);

  const removeFromQueue = useCallback(
    (trackId) => {
      let wasCurrentRemoved = false;
      let nextTrackToPlayIfCurrentRemoved = null;
      let newQueueAfterRemoval = queue; // Keep track of the queue state after removal

      setQueue((prevQueue) => {
        const itemIndex = prevQueue.findIndex((t) => t._id === trackId);
        if (itemIndex === -1) return prevQueue;
        const trackRemoved = prevQueue[itemIndex];
        newQueueAfterRemoval = prevQueue.filter((_, idx) => idx !== itemIndex);

        if (currentTrack && currentTrack._id === trackRemoved._id) {
          wasCurrentRemoved = true;
          if (newQueueAfterRemoval.length > 0) {
            const newPlayIndex = Math.min(
              itemIndex,
              newQueueAfterRemoval.length - 1
            );
            nextTrackToPlayIfCurrentRemoved =
              newQueueAfterRemoval[newPlayIndex];
          }
        } else if (itemIndex < currentQueueIndex) {
          setCurrentQueueIndex((prevIdx) => prevIdx - 1);
        }
        return newQueueAfterRemoval;
      });

      // Perform side effect based on flags set during state update
      if (wasCurrentRemoved) {
        if (nextTrackToPlayIfCurrentRemoved) {
          // Use a timeout to ensure setQueue has propagated before setTrackAndPlay
          setTimeout(() => setTrackAndPlay(nextTrackToPlayIfCurrentRemoved), 0);
        } else {
          setTimeout(() => cleanupMseAndAudio(true), 0); // Queue became empty
        }
      }
    },
    [
      queue,
      currentTrack,
      currentQueueIndex,
      setTrackAndPlay,
      cleanupMseAndAudio,
    ]
  ); // queue is a dep

  const openInfoAside = useCallback((track) => {
    if (track) setIsInfoAsideOpen(true);
  }, []);
  const closeInfoAside = useCallback(() => setIsInfoAsideOpen(false), []);
  const openContextMenu = useCallback(
    (event, item, actionsFromCaller = [], itemTypeFromCaller = "music") => {
      event.preventDefault();
      event.stopPropagation();
      setContextMenu({
        visible: true,
        x: event.clientX,
        y: event.clientY,
        item,
        itemType: itemTypeFromCaller,
        actions: actionsFromCaller,
      });
    },
    []
  );
  const closeContextMenu = useCallback(() => {
    setContextMenu((prev) => ({
      ...prev,
      visible: false,
      item: null,
      actions: [],
    }));
  }, []);

  return {
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
    isPlayerReady: isPlayerElementReady,
    isLoading: isLoadingTrack,
    isBuffering,
    streamError,
    isInfoAsideOpen,
    contextMenu,
    audioRef: audioElementRef,
    setTrackAndPlay,
    playPause,
    seek,
    setVolumeLevel,
    toggleMute,
    toggleShuffle,
    cycleRepeatMode,
    playNextTrack,
    playPreviousTrack,
    addToQueue,
    clearQueue,
    removeFromQueue,
    openInfoAside,
    closeInfoAside,
    openContextMenu,
    closeContextMenu,
  };
};
export default useMusicPlayer;
