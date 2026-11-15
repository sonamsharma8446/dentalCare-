import api from './axiosInstance';

// Each function returns just the useful part of the response
export const register = (data) => api.post('/auth/register', data).then((res) => res.data.user);
export const login = (data) => api.post('/auth/login', data).then((res) => res.data.user);
export const logout = () => api.post('/auth/logout').then((res) => res.data);
export const getMe = () => api.get('/auth/me').then((res) => res.data.user);

export const updateProfile = (data) => api.put('/users/profile', data).then((res) => res.data.user);
export const changePassword = (data) => api.put('/users/password', data).then((res) => res.data);
