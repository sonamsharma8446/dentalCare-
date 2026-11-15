import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Products' },
  { to: '/concerns', label: 'Dental Concerns' },
  { to: '/videos', label: 'Videos' },
  { to: '/articles', label: 'Articles' },
  { to: '/shops', label: 'Nearby Shops' },
  { to: '/contact', label: 'Contact' },
];

const linkClass = ({ isActive }) =>
  `whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-teal-50 text-teal-700'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`;

const plainButton =
  'whitespace-nowrap rounded-md px-3 py-2 text-left text-sm font-medium text-slate-600 hover:bg-slate-100';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, isAdmin, loading, logout } = useAuth();
  const navigate = useNavigate();
  const close = () => setOpen(false);

  const handleLogout = async () => {
    close();
    // Go home first. If we logged out first, a protected page (like /profile) would notice
    // "no user" and redirect to /login before we got the chance to leave it.
    navigate('/');
    try {
      await logout();
    } catch {
      // The user is logged out in the app even if the request failed (e.g. offline)
    }
  };

  // Links that depend on whether someone is logged in. Shown on desktop and in the mobile menu.
  const accountLinks = loading ? null : user ? (
    <>
      <span title={user.name} className="max-w-[6.5rem] truncate whitespace-nowrap px-3 py-2 text-sm text-slate-500">
        Hi, {user.name.split(' ')[0]}
      </span>
      {isAdmin && (
        <NavLink to="/admin" onClick={close} className={linkClass}>
          Admin
        </NavLink>
      )}
      <NavLink to="/profile" onClick={close} className={linkClass}>
        Profile
      </NavLink>
      <button type="button" onClick={handleLogout} className={plainButton}>
        Logout
      </button>
    </>
  ) : (
    <>
      <Link to="/login" onClick={close} className={plainButton}>
        Login
      </Link>
      <Link
        to="/register"
        onClick={close}
        className="rounded-md bg-teal-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-teal-700"
      >
        Register
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" onClick={close} className="whitespace-nowrap text-xl font-bold text-teal-700">
          DentalCare Kit
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 xl:flex">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === '/'} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Desktop account area */}
        <div className="hidden items-center gap-2 xl:flex">{accountLinks}</div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          aria-expanded={open}
          className="rounded-md p-2 text-slate-600 hover:bg-slate-100 xl:hidden"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 xl:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={close}
                className={linkClass}
              >
                {link.label}
              </NavLink>
            ))}
            <hr className="my-2 border-slate-200" />
            {accountLinks}
          </div>
        </div>
      )}
    </header>
  );
}