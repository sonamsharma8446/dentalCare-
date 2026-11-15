import { createContext, useEffect, useState } from 'react';
import * as authApi from '../api/authApi';

export const AuthContext = createContext(null);

// Holds "who is logged in" for the whole app. Use it through the useAuth() hook.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true until we know whether the browser has a valid login
  // True right after the person pressed Logout. Protected pages use it to send them home instead of to /login.
  const [loggedOut, setLoggedOut] = useState(false);

  // On first load, ask the server who the cookie belongs to (if anyone)
  useEffect(() => {
    let cancelled = false;
    authApi
      .getMe()
      .then((currentUser) => !cancelled && setUser(currentUser))
      .catch(() => !cancelled && setUser(null))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (credentials) => {
    const loggedIn = await authApi.login(credentials);
    setLoggedOut(false);
    setUser(loggedIn);
    return loggedIn;
  };

  const register = async (details) => {
    const created = await authApi.register(details);
    setLoggedOut(false);
    setUser(created);
    return created;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setLoggedOut(true);
      setUser(null);
    }
  };

  const value = { user, setUser, loading, loggedOut, isAdmin: user?.role === 'admin', login, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}