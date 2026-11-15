import { useCallback, useEffect, useState } from 'react';
import { getAdminUsers, updateAdminUser } from '../../api/adminUserApi';
import { useAuth } from '../../hooks/useAuth';
import SelectField from '../../components/common/SelectField';
import FormField from '../../components/common/FormField';
import Pagination from '../../components/common/Pagination';
import Alert from '../../components/common/Alert';
import Loader from '../../components/common/Loader';
import { formatDate } from '../../utils/date';

const PAGE_SIZE = 10;

export default function AdminUsers() {
  const { user: me } = useAuth();
  const [filters, setFilters] = useState({ search: '', role: '', isActive: '' });
  const [applied, setApplied] = useState(filters); // what the list is currently showing
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ users: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: 'error', text: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: PAGE_SIZE };
      for (const [key, value] of Object.entries(applied)) if (value) params[key] = value;
      setResult(await getAdminUsers(params));
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  }, [applied, page]);

  useEffect(() => {
    load();
  }, [load]);

  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const applyFilters = (e) => {
    e.preventDefault();
    setPage(1);
    setApplied({ ...filters, search: filters.search.trim() });
  };

  const change = async (user, changes, question, done) => {
    if (!window.confirm(question)) return;
    setMessage({ type: 'error', text: '' });
    try {
      await updateAdminUser(user._id, changes);
      setMessage({ type: 'success', text: done });
      await load();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const { users, pagination } = result;
  const filtered = Boolean(applied.search || applied.role || applied.isActive);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-900">Users</h2>

      <form onSubmit={applyFilters} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
        <FormField label="Search" name="search" type="search" placeholder="Name or email" value={filters.search} onChange={handleFilterChange} />
        <SelectField label="Role" name="role" value={filters.role} onChange={handleFilterChange}>
          <option value="">All</option>
          <option value="user">Users</option>
          <option value="admin">Admins</option>
        </SelectField>
        <SelectField label="Status" name="isActive" value={filters.isActive} onChange={handleFilterChange}>
          <option value="">All</option>
          <option value="true">Active</option>
          <option value="false">Deactivated</option>
        </SelectField>
        <button type="submit" className="rounded-md bg-slate-800 px-5 py-2 text-sm font-medium text-white hover:bg-slate-900">
          Filter
        </button>
      </form>

      <Alert type={message.type}>{message.text}</Alert>

      {loading ? (
        <Loader />
      ) : users.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-500">
          {filtered ? 'No users match these filters.' : 'No users yet.'}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Role</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Status</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Joined</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => {
                const isMe = user._id === me?._id;
                return (
                  <tr key={user._id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">
                        {user.name}
                        {isMe && <span className="ml-2 text-xs font-normal text-slate-500">(you)</span>}
                      </p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </td>
                    <td className="hidden px-4 py-3 text-slate-700 sm:table-cell">{user.role === 'admin' ? 'Admin' : 'User'}</td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-700'}`}>
                        {user.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-slate-600 md:table-cell">{formatDate(user.createdAt)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      {isMe ? (
                        <span className="text-xs text-slate-400">Cannot change yourself</span>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              change(
                                user,
                                { isActive: !user.isActive },
                                user.isActive ? `Deactivate ${user.name}? They will be logged out and unable to log in.` : `Activate ${user.name}? They will be able to log in again.`,
                                user.isActive ? `${user.name} was deactivated` : `${user.name} was activated`
                              )
                            }
                            className="mr-3 font-medium text-teal-700 hover:underline"
                          >
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              change(
                                user,
                                { role: user.role === 'admin' ? 'user' : 'admin' },
                                user.role === 'admin' ? `Remove admin access from ${user.name}?` : `Make ${user.name} an admin? Admins can change everything on this site.`,
                                user.role === 'admin' ? `${user.name} is now a regular user` : `${user.name} is now an admin`
                              )
                            }
                            className="font-medium text-slate-700 hover:underline"
                          >
                            {user.role === 'admin' ? 'Remove admin' : 'Make admin'}
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {pagination && <Pagination page={pagination.page} pages={pagination.pages} onPageChange={setPage} />}
    </div>
  );
}