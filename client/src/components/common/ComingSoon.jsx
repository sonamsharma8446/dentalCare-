// Temporary placeholder so every navbar link works during development.
// Each use of this component gets replaced by a real page in a later phase.
export default function ComingSoon({ title, phase }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 text-center">
      <h1 className="text-3xl font-bold text-slate-800">{title}</h1>
      <p className="mt-3 text-slate-500">This page will be built in Phase {phase}.</p>
    </section>
  );
}
