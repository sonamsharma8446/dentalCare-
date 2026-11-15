import api from './axiosInstance';

// Admin only: the server rejects everyone else, whatever the frontend does
export const getAdminShops = (params) => api.get('/admin/shops', { params }).then((res) => res.data);
export const getAdminShop = (id) => api.get(`/admin/shops/${id}`).then((res) => res.data.shop);
export const createShop = (data) => api.post('/admin/shops', data).then((res) => res.data.shop);
export const updateShop = (id, data) => api.put(`/admin/shops/${id}`, data).then((res) => res.data.shop);
export const deleteShop = (id) => api.delete(`/admin/shops/${id}`).then((res) => res.data);