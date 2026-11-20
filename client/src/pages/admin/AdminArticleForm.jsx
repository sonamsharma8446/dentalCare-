import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { getAdminArticle, createArticle, updateArticle } from '../../api/adminContentApi';
import FormField from '../../components/common/FormField';
import TextAreaField from '../../components/common/TextAreaField';
import SelectField from '../../components/common/SelectField';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';

const emptyForm = { title: '', kind: 'article', summary: '', body: '', sourceNote: '', isActive: true };

const formFromArticle = (a) => ({
  title: a.title,
  kind: a.kind,
  summary: a.summary || '',
  body: a.body || '',
  sourceNote: a.sourceNote || '',
  isActive: a.isActive,
});

// Used for both "Add article" (no id in the address) and "Edit article" (/admin/articles/:id/edit)
export default function AdminArticleForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const location = useLocation();

  const [article, setArticle] = useState(null); // the saved article (edit mode)
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: 'error', text: '' });
  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);

  // Load the article when editing. Runs again if the address changes.
  useEffect(() => {
    let cancelled = false;
    setLoadError('');
    setErrors({});
    setArticle(null);
    setForm(emptyForm);
    setMessage(location.state?.message ? { type: 'success', text: location.state.message } : { type: 'error', text: '' });

    if (!isEdit) {
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    getAdminArticle(id)
      .then((existing) => {
        if (cancelled) return;
        setArticle(existing);
        setForm(formFromArticle(existing));
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

    try {
      if (isEdit) {
        const updated = await updateArticle(id, form);
        setArticle(updated);
        setForm(formFromArticle(updated));
        setMessage({ type: 'success', text: 'Changes saved' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const created = await createArticle(form);
        navigate(`/admin/articles/${created._id}/edit`, { state: { message: 'Article created.' } });
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
        <Link to="/admin/articles" className="text-sm font-medium text-teal-700 hover:underline">
          Back to articles
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-slate-900">{isEdit ? 'Edit article' : 'Add article'}</h2>
        <div className="flex gap-4 text-sm font-medium">
          {isEdit && article?.isActive && (
            <Link to={`/articles/${article.slug}`} className="text-teal-700 hover:underline">
              View on website
            </Link>
          )}
          <Link to="/admin/articles" className="text-slate-600 hover:underline">
            Back to articles
          </Link>
        </div>
      </div>

      <Alert type={message.type}>{message.text}</Alert>

      <form onSubmit={handleSubmit} noValidate className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
          Write only what comes from a reliable source, such as a dental association page or a dentist's advice. Do not
          guess or add claims you cannot support. Copying text you do not have permission to use is not allowed. Note
          your source at the bottom.
        </p>

        <FormField label="Title *" name="title" value={form.title} onChange={handleChange} error={errors.title} />
        <SelectField label="Type" name="kind" value={form.kind} onChange={handleChange} error={errors.kind} help='Choose "Instructions" for step-by-step care instructions.'>
          <option value="article">Article</option>
          <option value="instruction">Instructions</option>
        </SelectField>
        <TextAreaField
          label="Short summary"
          name="summary"
          rows={2}
          value={form.summary}
          onChange={handleChange}
          error={errors.summary}
          help="One or two sentences shown on the cards (up to 300 characters)"
        />
        <TextAreaField
          label="Text"
          name="body"
          rows={14}
          value={form.body}
          onChange={handleChange}
          error={errors.body}
          help="Plain text. Leave a blank line between paragraphs. Each new line inside a paragraph stays a new line, which is handy for numbered steps."
        />
        


        <div className="pt-2">
          <button type="submit" disabled={saving} className="rounded-md bg-teal-600 px-6 py-2 font-medium text-white hover:bg-teal-700 disabled:opacity-60">
            {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create article'}
          </button>
        </div>
      </form>
    </div>
  );
}