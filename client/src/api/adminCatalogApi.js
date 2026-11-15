import api from './axiosInstance';

// Admin only: the server rejects everyone else, whatever the frontend does

// ---------- Categories ----------
export const getAdminCategories = () => api.get('/admin/categories').then((res) => res.data.categories);
export const createCategory = (data) => api.post('/admin/categories', data).then((res) => res.data.category);
export const updateCategory = (id, data) => api.put(`/admin/categories/${id}`, data).then((res) => res.data.category);
export const deleteCategory = (id) => api.delete(`/admin/categories/${id}`).then((res) => res.data);

// ---------- Products ----------
export const getAdminProducts = (params) => api.get('/admin/products', { params }).then((res) => res.data);
export const getAdminProduct = (id) => api.get(`/admin/products/${id}`).then((res) => res.data.product);
export const createProduct = (data) => api.post('/admin/products', data).then((res) => res.data.product);
export const updateProduct = (id, data) => api.put(`/admin/products/${id}`, data).then((res) => res.data.product);
export const deleteProduct = (id) => api.delete(`/admin/products/${id}`).then((res) => res.data);

// ---------- Product images ----------
export const uploadProductImages = (id, files) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file)); // the field must be called "images"
  return api.post(`/admin/products/${id}/images`, formData).then((res) => res.data.product);
};
export const deleteProductImage = (id, imageId) =>
  api.delete(`/admin/products/${id}/images/${imageId}`).then((res) => res.data.product);