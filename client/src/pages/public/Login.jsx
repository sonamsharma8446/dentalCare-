import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import FormField from '../../components/common/FormField';
import Alert from '../../components/common/Alert';

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({}); // per-field messages from the server
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    setFormError('');
    try {
      await login(form); // on success GuestRoute redirects automatically
    } catch (error) {
      setErrors(error.response?.data?.errors || {});
      setFormError(error.message);
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900">Log in</h1>
        <p className="mt-1 text-sm text-slate-500">Welcome back to DentalCare Kit.</p>

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
          {/* Field errors appear under the fields; this shows everything else (e.g. wrong password) */}
          {Object.keys(errors).length === 0 && <Alert>{formError}</Alert>}

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
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-teal-600 px-4 py-2 font-medium text-white hover:bg-teal-700 disabled:opacity-60"
          >
            {submitting ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          New here?{' '}
          <Link to="/register" className="font-medium text-teal-700 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </section>
  );
}
