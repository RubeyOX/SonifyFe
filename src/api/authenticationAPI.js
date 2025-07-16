import axios from 'axios';

// const baseUrl = 'http://localhost:3000/api/v1/auth';
const baseUrl = 'https://sonifybe.onrender.com/api/v1/auth';

const authUrls = {
    signup: `${baseUrl}/signup`,
    login: `${baseUrl}/login`,
    requestVerification: `${baseUrl}/request-verification`,
    verifyEmail: `${baseUrl}/verify/t/:token`,
    logout: `${baseUrl}/logout`,
    getMe: `${baseUrl}/me`,
};

const authApi = {
    signup: async (userData) => {
        try {
            const response = await axios.post(authUrls.signup, userData);
            return response.data;
        } catch (error) {
            console.error('Signup API error:', error.response ? error.response.data : error.message);
            throw error.response ? error.response.data : new Error('Signup failed');
        }
    },

    login: async (credentials) => {
        try {
            const response = await axios.post(authUrls.login, credentials);
            return response.data;
        } catch (error) {
            console.error('Login API error:', error.response ? error.response.data : error.message);
            throw error.response ? error.response.data : new Error('Login failed');
        }
    },

    requestVerification: async (emailData) => {
        try {
            const response = await axios.post(authUrls.requestVerification, {"email": emailData});
            return response.data;
        } catch (error) {
            console.error('Request Verification API error:', error.response ? error.response.data : error.message);
            throw error.response ? error.response.data : new Error('Request verification failed');
        }
    },

    verifyEmail: async ({ token }) => {
        if (!token) {
            console.error('Verify Email: Token is required.');
            throw new Error('Token is required for email verification.');
        }
        try {
            const url = authUrls.verifyEmail.replace(':token', token);
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            console.error('Verify Email API error:', error.response ? error.response.data : error.message);
            throw error.response ? error.response.data : new Error('Email verification failed');
        }
    },

    logout: async (token) => {
        try {
            const config = {};
            if (token) {
                config.headers = { Authorization: `Bearer ${token}` };
            }
            const response = await axios.post(authUrls.logout, {}, config);
            return response.data;
        } catch (error) {
            console.error('Logout API error:', error.response ? error.response.data : error.message);
            throw error.response ? error.response.data : new Error('Logout failed');
        }
    },

    getMe: async (token) => {
        try {
            const config = {};
            if (token) {
                config.headers = { Authorization: `Bearer ${token}` };
            }
            const response = await axios.get(authUrls.getMe, config);
            return response.data;
        } catch (error) {
            console.error('Get Me API error:', error.response ? error.response.data : error.message);
            throw error.response ? error.response.data : new Error('Failed to get user details');
        }
    },
};

export default authApi;