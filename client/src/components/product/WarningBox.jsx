// A highlighted box for safety information. Pass a title and the content as children.
export default function WarningBox({ title, children }) {
  return (
    <div role="note" className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      <p className="font-semibold">{title}</p>
      <div className="mt-2">{children}</div>
    </div>
  );
}