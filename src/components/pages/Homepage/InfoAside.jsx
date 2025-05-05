import React from 'react'
import './InfoAside.css'
import ListIcon from '@mui/icons-material/List';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
export default function InfoAside({ closeInfo }) {
    return (
        <div className='info-aside'>
            <div onClick={() => closeInfo('')} className="close-info"><ExitToAppIcon />
                <p>Something</p>
            </div>
            <img src="https://bloganchoi.com/wp-content/uploads/2021/12/chill-la-gi-nghe-nhac-chill-4.jpg" alt="ảnh cover nhạc" />
            <div className="nameInfo-container">
                <div className="left-name">
                    <h3>Last month on years</h3>
                    <p>Something</p>
                </div>
                <ControlPointIcon />
            </div>
            <div className="songstory-container">
                <h4>Song's story</h4>
                <p>This Artist is very lazy, they haven't wrote anything about this song here yet.</p>
            </div>
            <div className="about-artist-container">
                <h4>About the main artist</h4>
                <div className="profile-header">
                    <div className="left-profile">
                        <img src="https://i1.sndcdn.com/artworks-dpYHKm6svOv41CWl-fOxNrA-t500x500.jpg" alt="avt" />
                        <div className="name-artist">
                            <h5>Something</h5>
                            <p>Singer,writer</p>
                        </div>
                    </div>
                    <div className="right-profile">
                        <span className='follower'>Follow +</span>
                        <p>1M+ Montly listeners</p>
                    </div>
                </div>
                <div className="introduce">
                    <h5>Introduction</h5>
                    <p>This Artist is very lazy, they haven't wrote anything about herself here yet.</p>
                </div>
            </div>
            <div className="credit-container">
                <h5>Credits</h5>
                <div className="artist-item-list">
                    <div className="artist-item">
                        <div className="left-artist">
                            <h5>Mer</h5>
                            <p>Main Artist</p>
                        </div>
                        <span className='follower'>Follow +</span>
                    </div>
                </div>
            </div>
            <div className="lyrics-container">
                <h5>Lyrics</h5>
                <div className="lyrics-list">
                    <p>Past Line</p>
                    <h4>Previous Line</h4>
                    <h3>Line</h3>
                    <h4>Next Line</h4>
                    <p>Incomming Line</p>
                </div>
            </div>
            <div className="next-container">
                <h5>Next in queue</h5>
                <div className="next-music">
                    <div className="left-music">
                        <img src="https://bloganchoi.com/wp-content/uploads/2021/12/chill-la-gi-nghe-nhac-chill-4.jpg" alt="ảnh cover nhạc" />
                        <div className="info-music">
                            <h5>Lời nói</h5>
                            <p>Something</p>
                        </div>
                    </div>
                    <ListIcon />
                </div>
            </div>
        </div>
    )
}
