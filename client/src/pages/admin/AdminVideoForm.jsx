import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { getAdminVideoCategories, getAdminVideo, createVideo, updateVideo } from '../../api/adminContentApi';
import FormField from '../../components/common/FormField';
import TextAreaField from '../../components/common/TextAreaField';
import SelectField from '../../components/common/SelectField';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';
import VideoEmbed from '../../components/video/VideoEmbed';
import { extractYouTubeId, watchUrl } from '../../utils/youtube';

const emptyForm = { title: '', youtubeUrl: '', category: '', description: '', credit: '', isActive: true };

const formFromVideo = (v) => ({
  title: v.title,
  youtubeUrl: watchUrl(v.youtubeId),
  category: v.category?._id || '',
  description: v.description || '',
  credit: v.credit || '',
  isActive: v.isActive,
});

// Used for both "Add video" (no id in the address) and "Edit video" (/admin/videos/:id/edit)
export default function AdminVideoForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const location = useLocation();

  const [categories, setCategories] = useState([]);
  const [video, setVideo] = useState(null); // the saved video (edit mode)
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: 'error', text: '' });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);

  // Load the categories (and the video when editing). Runs again if the address changes.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError('');
    setErrors({});
    setVideo(null);
    setForm(emptyForm);
    setMessage(location.state?.message ? { type: 'success', text: location.state.message } : { type: 'error', text: '' });

    Promise.all([getAdminVideoCategories(), isEdit ? getAdminVideo(id) : Promise.resolve(null)])
      .then(([cats, existing]) => {
        if (cancelled) return;
        setCategories(cats);
        if (existing) {
          setVideo(existing);
          setForm(formFromVideo(existing));
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
    // The old error no longer applies once the person starts changing that field
    if (errors[name]) setErrors({ ...errors, [name]: undefined });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    setMessage({ type: 'error', text: '' });

    try {
      if (isEdit) {
        const updated = await updateVideo(id, form);
        setVideo(updated);
        setForm(formFromVideo(updated));
        setMessage({ type: 'success', text: 'Changes saved' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const created = await createVideo(form);
        navigate(`/admin/videos/${created._id}/edit`, { state: { message: 'Video created.' } });
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
        <Link to="/admin/videos" className="text-sm font-medium text-teal-700 hover:underline">
          Back to videos
        </Link>
      </div>
    );
  }

  // Shows the video as soon as the pasted link is recognised, so the admin can confirm it is the right one
  const previewId = extractYouTubeId(form.youtubeUrl);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-slate-900">{isEdit ? 'Edit video' : 'Add video'}</h2>
        <div className="flex gap-4 text-sm font-medium">
          {isEdit && video?.isActive && (
            <Link to={`/videos/${video.slug}`} className="text-teal-700 hover:underline">
              View on website
            </Link>
          )}
          <Link to="/admin/videos" className="text-slate-600 hover:underline">
            Back to videos
          </Link>
        </div>
      </div>

      <Alert type={message.type}>{message.text}</Alert>

      {categories.length === 0 && (
        <Alert>
          There are no video categories yet.{' '}
          <Link to="/admin/video-categories" className="font-medium underline">
            Add a category
          </Link>{' '}
          before adding a video.
        </Alert>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
          Only add videos you have checked yourself and that come from a source you trust. The video stays on YouTube;
          this site only shows it. Write the description in your own words or from the video's own description.
        </p>

        <FormField label="Title *" name="title" value={form.title} onChange={handleChange} error={errors.title} />
        <FormField
          label="YouTube link *"
          name="youtubeUrl"
          value={form.youtubeUrl}
          onChange={handleChange}
          error={errors.youtubeUrl}
          help="Paste the video's address from YouTube, for example https://www.youtube.com/watch?v=..."
          autoComplete="off"
        />

        {previewId && (
          <div className="max-w-md" aria-label="Video preview">
            <p className="mb-1 text-sm font-medium text-slate-700">Preview</p>
            <VideoEmbed youtubeId={previewId} title="Video preview" />
          </div>
        )}

        <SelectField label="Category *" name="category" value={form.category} onChange={handleChange} error={errors.category}>
          <option value="">Choose a category</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </SelectField>

        <TextAreaField label="Description" name="description" rows={5} value={form.description} onChange={handleChange} error={errors.description} />
        <FormField
          label="Video credit"
          name="credit"
          value={form.credit}
          onChange={handleChange}
          error={errors.credit}
          help="The channel or person who made the video. Shown to visitors."
        />

        <label className="flex items-center gap-2 pt-2 text-sm text-slate-700">
          <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
          Visible on the website
        </label>

        <div className="pt-2">
          <button type="submit" disabled={saving} className="rounded-md bg-teal-600 px-6 py-2 font-medium text-white hover:bg-teal-700 disabled:opacity-60">
            {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create video'}
          </button>
        </div>
      </form>
    </div>
  );
}