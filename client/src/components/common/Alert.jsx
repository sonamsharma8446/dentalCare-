const styles = {
  error: 'border-red-200 bg-red-50 text-red-700',
  success: 'border-green-200 bg-green-50 text-green-700',
};

// <Alert type="success">Saved</Alert>. Renders nothing when there is no message.
export default function Alert({ type = 'error', children }) {
  if (!children) return null;

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      className={`rounded-md border px-4 py-3 text-sm ${styles[type]}`}
    >
      {children}
    </div>
  );
}
