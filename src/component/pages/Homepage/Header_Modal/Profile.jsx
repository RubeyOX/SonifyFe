import React from 'react'
import './Profile.css'
import ArrowCircleLeftIcon from '@mui/icons-material/ArrowCircleLeft';
import TopArtist from '../Item-component/TopArtist';
import AlbumCollection from '../Item-component/AlbumCollection';
export default function Profile({ closeModal }) {
    return (
        <div className="profile-layout">
            <div className="profile-container">
                <span className='close-icon' onClick={() => closeModal('')}><ArrowCircleLeftIcon /></span>
                <div className="user-info">
                    <img src="https://i1.sndcdn.com/artworks-dpYHKm6svOv41CWl-fOxNrA-t500x500.jpg" alt="avt" />
                    <b>Something</b>
                    <p>"Nothing here. IT NOTHING"</p>
                </div>
                <div className="top-artist-container">
                    <h4>Top artist</h4>
                    <div className="top-artist-list">
                        <TopArtist />
                    </div>
                </div>
                <div className="album-collection-container">
                    <h4>Playlists</h4>
                    <div className="album-collection-list">
                        <AlbumCollection/>
                    </div>
                </div>
            </div>
        </div>
    )
}
