import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { getAdminConcern, createConcern, updateConcern } from '../../api/adminConcernApi';
import FormField from '../../components/common/FormField';
import TextAreaField from '../../components/common/TextAreaField';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';
import ProductMapper from '../../components/concern/ProductMapper';

const emptyForm = {
  name: '',
  summary: '',
  description: '',
  precautionsText: '', // one precaution per line; turned into a list when saving
  whenToSeeDentist: '',
  sourceNote: '',
  isActive: true,
};

const formFromConcern = (c) => ({
  name: c.name,
  summary: c.summary || '',
  description: c.description || '',
  precautionsText: (c.precautions || []).join('\n'),
  whenToSeeDentist: c.whenToSeeDentist || '',
  sourceNote: c.sourceNote || '',
  isActive: c.isActive,
});

// Server errors for list items look like "precautions.2": show them under the precautions box
const errorFor = (errors, field) => errors[field] || errors[Object.keys(errors).find((k) => k.startsWith(`${field}.`))];

// Used for both "Add concern" (no id in the address) and "Edit concern" (/admin/concerns/:id/edit)
export default function AdminConcernForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const location = useLocation();

  const [concern, setConcern] = useState(null); // the saved concern (edit mode)
  const [products, setProducts] = useState([]); // products linked to it (edit mode)
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: 'error', text: '' });
  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);

  // Load the concern when editing. Runs again if the address changes.
  useEffect(() => {
    let cancelled = false;
    setLoadError('');
    setErrors({});
    setConcern(null);
    setProducts([]);
    setForm(emptyForm);
    setMessage(location.state?.message ? { type: 'success', text: location.state.message } : { type: 'error', text: '' });

    if (!isEdit) {
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    getAdminConcern(id)
      .then((data) => {
        if (cancelled) return;
        setConcern(data.concern);
        setProducts(data.products);
        setForm(formFromConcern(data.concern));
      })
      .catch((error) => !cancelled && setLoadError(error.message))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    setMessage({ type: 'error', text: '' });

    const payload = {
      name: form.name,
      summary: form.summary,
      description: form.description,
      precautions: form.precautionsText.split('\n').map((line) => line.trim()).filter(Boolean),
      whenToSeeDentist: form.whenToSeeDentist,
      sourceNote: form.sourceNote,
      isActive: form.isActive,
    };

    try {
      if (isEdit) {
        const updated = await updateConcern(id, payload);
        setConcern(updated);
        setForm(formFromConcern(updated));
        setMessage({ type: 'success', text: 'Changes saved' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const created = await createConcern(payload);
        // Products need a saved concern, so continue on the edit page where they can be linked
        navigate(`/admin/concerns/${created._id}/edit`, {
          state: { message: 'Concern created. You can now link products below.' },
        });
      }
    } catch (error) {
      const fieldErrors = error.response?.data?.errors || {};
      setErrors(fieldErrors);
      setMessage({
        type: 'error',
        text: Object.keys(fieldErrors).length ? 'Please fix the highlighted fields.' : error.message,
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;
  if (loadError) {
    return (
      <div className="space-y-4">
        <Alert>{loadError}</Alert>
        <Link to="/admin/concerns" className="text-sm font-medium text-teal-700 hover:underline">
          Back to concerns
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-slate-900">{isEdit ? 'Edit concern' : 'Add concern'}</h2>
        <div className="flex gap-4 text-sm font-medium">
          {isEdit && concern?.isActive && (
            <Link to={`/concerns/${concern.slug}`} className="text-teal-700 hover:underline">
              View on website
            </Link>
          )}
          <Link to="/admin/concerns" className="text-slate-600 hover:underline">
            Back to concerns
          </Link>
        </div>
      </div>

      <Alert type={message.type}>{message.text}</Alert>

      <form onSubmit={handleSubmit} noValidate className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
          Write only what comes from a reliable source, such as a dental association page or a dentist's advice. Do not
          guess or add claims you cannot support. Note your source at the bottom.
        </p>

        <FormField label="Concern name *" name="name" value={form.name} onChange={handleChange} error={errors.name} />
        <TextAreaField
          label="Short summary"
          name="summary"
          rows={2}
          value={form.summary}
          onChange={handleChange}
          error={errors.summary}
          help="One or two sentences shown on the concern cards (up to 300 characters)"
        />
        <TextAreaField label="Description" name="description" rows={6} value={form.description} onChange={handleChange} error={errors.description} />
        <TextAreaField
          label="Precautions"
          name="precautionsText"
          value={form.precautionsText}
          onChange={handleChange}
          error={errorFor(errors, 'precautions')}
          help="One precaution per line. Up to 20."
        />
        <TextAreaField
          label="When to see a dentist"
          name="whenToSeeDentist"
          rows={3}
          value={form.whenToSeeDentist}
          onChange={handleChange}
          error={errors.whenToSeeDentist}
        />
        <FormField
          label="Where did this information come from?"
          name="sourceNote"
          value={form.sourceNote}
          onChange={handleChange}
          error={errors.sourceNote}
          help="For example a dental association page or a dentist's name. Shown to visitors."
        />

        <label className="flex items-center gap-2 pt-2 text-sm text-slate-700">
          <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
          Visible on the website
        </label>

        <div className="pt-2">
          <button type="submit" disabled={saving} className="rounded-md bg-teal-600 px-6 py-2 font-medium text-white hover:bg-teal-700 disabled:opacity-60">
            {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create concern'}
          </button>
        </div>
      </form>

      {isEdit && concern && <ProductMapper concernId={concern._id} products={products} onChange={setProducts} />}
    </div>
  );
}