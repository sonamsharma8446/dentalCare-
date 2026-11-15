import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getShopCities, getShops } from '../../api/shopApi';
import ShopCard from '../../components/shop/ShopCard';
import FormField from '../../components/common/FormField';
import SelectField from '../../components/common/SelectField';
import Pagination from '../../components/common/Pagination';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';

const PAGE_SIZE = 12;

function locationErrorText(error) {
  if (error.code === 1) return 'Location permission was denied. You can still search by city or area below.';
  if (error.code === 3) return 'Finding your location took too long. Please try again, or search by city or area.';
  return 'Could not find your location. Please try again, or search by city or area.';
}

export default function Shops() {
  // Search, city and page live in the page address, so Back and shared links work
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const city = searchParams.get('city') || '';
  const query = searchParams.toString();

  const [draft, setDraft] = useState(search);
  const [cities, setCities] = useState([]);
  const [result, setResult] = useState({ shops: [], pagination: null, nearby: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // The visitor's position. Kept only in this page's memory (never in the address, never saved).
  const [place, setPlace] = useState(null); // { lat, lng } or null
  const [radius, setRadius] = useState('');
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    setDraft(search);
  }, [search]);

  useEffect(() => {
    getShopCities()
      .then(setCities)
      .catch(() => {}); // the city filter is simply empty if this fails
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');

    const params = { ...Object.fromEntries(new URLSearchParams(query)), limit: PAGE_SIZE };
    if (place) {
      params.lat = place.lat;
      params.lng = place.lng;
      if (radius) params.radiusKm = radius;
    }

    getShops(params, controller.signal)
      .then((data) => {
        setResult(data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.code === 'ERR_CANCELED') return; // a newer request replaced this one
        setError(err.message);
        setLoading(false);
      });

    return () => controller.abort();
  }, [query, place, radius]);

  // Change some filters. Empty values are removed. Any change except paging goes back to page 1.
  const updateParams = (changes) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(changes)) {
      const text = String(value ?? '').trim();
      if (text) next.set(key, text);
      else next.delete(key);
    }
    if (!('page' in changes)) next.delete('page');
    setSearchParams(next);
  };

  const useMyLocation = () => {
    setLocationError('');
    if (!navigator.geolocation) {
      setLocationError('Your browser cannot share its location. Please search by city or area instead.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        const next = new URLSearchParams(searchParams);
        next.delete('page');
        setSearchParams(next);
        setPlace({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      (err) => {
        setLocating(false);
        setLocationError(locationErrorText(err));
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  };

  const stopUsingLocation = () => {
    setPlace(null);
    setRadius('');
    setLocationError('');
    const next = new URLSearchParams(searchParams);
    next.delete('page');
    setSearchParams(next);
  };

  const { shops, pagination, nearby } = result;
  const hasFilters = Boolean(search || city);

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-900">Nearby Medical Shops</h1>
      <p className="mt-2 text-slate-600">
        Find a medical shop near you. Please call the shop to confirm opening hours and whether it has what you need
        before you go.
      </p>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {place ? (
            <>
              <span className="rounded-full bg-teal-50 px-3 py-1 text-sm font-medium text-teal-800">Sorted by distance from you</span>
              <div className="w-40">
                <SelectField label="Show shops within" name="radius" value={radius} onChange={(e) => setRadius(e.target.value)}>
                  <option value="">Any distance</option>
                  <option value="2">2 km</option>
                  <option value="5">5 km</option>
                  <option value="10">10 km</option>
                  <option value="25">25 km</option>
                  <option value="50">50 km</option>
                </SelectField>
              </div>
              <button type="button" onClick={stopUsingLocation} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Stop using my location
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={useMyLocation}
              disabled={locating}
              className="rounded-md bg-teal-600 px-5 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60"
            >
              {locating ? 'Finding your location...' : 'Use my location'}
            </button>
          )}
          <p className="text-xs text-slate-500">Your location is used only to sort this list. It is not saved.</p>
        </div>
        {locationError && (
          <div className="mt-3">
            <Alert>{locationError}</Alert>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateParams({ search: draft });
          }}
          className="mt-4 grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2 lg:grid-cols-[1fr_220px_auto] lg:items-end"
        >
          <FormField label="Search" name="search" type="search" placeholder="Shop name, area or PIN code" value={draft} onChange={(e) => setDraft(e.target.value)} />
          <SelectField label="City" name="city" value={city} onChange={(e) => updateParams({ search: draft, city: e.target.value })}>
            <option value="">All cities</option>
            {cities.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </SelectField>
          <div className="flex gap-2">
            {hasFilters && (
              <button type="button" onClick={() => setSearchParams({})} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Clear
              </button>
            )}
            <button type="submit" className="rounded-md bg-teal-600 px-5 py-2 text-sm font-medium text-white hover:bg-teal-700">
              Search
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6" aria-live="polite">
        {error && <Alert>{error}</Alert>}
        {loading && <Loader label="Loading shops..." />}

        {!loading && !error && pagination && (
          <p className="mb-4 text-sm text-slate-500">
            {pagination.total} {pagination.total === 1 ? 'shop' : 'shops'} found
            {nearby && ' (only shops with a map position can be sorted by distance)'}
          </p>
        )}

        {!loading && !error && shops.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-16 text-center">
            <p className="font-medium text-slate-700">{hasFilters || place ? 'No shops found' : 'No shops have been added yet'}</p>
            <p className="mt-1 text-sm text-slate-500">
              {hasFilters || place ? 'Try a different search, a larger distance, or clear the filters.' : 'Please check back soon.'}
            </p>
          </div>
        )}

        {!loading && !error && shops.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {shops.map((shop) => (
              <ShopCard key={shop._id} shop={shop} />
            ))}
          </div>
        )}
      </div>

      {!loading && pagination && (
        <Pagination
          page={pagination.page}
          pages={pagination.pages}
          onPageChange={(newPage) => {
            updateParams({ page: newPage === 1 ? '' : newPage });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}
    </section>
  );
}