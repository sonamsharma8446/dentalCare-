import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getShop } from '../../api/shopApi';
import ShopMap from '../../components/shop/ShopMap';
import Loader from '../../components/common/Loader';
import { directionsUrl, fullAddress, hasLocation, osmPageUrl, telHref } from '../../utils/maps';

export default function ShopDetail() {
  const { id } = useParams();
  const [shop, setShop] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | notFound | error
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    window.scrollTo({ top: 0 });

    getShop(id)
      .then((data) => {
        if (cancelled) return;
        setShop(data);
        setStatus('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.response?.status === 404) setStatus('notFound');
        else {
          setErrorMessage(err.message);
          setStatus('error');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (status === 'loading') return <Loader label="Loading shop..." />;

  if (status !== 'ready') {
    return (
      <section className="mx-auto max-w-6xl px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold text-slate-800">{status === 'notFound' ? 'Shop not found' : 'Could not load this shop'}</h1>
        <p className="mt-2 text-slate-500">{status === 'notFound' ? 'It may have been removed or the link is incorrect.' : errorMessage}</p>
        <Link to="/shops" className="mt-6 inline-block rounded-md bg-teal-600 px-5 py-2 font-medium text-white hover:bg-teal-700">
          Back to Nearby Shops
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
        <Link to="/shops" className="hover:text-teal-700 hover:underline">
          Nearby Shops
        </Link>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{shop.name}</h1>

          <dl className="mt-6 space-y-4 text-sm">
            <div>
              <dt className="font-medium text-slate-500">Address</dt>
              <dd className="mt-1 text-slate-800">{fullAddress(shop)}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Phone</dt>
              <dd className="mt-1">
                <a href={telHref(shop.phone)} className="font-medium text-teal-700 hover:underline">
                  {shop.phone}
                </a>
              </dd>
            </div>
            {shop.openingHours && (
              <div>
                <dt className="font-medium text-slate-500">Opening hours</dt>
                <dd className="mt-1 text-slate-800">{shop.openingHours}</dd>
              </div>
            )}
          </dl>

          <div className="mt-6 flex flex-wrap gap-3">
            <a href={telHref(shop.phone)} className="rounded-md bg-teal-600 px-5 py-2 text-sm font-medium text-white hover:bg-teal-700">
              Call
            </a>
            <a
              href={directionsUrl(shop)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-slate-300 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Get directions
            </a>
          </div>

          <p className="mt-6 text-xs text-slate-500">Please call the shop to confirm opening hours and availability before you visit.</p>
        </div>

        <div>
          {hasLocation(shop) ? (
            <>
              <ShopMap latitude={shop.latitude} longitude={shop.longitude} title={`Map showing ${shop.name}`} />
              <p className="mt-2 text-xs text-slate-500">
                Map data from OpenStreetMap contributors.{' '}
                <a href={osmPageUrl(shop.latitude, shop.longitude)} target="_blank" rel="noopener noreferrer" className="text-teal-700 hover:underline">
                  View larger map
                </a>
              </p>
            </>
          ) : (
            <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
              A map is not available for this shop. Use "Get directions" to search for its address.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}