import api from './axiosInstance';

// Public videos and articles: anyone can call these

export const getVideoCategories = () => api.get('/video-categories').then((res) => res.data.categories);

// params: { search, category, page, limit }
export const getVideos = (params, signal) => api.get('/videos', { params, signal }).then((res) => res.data);
export const getVideo = (slug) => api.get(`/videos/${slug}`).then((res) => res.data.video);
export const getRelatedVideos = (slug) => api.get(`/videos/${slug}/related`).then((res) => res.data.videos);

// params: { search, kind, page, limit }
export const getArticles = (params, signal) => api.get('/articles', { params, signal }).then((res) => res.data);
export const getArticle = (slug) => api.get(`/articles/${slug}`).then((res) => res.data.article);