import React from 'react'
import "./PlaylistItem.css"

function PlaylistItem({
    coverImage,
    title="Sonify",
    contributors=["Sonify Record"],
    widthSize="170px"
}) {
  return (
    <div className='n-playlist-item' style={{width:widthSize}}>
        <img src={coverImage ? coverImage : "/SonifyIcon.png"} alt="" className='playlist-cover'/>
        <div className="item-info">
            <div className="playlist-title">
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

export default PlaylistItem