import { NavLink, Outlet } from 'react-router-dom';

// Add a line here when a later phase adds a new admin screen
const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/concerns', label: 'Dental Concerns' },
  { to: '/admin/videos', label: 'Videos' },
  { to: '/admin/video-categories', label: 'Video Categories' },
  { to: '/admin/articles', label: 'Articles' },
  { to: '/admin/shops', label: 'Medical Shops' },
  { to: '/admin/enquiries', label: 'Enquiries' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/reports', label: 'Reports' },
];

const linkClass = ({ isActive }) =>
  `whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`;

// Wraps every admin page. A sidebar on large screens, a scrolling row of links on small ones.
export default function AdminLayout() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Admin</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[200px_1fr]">
        <nav aria-label="Admin sections" className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
          {adminLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}