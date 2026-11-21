import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { getAdminShop, createShop, updateShop } from '../../api/adminShopApi';
import FormField from '../../components/common/FormField';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';
import ShopMap from '../../components/shop/ShopMap';

const emptyForm = {
  name: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  phone: '',
  openingHours: '',
  latitude: '',
  longitude: '',
  isActive: true,
};

const formFromShop = (s) => ({
  name: s.name,
  address: s.address,
  city: s.city,
  state: s.state || '',
  pincode: s.pincode || '',
  phone: s.phone,
  openingHours: s.openingHours || '',
  latitude: s.latitude ?? '',
  longitude: s.longitude ?? '',
  isActive: s.isActive,
});

// A usable map position: both numbers, inside the valid range
function validPosition(form) {
  if (String(form.latitude).trim() === '' || String(form.longitude).trim() === '') return null;
  const lat = Number(form.latitude);
  const lng = Number(form.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return { lat, lng };
}

// Used for both "Add shop" (no id in the address) and "Edit shop" (/admin/shops/:id/edit)
export default function AdminShopForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const location = useLocation();

  const [shop, setShop] = useState(null); // the saved shop (edit mode)
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: 'error', text: '' });
  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);

  // Load the shop when editing. Runs again if the address changes.
  useEffect(() => {
    let cancelled = false;
    setLoadError('');
    setErrors({});
    setShop(null);
    setForm(emptyForm);
    setMessage(location.state?.message ? { type: 'success', text: location.state.message } : { type: 'error', text: '' });

    if (!isEdit) {
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    getAdminShop(id)
      .then((existing) => {
        if (cancelled) return;
        setShop(existing);
        setForm(formFromShop(existing));
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
    if ((name === 'latitude' || name === 'longitude') && errors.latitude) setErrors({ ...errors, latitude: undefined });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    setMessage({ type: 'error', text: '' });

    try {
      if (isEdit) {
        const updated = await updateShop(id, form);
        setShop(updated);
        setForm(formFromShop(updated));
        setMessage({ type: 'success', text: 'Changes saved' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const created = await createShop(form);
        navigate(`/admin/shops/${created._id}/edit`, { state: { message: 'Shop created.' } });
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
        <Link to="/admin/shops" className="text-sm font-medium text-teal-700 hover:underline">
          Back to shops
        </Link>
      </div>
    );
  }

  // Shows the pin as soon as both numbers make sense, so the admin can check it is the right place
  const position = validPosition(form);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-slate-900">{isEdit ? 'Edit shop' : 'Add shop'}</h2>
        <div className="flex gap-4 text-sm font-medium">
          {isEdit && shop?.isActive && (
            <Link to={`/shops/${shop._id}`} className="text-teal-700 hover:underline">
              View on website
            </Link>
          )}
          <Link to="/admin/shops" className="text-slate-600 hover:underline">
            Back to shops
          </Link>
        </div>
      </div>

      <Alert type={message.type}>{message.text}</Alert>

      <form onSubmit={handleSubmit} noValidate className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
    

        <FormField label="Shop name *" name="name" value={form.name} onChange={handleChange} error={errors.name} />
        <FormField label="Address *" name="address" value={form.address} onChange={handleChange} error={errors.address} help="Street, area or landmark" />

        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="City *" name="city" value={form.city} onChange={handleChange} error={errors.city} />
          <FormField label="State" name="state" value={form.state} onChange={handleChange} error={errors.state} />
          <FormField label="PIN code" name="pincode" inputMode="numeric" value={form.pincode} onChange={handleChange} error={errors.pincode} help="6 digits" />
        </div>

        <FormField label="Phone *" name="phone" type="tel" value={form.phone} onChange={handleChange} error={errors.phone} help="For example 0120 4567890 or +91 98765 43210" />
        <FormField
          label="Opening hours"
          name="openingHours"
          value={form.openingHours}
          onChange={handleChange}
          error={errors.openingHours}
          help="Written as you like, for example Mon-Sat 9am-9pm"
        />

        <fieldset className="space-y-3 rounded-md border border-slate-200 p-4">
          <legend className="px-1 text-sm font-medium text-slate-700">Map position (optional)</legend>
          <p className="text-xs text-slate-500">
            This puts the shop on a map and lets visitors sort shops by distance. To find it: open the shop in Google
            Maps, right-click the spot, and click the numbers shown at the top of the menu to copy them. The first number
            is the latitude, the second is the longitude.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Latitude" name="latitude" inputMode="decimal" value={form.latitude} onChange={handleChange} error={errors.latitude} help="Between -90 and 90, for example 28.6139" />
            <FormField label="Longitude" name="longitude" inputMode="decimal" value={form.longitude} onChange={handleChange} error={errors.longitude} help="Between -180 and 180, for example 77.2090" />
          </div>
          {position && (
            <div className="max-w-md" aria-label="Map preview">
              <p className="mb-1 text-sm font-medium text-slate-700">Preview</p>
              <ShopMap latitude={position.lat} longitude={position.lng} title="Map preview" />
            </div>
          )}
        </fieldset>

        <label className="flex items-center gap-2 pt-2 text-sm text-slate-700">
          <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
          Visible on the website
        </label>

        <div className="pt-2">
          <button type="submit" disabled={saving} className="rounded-md bg-teal-600 px-6 py-2 font-medium text-white hover:bg-teal-700 disabled:opacity-60">
            {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create shop'}
          </button>
        </div>
      </form>
    </div>
  );
}