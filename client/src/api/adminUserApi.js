import api from './axiosInstance';

// Admin only: the server rejects everyone else, whatever the frontend does

// params: { search, role, isActive, page, limit }
export const getAdminUsers = (params) => api.get('/admin/users', { params }).then((res) => res.data);

// changes: { isActive } and/or { role }
export const updateAdminUser = (id, changes) => api.put(`/admin/users/${id}`, changes).then((res) => res.data.user);