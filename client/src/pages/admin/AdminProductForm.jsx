import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  getAdminCategories,
  getAdminProduct,
  createProduct,
  updateProduct,
} from '../../api/adminCatalogApi';
import FormField from '../../components/common/FormField';
import TextAreaField from '../../components/common/TextAreaField';
import SelectField from '../../components/common/SelectField';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';
import ImageManager from '../../components/product/ImageManager';

const emptyForm = {
  name: '',
  brand: '',
  category: '',
  price: '',
  description: '',
  usageInstructions: '',
  precautionsText: '', // one precaution per line; turned into a list when saving
  isActive: true,
};

const formFromProduct = (p) => ({
  name: p.name,
  brand: p.brand || '',
  category: p.category?._id || '',
  price: String(p.price),
  description: p.description || '',
  usageInstructions: p.usageInstructions || '',
  precautionsText: (p.precautions || []).join('\n'),
  isActive: p.isActive ?? true,
});

// Server errors for list items look like "precautions.2": show them under the precautions box
const errorFor = (errors, field) => errors[field] || errors[Object.keys(errors).find((k) => k.startsWith(`${field}.`))];

// Used for both "Add product" (no id in the address) and "Edit product" (/admin/products/:id/edit)
export default function AdminProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const location = useLocation();

  const [categories, setCategories] = useState([]);
  const [product, setProduct] = useState(null); // the saved product (edit mode)
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: 'error', text: '' });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);

  // Load the categories (and the product when editing). Runs again if the address changes.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError('');
    setErrors({});
    setProduct(null);
    setForm(emptyForm);
    setMessage(location.state?.message ? { type: 'success', text: location.state.message } : { type: 'error', text: '' });

    Promise.all([getAdminCategories(), isEdit ? getAdminProduct(id) : Promise.resolve(null)])
      .then(([cats, existing]) => {
        if (cancelled) return;
        setCategories(cats);
        if (existing) {
          setProduct(existing);
          setForm(formFromProduct(existing));
        }
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
      brand: form.brand,
      category: form.category,
      price: form.price === '' ? undefined : Number(form.price),
      description: form.description,
      usageInstructions: form.usageInstructions,
      precautions: form.precautionsText.split('\n').map((p) => p.trim()).filter(Boolean),
      isActive: form.isActive,
    };

    try {
      if (isEdit) {
        const updated = await updateProduct(id, payload);
        setProduct((current) => ({ ...current, ...updated }));
        setForm(formFromProduct(updated));
        setMessage({ type: 'success', text: 'Changes saved' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const created = await createProduct(payload);
        // Images need a saved product, so continue on the edit page where they can be added
        navigate(`/admin/products/${created._id}/edit`, {
          state: { message: 'Product created. You can now add images below.' },
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
        <Link to="/admin/products" className="text-sm font-medium text-teal-700 hover:underline">
          Back to products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-slate-900">{isEdit ? 'Edit product' : 'Add product'}</h2>
        <div className="flex gap-4 text-sm font-medium">
          {isEdit && product?.isActive && (
            <Link to={`/products/${product.slug}`} className="text-teal-700 hover:underline">
              View on website
            </Link>
          )}
          <Link to="/admin/products" className="text-slate-600 hover:underline">
            Back to products
          </Link>
        </div>
      </div>

      <Alert type={message.type}>{message.text}</Alert>

      {categories.length === 0 && (
        <Alert>
          There are no categories yet.{' '}
          <Link to="/admin/categories" className="font-medium underline">
            Add a category
          </Link>{' '}
          before adding a product.
        </Alert>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        

        <FormField label="Product name *" name="name" value={form.name} onChange={handleChange} error={errors.name} />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Brand" name="brand" value={form.brand} onChange={handleChange} error={errors.brand} />
          <SelectField label="Category *" name="category" value={form.category} onChange={handleChange} error={errors.category}>
            <option value="">Choose a category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </SelectField>
        </div>

        <FormField
          label="Price (₹) *"
          name="price"
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          value={form.price}
          onChange={handleChange}
          error={errors.price}

          className="sm:max-w-xs"
        />

        <TextAreaField label="Description" name="description" value={form.description} onChange={handleChange} error={errors.description} />
        <TextAreaField
          label="Usage instructions"
          name="usageInstructions"
          value={form.usageInstructions}
          onChange={handleChange}
          error={errors.usageInstructions}

        />
        <TextAreaField
          label="Precautions"
          name="precautionsText"
          value={form.precautionsText}
          onChange={handleChange}
          error={errorFor(errors, 'precautions')}

        />
        <label className="flex items-center gap-2 pt-2 text-sm text-slate-700">
          <input
            type="checkbox"
            name="isActive"
            checked={form.isActive}
            onChange={handleChange}
            className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
          />
          Visible on the website
        </label>

        <div className="flex gap-2 pt-2">
          <button type="submit" disabled={saving} className="rounded-md bg-teal-600 px-6 py-2 font-medium text-white hover:bg-teal-700 disabled:opacity-60">
            {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create product'}
          </button>
        </div>
      </form>

      {isEdit && product && (
        <ImageManager product={product} onChange={(updated) => setProduct((current) => ({ ...current, ...updated }))} />
      )}
    </div>
  );
}