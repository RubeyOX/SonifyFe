import React, { useEffect, useState, useCallback } from "react";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useNavigate } from 'react-router-dom';

import "./Homepage.css";
import { useAuth } from "../../../utils/AuthenticationUtils";
import useMusicPlayer from "../../hooks/useMusicPlayer";

import MusicAPI from "../../../api/musicAPI.js";
import LibraryAPI from "../../../api/libraryAPI.js";
import FeaturesAPI from "../../../api/featuresAPI.js";


import Header from "./Header";
import Aside from "./Aside";
import InfoAside from "./InfoAside";
import Audio from "./Audio";
import Banner from "../../Banner/Banner";
import RecentlyWrapper from "../../Recently/RecentlyWrapper";
import RecentlyBlock from "../../Recently/RecentlyBlock";
import SuggestionWrapper from "../../Suggestion/SuggestionWrapper";
import SuggestionBlock from "../../Suggestion/SuggestionBlock";
import ItemCarousel from "../../ItemCarousel/ItemCarousel";
import MusicItem from "../../Items/MusicItem";
import AlbumItem from "../../Items/AlbumItem";
import ArtistItem from "../../Items/ArtistItem";
import ContextMenu from "../../ContextMenu/ContextMenu.jsx";

export default function Homepage() {
    const musicPlayer = useMusicPlayer();
    const { token: authToken } = useAuth();
    const navigate = useNavigate();

    const [newReleases, setNewReleases] = useState([]);
    const [topTrendingMusic, setTopTrendingMusic] = useState([]);
    const [madeForYou, setMadeForYou] = useState([]);
    const [recentlyPlayed, setRecentlyPlayed] = useState([]);

    const [searchResults, setSearchResults] = useState(null);
    const [isLoadingSearch, setIsLoadingSearch] = useState(false);
    const [currentSearchQuery, setCurrentSearchQuery] = useState("");

    const [isPageLoading, setIsPageLoading] = useState(true);

    const [userLibraryMusicIds, setUserLibraryMusicIds] = useState(new Set());
    const [userLibraryAlbumIds, setUserLibraryAlbumIds] = useState(new Set());
    const [userLibraryArtistIds, setUserLibraryArtistIds] = useState(new Set());

    const isItemInLibrary = useCallback((itemType, itemId) => {
        if (!itemId) return false;
        switch (itemType) {
            case 'music': return userLibraryMusicIds.has(itemId);
            case 'album': return userLibraryAlbumIds.has(itemId);
            case 'artist': return userLibraryArtistIds.has(itemId);
            default: return false;
        }
    }, [userLibraryMusicIds, userLibraryAlbumIds, userLibraryArtistIds]);

    const updateLocalLibraryState = useCallback((itemType, itemId, shouldBeInLibrary) => {
        const updater = (prevIds) => {
            const newSet = new Set(prevIds);
            shouldBeInLibrary ? newSet.add(itemId) : newSet.delete(itemId);
            return newSet;
        };
        switch (itemType) {
            case 'music': setUserLibraryMusicIds(updater); break;
            case 'album': setUserLibraryAlbumIds(updater); break;
            case 'artist': setUserLibraryArtistIds(updater); break;
            default: break;
        }
    }, []);

    const fetchUserLibraryData = useCallback(async () => {
        if (!authToken) {
            setUserLibraryMusicIds(new Set());
            setUserLibraryAlbumIds(new Set());
            setUserLibraryArtistIds(new Set());
            return;
        }
        try {
            const libraryLimit = 50;
            const [musicLibRes, albumLibRes, artistLibRes] = await Promise.allSettled([
                LibraryAPI.listLibraryItems({ item_type: 'music', limit: libraryLimit }, authToken),
                LibraryAPI.listLibraryItems({ item_type: 'album', limit: libraryLimit }, authToken),
                LibraryAPI.listLibraryItems({ item_type: 'artist', limit: libraryLimit }, authToken),
            ]);

            if (musicLibRes.status === 'fulfilled' ) {
                setUserLibraryMusicIds(new Set((musicLibRes.value.data?.items || []).map(i => i.item_id)));
            } else if (musicLibRes.status === 'rejected') {
                console.warn("Failed to fetch music library IDs:", musicLibRes.reason || musicLibRes.value?.message);
            }

            if (albumLibRes.status === 'fulfilled' ) {
                setUserLibraryAlbumIds(new Set((albumLibRes.value.data?.items || []).map(i => i.item_id)));
            } else if (albumLibRes.status === 'rejected') {
                console.warn("Failed to fetch album library IDs:", albumLibRes.reason || albumLibRes.value?.message);
            }

            if (artistLibRes.status === 'fulfilled' ) {
                setUserLibraryArtistIds(new Set((artistLibRes.value.data?.items || []).map(i => i.item_id)));
            } else if (artistLibRes.status === 'rejected') {
                console.warn("Failed to fetch artist library IDs:", artistLibRes.reason || artistLibRes.value?.message);
            }

        } catch (error) {
            console.error("Error fetching user library data wrapper:", error);
        }
    }, [authToken]);

    const handleToggleLibrary = useCallback(async (item, itemType) => {
        if (!authToken || !item?._id) return;
        const currentlyInLibrary = isItemInLibrary(itemType, item._id);
        try {
            if (currentlyInLibrary) {
                const res = await LibraryAPI.removeItemFromLibrary({ item_id: item._id, item_type: itemType }, authToken);
                 if(res.success) updateLocalLibraryState(itemType, item._id, false);
                console.log(`${itemType} '${item.title || item.name}' removed from library.`);
            } else {
                const res = await LibraryAPI.addItemToLibrary({ item_id: item._id, item_type: itemType }, authToken);
                if(res.success) updateLocalLibraryState(itemType, item._id, true);
                console.log(`${itemType} '${item.title || item.name}' added to library.`);
            }
        } catch (error) {
            console.error(`Error toggling library state for ${itemType} '${item.title || item.name}':`, error);
        }
        if (musicPlayer.contextMenu.visible) {
            musicPlayer.closeContextMenu();
        }
    }, [authToken, isItemInLibrary, updateLocalLibraryState, musicPlayer]);


    useEffect(() => {
        const fetchPageData = async () => {
            if (!authToken) {
                setNewReleases([]); setTopTrendingMusic([]); setMadeForYou([]); setRecentlyPlayed([]);
                setUserLibraryMusicIds(new Set());
                setUserLibraryAlbumIds(new Set());
                setUserLibraryArtistIds(new Set());
                setIsPageLoading(false);
                console.log("No auth token, cleared data and library IDs");
                return;
            }
            setIsPageLoading(true);

            await fetchUserLibraryData();

            try {
                const [newMusicRes] = await Promise.allSettled([
                    MusicAPI.listNewMusic({ limit: 12 }, authToken),
                ]);
                console.log(newMusicRes)
                if (newMusicRes.status === "fulfilled") {
                    const musicData = newMusicRes.value.data || [];
                    setNewReleases(musicData);
                    const sortedTrending = [...musicData].sort((a, b) => (b.play_count || 0) - (a.play_count || 0));
                    setTopTrendingMusic(sortedTrending.slice(0, 12));
                    setMadeForYou(musicData.sort(() => 0.5 - Math.random()).slice(0, 6));
                } else {
                    console.warn("Failed to fetch new releases:", newMusicRes.reason || newMusicRes.value?.message);
                    setNewReleases([]); setTopTrendingMusic([]); setMadeForYou([]);
                }
                setRecentlyPlayed([]);
                setIsPageLoading(false);
                
            } catch (error) {
                console.error("Error fetching homepage section data:", error);
                setNewReleases([]); setTopTrendingMusic([]); setMadeForYou([]); setRecentlyPlayed([]);
            } finally {
                setIsPageLoading(false);
            }
        };
        fetchPageData();
    }, [authToken, fetchUserLibraryData]);

    const handleSearch = useCallback(async (query) => {
        if (!query || query.trim() === "") {
            setSearchResults(null);
            setCurrentSearchQuery("");
            setIsLoadingSearch(false);
            return;
        }
        if (!authToken) return;

        setCurrentSearchQuery(query);
        setIsLoadingSearch(true);
        try {
            const response = await MusicAPI.searchMusic({ q: query.trim(), type: 'all' }, authToken);
            if (response.success) {
                setSearchResults(response.data);
            } else {
                setSearchResults(null);
                console.error("Search failed:", response.message);
            }
        } catch (error) {
            setSearchResults(null);
            console.error("Error performing search:", error);
        } finally {
            setIsLoadingSearch(false);
        }
    }, [authToken]);

    const handleAddToQueue = useCallback((item) => {
        musicPlayer.addToQueue(item.details || item);
        musicPlayer.closeContextMenu();
    }, [musicPlayer]);

    const handleToggleFavorite = useCallback(async (item, itemType) => {
        if (!authToken || !item?._id) return;
        try {
            await FeaturesAPI.toggleLike({ item_id: item._id, item_type: itemType }, authToken);
        } catch (error) {
            console.error(`Error toggling favorite for ${itemType} ${item.title || item.name}:`, error);
        }
        musicPlayer.closeContextMenu();
    }, [authToken, musicPlayer]);


    const contextMenuActions = [
        { label: "Add to Queue", action: handleAddToQueue },
        {
            labelGetter: (item, itemType) =>
                isItemInLibrary(itemType, item._id) ? `Remove from Library` : `Add to Library`,
            action: handleToggleLibrary
        },
        { label: "Toggle Favorite", action: (item, itemType) => handleToggleFavorite(item, itemType) },
        
    ];


    const renderMusicCarousel = (title, items, sectionKeyForItemType = 'music') => {
        console.log(items)
        if (isPageLoading && items.length === 0 && !currentSearchQuery) {
            return <div className="trending-container" key={title}><p className="loading-text">Loading {title.toLowerCase()}...</p></div>;
        }
        if (!items || items.length === 0) {
            console.log("No music data")
            return null;
        }

        return (
            <div className="trending-container" key={title}>
                <div className="title-trending">
                    <b className="title-text">{title}</b>
                </div>
                <ItemCarousel>
                    {items.map((item) => (
                        <MusicItem
                            key={`${sectionKeyForItemType}-${item._id}`}
                            item={item}
                            onPlayClick={() => musicPlayer.setTrackAndPlay(item)}
                            onAddToLibraryClick={handleToggleLibrary}
                            onContextMenuOpen={(event, contextItem = item) => musicPlayer.openContextMenu(event, contextItem, contextMenuActions, sectionKeyForItemType)}
                            isInLibrary={isItemInLibrary(sectionKeyForItemType, item._id)}
                        />
                    ))}
                </ItemCarousel>
            </div>
        );
    };

    const renderSearchResults = () => {
        if (isLoadingSearch) return <div className="search-results-container"><p className="loading-text">Searching...</p></div>;
        if (!searchResults && currentSearchQuery) return <div className="search-results-container"><p className="info-text">No results for "{currentSearchQuery}".</p></div>;
        if (!searchResults) return null;

        const { music, albums, artists } = searchResults;
        const hasResults = music?.data?.length > 0 || albums?.data?.length > 0 || artists?.data?.length > 0;
        if (!hasResults) return <div className="search-results-container"><p className="info-text">No results found for "{currentSearchQuery}".</p></div>;

        return (
            <div className="search-results-container">
                {music?.data?.length > 0 && (
                    <div className="search-category trending-container">
                        <h3 className="category-title title-trending"><b className="title-text">Tracks</b></h3>
                        <ItemCarousel>
                            {music.data.map(item => (
                                <MusicItem
                                    key={`search-music-${item._id}`}
                                    item={item}
                                    onPlayClick={() => musicPlayer.setTrackAndPlay(item)}
                                    onAddToLibraryClick={handleToggleLibrary}
                                    onContextMenuOpen={(e, ctxItem = item) => musicPlayer.openContextMenu(e, ctxItem, contextMenuActions, 'music')}
                                    isInLibrary={isItemInLibrary('music', item._id)}
                                />
                            ))}
                        </ItemCarousel>
                    </div>
                )}
                {albums?.data?.length > 0 && (
                    <div className="search-category trending-container">
                        <h3 className="category-title title-trending"><b className="title-text">Albums</b></h3>
                        <ItemCarousel>
                            {albums.data.map(album => (
                                <AlbumItem
                                    key={`search-album-${album._id}`}
                                    item={album}
                                    onAddToLibraryClick={handleToggleLibrary}
                                    onContextMenuOpen={(e, ctxItem = album) => musicPlayer.openContextMenu(e, ctxItem, contextMenuActions, 'album')}
                                    isInLibrary={isItemInLibrary('album', album._id)}
                                />
                            ))}
                        </ItemCarousel>
                    </div>
                )}
                {artists?.data?.length > 0 && (
                    <div className="search-category trending-container">
                        <h3 className="category-title title-trending"><b className="title-text">Artists</b></h3>
                        <ItemCarousel>
                            {artists.data.map(artist => (
                                <ArtistItem
                                    key={`search-artist-${artist._id}`}
                                    item={artist}
                                    onAddToLibraryClick={handleToggleLibrary}
                                    onContextMenuOpen={(e, ctxItem = artist) => musicPlayer.openContextMenu(e, ctxItem, contextMenuActions, 'artist')}
                                    isInLibrary={isItemInLibrary('artist', artist._id)}
                                />
                            ))}
                        </ItemCarousel>
                    </div>
                )}
            </div>
        );
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="homepage-container">
                <div className="header">
                    <Header onSearch={handleSearch} />
                </div>
                <div className="aside-collection-grid">
                    <Aside
                        openInfo={musicPlayer.openInfoAside}
                        isItemInLibrary={isItemInLibrary}
                        onToggleLibrary={handleToggleLibrary}
                    />
                </div>
                <div className="main-content">
                    {currentSearchQuery && searchResults !== null ? (
                        renderSearchResults()
                    ) : (
                        <>
                            <Banner />
                            {recentlyPlayed.length > 0 && (
                                <RecentlyWrapper>
                                    {recentlyPlayed.map((item) => (
                                        <RecentlyBlock
                                            key={`recent-${item._id}`}
                                            musicCover={item.cover_image || item.details?.cover_image}
                                            name={item.title || item.details?.title}
                                            onPlayClick={() => musicPlayer.setTrackAndPlay(item.details || item)}
                                            onContextMenuOpen={(event) => musicPlayer.openContextMenu(event, item.details || item, contextMenuActions, 'music')}
                                        />
                                    ))}
                                </RecentlyWrapper>
                            )}

                            <SuggestionWrapper
                                suggestionBlock={
                                    <SuggestionBlock
                                        artistName={"Quyếch"} title={"Lời nhắn"}
                                        detail={'Details about Quyếch...'}
                                        image={"https://th.bing.com/th/id/OIP.WgPDUDvQxktaBJWTa7GcywHaHa?cb=iwc1&rs=1&pid=ImgDetMain"}
                                        following={true} key={"quyech-suggestion"}
                                    />
                                }
                                suggestionSlider={renderMusicCarousel("Made For You", madeForYou, "made-for-you-music")}
                            />

                            {renderMusicCarousel("New Releases", newReleases, "music")}
                            {renderMusicCarousel("Top Trending", topTrendingMusic, "music")}
                        </>
                    )}
                </div>

                <div className={`info-aside-grid ${musicPlayer.isInfoAsideOpen ? 'open' : ''}`}>
                    <InfoAside
                        closeInfo={musicPlayer.closeInfoAside}
                        trackData={musicPlayer.currentTrack}
                        isOpen={musicPlayer.isInfoAsideOpen}
                        onToggleLibrary={handleToggleLibrary}
                        isInLibrary={musicPlayer.currentTrack ? isItemInLibrary('music', musicPlayer.currentTrack._id) : false}
                    />
                </div>

                <div className="audio-grid">
                    <Audio
                        trackData={musicPlayer.currentTrack}
                        isPlaying={musicPlayer.isPlaying}
                        currentTime={musicPlayer.currentTime}
                        duration={musicPlayer.duration}
                        volumeLevel={musicPlayer.volume}
                        isMuted={musicPlayer.isMuted}
                        shuffle={musicPlayer.shuffle}
                        repeatMode={musicPlayer.repeatMode}
                        onPlayPauseClick={musicPlayer.playPause}
                        onSeek={musicPlayer.seek}
                        onVolumeChange={musicPlayer.setVolumeLevel}
                        toggleMute={musicPlayer.toggleMute}
                        nextTrack={musicPlayer.playNextTrack}
                        previousTrack={musicPlayer.playPreviousTrack}
                        toggleShuffle={musicPlayer.toggleShuffle}
                        cycleRepeatMode={musicPlayer.cycleRepeatMode}
                        onOpenInfoAside={() => musicPlayer.currentTrack && musicPlayer.openInfoAside(musicPlayer.currentTrack)}
                        onAddToLibraryClick={handleToggleLibrary}
                        currentTrackIsInLibrary={musicPlayer.currentTrack ? isItemInLibrary('music', musicPlayer.currentTrack._id) : false}
                    />
                </div>

                {musicPlayer.contextMenu.visible && (
                    <ContextMenu
                        x={musicPlayer.contextMenu.x}
                        y={musicPlayer.contextMenu.y}
                        item={musicPlayer.contextMenu.item}
                        itemType={musicPlayer.contextMenu.itemType}
                        actions={musicPlayer.contextMenu.actions}
                        onClose={musicPlayer.closeContextMenu}
                    />
                )}
            </div>
        </DndProvider>
    );
}