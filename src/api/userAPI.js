import axios from "axios";

const API_BASE_URL = "https://sonifybe.onrender.com/api/v1/users";
// const API_BASE_URL = "http://localhost:3000/api/v1/users";
// const API_BASE_URL = "https://sonify-backend.onrender.com/api/v1/users";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

const userAPI = {
  listUser: async (
    { page = 1, limit = 10, sortBy, sortOrder = "desc" },
    authToken,signal
  ) => {
    try {
      const config = { params: { page, limit, sortBy, sortOrder },signal };
      if (!authToken) {
        throw new Error("Need token to list user");
      }
      config.headers = { Authorization: `Bearer ${authToken}` };
      const response = await apiClient.get("/lists", config);
      return response.data.data.users;
    } catch (err) {
      console.error(
        "UserAPI listUser error",
        err.response ? err.response.data : err.message
      );
    }
  },
  changeUserDetailManager: async (data, authToken) => {
    try {
      if (!authToken) {
        throw new Error("Need token to change user detail");
      }
      const { _id, username, role } = data;
      if (!_id || !username || !role) {
        throw new Error("Missing required fields: _id, username, or role.");
      }
      const config = {};
      config.headers = { Authorization: `Bearer ${authToken}` };
      const response = await apiClient.put("/change-detail", data, config);
      return response.data;
    } catch (err) {
      return err;
    }
  },
};

export default userAPI;
