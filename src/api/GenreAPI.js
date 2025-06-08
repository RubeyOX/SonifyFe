// --- START OF FILE genreAPI.js ---
import axios from 'axios';

const API_BASE_URL = 'https://sonify-backend.onrender.com/api/v1/genres';

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

    listGenres: async () => {
        try {
            const response=await apiClient.get('/list')
            return response.data;
        } catch (error) {
            console.error('GenreAPI listGenres error:', error.response ? error.response.data : error.message);
            throw error.response ? error.response.data : new Error('Failed to list genres');
        }
    },
};

export default GenreAPI;
// --- END OF FILE genreAPI.js ---