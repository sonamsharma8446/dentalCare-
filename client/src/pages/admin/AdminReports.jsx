import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getReports } from '../../api/adminReportApi';
import BarList from '../../components/admin/BarList';
import { statusLabel } from '../../components/admin/EnquiryStatus';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';
import { formatDateTime } from '../../utils/date';

function Panel({ title, note, children }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="font-semibold text-slate-900">{title}</h3>
      {note && <p className="mt-1 text-xs text-slate-500">{note}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function AdminReports() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    getReports()
      .then((result) => !cancelled && setData(result))
      .catch((err) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return <Alert>{error}</Alert>;
  if (!data) return <Loader />;

  const monthly = (rows) => rows.map((row) => ({ label: row.month, value: row.count }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl font-semibold text-slate-900">Reports</h2>
        <p className="text-xs text-slate-500">Updated {formatDateTime(data.generatedAt)}. Months are counted in UTC.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Enquiries per month" note="Last 6 months">
          <BarList items={monthly(data.enquiriesByMonth)} />
        </Panel>
        <Panel title="New users per month" note="Last 6 months">
          <BarList items={monthly(data.usersByMonth)} />
        </Panel>
        <Panel title="Enquiries by status">
          <BarList items={data.enquiriesByStatus.map((row) => ({ label: statusLabel[row.status], value: row.count }))} />
        </Panel>
        <Panel title="Most asked-about products" note="Enquiries sent from a product page">
          <BarList items={data.topEnquiredProducts.map((row) => ({ label: row.name, value: row.count }))} emptyText="No product enquiries yet." />
        </Panel>
      </div>

      <Panel title="Products in each category">
        {data.productsByCategory.length === 0 ? (
          <p className="text-sm text-slate-500">No categories yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-500">
                <tr>
                  <th className="py-2 pr-4 font-medium">Category</th>
                  <th className="py-2 pr-4 font-medium">Products</th>
                  <th className="py-2 font-medium">Visible on website</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.productsByCategory.map((row) => (
                  <tr key={row.name}>
                    <td className="py-2 pr-4 font-medium text-slate-900">{row.name}</td>
                    <td className="py-2 pr-4 text-slate-700">{row.total}</td>
                    <td className="py-2 text-slate-700">{row.visible}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Panel
        title="Visible products with missing information"
        note="These products are shown on the website but are missing something. Add it from the product's own packaging or label."
      >
        {data.productsMissingInfo.total === 0 ? (
          <p className="text-sm text-slate-500">Every visible product has an image, description, usage instructions and precautions.</p>
        ) : (
          <>
            <ul className="divide-y divide-slate-100">
              {data.productsMissingInfo.items.map((item) => (
                <li key={item._id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                  <div>
                    <Link to={`/admin/products/${item._id}/edit`} className="font-medium text-teal-700 hover:underline">
                      {item.name}
                    </Link>
                    <span className="ml-2 text-slate-500">missing {item.missing.join(', ')}</span>
                  </div>
                </li>
              ))}
            </ul>
            {data.productsMissingInfo.total > data.productsMissingInfo.items.length && (
              <p className="mt-3 text-xs text-slate-500">
                Showing {data.productsMissingInfo.items.length} of {data.productsMissingInfo.total}.
              </p>
            )}
          </>
        )}
      </Panel>

      <Panel title="Visible dental concerns with no products" note="No visible product is linked to these concerns yet.">
        {data.concernsWithoutProducts.length === 0 ? (
          <p className="text-sm text-slate-500">Every visible concern has at least one product.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {data.concernsWithoutProducts.map((concern) => (
              <li key={concern._id}>
                <Link to={`/admin/concerns/${concern._id}/edit`} className="inline-block rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-700 hover:bg-slate-100">
                  {concern.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}