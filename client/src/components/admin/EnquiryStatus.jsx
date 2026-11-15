export const statusLabel = { new: 'New', read: 'Read', resolved: 'Resolved' };

const styles = {
  new: 'bg-amber-100 text-amber-900',
  read: 'bg-sky-100 text-sky-900',
  resolved: 'bg-green-100 text-green-800',
};

// A small coloured label. The words are always shown too, so colour is never the only clue.
export default function EnquiryStatus({ status }) {
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] || styles.read}`}>{statusLabel[status] || status}</span>;
}