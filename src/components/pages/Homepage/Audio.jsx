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

//Presentational Component - recieves control as props
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
}) => {

    const formatDuration = (time) => {
        const minute = Math.floor(time / 60);
        const second = Math.floor(time % 60);
        const formatSecond = second.toString().padStart(2, "0");
        return `${minute}:${formatSecond}`;
    };

    const thumbPercent = duration ? (currentTime / duration) * 100 : 0;

    return (
        <div className="audio-container">
            <div className="audio-info">
                <img src={trackData?.cover_image || "/SonifyIcon.png"} alt="cover image" />
                <div className="info-music">
                    <p className="name-music">{trackData?.title || "No track selected"}</p>
                    <p className="musician">{trackData?.primary_artist_name || "Unknown"}</p>
                </div>
                <span className="add"><AddCircleOutlineIcon /></span>
            </div>
            <div className="playback-control">
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
                        type="range"
                        name="time"
                        id="time"
                        min="0"
                        max={duration}
                        value={currentTime}
                        onChange={(e) => onSeek(parseFloat(e.target.value))}
                        className='audio-range'
                    />
                </div>
            </div>
            <div className="additional-control">
                <span className="device"><PhonelinkIcon /></span>
                <span className="volume" onClick={toggleMute}><VolumeUpIcon /></span>
                <input
                    style={{ "--sound-percent": `${volumeLevel * 100}%` }}
                    type="range"
                    name='volume'
                    id='volume'
                    min={0}
                    max={1}
                    step={0.01}
                    value={volumeLevel}
                    onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                    className='volumn-range'
                />
                <span className="zoom"><CropFreeIcon /></span>
                <span className="material-symbols-rounded">
                    pip
                </span>
            </div>
        </div>
    );
};

export default Audio;