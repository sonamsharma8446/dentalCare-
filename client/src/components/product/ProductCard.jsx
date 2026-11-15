import { Link } from 'react-router-dom';
import ProductImage from './ProductImage';
import { formatPrice } from '../../utils/format';

export default function ProductCard({ product }) {
  return (
    <Link
      to={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:border-teal-300 hover:shadow"
    >
      <ProductImage image={product.images[0]} alt={product.name} width={500} className="aspect-square w-full" />

      <div className="flex flex-1 flex-col p-4">
        {product.category && <p className="text-xs font-medium uppercase tracking-wide text-teal-700">{product.category.name}</p>}
        <h3 className="mt-1 font-semibold text-slate-900 group-hover:text-teal-700">{product.name}</h3>
        {product.brand && <p className="text-sm text-slate-500">{product.brand}</p>}

        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-lg font-bold text-slate-900">{formatPrice(product.price)}</span>
          {!product.inStock && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">Out of stock</span>
          )}
        </div>
      </div>
    </Link>
  );
}