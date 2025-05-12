import React from 'react'
import "./MusicItem.css"

import PlayButton from '../PlayButton/PlayButton'

function MusicItem({
    coverImage,
    title="Sonify",
    contributors=["Sonify Record"],
    widthSize="170px",
    onPlayClick=()=>{},
}) {
  return (
    <div className='n-music-item' style={{width:widthSize}}>
        <div className="music-cover-wrapper">
            <img src={coverImage ? coverImage : "/SonifyIcon.png"} alt="" className='music-cover'/>
            <div className="overlay">
                <PlayButton onclick={()=>onPlayClick()}/>
            </div>
        </div>

        <div className="item-info">
            <div className="music-title">
                {title}
            </div>
            <div className="contributors">
                {contributors.map((e, ind)=>{
                    return(<>{ind > 0 ? ", ":""}{e}</>)
                })}
            </div>
        </div>
    </div>
  )
}

export default MusicItem