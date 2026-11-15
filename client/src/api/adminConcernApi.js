import api from './axiosInstance';

// Admin only: the server rejects everyone else, whatever the frontend does

export const getAdminConcerns = (params) => api.get('/admin/concerns', { params }).then((res) => res.data.concerns);

// Returns { concern, products } where products are the ones linked to this concern
export const getAdminConcern = (id) => api.get(`/admin/concerns/${id}`).then((res) => res.data);

export const createConcern = (data) => api.post('/admin/concerns', data).then((res) => res.data.concern);
export const updateConcern = (id, data) => api.put(`/admin/concerns/${id}`, data).then((res) => res.data.concern);
export const deleteConcern = (id) => api.delete(`/admin/concerns/${id}`).then((res) => res.data);

// Linking products. Both return the updated list of linked products.
export const addProductToConcern = (id, productId) =>
  api.post(`/admin/concerns/${id}/products`, { productId }).then((res) => res.data.products);
export const removeProductFromConcern = (id, productId) =>
  api.delete(`/admin/concerns/${id}/products/${productId}`).then((res) => res.data.products);