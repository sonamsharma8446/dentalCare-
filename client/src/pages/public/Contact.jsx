import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { sendEnquiry } from '../../api/enquiryApi';
import { getProduct } from '../../api/catalogApi';
import { useAuth } from '../../hooks/useAuth';
import FormField from '../../components/common/FormField';
import TextAreaField from '../../components/common/TextAreaField';
import Alert from '../../components/common/Alert';

const emptyForm = { name: '', email: '', phone: '', message: '', leaveBlank: '' };

export default function Contact() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const productSlug = searchParams.get('product') || '';

  const [form, setForm] = useState(emptyForm);
  const [product, setProduct] = useState(null); // the product the question is about, if any
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [sent, setSent] = useState('');
  const [sending, setSending] = useState(false);

  // Logged-in visitors get their details filled in (only into empty fields)
  useEffect(() => {
    if (!user) return;
    setForm((current) => ({
      ...current,
      name: current.name || user.name || '',
      email: current.email || user.email || '',
      phone: current.phone || user.phone || '',
    }));
  }, [user]);

  // Coming from a product page: "Ask about this product"
  useEffect(() => {
    let cancelled = false;
    setProduct(null);
    if (!productSlug) return undefined;
    getProduct(productSlug)
      .then((found) => !cancelled && setProduct(found))
      .catch(() => {}); // an unknown product simply means a general message
    return () => {
      cancelled = true;
    };
  }, [productSlug]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: undefined });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setErrors({});
    setError('');
    setSent('');
    try {
      const result = await sendEnquiry({ ...form, product: product?._id || '' });
      setSent(result.message);
      setForm({ ...emptyForm, name: user?.name || '', email: user?.email || '', phone: user?.phone || '' });
      setProduct(null);
    } catch (err) {
      const fieldErrors = err.response?.data?.errors || {};
      setErrors(fieldErrors);
      setError(Object.keys(fieldErrors).length ? 'Please fix the highlighted fields.' : err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-900">Contact us</h1>
      <p className="mt-2 text-slate-600">Have a question about a product or something on this site? Send us a message.</p>

      <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        This form is not for medical emergencies. If you have severe pain, swelling or bleeding, contact a dentist or doctor
        straight away.
      </p>

      <div className="mt-6 space-y-4" aria-live="polite">
        <Alert type="success">{sent}</Alert>
        <Alert>{error}</Alert>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        {product && (
          <div className="flex items-start justify-between gap-3 rounded-md bg-teal-50 px-3 py-2 text-sm text-teal-900">
            <p>
              Your message is about: <Link to={`/products/${product.slug}`} className="font-medium underline">{product.name}</Link>
            </p>
            <button type="button" onClick={() => setProduct(null)} className="shrink-0 font-medium hover:underline">
              Remove
            </button>
          </div>
        )}

        <FormField label="Your name *" name="name" autoComplete="name" value={form.name} onChange={handleChange} error={errors.name} />
        <FormField label="Email *" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} error={errors.email} />
        <FormField label="Phone (optional)" name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={handleChange} error={errors.phone} />
        <TextAreaField
          label="Message *"
          name="message"
          rows={6}
          value={form.message}
          onChange={handleChange}
          error={errors.message}
        />
        <p className="-mt-2 text-right text-xs text-slate-500">{form.message.trim().length} / 2000 characters (at least 10)</p>

        {/* Hidden trap for spam bots. People never see or fill this in. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label htmlFor="field-leaveBlank">Leave this empty</label>
          <input id="field-leaveBlank" name="leaveBlank" tabIndex={-1} autoComplete="off" value={form.leaveBlank} onChange={handleChange} />
        </div>

        <button type="submit" disabled={sending} className="rounded-md bg-teal-600 px-6 py-2 font-medium text-white hover:bg-teal-700 disabled:opacity-60">
          {sending ? 'Sending...' : 'Send message'}
        </button>
      </form>
    </section>
  );
}