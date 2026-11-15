import api from './axiosInstance';

// Public dental concerns: anyone can call these

// params: { search }
export const getConcerns = (params, signal) =>
  api.get('/concerns', { params, signal }).then((res) => res.data.concerns);

export const getConcern = (slug) => api.get(`/concerns/${slug}`).then((res) => res.data.concern);

export const getConcernProducts = (slug) =>
  api.get(`/concerns/${slug}/products`).then((res) => res.data.products);