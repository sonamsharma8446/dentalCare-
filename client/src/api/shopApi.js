import api from './axiosInstance';

// Public: anyone can call these

// params: { search, city, lat, lng, radiusKm, page, limit }
export const getShops = (params, signal) => api.get('/shops', { params, signal }).then((res) => res.data);
export const getShopCities = () => api.get('/shops/cities').then((res) => res.data.cities);
export const getShop = (id) => api.get(`/shops/${id}`).then((res) => res.data.shop);