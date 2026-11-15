import api from './axiosInstance';

// Admin only: the server rejects everyone else, whatever the frontend does
export const getDashboard = () => api.get('/admin/dashboard').then((res) => res.data.dashboard);
export const getReports = () => api.get('/admin/reports').then((res) => res.data.reports);