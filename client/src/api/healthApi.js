import api from './axiosInstance';

// Each resource gets its own small API module like this one
export const getHealth = () => api.get('/health').then((res) => res.data);
