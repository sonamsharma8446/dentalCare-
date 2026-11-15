import { Link } from 'react-router-dom';
import { directionsUrl, formatDistance, fullAddress, telHref } from '../../utils/maps';

export default function ShopCard({ shop }) {
  return (
    <article className="flex flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-slate-900">
          <Link to={`/shops/${shop._id}`} className="hover:text-teal-700 hover:underline">
            {shop.name}
          </Link>
        </h3>
        {typeof shop.distanceKm === 'number' && (
          <span className="shrink-0 rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-800">{formatDistance(shop.distanceKm)}</span>
        )}
      </div>

      <p className="mt-2 text-sm text-slate-600">{fullAddress(shop)}</p>
      {shop.openingHours && <p className="mt-1 text-sm text-slate-500">Hours: {shop.openingHours}</p>}

      <div className="mt-auto flex flex-wrap gap-x-4 gap-y-2 pt-4 text-sm font-medium">
        <a href={telHref(shop.phone)} className="text-teal-700 hover:underline">
          Call {shop.phone}
        </a>
        <a href={directionsUrl(shop)} target="_blank" rel="noopener noreferrer" className="text-teal-700 hover:underline">
          Directions
        </a>
        <Link to={`/shops/${shop._id}`} className="text-slate-600 hover:underline">
          Details
        </Link>
      </div>
    </article>
  );
}