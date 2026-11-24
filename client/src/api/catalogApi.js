import api from './axiosInstance';

// Public catalogue: anyone can call these

export const getCategories = () => api.get('/categories').then((res) => res.data.categories);

// params: { search, category, inStock, sort, page, limit }
export const getProducts = (params, signal) =>
  api.get('/products', { params, signal }).then((res) => res.data);

export const getProduct = (slug) => api.get(`/products/${slug}`).then((res) => res.data.product);

export const getRelatedProducts = (slug) =>
  api.get(`/products/${slug}/related`).then((res) => res.data.products);