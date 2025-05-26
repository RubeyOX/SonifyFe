import React from 'react';
import './ContextMenu.css';

const ContextMenu = ({ isOpen, position, track, onAddToQueue, onAddToFavorites, onAddToLibrary, onClose }) => {
    if (!isOpen || !track) return null;

    const style = {
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
    };

    return (
        <div className="context-menu" style={style} onClick={onClose}> {/* Close on outside click */}
            <ul className="context-menu-items">
                <li className="context-menu-item" onClick={(e) => { e.stopPropagation(); onAddToQueue(track); }}>Add to Queue</li> {/* Stop propagation */}
                <li className="context-menu-item" onClick={(e) => { e.stopPropagation(); onAddToFavorites(track); }}>Add to Favorites</li> {/* Stop propagation */}
                <li className="context-menu-item" onClick={(e) => { e.stopPropagation(); onAddToLibrary(track); }}>Add to Library</li> {/* Stop propagation */}
            </ul>
        </div>
    );
};

export default ContextMenu;