import React from 'react';
import './Audio.css';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';
import PhonelinkIcon from '@mui/icons-material/Phonelink';
import PauseIcon from '@mui/icons-material/Pause';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import CropFreeIcon from '@mui/icons-material/CropFree';
import AddToFavBtn from '../../PlayButton/AddToFavButton'; // Using your button component

const Audio = ({
    trackData,
    isPlaying,
    currentTime,
    duration,
    volumeLevel,
    isMuted,
    shuffle,
    repeatMode,
    onPlayPauseClick,
    onSeek,
    onVolumeChange,
    toggleMute,
    nextTrack,
    previousTrack,
    toggleShuffle,
    cycleRepeatMode,
    onOpenInfoAside, // Prop from Homepage
    onAddToLibraryClick, // Specific handler from Homepage for the current track
    currentTrackIsInLibrary // Boolean from Homepage
}) => {

    const formatDuration = (time) => {
        if (isNaN(time) || time === Infinity || time < 0) return "0:00";
        const minute = Math.floor(time / 60);
        const second = Math.floor(time % 60);
        const formatSecond = second.toString().padStart(2, "0");
        return `${minute}:${formatSecond}`;
    };

    const thumbPercent = duration && duration > 0 ? (currentTime / duration) * 100 : 0;

    const handleAddToLibrary = (e) => {
        if (trackData && onAddToLibraryClick) {
            e.stopPropagation();
            onAddToLibraryClick(trackData, 'music');
        }
    };

    const handleOpenInfo = (e) => {
        if (trackData && onOpenInfoAside) {
            e.stopPropagation();
            onOpenInfoAside(); // Homepage's openInfoAside expects the track, which is currentTrack in player
        }
    }

    return (
        <div className="audio-container">
            <div className="audio-info">
                <img
                    src={trackData?.cover_image || "/SonifyIcon.png"}
                    alt={trackData?.title || "No track"}
                    onClick={handleOpenInfo} // Make cover clickable to open info aside
                    style={{ cursor: trackData ? 'pointer' : 'default' }}
                />
                <div className="info-music">
                    <p className="name-music">{trackData?.title || "No track selected"}</p>
                    <p className="musician">{trackData?.primary_artist_name || "Unknown"}</p>
                </div>
                {trackData && onAddToLibraryClick && (
                     <div style={{ marginLeft: '10px' }}> {/* Wrapper for consistent styling/spacing */}
                        <AddToFavBtn
                            onClickHandler={handleAddToLibrary}
                            isInLibraryState={currentTrackIsInLibrary}
                        />
                    </div>
                )}
            </div>
            <div className="playback-control">
                {/* ... Your existing playback controls ... */}
                 <div className="button-section">
                    <span onClick={toggleShuffle} className={shuffle ? 'shuffle active' : 'shuffle'}>
                        <ShuffleIcon />
                    </span>
                    <span onClick={previousTrack} className="previous">
                        <SkipPreviousIcon />
                    </span>
                    <span onClick={onPlayPauseClick} className="play">
                        {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                    </span>
                    <span onClick={nextTrack} className="next">
                        <SkipNextIcon />
                    </span>
                    <span onClick={cycleRepeatMode} className={`repeat ${repeatMode === 'none' ? '' : 'active'}`}>
                        <AllInclusiveIcon />
                    </span>
                </div>
                <div className="music-play-section">
                    <div className="time-music">
                        <p className='time-played'>{formatDuration(currentTime)}</p>
                        <p className='max-time'>{formatDuration(duration)}</p>
                    </div>
                    <input
                        style={{ "--thumb-percent": `${thumbPercent}%` }}
                        type="range" name="time" id="time" min="0"
                        max={duration || 0} // Ensure max is not NaN
                        value={currentTime || 0} // Ensure value is not NaN
                        onChange={(e) => onSeek(parseFloat(e.target.value))}
                        className='audio-range'
                        disabled={!trackData}
                    />
                </div>
            </div>
            <div className="additional-control">
                {/* ... Your existing additional controls ... */}
                 <span className="device"><PhonelinkIcon /></span>
                <span className="volume" onClick={toggleMute}><VolumeUpIcon /></span>
                <input
                    style={{ "--sound-percent": `${volumeLevel * 100}%` }}
                    type="range" name='volume' id='volume' min={0} max={1} step={0.01}
                    value={volumeLevel}
                    onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                    className='volumn-range'
                />
                <span className="zoom"><CropFreeIcon /></span>
            </div>
        </div>
    );
};

export default Audio;