// --- START OF FILE featuresAPI.js ---
import axios from 'axios';

const API_BASE_URL = 'https://sonify-backend.onrender.com/api/v1/features';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
});

const FeaturesAPI = {
    toggleLike: async ({ item_id, item_type }, authToken) => {
        if (!item_id || !item_type) throw new Error('Item ID and Item Type are required for toggleLike');
        try {
            const config = {};
            if (authToken) {
                config.headers = { Authorization: `Bearer ${authToken}` };
            }
            const response = await apiClient.post('/favorite/toggle', { item_id, item_type }, config);
            return response.data; // Expected: { success: true, data: { liked, item_id, item_type, current_like_count }, message }
        } catch (error) {
            console.error('FeaturesAPI toggleLike error:', error.response ? error.response.data : error.message);
            throw error.response ? error.response.data : new Error('Failed to toggle like status');
        }
    },
};

export default FeaturesAPI;
// --- END OF FILE featuresAPI.js ---