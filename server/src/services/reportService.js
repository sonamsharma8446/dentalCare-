import User from '../models/User.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Concern from '../models/Concern.js';
import Video from '../models/Video.js';
import Article from '../models/Article.js';
import Shop from '../models/Shop.js';
import Enquiry from '../models/Enquiry.js';

const count = (Model, filter = {}) => Model.countDocuments(filter);

// ---------- Dashboard: the numbers shown on the first admin screen ----------

export async function getDashboard() {
  const [
    usersTotal, admins, inactiveUsers,
    productsTotal, productsActive, outOfStock,
    categories, concernsTotal, concernsActive,
    videosTotal, videosActive, articlesTotal, articlesActive,
    shopsTotal, shopsActive,
    enquiriesNew, enquiriesRead, enquiriesResolved,
    recentEnquiries, recentUsers,
  ] = await Promise.all([
    count(User), count(User, { role: 'admin' }), count(User, { isActive: false }),
    count(Product), count(Product, { isActive: true }), count(Product, { isActive: true, inStock: false }),
    count(Category), count(Concern), count(Concern, { isActive: true }),
    count(Video), count(Video, { isActive: true }), count(Article), count(Article, { isActive: true }),
    count(Shop), count(Shop, { isActive: true }),
    count(Enquiry, { status: 'new' }), count(Enquiry, { status: 'read' }), count(Enquiry, { status: 'resolved' }),
    Enquiry.find().select('name email status productName createdAt').sort({ createdAt: -1, _id: -1 }).limit(5).lean(),
    User.find().select('name email role isActive createdAt').sort({ createdAt: -1, _id: -1 }).limit(5).lean(),
  ]);

  return {
    users: { total: usersTotal, admins, inactive: inactiveUsers },
    products: { total: productsTotal, visible: productsActive, hidden: productsTotal - productsActive, outOfStock },
    categories,
    concerns: { total: concernsTotal, visible: concernsActive },
    videos: { total: videosTotal, visible: videosActive },
    articles: { total: articlesTotal, visible: articlesActive },
    shops: { total: shopsTotal, visible: shopsActive },
    enquiries: { new: enquiriesNew, read: enquiriesRead, resolved: enquiriesResolved, total: enquiriesNew + enquiriesRead + enquiriesResolved },
    recentEnquiries,
    recentUsers,
  };
}

// ---------- Reports ----------

const MONTHS = 6;
const monthKey = (date) => `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
const monthLabel = (date) => date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' });

// The last 6 calendar months (UTC), oldest first, including the current month
function lastMonths(now = new Date()) {
  const list = [];
  for (let i = MONTHS - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    list.push({ key: monthKey(d), label: monthLabel(d), start: d });
  }
  return list;
}

async function monthlyCounts(Model, months) {
  const rows = await Model.find({ createdAt: { $gte: months[0].start } }).select('createdAt').lean();
  const byKey = new Map(months.map((m) => [m.key, 0]));
  for (const row of rows) {
    const key = monthKey(new Date(row.createdAt));
    if (byKey.has(key)) byKey.set(key, byKey.get(key) + 1);
  }
  return months.map((m) => ({ month: m.label, count: byKey.get(m.key) }));
}

export async function getReports() {
  const months = lastMonths();
  const [usersByMonth, enquiriesByMonth, categories, products, concerns, enquiriesWithProduct, statusCounts] = await Promise.all([
    monthlyCounts(User, months),
    monthlyCounts(Enquiry, months),
    Category.find().select('name').sort({ name: 1 }).lean(),
    Product.find().select('name category isActive images description usageInstructions precautions concerns').lean(),
    Concern.find().select('name isActive').sort({ name: 1 }).lean(),
    Enquiry.find({ product: { $ne: null } }).select('product productName').lean(),
    Promise.all(['new', 'read', 'resolved'].map((status) => count(Enquiry, { status }))),
  ]);

  // Products in each category
  const perCategory = new Map(categories.map((c) => [String(c._id), { name: c.name, total: 0, visible: 0 }]));
  for (const p of products) {
    const row = perCategory.get(String(p.category));
    if (!row) continue;
    row.total += 1;
    if (p.isActive) row.visible += 1;
  }

  // Visible products that are missing information (so nothing looks half-finished on the site)
  const missingInfo = [];
  for (const p of products) {
    if (!p.isActive) continue;
    const missing = [];
    if (!p.images || p.images.length === 0) missing.push('image');
    if (!p.description) missing.push('description');
    if (!p.usageInstructions) missing.push('usage instructions');
    if (!p.precautions || p.precautions.length === 0) missing.push('precautions');
    if (missing.length) missingInfo.push({ _id: p._id, name: p.name, missing });
  }

  // Dental concerns that no visible product is linked to
  const linked = new Set();
  for (const p of products) if (p.isActive) for (const c of p.concerns || []) linked.add(String(c));
  const concernsWithoutProducts = concerns.filter((c) => c.isActive && !linked.has(String(c._id))).map((c) => ({ _id: c._id, name: c.name }));

  // Products people ask about most
  const asked = new Map();
  for (const e of enquiriesWithProduct) {
    const key = String(e.product);
    const row = asked.get(key) || { name: e.productName || 'Deleted product', count: 0 };
    row.count += 1;
    asked.set(key, row);
  }
  const topEnquiredProducts = [...asked.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)).slice(0, 5);

  const [statusNew, statusRead, statusResolved] = statusCounts;
  return {
    generatedAt: new Date().toISOString(),
    usersByMonth,
    enquiriesByMonth,
    enquiriesByStatus: [
      { status: 'new', count: statusNew },
      { status: 'read', count: statusRead },
      { status: 'resolved', count: statusResolved },
    ],
    productsByCategory: [...perCategory.values()],
    topEnquiredProducts,
    productsMissingInfo: { total: missingInfo.length, items: missingInfo.slice(0, 20) },
    concernsWithoutProducts,
  };
}