// src/components/Items/AlbumItem.jsx
import React from 'react';
import './PlaylistItem.css'; // Assuming a shared or specific CSS

const AlbumItem = ({ coverImage, title, artistName, onAlbumClick, onContextMenuOpen }) => {
    return (
        <div className="item-card album-item" onClick={onAlbumClick} onContextMenu={onContextMenuOpen}>
            <img src={coverImage || '/SonifyIcon.png'} alt={title} className="item-cover-image" />
            <div className="item-info">
                <p className="item-title">{title}</p>
                <p className="item-contributors">{artistName}</p>
            </div>
        </div>
    );
};
export default AlbumItem;
