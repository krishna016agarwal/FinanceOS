import { useState, useEffect, useCallback } from 'react';
import { getUsers } from '../api/users.api';
import UsersTable from '../components/users/UsersTable';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';
import { Search } from 'lucide-react';

const Users = () => {
  const [users,   setUsers]   = useState([]);
  const [meta,    setMeta]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);
  const [search,  setSearch]  = useState('');

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      const res = await getUsers(params);
      setUsers(res.data.data.users);
      setMeta(res.data.meta);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="text-sm text-gray-500 mt-1">{meta?.total ?? '—'} registered users</p>
        </div>
        <div className="w-64 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Search name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>

      <UsersTable
        users={users}
        loading={loading}
        meta={meta}
        page={page}
        onPageChange={setPage}
        onRefresh={fetch}
      />
    </div>
  );
};

export default Users;