// --- START OF FILE libraryAPI.js ---
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1/library';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
});

const LibraryAPI = {
    addItemToLibrary: async ({ item_id, item_type }, authToken) => {
        if (!item_id || !item_type) throw new Error('Item ID and Item Type are required');
        try {
            const config = {};
            if (authToken) {
                config.headers = { Authorization: `Bearer ${authToken}` };
            }
            const response = await apiClient.post('/items', { item_id, item_type }, config);
            return response.data;
        } catch (error) {
            console.error('LibraryAPI addItemToLibrary error:', error.response ? error.response.data : error.message);
            throw error.response ? error.response.data : new Error('Failed to add item to library');
        }
    },

    removeItemFromLibrary: async ({ item_id, item_type }, authToken) => {
        if (!item_id || !item_type) throw new Error('Item ID and Item Type are required');
        try {
            const config = { data: { item_id, item_type } }; // For DELETE with body
            if (authToken) {
                config.headers = { Authorization: `Bearer ${authToken}` };
            }
            const response = await apiClient.delete('/items', config);
            return response.data;
        } catch (error) {
            console.error('LibraryAPI removeItemFromLibrary error:', error.response ? error.response.data : error.message);
            throw error.response ? error.response.data : new Error('Failed to remove item from library');
        }
    },

    listLibraryItems: async ({ item_type, page = 1, limit = 20, sortBy = 'added_date', sortOrder = 'desc' } = {}, authToken) => {
        try {
            const params = { page, limit, sortBy, sortOrder };
            if (item_type) params.item_type = item_type;

            const config = { params };
            if (authToken) {
                config.headers = { Authorization: `Bearer ${authToken}` };
            }
            const response = await apiClient.get('/items', config);
            // Process playbackUrls if music items are populated with details
            if (response.data?.data?.items) {
                response.data.data.items = response.data.data.items.map(libItem => {
                    if (libItem.item_type === 'music' && libItem.details && libItem.details.playbackUrl) {
                        return {
                            ...libItem,
                            details: {
                                ...libItem.details,
                                fullPlaybackUrl: getFullStreamUrl(libItem.details.playbackUrl) // Use the same helper
                            }
                        };
                    }
                    return libItem;
                });
            }
            return response.data;
        } catch (error) {
            console.error('LibraryAPI listLibraryItems error:', error.response ? error.response.data : error.message);
            throw error.response ? error.response.data : new Error('Failed to list library items');
        }
    },
};

// Re-using the helper from musicAPI or making it a shared util
const getFullStreamUrl = (playbackUrl) => {
    if (!playbackUrl) return '';
    if (playbackUrl.startsWith('http://') || playbackUrl.startsWith('https://')) {
        return playbackUrl;
    }
    const backendOrigin = 'http://localhost:3000';
    try {
        if (playbackUrl.startsWith('/api/v1/music/stream/')) {
             return `${backendOrigin}${playbackUrl}`;
        }
        const url = new URL(playbackUrl, 'http://localhost:3000/api/v1/music');
        return url.toString();
    } catch (e) {
        console.error("Failed to construct full playback URL:", playbackUrl, e);
        return `${backendOrigin}${playbackUrl}`;
    }
};


export default LibraryAPI;
// --- END OF FILE libraryAPI.js ---