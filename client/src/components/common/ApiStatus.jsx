import { useEffect, useState } from 'react';
import { getHealth } from '../../api/healthApi';

// Development-only badge that proves the frontend can reach the backend and database.
// It is hidden automatically in production builds (see Home.jsx).
export default function ApiStatus() {
  const [state, setState] = useState({ loading: true });

  useEffect(() => {
    getHealth()
      .then((data) => setState({ loading: false, data }))
      .catch((error) => setState({ loading: false, error: error.message }));
  }, []);

  let text = 'Checking backend...';
  let color = 'bg-slate-100 text-slate-600';

  if (!state.loading && state.error) {
    text = `Backend unreachable: ${state.error}`;
    color = 'bg-red-50 text-red-700';
  } else if (!state.loading && state.data?.database === 'connected') {
    text = 'Backend and database connected';
    color = 'bg-green-50 text-green-700';
  } else if (!state.loading) {
    text = `Backend reachable, database ${state.data?.database}`;
    color = 'bg-amber-50 text-amber-700';
  }

  return (
    <p role="status" className={`mx-auto mt-6 w-fit rounded-full px-4 py-1 text-xs font-medium ${color}`}>
      Dev check: {text}
    </p>
  );
}
