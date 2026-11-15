import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/common/Loader';

// For /login and /register: someone already logged in is redirected away.
// After a successful login this also does the redirect (back to the page they came from, or home).
export default function GuestRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader />;
  if (user) return <Navigate to={location.state?.from?.pathname || '/'} replace />;
  return <Outlet />;
}
