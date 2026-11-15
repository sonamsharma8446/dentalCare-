import { Link } from 'react-router-dom';

export default function Forbidden() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 text-center">
      <p className="text-5xl font-bold text-teal-600">403</p>
      <h1 className="mt-4 text-2xl font-semibold text-slate-800">Access denied</h1>
      <p className="mt-2 text-slate-500">You do not have permission to view this page.</p>
      <Link
        to="/"
        className="mt-6 inline-block rounded-md bg-teal-600 px-5 py-2 font-medium text-white hover:bg-teal-700"
      >
        Back to Home
      </Link>
    </section>
  );
}
