import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 text-center">
      <p className="text-5xl font-bold text-teal-600">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-slate-800">Page not found</h1>
      <p className="mt-2 text-slate-500">The page you are looking for does not exist.</p>
      <Link
        to="/"
        className="mt-6 inline-block rounded-md bg-teal-600 px-5 py-2 font-medium text-white hover:bg-teal-700"
      >
        Back to Home
      </Link>
    </section>
  );
}
