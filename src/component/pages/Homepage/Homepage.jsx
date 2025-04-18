import Aside from './Aside'
import './Homepage.css'
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import { useEffect, useState } from 'react';
import InfoAside from './InfoAside';
import RemoveIcon from '@mui/icons-material/Remove';
import Audio from './Audio';
import Header from '../../Header';
export default function Homepage() {
  const [infoAside, setInfoAside] = useState('')
  const typeInfoAside = (type) => {
    if (type === 'open-aside') {
      setInfoAside(type)
    } else {
      setInfoAside('')
    }
  }
  return (
    <div className='homepage-container'>
      <div className="header">
        <Header/>
      </div>
      <div className="aside-collection-grid">
        <Aside openInfo={typeInfoAside} />
      </div>
      <div className="main-content">
        <div className="banner-container">
          <img src="https://t4.ftcdn.net/jpg/04/91/09/71/360_F_491097109_NbqFULEQiM3V1VmO5suiDEEHDPrkkNCv.jpg" alt="banner" />
          <div className="stop-show">
            <div className="choose-stop">
              <p>Don't show me again</p>
              <RemoveIcon />
            </div>
          </div>
        </div>
        <div className="recently-container">
          <p className="title-text">Recently played</p>
          <div className="music-list-container">
            <div className="music-item">
              <div className="left-music-item">
                <img src="https://bloganchoi.com/wp-content/uploads/2021/12/chill-la-gi-nghe-nhac-chill-4.jpg" alt="ảnh cover nhạc" />
                <b>Last month on years</b>
              </div>
              <div className="right-icon">
                <div className="playing-icon">
                  <GraphicEqIcon />
                </div>
                <div className="play-icon">
                  <span onClick={() => setInfoAside('open-aside')} className="play-btn"><PlayArrowIcon /></span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="suggest-container">
          <div className="left-suggest">
            <div className="title-suggest">
              <img src="https://i1.sndcdn.com/artworks-dpYHKm6svOv41CWl-fOxNrA-t500x500.jpg" alt="avt" />
              <div className="message-name">
                <p>New release from Something</p>
                <b className='title-text'>Lời nói</b>
              </div>
            </div>
            <div className="new-music-item">
              <img src="https://bloganchoi.com/wp-content/uploads/2021/12/chill-la-gi-nghe-nhac-chill-4.jpg" alt="ảnh cover nhạc" />
              <div className="info-music">
                <p className="name-musician">Something o followed</p>
                <b className="name-music title-text">Lời nói</b>
                <p className="detail-music">"Lời Nhắn" của Quyếch là một bài hát sâu lắng, thể hiện những tâm tư và cảm xúc chân thật trong cuộc sống.
                  Với giai điệu nhẹ nhàng và lời hát giàu ý nghĩa, bài hát như một lời tâm tình, chạm đến trái tim người nghe và tạo ra sự đồng cảm mạnh mẽ.
                  Đây là một tác phẩm đáng...</p>
                <div className="button-section">
                  <span onClick={() => setInfoAside('open-aside')} className="play-btn"><PlayArrowIcon /></span><span className="add-btn"><ControlPointIcon /></span>
                </div>
              </div>
            </div>
          </div>
          <div className="right-suggest">
            <div className="title-suggest">
              <b className='title-text'>Made for Something</b>
              <p className='show-more'>Show more</p>
            </div>
            <div className="music-item-list">
              <div className="music-item">
                <img src="https://bloganchoi.com/wp-content/uploads/2021/12/chill-la-gi-nghe-nhac-chill-4.jpg" alt="ảnh cover nhạc" />
                <div className="info-music-item">
                  <h4>Morning</h4>
                  <p>From Something, TheFlop</p>
                  <p>+99 more</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="trending-container">
          <div className="title-trending">
            <b className='title-text'>Top Trending</b>
            <p className='show-more'>Show more</p>
          </div>
          <div className="music-list-container">
            <div onClick={() => setInfoAside('open-aside')} className="music-item">
              <img src="https://bloganchoi.com/wp-content/uploads/2021/12/chill-la-gi-nghe-nhac-chill-4.jpg" alt="ảnh cover nhạc" />
              <div className="info-music">
                <b>Last month on years</b>
                <p>Something</p>
                <p>Idk what is that </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={`info-aside-grid ${infoAside}`}>
        <InfoAside closeInfo={typeInfoAside} />
      </div>
      <div className="audio-grid">
        <Audio/>
      </div>
    </div>
  )
}
