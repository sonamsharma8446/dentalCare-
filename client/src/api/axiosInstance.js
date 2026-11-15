import axios from 'axios';

// One shared axios instance for the whole app.
// withCredentials lets the browser send the httpOnly auth cookie (added in Phase 2).
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  withCredentials: true,
});

// Use the server's error message when there is one, so components can simply show error.message
api.interceptors.response.use(
  (response) => response,
  (error) => {
    error.message = error.response?.data?.message || error.message;
    return Promise.reject(error);
  }
);

export default api;
