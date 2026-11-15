import api from './axiosInstance';

// Admin only: the server rejects everyone else, whatever the frontend does

// ---------- Video categories ----------
export const getAdminVideoCategories = () => api.get('/admin/video-categories').then((res) => res.data.categories);
export const createVideoCategory = (data) => api.post('/admin/video-categories', data).then((res) => res.data.category);
export const updateVideoCategory = (id, data) => api.put(`/admin/video-categories/${id}`, data).then((res) => res.data.category);
export const deleteVideoCategory = (id) => api.delete(`/admin/video-categories/${id}`).then((res) => res.data);

// ---------- Videos ----------
export const getAdminVideos = (params) => api.get('/admin/videos', { params }).then((res) => res.data);
export const getAdminVideo = (id) => api.get(`/admin/videos/${id}`).then((res) => res.data.video);
export const createVideo = (data) => api.post('/admin/videos', data).then((res) => res.data.video);
export const updateVideo = (id, data) => api.put(`/admin/videos/${id}`, data).then((res) => res.data.video);
export const deleteVideo = (id) => api.delete(`/admin/videos/${id}`).then((res) => res.data);

// ---------- Articles ----------
export const getAdminArticles = (params) => api.get('/admin/articles', { params }).then((res) => res.data);
export const getAdminArticle = (id) => api.get(`/admin/articles/${id}`).then((res) => res.data.article);
export const createArticle = (data) => api.post('/admin/articles', data).then((res) => res.data.article);
export const updateArticle = (id, data) => api.put(`/admin/articles/${id}`, data).then((res) => res.data.article);
export const deleteArticle = (id) => api.delete(`/admin/articles/${id}`).then((res) => res.data);