import { useCallback, useEffect, useState } from 'react';
import {
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../api/adminCatalogApi';
import FormField from '../../components/common/FormField';
import TextAreaField from '../../components/common/TextAreaField';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';

const emptyForm = { name: '', description: '' };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null); // null = adding a new category
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: 'error', text: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setCategories(await getAdminCategories());
      setLoadError('');
    } catch (error) {
      setLoadError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const startEdit = (category) => {
    setEditingId(category._id);
    setForm({ name: category.name, description: category.description || '' });
    setErrors({});
    setMessage({ type: 'error', text: '' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    setMessage({ type: 'error', text: '' });
    try {
      if (editingId) await updateCategory(editingId, form);
      else await createCategory(form);
      setMessage({ type: 'success', text: editingId ? 'Category updated' : 'Category added' });
      cancelEdit();
      await load();
    } catch (error) {
      const fieldErrors = error.response?.data?.errors || {};
      setErrors(fieldErrors);
      if (!Object.keys(fieldErrors).length) setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`Delete the category "${category.name}"?`)) return;
    setMessage({ type: 'error', text: '' });
    try {
      await deleteCategory(category._id);
      if (editingId === category._id) cancelEdit();
      setMessage({ type: 'success', text: 'Category deleted' });
      await load();
    } catch (error) {
      setMessage({ type: 'error', text: error.message }); // e.g. "used by 3 products"
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-900">Categories</h2>

      <form onSubmit={handleSubmit} noValidate className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="font-semibold text-slate-900">{editingId ? 'Edit category' : 'Add a category'}</h3>
        <FormField label="Name" name="name" value={form.name} onChange={handleChange} error={errors.name} />
        <TextAreaField
          label="Description (optional)"
          name="description"
          rows={2}
          value={form.description}
          onChange={handleChange}
          error={errors.description}
        />
        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="rounded-md bg-teal-600 px-5 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60">
            {saving ? 'Saving...' : editingId ? 'Save changes' : 'Add category'}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} className="rounded-md border border-slate-300 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
          )}
        </div>
      </form>

      <Alert type={message.type}>{message.text}</Alert>
      <Alert>{loadError}</Alert>

      {loading ? (
        <Loader />
      ) : categories.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-500">
          No categories yet. Add your first one above.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Description</th>
                <th className="px-4 py-3 font-medium">Products</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map((category) => (
                <tr key={category._id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{category.name}</td>
                  <td className="hidden max-w-xs truncate px-4 py-3 text-slate-500 sm:table-cell">{category.description || '-'}</td>
                  <td className="px-4 py-3 text-slate-700">{category.productCount}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <button type="button" onClick={() => startEdit(category)} className="mr-3 font-medium text-teal-700 hover:underline">
                      Edit
                    </button>
                    <button type="button" onClick={() => handleDelete(category)} className="font-medium text-red-600 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}