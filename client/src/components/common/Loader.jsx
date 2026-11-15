export default function Loader({ label = 'Loading...' }) {
  return (
    <div role="status" className="flex items-center justify-center gap-3 py-20 text-slate-500">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-teal-600" />
      {label}
    </div>
  );
}
