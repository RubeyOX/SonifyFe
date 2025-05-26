// src/components/Items/MusicItem.jsx (or your path)
import React from 'react';
import "./MusicItem.css"; // Ensure this path is correct

import PlayButton from '../PlayButton/PlayButton';
import AddToFavBtn from '../PlayButton/AddToFavButton'; // This is your component

function MusicItem({
    item, // Pass the whole item object
    widthSize = "170px",
    onPlayClick = () => {},
    onAddToLibraryClick = () => {}, // Specific handler for adding to library
    onContextMenuOpen = () => {},
    isInLibrary = false // Boolean indicating if item is in library
}) {
  // Destructure with defaults
  const {
    cover_image,
    title = "Sonify",
    collaborators,
    primary_artist_name
  } = item || {}; // Add default empty object to prevent errors if item is undefined

  const displayContributors = collaborators?.map(c => c.name) ||
                             (primary_artist_name ? [primary_artist_name] : ["Sonify Record"]);

  // Prevent errors if item is null or undefined temporarily during loading
  if (!item) {
    return <div className='n-music-item' style={{ width: widthSize, opacity: 0.5 }} >Loading...</div>;
  }

  const handlePlay = (e) => {
    e.stopPropagation();
    onPlayClick(item);
  };

  const handleAddToLibrary = (e) => {
    e.stopPropagation();
    onAddToLibraryClick(item, 'music'); // Pass item and itemType
  };

  const handleContextMenu = (e) => {
    onContextMenuOpen(e, item, 'music'); // Assuming item is music
  };

  return (
    <div className='n-music-item' style={{ width: widthSize }} onContextMenu={handleContextMenu}>
        <div className="music-cover-wrapper" onClick={handlePlay}> {/* Make whole wrapper clickable for play */}
            <img src={cover_image || "/SonifyIcon.png"} alt={title} className='music-cover'/>
            <div className="overlay">
                <AddToFavBtn
                    onClickHandler={handleAddToLibrary}
                    isInLibraryState={isInLibrary}
                />
                <PlayButton onClick={handlePlay}/> {/* PlayButton already handles stopPropagation if needed */}
            </div>
        </div>

        <div className="item-info">
            <div className="music-title">
                {title}
            </div>
            <div className="contributors">
                {displayContributors.map((name, ind) => (
                    <React.Fragment key={ind}>
                        {ind > 0 ? ", " : ""}
                        {name}
                    </React.Fragment>
                ))}
            </div>
        </div>
    </div>
  );
}

export default MusicItem;