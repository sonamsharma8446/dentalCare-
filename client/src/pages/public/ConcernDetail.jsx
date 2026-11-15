import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getConcern, getConcernProducts } from '../../api/concernApi';
import ProductCard from '../../components/product/ProductCard';
import WarningBox from '../../components/product/WarningBox';
import Loader from '../../components/common/Loader';

export default function ConcernDetail() {
  const { slug } = useParams();
  const [concern, setConcern] = useState(null);
  const [products, setProducts] = useState(null); // null = still loading
  const [productsFailed, setProductsFailed] = useState(false);
  const [status, setStatus] = useState('loading'); // loading | ready | notFound | error
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setProducts(null);
    setProductsFailed(false);
    window.scrollTo({ top: 0 });

    getConcern(slug)
      .then((data) => {
        if (cancelled) return;
        setConcern(data);
        setStatus('ready');
        // The products are loaded after the main content so the page appears quickly
        getConcernProducts(slug)
          .then((items) => !cancelled && setProducts(items))
          .catch(() => !cancelled && setProductsFailed(true));
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
  }, [slug]);

  if (status === 'loading') return <Loader label="Loading..." />;

  if (status !== 'ready') {
    return (
      <section className="mx-auto max-w-6xl px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold text-slate-800">
          {status === 'notFound' ? 'Concern not found' : 'Could not load this page'}
        </h1>
        <p className="mt-2 text-slate-500">
          {status === 'notFound' ? 'It may have been removed or the link is incorrect.' : errorMessage}
        </p>
        <Link to="/concerns" className="mt-6 inline-block rounded-md bg-teal-600 px-5 py-2 font-medium text-white hover:bg-teal-700">
          Back to Dental Concerns
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
        <Link to="/concerns" className="hover:text-teal-700 hover:underline">
          Dental Concerns
        </Link>
      </nav>

      <div className="mx-auto mt-6 max-w-3xl">
        <h1 className="text-3xl font-bold text-slate-900">{concern.name}</h1>
        {concern.summary && <p className="mt-3 text-lg text-slate-600">{concern.summary}</p>}

        {concern.description && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-slate-900">About this concern</h2>
            <p className="mt-2 whitespace-pre-line text-slate-700">{concern.description}</p>
          </div>
        )}

        {concern.precautions.length > 0 && (
          <div className="mt-8">
            <WarningBox title="Precautions">
              <ul className="list-disc space-y-1 pl-5">
                {concern.precautions.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </WarningBox>
          </div>
        )}

        {concern.whenToSeeDentist && (
          <div className="mt-6">
            <WarningBox title="When to see a dentist">
              <p className="whitespace-pre-line">{concern.whenToSeeDentist}</p>
            </WarningBox>
          </div>
        )}

        <div className="mt-6">
          <WarningBox title="Please note">
            <p>
              The information on this page is for general education and is not a substitute for professional dental
              advice. Consult a dentist if you have any concerns about your teeth or gums.
            </p>
          </WarningBox>
        </div>

        {concern.sourceNote && <p className="mt-4 text-xs text-slate-500">Information source: {concern.sourceNote}</p>}
      </div>

      <div className="mt-14">
        <h2 className="text-xl font-semibold text-slate-900">Products linked to this concern</h2>
        <p className="mt-1 text-sm text-slate-500">
          Read each product's label and follow the manufacturer's instructions before use.
        </p>

        <div className="mt-4" aria-live="polite">
          {productsFailed && <p className="text-sm text-red-600">Could not load the linked products. Please try again later.</p>}
          {!productsFailed && products === null && <Loader label="Loading products..." />}
          {products && products.length === 0 && (
            <p className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
              No products are linked to this concern yet.{' '}
              <Link to="/products" className="font-medium text-teal-700 hover:underline">
                Browse all products
              </Link>
            </p>
          )}
          {products && products.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}