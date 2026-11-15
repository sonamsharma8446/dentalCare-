import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getAdminEnquiry, updateEnquiry, deleteEnquiry } from '../../api/adminEnquiryApi';
import EnquiryStatus from '../../components/admin/EnquiryStatus';
import SelectField from '../../components/common/SelectField';
import TextAreaField from '../../components/common/TextAreaField';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';
import { formatDateTime } from '../../utils/date';

export default function AdminEnquiryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [enquiry, setEnquiry] = useState(null);
  const [form, setForm] = useState({ status: 'new', adminNote: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: 'error', text: '' });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError('');
    getAdminEnquiry(id)
      .then((data) => {
        if (cancelled) return;
        setEnquiry(data);
        setForm({ status: data.status, adminNote: data.adminNote || '' });
      })
      .catch((error) => !cancelled && setLoadError(error.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: undefined });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    setMessage({ type: 'error', text: '' });
    try {
      const updated = await updateEnquiry(id, form);
      setEnquiry(updated);
      setForm({ status: updated.status, adminNote: updated.adminNote || '' });
      setMessage({ type: 'success', text: 'Changes saved' });
    } catch (error) {
      const fieldErrors = error.response?.data?.errors || {};
      setErrors(fieldErrors);
      setMessage({ type: 'error', text: Object.keys(fieldErrors).length ? 'Please fix the highlighted fields.' : error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this enquiry? This cannot be undone.')) return;
    try {
      await deleteEnquiry(id);
      navigate('/admin/enquiries', { state: { message: 'Enquiry deleted' } });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  if (loading) return <Loader />;
  if (loadError) {
    return (
      <div className="space-y-4">
        <Alert>{loadError}</Alert>
        <Link to="/admin/enquiries" className="text-sm font-medium text-teal-700 hover:underline">
          Back to enquiries
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-slate-900">Enquiry from {enquiry.name}</h2>
        <Link to="/admin/enquiries" className="text-sm font-medium text-slate-600 hover:underline">
          Back to enquiries
        </Link>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <EnquiryStatus status={enquiry.status} />
          <span>Received {formatDateTime(enquiry.createdAt)}</span>
        </div>

        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-medium text-slate-500">Name</dt>
            <dd className="mt-1 text-slate-900">{enquiry.name}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Email</dt>
            <dd className="mt-1">
              <a href={`mailto:${enquiry.email}`} className="font-medium text-teal-700 hover:underline">
                {enquiry.email}
              </a>
            </dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Phone</dt>
            <dd className="mt-1 text-slate-900">
              {enquiry.phone ? (
                <a href={`tel:${enquiry.phone.replace(/[^\d+]/g, '')}`} className="font-medium text-teal-700 hover:underline">
                  {enquiry.phone}
                </a>
              ) : (
                'Not given'
              )}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">About</dt>
            <dd className="mt-1 text-slate-900">
              {enquiry.product && enquiry.product.isActive ? (
                <Link to={`/products/${enquiry.product.slug}`} className="font-medium text-teal-700 hover:underline">
                  {enquiry.product.name}
                </Link>
              ) : (
                enquiry.productName || 'General question'
              )}
            </dd>
          </div>
        </dl>

        <div className="mt-6">
          <p className="text-sm font-medium text-slate-500">Message</p>
          <p className="mt-2 whitespace-pre-line break-words rounded-md bg-slate-50 p-4 text-slate-800">{enquiry.message}</p>
        </div>
      </section>

      <Alert type={message.type}>{message.text}</Alert>

      <form onSubmit={handleSubmit} noValidate className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="font-semibold text-slate-900">Follow-up</h3>
        <SelectField label="Status" name="status" value={form.status} onChange={handleChange} error={errors.status}>
          <option value="new">New</option>
          <option value="read">Read</option>
          <option value="resolved">Resolved</option>
        </SelectField>
        <TextAreaField
          label="Private note"
          name="adminNote"
          rows={4}
          value={form.adminNote}
          onChange={handleChange}
          error={errors.adminNote}
          help="Only admins can see this. For example: who replied and when."
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button type="submit" disabled={saving} className="rounded-md bg-teal-600 px-6 py-2 font-medium text-white hover:bg-teal-700 disabled:opacity-60">
            {saving ? 'Saving...' : 'Save changes'}
          </button>
          <button type="button" onClick={handleDelete} className="text-sm font-medium text-red-600 hover:underline">
            Delete enquiry
          </button>
        </div>
      </form>
    </div>
  );
}