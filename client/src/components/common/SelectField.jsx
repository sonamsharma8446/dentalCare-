// A dropdown with a label. Pass <option> elements as children.
export default function SelectField({ label, name, error, help, className = '', children, ...props }) {
  const id = `field-${name}`;

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <select
        id={id}
        name={name}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${
          error ? 'border-red-400' : 'border-slate-300'
        }`}
        {...props}
      >
        {children}
      </select>
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      ) : (
        help && <p className="mt-1 text-xs text-slate-500">{help}</p>
      )}
    </div>
  );
}