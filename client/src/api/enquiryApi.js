import api from './axiosInstance';

// Public: anyone can send a message from the Contact page
export const sendEnquiry = (data) => api.post('/enquiries', data).then((res) => res.data);