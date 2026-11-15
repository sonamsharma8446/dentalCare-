import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard } from '../../api/adminReportApi';
import EnquiryStatus from '../../components/admin/EnquiryStatus';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';
import { formatDate } from '../../utils/date';

function StatCard({ title, value, to, children, highlight }) {
  return (
    <Link
      to={to}
      className={`rounded-lg border bg-white p-5 shadow-sm transition hover:border-teal-300 hover:shadow ${highlight ? 'border-amber-300' : 'border-slate-200'}`}
    >
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{children}</p>
    </Link>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    getDashboard()
      .then((result) => !cancelled && setData(result))
      .catch((err) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return <Alert>{error}</Alert>;
  if (!data) return <Loader />;

  const { enquiries, products, users } = data;

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-slate-900">Dashboard</h2>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard title="New enquiries" value={enquiries.new} to="/admin/enquiries?status=new" highlight={enquiries.new > 0}>
          {enquiries.total} in total, {enquiries.resolved} resolved
        </StatCard>
        <StatCard title="Products" value={products.total} to="/admin/products">
          {products.visible} visible, {products.hidden} hidden, {products.outOfStock} out of stock
        </StatCard>
        <StatCard title="Users" value={users.total} to="/admin/users">
          {users.admins} {users.admins === 1 ? 'admin' : 'admins'}, {users.inactive} deactivated
        </StatCard>
        <StatCard title="Dental concerns" value={data.concerns.total} to="/admin/concerns">
          {data.concerns.visible} visible
        </StatCard>
        <StatCard title="Videos" value={data.videos.total} to="/admin/videos">
          {data.videos.visible} visible
        </StatCard>
        <StatCard title="Articles and instructions" value={data.articles.total} to="/admin/articles">
          {data.articles.visible} visible
        </StatCard>
        <StatCard title="Medical shops" value={data.shops.total} to="/admin/shops">
          {data.shops.visible} visible
        </StatCard>
        <StatCard title="Product categories" value={data.categories} to="/admin/categories">
          Used to group products
        </StatCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Latest enquiries</h3>
            <Link to="/admin/enquiries" className="text-sm font-medium text-teal-700 hover:underline">
              View all
            </Link>
          </div>
          {data.recentEnquiries.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No enquiries yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100">
              {data.recentEnquiries.map((enquiry) => (
                <li key={enquiry._id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div className="min-w-0">
                    <Link to={`/admin/enquiries/${enquiry._id}`} className="font-medium text-slate-900 hover:text-teal-700 hover:underline">
                      {enquiry.name}
                    </Link>
                    <p className="truncate text-xs text-slate-500">
                      {formatDate(enquiry.createdAt)}
                      {enquiry.productName && ` · ${enquiry.productName}`}
                    </p>
                  </div>
                  <EnquiryStatus status={enquiry.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Newest users</h3>
            <Link to="/admin/users" className="text-sm font-medium text-teal-700 hover:underline">
              Manage users
            </Link>
          </div>
          <ul className="mt-3 divide-y divide-slate-100">
            {data.recentUsers.map((user) => (
              <li key={user._id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div className="min-w-0">
                  <p className="font-medium text-slate-900">{user.name}</p>
                  <p className="truncate text-xs text-slate-500">
                    {user.email} · joined {formatDate(user.createdAt)}
                  </p>
                </div>
                <span className="text-xs text-slate-500">{user.role === 'admin' ? 'Admin' : user.isActive ? '' : 'Deactivated'}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}