import Aside from './Aside'
import './Homepage.css'
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import { useEffect, useState } from 'react';
import InfoAside from './InfoAside';
import RemoveIcon from '@mui/icons-material/Remove';
import Audio from './Audio';
import Header from './Header';
import CustomSlickSlider from '../../slider/CustomSlickSlider';
export default function Homepage() {
  const [infoAside, setInfoAside] = useState('')
  const typeInfoAside = (type) => {
    if (type === 'open-aside') {
      setInfoAside(type)
    } else {
      setInfoAside('')
    }
  }
  const [dataRecently, setDataRecently] = useState([{
      id: '01',
      music_cover: 'https://bloganchoi.com/wp-content/uploads/2021/12/chill-la-gi-nghe-nhac-chill-4.jpg',
      name: 'Last month in yesdgsdgdsars'
    },])
  const [dataMadefor,setDataMadefor]=useState([{
    id:'01',
    collection_cover:'https://bloganchoi.com/wp-content/uploads/2021/12/chill-la-gi-nghe-nhac-chill-4.jpg',
    name:'Morning',
    from:'Something, ThesFLop',
    more:["1","543","214","4","6"]
  }])
  const [dataTopTrending,setDataTopTrending]=useState([{
    id:'01',
    music_cover:'https://bloganchoi.com/wp-content/uploads/2021/12/chill-la-gi-nghe-nhac-chill-4.jpg',
    name:"Last on the years",
    musician:"Something"
  }])
  return (
    <div className='homepage-container'>
      <div className="header">
        <Header />
      </div>
      <div className="aside-collection-grid">
        <Aside openInfo={typeInfoAside} />
      </div>
      <div className="main-content">
        <div className="banner-container">
          <img src="https://s3-alpha-sig.figma.com/img/721d/f9e3/a28bc69c03a9d359446f6135b7caf505?Expires=1745798400&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=EQg6C~PQcHYZ5ZUvt88CmS9vvCRBP8OBSliGzq8yDqcWADDO24EMax9JaGPTCartZpTrWBA2ahY91EK3TTViW1cfPTqZVzJTu4NY1juoBsbT9ct-J8uoeuti0qRWA1g1QNxX2LSVaKICdt7PEkcObZH674Qjy0NtyPicS93eAUV6FCsShnjAikBSZfWnAnSjQRxDtBp0AEDK-wqBsAW0z2XtWqGjGOF28tKaRQN6t4dMX8~q12y4oIYVw4CyiJ9XfQhkztyGFqO5QvL94QLH00TqUYw~T2W8SYj1B4ibu-fnEmhDyGDrt2NQS9c3kZDT0zYe008fTr-34-4qk~-uzw__" alt="banner" />
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
            <CustomSlickSlider data={dataRecently} slidetoShow={6} typeCarousel={'recently'} openAside={typeInfoAside} />
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
              <CustomSlickSlider data={dataMadefor} slidetoShow={6} typeCarousel={'madefor'}/>
            </div>
          </div>
        </div>
        <div className="trending-container">
          <div className="title-trending">
            <b className='title-text'>Top Trending</b>
            <p className='show-more'>Show more</p>
          </div>
          <div className="music-list-container">
            <CustomSlickSlider data={dataTopTrending} slidetoShow={8} typeCarousel={'toptrending'}/>
          </div>
        </div>
      </div>
      <div className={`info-aside-grid ${infoAside}`}>
        <InfoAside closeInfo={typeInfoAside} />
      </div>
      <div className="audio-grid">
        <Audio audioSrc='https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' />
      </div>
    </div>
  )
}
