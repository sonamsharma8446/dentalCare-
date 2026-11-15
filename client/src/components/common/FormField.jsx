// A label + input + error message. Any extra props (type, value, onChange, required...) go to the <input>.
export default function FormField({ label, name, error, help, className = '', ...inputProps }) {
  const id = `field-${name}`;

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        name={name}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-slate-100 disabled:text-slate-500 ${
          error ? 'border-red-400' : 'border-slate-300'
        }`}
        {...inputProps}
      />
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
