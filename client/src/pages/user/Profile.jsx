import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import * as authApi from '../../api/authApi';
import FormField from '../../components/common/FormField';
import Alert from '../../components/common/Alert';

const card = 'rounded-lg border border-slate-200 bg-white p-6 shadow-sm';
const button =
  'rounded-md bg-teal-600 px-5 py-2 font-medium text-white hover:bg-teal-700 disabled:opacity-60';

export default function Profile() {
  const { user } = useAuth();

  return (
    <section className="mx-auto max-w-2xl space-y-6 px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">My profile</h1>
      <ProfileForm user={user} />
      <PasswordForm />
    </section>
  );
}

function ProfileForm({ user }) {
  const { setUser } = useAuth();
  const [form, setForm] = useState({
    name: user.name,
    phone: user.phone || '',
    address: {
      line1: user.address?.line1 || '',
      city: user.address?.city || '',
      state: user.address?.state || '',
      pincode: user.address?.pincode || '',
    },
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  // Field names like "address.city" update the nested address object
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      setForm({ ...form, address: { ...form.address, [name.slice('address.'.length)]: value } });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    setMessage({ type: '', text: '' });
    try {
      const updated = await authApi.updateProfile(form);
      setUser(updated);
      setMessage({ type: 'success', text: 'Profile updated' });
    } catch (error) {
      const fieldErrors = error.response?.data?.errors || {};
      setErrors(fieldErrors);
      // Field errors show under their fields, so only show the top alert for other problems
      setMessage(Object.keys(fieldErrors).length ? { type: '', text: '' } : { type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className={`${card} space-y-4`}>
      <h2 className="text-lg font-semibold text-slate-900">Personal details</h2>
      <Alert type={message.type || 'error'}>{message.text}</Alert>

      <FormField label="Email" name="email" value={user.email} disabled help="Email cannot be changed" />
      <FormField label="Full name" name="name" value={form.name} onChange={handleChange} error={errors.name} />
      <FormField label="Phone" name="phone" type="tel" value={form.phone} onChange={handleChange} error={errors.phone} />

      <h3 className="pt-2 text-sm font-semibold text-slate-700">Delivery address</h3>
      <FormField
        label="Address"
        name="address.line1"
        value={form.address.line1}
        onChange={handleChange}
        error={errors['address.line1']}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label="City" name="address.city" value={form.address.city} onChange={handleChange} error={errors['address.city']} />
        <FormField label="State" name="address.state" value={form.address.state} onChange={handleChange} error={errors['address.state']} />
        <FormField label="Pincode" name="address.pincode" value={form.address.pincode} onChange={handleChange} error={errors['address.pincode']} />
      </div>

      <button type="submit" disabled={saving} className={button}>
        {saving ? 'Saving...' : 'Save changes'}
      </button>
    </form>
  );
}

function PasswordForm() {
  const empty = { currentPassword: '', newPassword: '', confirmPassword: '' };
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (form.newPassword !== form.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    setSaving(true);
    setErrors({});
    try {
      await authApi.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setForm(empty);
      setMessage({ type: 'success', text: 'Password updated. Other devices have been logged out.' });
    } catch (error) {
      const fieldErrors = error.response?.data?.errors || {};
      setErrors(fieldErrors);
      setMessage(Object.keys(fieldErrors).length ? { type: '', text: '' } : { type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className={`${card} space-y-4`}>
      <h2 className="text-lg font-semibold text-slate-900">Change password</h2>
      <Alert type={message.type || 'error'}>{message.text}</Alert>

      <FormField
        label="Current password"
        name="currentPassword"
        type="password"
        autoComplete="current-password"
        value={form.currentPassword}
        onChange={handleChange}
        error={errors.currentPassword}
      />
      <FormField
        label="New password"
        name="newPassword"
        type="password"
        autoComplete="new-password"
        help="At least 8 characters, with a letter and a number"
        value={form.newPassword}
        onChange={handleChange}
        error={errors.newPassword}
      />
      <FormField
        label="Confirm new password"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        value={form.confirmPassword}
        onChange={handleChange}
        error={errors.confirmPassword}
      />

      <button type="submit" disabled={saving} className={button}>
        {saving ? 'Updating...' : 'Update password'}
      </button>
    </form>
  );
}
