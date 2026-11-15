import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import FormField from '../../components/common/FormField';
import Alert from '../../components/common/Alert';

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (form.password !== form.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    setSubmitting(true);
    setErrors({});
    try {
      const { confirmPassword, ...details } = form; // the server does not need the confirmation
      await register(details); // on success GuestRoute redirects automatically
    } catch (error) {
      setErrors(error.response?.data?.errors || {});
      setFormError(error.message);
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
        <p className="mt-1 text-sm text-slate-500">Save favourites and place order requests.</p>

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
          {Object.keys(errors).length === 0 && <Alert>{formError}</Alert>}

          <FormField
            label="Full name"
            name="name"
            autoComplete="name"
            value={form.name}
            onChange={handleChange}
            error={errors.name}
          />
          <FormField
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
          />
          <FormField
            label="Phone (optional)"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={handleChange}
            error={errors.phone}
          />
          <FormField
            label="Password"
            name="password"
            type="password"
            autoComplete="new-password"
            help="At least 8 characters, with a letter and a number"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
          />
          <FormField
            label="Confirm password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-teal-600 px-4 py-2 font-medium text-white hover:bg-teal-700 disabled:opacity-60"
          >
            {submitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-teal-700 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </section>
  );
}
