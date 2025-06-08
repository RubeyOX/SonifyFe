import React, { useState, useEffect, useCallback } from 'react';
import CollectionsBookmarkOutlinedIcon from '@mui/icons-material/CollectionsBookmarkOutlined';
import './Aside.css';
import { useAuth } from '../../../utils/AuthenticationUtils';
import LibraryAPI from '../../../api/libraryAPI';
import MusicAPI from '../../../api/musicAPI';

const LIBRARY_ITEM_TYPES = [
    { key: 'all', display: 'All', itemTypeForAPI: undefined }, 
    { key: 'music', display: 'Music', itemTypeForAPI: 'music' },
    { key: 'album', display: 'Albums', itemTypeForAPI: 'album' },
    { key: 'playlist', display: 'Playlists', itemTypeForAPI: 'playlist' },
    { key: 'artist', display: 'Artists', itemTypeForAPI: 'artist' },
];

async function fetchDetailsForItem(entry, authToken) {
    if (!entry || !entry.item_id || !entry.item_type) return null;

    try {
        let response;
        if (entry.details) { 
            return entry.details;
        }

        switch (entry.item_type) {
            case 'music':
                response = await MusicAPI.getMusicDetails(entry.item_id, authToken);
                break;

            default:
                console.warn(`[Aside] Unsupported item type for detail fetching: ${entry.item_type}`);
                return null;
        }

        if (response && response.data) { 
            return response.data;
        }
        console.warn(`[Aside] Failed to fetch details for ${entry.item_type} ${entry.item_id}:`, response?.message);
        return null;
    } catch (error) {
        console.error(`[Aside] Error fetching details for ${entry.item_type} ${entry.item_id}:`, error);
        return null;
    }
}

export default function Aside({ openInfo, musicPlayer }) { 
    const { token: authToken } = useAuth();
    const [isExpanded, setIsExpanded] = useState(true);
    const [selectedTypeFilter, setSelectedTypeFilter] = useState(LIBRARY_ITEM_TYPES[0].key);
    const [libraryItems, setLibraryItems] = useState([]);
    const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);

    useEffect(() => {
        const fetchLibraryData = async () => {
            if (!authToken) {
                setLibraryItems([]);
                return;
            }
            setIsLoadingLibrary(true);
            try {
                const currentFilterObject = LIBRARY_ITEM_TYPES.find(f => f.key === selectedTypeFilter);
                const params = { limit: 50 };
                if (currentFilterObject && currentFilterObject.itemTypeForAPI) {
                    params.item_type = currentFilterObject.itemTypeForAPI;
                }

                const response = await LibraryAPI.listLibraryItems(params, authToken);

                if (response.success && Array.isArray(response.data?.items)) {
                    const validItems = response.data.items.filter(item => item && item.details);
                    setLibraryItems(validItems);
                } else {
                    console.warn("[Aside] LibraryAPI.listLibraryItems did not return success or items array:", response);
                    setLibraryItems([]);
                }
            } catch (error) {
                console.error("[Aside] Error fetching library items:", error);
                setLibraryItems([]);
            }
            setIsLoadingLibrary(false);
        };

        fetchLibraryData();
    }, [authToken, selectedTypeFilter]);

    const toggleExpandAside = () => {
        setIsExpanded(!isExpanded);
    };

    const handlePlayLibraryItem = (libraryEntry) => {
        if (!musicPlayer || !libraryEntry.details) return;

        if (libraryEntry.item_type === 'music') {
            musicPlayer.setTrackAndPlay(libraryEntry.details);
            console.log("Changed track play.")
            if (openInfo) openInfo(libraryEntry.details);
        } else if (libraryEntry.item_type === 'album') {
            console.log("[Aside] Play album (feature to be implemented):", libraryEntry.details.name);
        } else if (libraryEntry.item_type === 'playlist') {
            console.log("[Aside] Play playlist (feature to be implemented):", libraryEntry.details.name);
        }
    };

    const renderLibraryItem = (itemEntry) => {
        const { details, item_type } = itemEntry;

        if (!details) {
            return (
                <div className="music-item item-error" key={itemEntry._id || itemEntry.item_id || Math.random()}>
                    <p>Details unavailable</p>
                </div>
            );
        }

        let title = "Unknown Title";
        let subtitle = "Details";
        let coverImage = "/SonifyIcon.png"; 
        if (item_type === 'music') {
            title = details.title || "Unknown Song";
            subtitle = details.primary_artist_name || details.collaborators?.find(c => c.role === "Primary Artist")?.name || details.collaborators?.[0]?.name || "Unknown Artist";
            coverImage = details.cover_image || coverImage;
        } else if (item_type === 'album') {
            title = details.name || "Unknown Album";
            subtitle = details.artist_name || details.primary_artist_name || details.collaborators?.[0]?.name || "Various Artists";
            coverImage = details.cover_image_path || details.cover_image || coverImage;
        } else if (item_type === 'playlist') {
            title = details.name || "Unknown Playlist";
            subtitle = `Playlist • ${details.track_count || details.music_count || 0} songs`;
            coverImage = details.cover_image_url || details.images?.[0]?.url || coverImage;
        } else if (item_type === 'artist') {
            title = details.name || "Unknown Artist";
            subtitle = "Artist";
            coverImage = details.profile_image_path || details.images?.[0]?.url || coverImage;
        }

        return (
            <div
                className="music-item" 
                key={`${item_type}-${details._id}`}
                onClick={() => handlePlayLibraryItem(itemEntry)}
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
                    </div>
                    <div className="name-collection-container type-filters">
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
                            <p>Your library is empty{selectedTypeFilter !== 'all' ? ` for ${LIBRARY_ITEM_TYPES.find(t => t.key === selectedTypeFilter)?.display.toLowerCase()}s` : ''}.</p>
                        )}
                    </div>
                </div>
            ) : (
                <div className="collapse-title">
                    <div className="collection-title-container">
                        <CollectionsBookmarkOutlinedIcon onClick={toggleExpandAside} />
                    </div>
                    <div className="music-list-container collapsed-library-icons">
                        {libraryItems.slice(0, 5).map(itemEntry => {
                            if (!itemEntry.details) return null;
                             let coverImage = "/SonifyIcon.png";
                             let title = itemEntry.details.title || itemEntry.details.name || "Item";

                            if (itemEntry.item_type === 'music') coverImage = itemEntry.details.cover_image || coverImage;
                            else if (itemEntry.item_type === 'album') coverImage = itemEntry.details.cover_image_path || itemEntry.details.cover_image || coverImage;
                            else if (itemEntry.item_type === 'playlist') coverImage = itemEntry.details.cover_image_url || itemEntry.details.images?.[0]?.url || coverImage;
                            else if (itemEntry.item_type === 'artist') coverImage = itemEntry.details.profile_image_path || itemEntry.details.images?.[0]?.url || coverImage;

                            return (
                                <img
                                    key={`${itemEntry.item_type}-${itemEntry.details._id}-collapsed`}
                                    onClick={() => handlePlayLibraryItem(itemEntry)}
                                    src={coverImage}
                                    alt={title}
                                    title={title}
                                />
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}