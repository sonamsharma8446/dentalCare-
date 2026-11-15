import mongoose from 'mongoose';
import Enquiry from '../models/Enquiry.js';
import Product from '../models/Product.js';
import ApiError from '../utils/ApiError.js';

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function assertValidId(id) {
  if (!mongoose.isValidObjectId(id)) throw new ApiError(404, 'Enquiry not found');
}

// ---------- Public ----------

// Returns the saved enquiry, or null when the hidden "leaveBlank" field was filled in (a spam bot).
// The caller answers "success" either way, so bots get no hint that they were caught.
export async function createEnquiry({ name, email, phone, message, product, leaveBlank }) {
  if (leaveBlank && leaveBlank.trim() !== '') return null;

  const data = { name, email, phone: phone || '', message };

  if (product) {
    const found = await Product.findOne({ _id: product, isActive: true }).select('name');
    if (!found) throw new ApiError(400, 'That product could not be found', { product: 'That product could not be found' });
    data.product = found._id;
    data.productName = found.name;
  }

  return Enquiry.create(data);
}

// ---------- Admin ----------

function buildFilter({ search, status }) {
  const filter = {};
  if (status) filter.status = status;
  if (search) {
    // Escaped so user input is treated as plain text, never as a regex pattern
    const pattern = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ name: pattern }, { email: pattern }, { message: pattern }, { productName: pattern }];
  }
  return filter;
}

export async function listEnquiries({ page, limit, search, status }) {
  const filter = buildFilter({ search, status });
  const [enquiries, total] = await Promise.all([
    Enquiry.find(filter)
      .select('-message') // the list shows a short preview made below, not the whole message
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Enquiry.countDocuments(filter),
  ]);
  return { enquiries, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

export async function getEnquiry(id) {
  assertValidId(id);
  const enquiry = await Enquiry.findById(id).populate('product', 'name slug isActive');
  if (!enquiry) throw new ApiError(404, 'Enquiry not found');
  return enquiry;
}

export async function updateEnquiry(id, data) {
  assertValidId(id);
  const enquiry = await Enquiry.findById(id);
  if (!enquiry) throw new ApiError(404, 'Enquiry not found');
  enquiry.set(data);
  await enquiry.save();
  return enquiry.populate('product', 'name slug isActive');
}

export async function deleteEnquiry(id) {
  assertValidId(id);
  const enquiry = await Enquiry.findById(id);
  if (!enquiry) throw new ApiError(404, 'Enquiry not found');
  await enquiry.deleteOne();
}

// A cell that starts with = + - @ could be run as a formula when the file is opened in Excel.
// A leading apostrophe turns it back into plain text.
function csvCell(value) {
  let text = String(value ?? '');
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export async function exportEnquiriesCsv(filters) {
  const enquiries = await Enquiry.find(buildFilter(filters)).sort({ createdAt: -1, _id: -1 }).limit(5000).lean();
  const header = ['Date', 'Name', 'Email', 'Phone', 'Product', 'Status', 'Message', 'Admin note'];
  const rows = enquiries.map((e) => [
    new Date(e.createdAt).toISOString().slice(0, 16).replace('T', ' ') + ' UTC',
    e.name,
    e.email,
    e.phone,
    e.productName,
    e.status,
    e.message,
    e.adminNote,
  ]);
  // The BOM at the start makes Excel read the file as UTF-8
  return '\uFEFF' + [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n') + '\r\n';
}