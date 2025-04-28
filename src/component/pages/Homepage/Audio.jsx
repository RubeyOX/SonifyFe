import React, { useEffect, useRef, useState } from 'react'
import './Audio.css'
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
export default function Audio({ audioSrc }) {
  const audioRef = useRef(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [musicButton, setMusicButton] = useState([])
  const [isPlay, setIsPlay] = useState(true)
  const [volume,setVolume]=useState(100)
  const thumbPercent = duration ? (currentTime / duration) * 100 : 0
  const musicButtonConfig = [
    { type: "random", Icon: ShuffleIcon },
    { type: "previous", Icon: SkipPreviousIcon },
    { type: "play", Icon: PlayArrowIcon },
    { type: "next", Icon: SkipNextIcon },
    { type: "loop", Icon: AllInclusiveIcon },
  ]
  const SelectMusicButton = (button) => {
    if (button == 'play') {
      setIsPlay(play => !play)
      handlePlayPause()
    }
    setMusicButton(pre => pre.includes(button) ? pre.filter(item => item !== button) : [...pre, button])
  }

  const handleSeek = (e) => {
    audioRef.current.currentTime = e.target.value
    setCurrentTime(e.target.value)
  }

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime)
    setDuration(audioRef.current.duration)
  }
  const handlePlayPause = () => {
    if (!isPlaying) {
      audioRef.current.play()
      setIsPlaying(true)
    } else {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }
  const handleChangeVolumn = (e) => {
    const newVolume=e.target.value / 100;
    setVolume(e.target.value)
    if(audioRef.current){
      audioRef.current.volume=newVolume
    }
  }
  function formatDuration(time) {
    const minute = Math.floor(time / 60)
    const second = Math.floor(time % 60)
    const formatSecond = second.toString().padStart(2, "0")
    return `${minute}:${formatSecond}`
  }
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener("timeupdate", handleTimeUpdate)
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("timeupdate", handleTimeUpdate)
      }
    }
  }, [])

  return (
    <div className="audio-container">
      <div className="audio-info">
        <img src="https://bloganchoi.com/wp-content/uploads/2021/12/chill-la-gi-nghe-nhac-chill-4.jpg" alt="cover image" />
        <div className="info-music">
          <p className="name-music">Lời nói</p>
          <p className="musician">Something</p>
        </div>
        <span className="add"><AddCircleOutlineIcon /></span>
      </div>
      <div className="playback-control">
        <div className="button-section">
          {musicButtonConfig.map(({ type, Icon }) => {
            return (
              <span key={type} onClick={() => SelectMusicButton(type)} className={musicButton.includes(type) ? `${type} active` : `${type}`}>
                {type == 'play' ? (isPlay ? <PlayArrowIcon /> : <PauseIcon />) :
                  <Icon />
                }
              </span>
            )
          })}
        </div>
        <div className="music-play-section">
          <div className="time-music">
            <p className='time-played'>{formatDuration(currentTime)}</p>
            <p className='max-time'>{formatDuration(duration)}</p>
          </div>
          <input style={{ "--thumb-percent": `${thumbPercent}%` }}
            type="range" name="time" id="time" min="0" max={duration} value={currentTime} onChange={handleSeek} className='audio-range' />
          <audio ref={audioRef} src={audioSrc}></audio>
        </div>
      </div>
      <div className="additional-control">
        <span className="device"><PhonelinkIcon /></span>
        <span className="volume"><VolumeUpIcon /></span>
        <input style={{"--sound-percent": `${volume}%`}}
        type="range" name='volume' id='volume' min={0} max={100} value={volume} onChange={handleChangeVolumn} className='volumn-range' />
        <span className="zoom"><CropFreeIcon /></span>
        <span className="material-symbols-rounded">
          pip
        </span>
      </div>
    </div>
  )
}
