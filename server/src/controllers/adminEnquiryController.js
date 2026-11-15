import * as enquiryService from '../services/enquiryService.js';
import * as reportService from '../services/reportService.js';
import { parse } from '../middleware/validate.js';
import { adminEnquiryQuerySchema } from '../validators/enquiryValidators.js';

export async function listEnquiries(req, res) {
  const query = parse(adminEnquiryQuerySchema, req.query);
  const { enquiries, pagination } = await enquiryService.listEnquiries(query);
  res.json({ success: true, enquiries, pagination });
}

// GET /api/v1/admin/enquiries/export?status=&search=   downloads a CSV file
export async function exportEnquiries(req, res) {
  const { search, status } = parse(adminEnquiryQuerySchema, req.query);
  const csv = await enquiryService.exportEnquiriesCsv({ search, status });
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="enquiries.csv"');
  res.send(csv);
}

export async function getEnquiry(req, res) {
  const enquiry = await enquiryService.getEnquiry(req.params.id);
  res.json({ success: true, enquiry });
}

export async function updateEnquiry(req, res) {
  const enquiry = await enquiryService.updateEnquiry(req.params.id, req.body);
  res.json({ success: true, enquiry });
}

export async function deleteEnquiry(req, res) {
  await enquiryService.deleteEnquiry(req.params.id);
  res.json({ success: true, message: 'Enquiry deleted' });
}

// GET /api/v1/admin/dashboard
export async function getDashboard(req, res) {
  const dashboard = await reportService.getDashboard();
  res.json({ success: true, dashboard });
}

// GET /api/v1/admin/reports
export async function getReports(req, res) {
  const reports = await reportService.getReports();
  res.json({ success: true, reports });
}