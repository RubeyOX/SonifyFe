
// src/components/Items/ArtistItem.jsx
import React from 'react';
import './PlaylistItem.css'; // Assuming a shared or specific CSS

const ArtistItem = ({ profileImage, name, onArtistClick, onContextMenuOpen }) => {
    return (
        <div className="item-card artist-item" onClick={onArtistClick} onContextMenu={onContextMenuOpen}>
            <img src={profileImage || '/default-artist.png'} alt={name} className="item-cover-image artist-profile-image" /> {/* Add styling for round artist image */}
            <div className="item-info">
                <p className="item-title">{name}</p>
            </div>
        </div>
    );
};
export default ArtistItem;