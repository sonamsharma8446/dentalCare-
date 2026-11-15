// A simple list of horizontal bars. Every row shows its number as text, so nothing depends on colour or the bar.
// items: [{ label, value }]
export default function BarList({ items, emptyText = 'Nothing to show yet.' }) {
  if (!items.length) return <p className="text-sm text-slate-500">{emptyText}</p>;
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.label} className="grid grid-cols-[6.5rem_1fr_2.5rem] items-center gap-3 text-sm">
          <span className="truncate text-slate-600" title={item.label}>
            {item.label}
          </span>
          <span className="h-3 rounded-full bg-slate-100" aria-hidden="true">
            <span className="block h-3 rounded-full bg-teal-500" style={{ width: item.value ? `${Math.max((item.value / max) * 100, 3)}%` : '0%' }} />
          </span>
          <span className="text-right font-medium text-slate-800">{item.value}</span>
        </li>
      ))}
    </ul>
  );
}