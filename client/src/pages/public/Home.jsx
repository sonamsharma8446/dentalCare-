import { Link } from 'react-router-dom';
import ApiStatus from '../../components/common/ApiStatus';

const sections = [
  {
    title: 'Products',
    text: 'Browse dental care products with descriptions, usage instructions and safety precautions.',
    to: '/products',
  },
  {
    title: 'Dental Concerns',
    text: 'Read about common dental concerns and see which products relate to each one.',
    to: '/concerns',
  },
  {
    title: 'Videos',
    text: 'Watch educational dental care videos, organised by topic.',
    to: '/videos',
  },
  {
    title: 'Articles and Instructions',
    text: 'Read articles and step-by-step care instructions.',
    to: '/articles',
  },
  {
    title: 'Nearby Medical Shops',
    text: 'Find a medical shop near you, with its address, phone number and map.',
    to: '/shops',
  },
  {
    title: 'Contact Us',
    text: 'Have a question about a product? Send us an enquiry.',
    to: '/contact',
  },
];

export default function Home() {
  return (
    <>
      <section className="bg-gradient-to-b from-teal-50 to-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:py-24">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Dental care, explained simply
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            Learn about everyday dental concerns and find care products with clear usage
            instructions and safety information.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/products"
              className="rounded-md bg-teal-600 px-6 py-3 font-medium text-white hover:bg-teal-700"
            >
              Browse Products
            </Link>
            <Link
              to="/concerns"
              className="rounded-md border border-slate-300 bg-white px-6 py-3 font-medium text-slate-700 hover:bg-slate-50"
            >
              Explore Dental Concerns
            </Link>
          </div>

          {import.meta.env.DEV && <ApiStatus />}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((item) => (
            <Link
              key={item.title}
              to={item.to}
              className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:border-teal-300 hover:shadow"
            >
              <h2 className="text-lg font-semibold text-slate-900">{item.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{item.text}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}