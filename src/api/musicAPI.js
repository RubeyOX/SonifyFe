import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1/music';
const STREAM_BASE_URL = 'http://localhost:3000/api/v1/music'; 

const apiClient = axios.create({
    baseURL: API_BASE_URL,
});

const getFullStreamUrl = (playbackUrl) => {
    if (!playbackUrl) return ''; // Handle null/undefined playbackUrl
    if (playbackUrl.startsWith('http://') || playbackUrl.startsWith('https://')) {
        return playbackUrl;
    }
    try {
        const url = new URL(playbackUrl, STREAM_BASE_URL);
        return url.toString();
    } catch (e) {
        console.error("Failed to construct full playback URL:", playbackUrl, e);
        return playbackUrl;
    }
};


const MusicAPI = {
    listNewMusic: async ({ limit = 12, offset = 0, sortBy, sortOrder = 'desc' } = {}, authToken) => {
        try {
            const config = { params: { limit, offset, sortOrder } };
            if (sortBy) config.params.sortBy = sortBy;
            if (authToken) {
                config.headers = { Authorization: `Bearer ${authToken}` };
            }
            const response = await apiClient.get('/list', config);
            if (response.data && response.data.data) {
                response.data.data = response.data.data.map(track => ({
                    ...track,
                    fullPlaybackUrl: getFullStreamUrl(track.playbackUrl) 
                }));
            }
            return response.data;
        } catch (error) {
            console.error('MusicAPI listNewMusic error:', error.response ? error.response.data : error.message);
            throw error.response ? error.response.data : new Error('Failed to fetch new music');
        }
    },
    searchMusic: async ({ query, limit = 10, offset = 0, genre_id, artist_id, album_id } = {}, authToken) => {
        try {
            const config = { params: { query, limit, offset } };
            if (genre_id) config.params.genre_id = genre_id;
            if (artist_id) config.params.artist_id = artist_id;
            if (album_id) config.params.album_id = album_id;
            if (authToken) {
                config.headers = { Authorization: `Bearer ${authToken}` };
            }
            const response = await apiClient.get('/search', config);
             if (response.data && response.data.data) {
                response.data.data = response.data.data.map(track => ({
                    ...track,
                    fullPlaybackUrl: getFullStreamUrl(track.playbackUrl)
                }));
            }
            return response.data;
        } catch (error) {
            console.error('MusicAPI searchMusic error:', error.response ? error.response.data : error.message);
            throw error.response ? error.response.data : new Error('Failed to search music');
        }
    },
    getMusicDetails: async (musicId, authToken) => {
        if (!musicId) throw new Error('Music ID is required for getMusicDetails');
        try {
            const config = {};
            if (authToken) {
                config.headers = { Authorization: `Bearer ${authToken}` };
            }
            const response = await apiClient.get(`/${musicId}`, config);
            if (response.data && response.data.data) {
                response.data.data.fullPlaybackUrl = getFullStreamUrl(response.data.data.playbackUrl);
            }
            return response.data;
        } catch (error) {
            console.error('MusicAPI getMusicDetails error:', error.response ? error.response.data : error.message);
            throw error.response ? error.response.data : new Error('Failed to fetch music details');
        }
    },
    fetchAudioForPlayback: async (fullPlaybackUrl, authToken) => {
        if (!fullPlaybackUrl) throw new Error('Playback URL is required to fetch audio');
        try {
            const config = { responseType: 'arraybuffer' };
            if (authToken) {
                config.headers = { Authorization: `Bearer ${authToken}` };
            }
            const response = await axios.get(fullPlaybackUrl, config);
            return response.data; // This will be an ArrayBuffer
        } catch (error) {
            console.error('MusicAPI fetchAudioForPlayback error:', error.response ? error.response.statusText : error.message);
            throw error.response ? new Error(`Failed to fetch audio: ${error.response.statusText}`) : new Error('Failed to fetch audio');
        }
    }

};

export default MusicAPI;