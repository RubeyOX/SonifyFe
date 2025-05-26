import React, { useState } from 'react'
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AliceCarousel from 'react-alice-carousel';
import 'react-alice-carousel/lib/alice-carousel.css';

export default function CustomSlickSlider({ data, slidetoShow, typeCarousel, openAside }) {
    const [playingRecently, isPlayingRecently] = useState('01')
    const renderItem = {
        "recently":
            data.map((item, index) => {
                return (
                    <div className="music-item" key={index}>
                        <div className="left-music-item">
                            <img src={item.music_cover} alt="ảnh cover nhạc" draggable="false" />
                            <b>{item.name}</b>
                        </div>
                        {/* thêm xét icon */}
                        <div className="right-icon">
                            {playingRecently === item.id ?
                                <div className="playing-icon">
                                    <GraphicEqIcon />
                                </div> :
                                <div className="play-icon">
                                    <span onClick={() => openAside('open-aside')} className="play-btn"><PlayArrowIcon /></span>
                                </div>
                            }
                        </div>
                    </div>
                )
            })
        ,
        "madefor":
            data.map((item, index) => {
                return (
                    <div className="music-item" key={index}>
                        <img src={item.collection_cover} alt="ảnh cover nhạc" draggable="false" />
                        <div className="info-music-item">
                            <h4>{item.name}</h4>
                            <p>From {item.from}</p>
                            <p>+{item.more?.length ?? 0} more</p>
                        </div>
                    </div>
                )
            })
        ,
        "toptrending": data.map((item, index) => {
            return (
                <div onClick={() => openAside('open-aside')} className="music-item" key={index}>
                    <img src={item.music_cover} alt="ảnh cover nhạc" draggable="false" />
                    <div className="info-music">
                        <b>{item.name}</b>
                        <p>{item.musician}</p>
                    </div>
                </div>
            )
        })
        ,
        "topartist": data.map((item, index) => {
            return (
                <div className='top-artist-item' key={index}>
                    <img src={item.avatar} alt="avt" draggable="false" />
                    <b>{item.name}</b>
                    <p>{item.job}</p>
                </div>
            )
        })
        ,
        "playlists": data.map((item, index) => {
            return (
                <div className='album-collection-item' key={index}>
                    <img src={item.cover_img} alt="ảnh cover nhạc" draggable="false" />
                    <b>{item.name}</b>
                </div>
            )
        })
    }
    const setting = {
        mouseTracking: true,
        items: renderItem[typeCarousel],
        responsive: {
            0: { items: 1 },
            800: { items: 1 },
            1024: { items: slidetoShow },
        },
        disableDotsControls: true,
        disableButtonsControls: true,
        keyboardNavigation: false,
    }
    return (
        <>
            <AliceCarousel {...setting} />
        </>
    )
}
