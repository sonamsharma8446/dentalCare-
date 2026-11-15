import api from './axiosInstance';

// Admin only: the server rejects everyone else, whatever the frontend does

// params: { search, status, page, limit }
export const getAdminEnquiries = (params) => api.get('/admin/enquiries', { params }).then((res) => res.data);
export const getAdminEnquiry = (id) => api.get(`/admin/enquiries/${id}`).then((res) => res.data.enquiry);
export const updateEnquiry = (id, changes) => api.put(`/admin/enquiries/${id}`, changes).then((res) => res.data.enquiry);
export const deleteEnquiry = (id) => api.delete(`/admin/enquiries/${id}`).then((res) => res.data);

// Downloads the enquiries (with the same search/status filters as the list) as a CSV file
export async function downloadEnquiriesCsv(params) {
  const res = await api.get('/admin/enquiries/export', { params, responseType: 'blob' });
  const url = URL.createObjectURL(res.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'enquiries.csv';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}