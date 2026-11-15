import { Link } from 'react-router-dom';

export default function ConcernCard({ concern }) {
  return (
    <Link
      to={`/concerns/${concern.slug}`}
      className="group flex flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-300 hover:shadow"
    >
      <h3 className="font-semibold text-slate-900 group-hover:text-teal-700">{concern.name}</h3>
      {concern.summary && <p className="mt-2 text-sm text-slate-600">{concern.summary}</p>}

      <p className="mt-auto pt-4 text-xs font-medium text-teal-700">
        {concern.productCount > 0
          ? `${concern.productCount} linked ${concern.productCount === 1 ? 'product' : 'products'}`
          : 'Read more'}
      </p>
    </Link>
  );
}