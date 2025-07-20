import axios from "axios";

// const API_BASE_URL = "http://localhost:3000/api/v1/music";
const API_BASE_URL = "https://sonifybe.onrender.com/api/v1/music";
const STREAM_BASE_URL = "https://sonifybe.onrender.com/api/v1/music";
const backendOrigin = "https://sonifybe.onrender.com"; //refactored
// const STREAM_BASE_URL = "https://sonify-backend.onrender.com/api/v1/music";
// const backendOrigin = "https://sonify-backend.onrender.com"; //refactored

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Helper to ensure playback URLs are absolute if they are relative
const getFullStreamUrl = (playbackUrl) => {
  if (!playbackUrl) return "";
  if (playbackUrl.startsWith("http://") || playbackUrl.startsWith("https://")) {
    return playbackUrl;
  }
  try {
    if (playbackUrl.startsWith("/api/v1/music/stream/")) {
      return `${backendOrigin}${playbackUrl}`;
    }
    const url = new URL(playbackUrl, API_BASE_URL);
    return url.toString();
  } catch (e) {
    console.error("Failed to construct full playback URL:", playbackUrl, e);
    return `${backendOrigin}${playbackUrl}`;
  }
};

const MusicAPI = {
  listNewMusic: async ({ limit = 12, page = 1 } = {}, authToken) => {
    try {
      const config = { params: { limit, page } };
      if (authToken) {
        config.headers = { Authorization: `Bearer ${authToken}` };
      }
      const response = await apiClient.get("/list", config);
      if (response.data && response.data.data) {
        response.data.data = response.data.data.map((track) => ({
          ...track,
          fullPlaybackUrl: getFullStreamUrl(track.playbackUrl),
        }));
      }
      return response.data;
    } catch (error) {
      console.error(
        "MusicAPI listNewMusic error:",
        error.response ? error.response.data : error.message
      );
      throw error.response
        ? error.response.data
        : new Error("Failed to fetch new music");
    }
  },
  // Updated searchMusic
  searchMusic: async (
    {
      q,
      type = "all", // 'music', 'album', 'artist', 'all'
      genreId,
      albumId, // Corrected from album_id to match backend query params
      artistId, // Corrected from artist_id
      musicPage = 1,
      musicLimit = 5,
      albumPage = 1,
      albumLimit = 5,
      artistPage = 1,
      artistLimit = 5,
    } = {},
    authToken
  ) => {
    try {
      const params = {
        q,
        type,
        musicPage,
        musicLimit,
        albumPage,
        albumLimit,
        artistPage,
        artistLimit,
      };
      if (genreId) params.genreId = genreId;
      if (albumId) params.albumId = albumId;
      if (artistId) params.artistId = artistId;

      const config = { params };
      if (authToken) {
        config.headers = { Authorization: `Bearer ${authToken}` };
      }
      const response = await apiClient.get("/search", config);
      // The response structure is now { music: { data: [], pagination: {} }, albums: {...}, artists: {...} }
      // We need to process playbackUrls within the music data
      if (response.data?.data?.music?.data) {
        response.data.data.music.data = response.data.data.music.data.map(
          (track) => ({
            ...track,
            fullPlaybackUrl: getFullStreamUrl(track.playbackUrl),
          })
        );
      }
      // Potentially process album cover images or artist profile images if they are relative paths
      return response.data;
    } catch (error) {
      console.error(
        "MusicAPI searchMusic error:",
        error.response ? error.response.data : error.message
      );
      throw error.response
        ? error.response.data
        : new Error("Failed to search");
    }
  },
  getMusicDetails: async (musicId, authToken) => {
    if (!musicId) throw new Error("Music ID is required for getMusicDetails");
    try {
      const config = {};
      if (authToken) {
        config.headers = { Authorization: `Bearer ${authToken}` };
      }
      const response = await apiClient.get(`/${musicId}`, config);
      if (response.data && response.data.data) {
        response.data.data.fullPlaybackUrl = getFullStreamUrl(
          response.data.data.playbackUrl
        );
      }
      return response.data;
    } catch (error) {
      console.error(
        "MusicAPI getMusicDetails error:",
        error.response ? error.response.data : error.message
      );
      throw error.response
        ? error.response.data
        : new Error("Failed to fetch music details");
    }
  },
  // This function is likely better handled directly by the <audio> element or a player library,
  // but if you need to fetch the blob for some reason (e.g. Web Audio API), it can stay.
  // The stream endpoint itself handles auth.
  fetchAudioForPlayback: async (fullPlaybackUrl, authToken) => {
    if (!fullPlaybackUrl)
      throw new Error("Playback URL is required to fetch audio");
    try {
      const config = { responseType: "blob" }; // Changed to blob for easier use with URL.createObjectURL
      if (authToken) {
        config.headers = { Authorization: `Bearer ${authToken}` };
      }
      const response = await axios.get(fullPlaybackUrl, config);
      return response.data; // This will be a Blob
    } catch (error) {
      console.error(
        "MusicAPI fetchAudioForPlayback error:",
        error.response ? error.response.statusText : error.message
      );
      throw error.response
        ? new Error(`Failed to fetch audio: ${error.response.statusText}`)
        : new Error("Failed to fetch audio");
    }
  },
  // New: Get music in an album
  getMusicInAlbum: async (
    albumId,
    { page = 1, limit = 10 } = {},
    authToken
  ) => {
    if (!albumId) throw new Error("Album ID is required");
    try {
      const config = { params: { page, limit } };
      if (authToken) {
        config.headers = { Authorization: `Bearer ${authToken}` };
      }
      // Assuming album routes are separate, or adjust base URL
      const albumApiClient = axios.create({
        baseURL: "https://sonify-backend.onrender.com/api/v1/albums",
      });
      const response = await albumApiClient.get(`/${albumId}/music`, config);

      if (response.data?.data?.music) {
        // Backend returns { album: {}, music: [], pagination: {} }
        response.data.data.music = response.data.data.music.map((track) => ({
          ...track,
          fullPlaybackUrl: getFullStreamUrl(track.playbackUrl),
        }));
      }
      return response.data;
    } catch (error) {
      console.error(
        `MusicAPI getMusicInAlbum (albumId: ${albumId}) error:`,
        error.response ? error.response.data : error.message
      );
      throw error.response
        ? error.response.data
        : new Error("Failed to fetch music in album");
    }
  },
  uploadMusic: async (musicData, token) => {
    try {
      if (
        !musicData.cover_image ||
        !musicData.music_file ||
        !musicData.title ||
        !musicData.description ||
        musicData.genre.length == 0 ||
        musicData.collaborators.length == 0
      ) {
        alert("Need data");
        throw new Error("Need data");
      }
      const formData = new FormData();
      formData.append("coverImage", musicData.cover_image);
      formData.append("audioFile", musicData.music_file);
      formData.append("title", musicData.title);
      const genreIds = musicData.genre.map((tags) => tags.id);
      console.log(genreIds)
      // genreIds.forEach((id) => {
      //   formData.append("genre_id", id); // backend nhận mảng
      // });
      formData.append("genre_id",JSON.stringify(genreIds))
      formData.append("collaborators", JSON.stringify(musicData.collaborators));
      const response = await apiClient.post("/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  listUserMusic: async ({
    limit,
    offset,
    sortBy,
    sortOrder = "desc",
  }={},authToken,signal) => {
    try {
      const config = { params: { limit, offset, sortBy, sortOrder },signal };
      if (authToken) {
        config.headers = { Authorization: `Bearer ${authToken}` };
      }else if(!authToken){
        throw new Error("Need token to list user music")
      }
      const response = await apiClient.get("/list-music-user", config);
      return response.data;
    } catch (error) {
      console.error(
        "MusicAPI listUserMusic error:", // Corrected error message context
        error.response ? error.response.data : error.message
      );
      throw error.response
        ? error.response.data
        : new Error("Failed to fetch user music");
    }
  },
  listMusic: async({
    limit = 10,
    offset = 0,
    sortBy,
    sortOrder='desc'
  }={},authToken,signal)=>{
    try{
      const config = { params: { limit, offset, sortBy, sortOrder },signal };
      if (authToken) {
        config.headers = { Authorization: `Bearer ${authToken}` };
      }else if(!authToken){
        throw new Error("Need token to list all music") // Corrected error message
      }
      const response = await apiClient.get("/list-music", config);
      return response.data;
    }catch(error){
      console.error(
        "MusicAPI listMusic error:",
        error.response ? error.response.data : error.message
      );
      throw error.response
        ? error.response.data
        : new Error("Failed to fetch all music");
    }
  },
  changeMusicDetailManager:async(data,authToken)=>{
    try{
      console.log(data)
      const config={}
      if(!authToken){
        throw new Error('Need token to change music detail')
      }
      config.headers={Authorization: `Bearer ${authToken}`}
      if(!data.title || !Array.isArray(data.genre) || typeof data.is_deleted!=='boolean'){
        throw new Error('Missing data')
      }
      const response=await apiClient.put("/change-detail",data,config)
      return response.data
    }catch(error){
      console.error(
        "MusicAPI change Music detail error:",
        error.response ? error.response.data : error.message
      );
      throw error.response
        ? error.response.data
        : new Error("Failed to change music detail");
    }
  },
  listRecentMusic: async ({ page = 1, limit = 10 } = {}, authToken) => {
    if (!authToken) {
      console.warn("Auth token is required to fetch recent music.");
      throw new Error("Authentication token is required.");
    }
    try {
      const config = { 
        params: { page, limit },
        headers: { Authorization: `Bearer ${authToken}` } 
      };
      
      const response = await apiClient.get("/list/recent", config);
      
      if (response.data && response.data.data) {
        response.data.data = response.data.data.map((track) => ({
          ...track,
          fullPlaybackUrl: getFullStreamUrl(track.playbackUrl),
        }));
      }
      return response.data;
    } catch (error) {
      console.error(
        "MusicAPI listRecentMusic error:",
        error.response ? error.response.data : error.message
      );
      throw error.response
        ? error.response.data
        : new Error("Failed to fetch recent music");
    }
  },
};

export default MusicAPI;