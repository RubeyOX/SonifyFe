// --- START OF FILE genreAPI.js ---
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1/genres';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
});

const GenreAPI = {
    createGenre: async ({ name }, authToken) => {
        if (!name) throw new Error('Genre name is required');
        try {
            const config = {};
            if (authToken) {
                config.headers = { Authorization: `Bearer ${authToken}` }; // Assuming artists/admins create genres
            }
            const response = await apiClient.post('/', { name }, config);
            return response.data;
        } catch (error) {
            console.error('GenreAPI createGenre error:', error.response ? error.response.data : error.message);
            throw error.response ? error.response.data : new Error('Failed to create genre');
        }
    },

    listGenres: async ({ page = 1, limit = 20, search } = {}, authToken) => {
        try {
            const params = { page, limit };
            if (search) params.search = search;
            const config = { params };
            if (authToken) { // If listing genres is protected or personalized
                config.headers = { Authorization: `Bearer ${authToken}` };
            }
            const response = await apiClient.get('/', config);
            return response.data;
        } catch (error) {
            console.error('GenreAPI listGenres error:', error.response ? error.response.data : error.message);
            throw error.response ? error.response.data : new Error('Failed to list genres');
        }
    },
};

export default GenreAPI;
// --- END OF FILE genreAPI.js ---