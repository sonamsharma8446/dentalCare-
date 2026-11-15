// Previous / Next buttons with "Page 2 of 5". Renders nothing when there is only one page.
export default function Pagination({ page, pages, onPageChange }) {
  if (!pages || pages <= 1) return null;

  const button =
    'rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-4">
      <button type="button" className={button} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Previous
      </button>
      <span className="text-sm text-slate-600">
        Page {page} of {pages}
      </span>
      <button type="button" className={button} disabled={page >= pages} onClick={() => onPageChange(page + 1)}>
        Next
      </button>
    </nav>
  );
}