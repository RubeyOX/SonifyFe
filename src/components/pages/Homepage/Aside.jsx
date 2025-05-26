// --- START OF FILE Aside.jsx --- (Updated)
import React, { useState, useEffect } from 'react';
import CollectionsBookmarkOutlinedIcon from '@mui/icons-material/CollectionsBookmarkOutlined';
import FileDownloadDoneOutlinedIcon from '@mui/icons-material/FileDownloadDoneOutlined'; // Or a play icon
import AddIcon from '@mui/icons-material/Add';
import './Aside.css';
import { useAuth } from '../../../utils/AuthenticationUtils';
import LibraryAPI from '../../../api/libraryAPI'; // New
import useMusicPlayer from '../../hooks/useMusicPlayer'; // To play items from library

// Define item types your library will show filters for
const LIBRARY_ITEM_TYPES = [
    { key: 'all', display: 'All' },
    { key: 'music', display: 'Music' },
    { key: 'album', display: 'Albums' },
    { key: 'playlist', display: 'Playlists' },
    { key: 'artist', display: 'Artists' },
];

export default function Aside({ openInfo }) { // openInfo might be for a specific track's info
    const { authToken } = useAuth();
    const musicPlayer = useMusicPlayer();
    const [isExpanded, setIsExpanded] = useState(true); // Default to expanded
    const [selectedTypeFilter, setSelectedTypeFilter] = useState(LIBRARY_ITEM_TYPES[0].key); // Default to 'all'
    const [libraryItems, setLibraryItems] = useState([]);
    const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);
    // Add pagination state if needed: const [libraryPage, setLibraryPage] = useState(1);


    useEffect(() => {
        const fetchLibraryItems = async () => {
            if (!authToken) {
                setLibraryItems([]);
                return;
            }
            setIsLoadingLibrary(true);
            try {
                const params = { limit: 50 }; // Fetch more items for library view
                if (selectedTypeFilter !== 'all') {
                    params.item_type = selectedTypeFilter;
                }
                const response = await LibraryAPI.listLibraryItems(params, authToken);
                if (response.success && response.data?.items) {
                    setLibraryItems(response.data.items);
                } else {
                    setLibraryItems([]);
                }
            } catch (error) {
                console.error("Error fetching library items:", error);
                setLibraryItems([]);
            }
            setIsLoadingLibrary(false);
        };

        fetchLibraryItems();
    }, [authToken, selectedTypeFilter]);

    const toggleExpandAside = () => {
        setIsExpanded(!isExpanded);
    };

    const handlePlayLibraryItem = (libraryEntry) => {
        if (libraryEntry.item_type === 'music' && libraryEntry.details) {
            musicPlayer.setTrackAndPlay(libraryEntry.details);
        } else if (libraryEntry.item_type === 'album' && libraryEntry.details) {
            // Fetch tracks for this album and play the first one / add to queue
            console.log("Play album:", libraryEntry.details.name);
            // musicPlayer.playAlbum(libraryEntry.details); // Implement this in useMusicPlayer
        }
        // Add handling for other types like playlist, artist
    };

    const renderLibraryItem = (itemEntry) => {
        const { details, item_type } = itemEntry;
        if (!details) return <p className="item-error">Details missing</p>;

        let title = details.title || details.name || "Unknown Title";
        let subtitle = "Unknown";
        let coverImage = details.cover_image || details.cover_image_path || details.profile_image_path || "/SonifyIcon.png";

        if (item_type === 'music') {
            subtitle = details.primary_artist_name || details.collaborators?.map(c => c.name).join(', ') || "Unknown Artist";
        } else if (item_type === 'album') {
            subtitle = details.primary_artist?.name || details.collaborators?.[0]?.name || "Various Artists";
        } else if (item_type === 'playlist') {
            subtitle = `Playlist • ${details.music_count || 0} songs`;
        } else if (item_type === 'artist') {
            subtitle = "Artist";
        }

        return (
            <div
                className="music-item" // Re-use styling or create specific library-item style
                key={details._id}
                onClick={() => handlePlayLibraryItem(itemEntry)}
            // onContextMenu={(e) => musicPlayer.openContextMenu(e, details, contextMenuActions, item_type)}
            >
                <div className="left-music-item">
                    <div className="cover-container">
                        <img src={coverImage} alt={title} />
                    </div>
                    <div className="detail-music-item">
                        <b className="name-music">{title}</b>
                        <p className="musician-name">{subtitle}</p>
                    </div>
                </div>
                {/* Optionally add an icon, e.g., a play icon or type icon */}
            </div>
        );
    };


    return (
        <div className={`aside-collection ${isExpanded ? 'expanded-aside' : 'collapsed-aside'}`}>
            {isExpanded ? (
                <div className="expand-title">
                    <div className="collection-title-container">
                        <span className='left-title' onClick={toggleExpandAside}>
                            <CollectionsBookmarkOutlinedIcon />
                            <b>Your Library</b>
                        </span>
                        {/* <AddIcon />  Add Playlist/etc. functionality later */}
                    </div>
                    <div className="name-collection-container type-filters"> {/* Renamed class for clarity */}
                        {LIBRARY_ITEM_TYPES.map((type) => (
                            <span
                                onClick={() => setSelectedTypeFilter(type.key)}
                                className={`name-collection ${selectedTypeFilter === type.key ? 'selected' : ''}`}
                                key={type.key}
                            >
                                {type.display}
                            </span>
                        ))}
                    </div>
                    <div className="music-list-container library-items-list">
                        {isLoadingLibrary ? (
                            <p>Loading library...</p>
                        ) : libraryItems.length > 0 ? (
                            libraryItems.map(renderLibraryItem)
                        ) : (
                            <p>Your library is empty for this filter.</p>
                        )}
                    </div>
                </div>
            ) : (
                <div className="collapse-title">
                    <div className="collection-title-container">
                        <CollectionsBookmarkOutlinedIcon onClick={toggleExpandAside} />
                        {/* <AddIcon /> */}
                    </div>
                    <div className="music-list-container collapsed-library-icons">
                        {/* Show a few prominent cover images when collapsed */}
                        {libraryItems.slice(0, 3).map(itemEntry => (
                            itemEntry.details && (
                                <img
                                    key={itemEntry.details._id}
                                    onClick={() => handlePlayLibraryItem(itemEntry)}
                                    src={itemEntry.details.cover_image || itemEntry.details.cover_image_path || itemEntry.details.profile_image_path || "/SonifyIcon.png"}
                                    alt={itemEntry.details.title || itemEntry.details.name}
                                    title={itemEntry.details.title || itemEntry.details.name}
                                />
                            )
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
// --- END OF FILE Aside.jsx ---