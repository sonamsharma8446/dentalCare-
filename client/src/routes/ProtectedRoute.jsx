import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/common/Loader';

// Pages inside this route need a logged-in user. Visitors are sent to /login and
// brought back here afterwards.
// (This only improves the experience. The server enforces access on every API call.)
export default function ProtectedRoute() {
  const { user, loading, loggedOut } = useAuth();
  const location = useLocation();

  if (loading) return <Loader />;
  // Someone who just pressed Logout goes home. Anyone else is asked to log in.
  if (!user) return loggedOut ? <Navigate to="/" replace /> : <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}