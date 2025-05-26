import Aside from "./Aside";
import "./Homepage.css";
import { useEffect, useState } from "react";
import InfoAside from "./InfoAside";
import Audio from "./Audio";
import Header from "./Header";
import CustomSlickSlider from "../../slider/CustomSlickSlider";

import Banner from "../../Banner/Banner";

import RecentlyWrapper from "../../Recently/RecentlyWrapper";
import RecentlyBlock from "../../Recently/RecentlyBlock";

import SuggestionWrapper from "../../Suggestion/SuggestionWrapper";
import SuggestionBlock from "../../Suggestion/SuggestionBlock";

import ItemCarousel from "../../ItemCarousel/ItemCarousel";

import MusicItem from "../../Items/MusicItem";

import PlaylistItem from "../../Items/PlaylistItem";
import useMusicPlayer from "../../hooks/useMusicPlayer";
import MusicAPI from "../../../api/musicAPI.js";
import ContextMenu from "../../ContextMenu/ContextMenu.jsx";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { useAuth } from "../../../utils/AuthenticationUtils";


export default function Homepage() {
    const musicPlayer = useMusicPlayer(); // Use the hook

    const [recentlyPlayed, setRecentlyPlayed] = useState([]);
    const [madeForYouPlaylists, setMadeForYouPlaylists] = useState([]);
    const [topTrending, setTopTrending] = useState([]);
    const { authToken } = useAuth();
    // const [authToken, setAuthToken] = 


    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // 1. Get New Music (used for Top Trending and Made For You as placeholder)
                const newMusicResponse = await MusicAPI.listNewMusic({}, authToken); // Pass empty object for no specific params

                if (newMusicResponse?.data) {
                    // 2. Set Top Trending (sort by play_count if available, otherwise just use the new music list)
                    const sortedTrending = [...newMusicResponse.data].sort((a, b) => (b.play_count || 0) - (a.play_count || 0)); //Sort by play counts
                    setTopTrending(sortedTrending);

                    // 3. Set Made For You (use new music as placeholder)
                    setMadeForYouPlaylists(newMusicResponse.data);

                    // 4. Set Recently Played (if API is available - otherwise, leave empty)
                    // const recentlyPlayedResponse = await MusicAPI.getRecentlyPlayed({}, authToken); // If API is avaiable, just remove the comments and adjust the endpoint
                    // if (recentlyPlayedResponse?.data) {
                    //      setRecentlyPlayed(recentlyPlayedResponse.data);
                    // } else {
                    //      setRecentlyPlayed([]); //If API is not avaiable, assign the empty
                    // }

                } else {
                    console.warn("Initial data fetch: No data received from API");
                }
            } catch (error) {
                console.error("Error fetching initial data:", error);
            }
        };

        fetchInitialData();
    }, [authToken]); // Refetch data if authToken changes


    //Handle Context Menu Action
    const handleAddToQueue = (track) => {
        musicPlayer.addToQueue(track);
        musicPlayer.closeContextMenu();
    };

    const handleAddToFavorites = (track) => {
        // Placeholder for add to favorites logic.  Implement API call.
        console.log("Add to favorites:", track);
        musicPlayer.closeContextMenu();
    };

    const handleAddToLibrary = (track) => {
        // Placeholder for add to library logic.  Implement API call.
        console.log("Add to library:", track);
        musicPlayer.closeContextMenu();
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="homepage-container">
                <div className="header">
                    <Header />
                </div>
                <div className="aside-collection-grid">
                    <Aside />
                </div>
                <div className="main-content">
                    <Banner />
                    <RecentlyWrapper>
                        {recentlyPlayed.map((item) => (
                            <RecentlyBlock
                                key={item._id} // Use a unique key
                                musicCover={item.cover_image}
                                name={item.title}
                                onPlayClick={() => musicPlayer.setTrackAndPlay(item)}
                                onContextMenuOpen={(event) => musicPlayer.openContextMenu(event, item)}
                            />
                        ))}
                    </RecentlyWrapper>
                    <SuggestionWrapper
                        suggestionBlock={
                            <SuggestionBlock
                                artistName={"Quyếch"}
                                title={"Lời nhắn"}
                                detail={
                                    '"Lời Nhắn" của Quyếch là một bài hát sâu lắng, thể hiện những tâm tư và cảm xúc chân thật trong cuộc sống. Với giai điệu nhẹ nhàng và lời hát giàu ý nghĩa, bài hát như một lời tâm tình, chạm đến trái tim người nghe và tạo ra sự đồng cảm mạnh mẽ. Đây là một tác phẩm đáng...'
                                }
                                image={
                                    "https://th.bing.com/th/id/OIP.WgPDUDvQxktaBJWTa7GcywHaHa?cb=iwc1&rs=1&pid=ImgDetMain"
                                }
                                following={true}
                                key={"acs"}
                            />
                        }
                        suggestionSlider={
                            <>
                                <ItemCarousel>
                                    {madeForYouPlaylists.map((item) => (
                                        <PlaylistItem
                                            key={item._id}
                                            coverImage={item.cover_image}
                                            title={item.title}
                                            contributors={[item.primary_artist_name]} //Adjust based on actual data
                                            widthSize="180px"
                                            onPlayClick={() => musicPlayer.setTrackAndPlay(item)}
                                            onContextMenuOpen={(event) => musicPlayer.openContextMenu(event, item)}
                                        />
                                    ))}
                                </ItemCarousel>
                            </>
                        }
                    />
                    <div className="trending-container">
                        <div className="title-trending">
                            <b className="title-text">Top Trending</b>
                            <p className="show-more">Show more</p>
                        </div>
                        <div className="music-list-container">
                            <ItemCarousel>
                                {topTrending.map((item) => (
                                    <MusicItem
                                        key={item._id}
                                        coverImage={item.cover_image}
                                        contributors={[item.primary_artist_name]} //Adjust based on actual data
                                        title={item.title}
                                        onPlayClick={() => musicPlayer.setTrackAndPlay(item)}
                                        onContextMenuOpen={(event) => musicPlayer.openContextMenu(event, item)}
                                    />
                                ))}
                            </ItemCarousel>
                        </div>
                    </div>
                </div>

                <div className={`info-aside-grid ${musicPlayer.isInfoAsideOpen ? 'open' : ''}`}>
                    <InfoAside closeInfo={musicPlayer.closeInfoAside} trackData={musicPlayer.currentTrack} isOpen={musicPlayer.isInfoAsideOpen} />
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
                        nextTrack={musicPlayer.playNextInQueue}
                        previousTrack={musicPlayer.playPreviousInQueue}
                        toggleShuffle={musicPlayer.toggleShuffle}
                        cycleRepeatMode={musicPlayer.cycleRepeatMode}
                    />
                </div>
            </div>
        </DndProvider>
    );
}