import React, { useRef, useState } from 'react'
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
export default function Audio() {
  const [musicButton, setMusicButton] = useState([])
  const [isPlay, setIsPlay] = useState(true)
  const musicButtonConfig = [
    { type: "random", Icon: ShuffleIcon },
    { type: "previous", Icon: SkipPreviousIcon },
    { type: "play", Icon: PlayArrowIcon },
    { type: "next", Icon: SkipNextIcon },
    { type: "loop", Icon: AllInclusiveIcon },
  ]
  const SelectMusicButton = (button) => {
    if (button == 'play') {
      setIsPlay(p => !p)
    }
    setMusicButton(pre => pre.includes(button) ? pre.filter(item => item !== button) : [...pre, button])
  }
  const countRef = useRef(0)
  console.log(countRef)

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
            <p className='time-played'>0:10</p>
            <p className='max-time'>4:00</p>
          </div>
          <input type="range" name="time" id="time" min={0} max={200} value={10} className='audio-range' />
        </div>
      </div>
      <div className="additional-control">
        <span className="device"><PhonelinkIcon /></span>
        <span className="volume"><VolumeUpIcon /></span>
        <input type="range" name='volume' id='volumn' min={0} max={200} value={10} className='volumn-range' />
        <span className="zoom"><CropFreeIcon /></span>
        <span class="material-symbols-rounded">
          pip
        </span>
      </div>
    </div>
  )
}
