import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/common/Loader';
import Forbidden from '../pages/public/Forbidden';

// Pages inside this route are for admins only.
// (This only improves the experience. The server checks the admin role on every API call.)
export default function AdminRoute() {
  const { user, isAdmin, loading, loggedOut } = useAuth();
  const location = useLocation();

  if (loading) return <Loader />;
  // Someone who just pressed Logout goes home. Anyone else is asked to log in.
  if (!user) return loggedOut ? <Navigate to="/" replace /> : <Navigate to="/login" replace state={{ from: location }} />;
  if (!isAdmin) return <Forbidden />;
  return <Outlet />;
}