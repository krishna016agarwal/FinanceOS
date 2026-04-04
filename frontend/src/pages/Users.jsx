import { useState, useEffect, useCallback } from 'react';
import { getUsers } from '../api/users.api';
import UserStatsCards    from '../components/users/UserStatsCards';
import UsersTable        from '../components/users/UsersTable';
import toast  from 'react-hot-toast';
import {  Search, X } from 'lucide-react';

const ROLES    = ['', 'VIEWER', 'ANALYST', 'ADMIN'];
const STATUSES = ['', 'ACTIVE', 'INACTIVE'];

const Users = () => {
  const [users,    setUsers]    = useState([]);
  const [meta,     setMeta]     = useState(null);
  const [stats,    setStats]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [page,     setPage]     = useState(1);
  const [search,   setSearch]   = useState('');
  const [roleFilter,   setRoleFilter]   = useState('');
  const [statusFilter, setStatusFilter] = useState('');



  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search)       params.search = search;
      if (roleFilter)   params.role   = roleFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await getUsers(params);
      setUsers(res.data.data.users);
      setStats(res.data.data.stats);
      setMeta(res.data.meta);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, statusFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const resetFilters = () => {
    setSearch('');
    setRoleFilter('');
    setStatusFilter('');
    setPage(1);
  };

  const hasFilters = search || roleFilter || statusFilter;

  return (
    <div className="p-6 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="text-sm text-gray-500 mt-1">
            {meta?.total ?? '—'} registered accounts
          </p>
        </div>
       
      </div>

      {/* Stats */}
      <UserStatsCards stats={stats} />

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3 items-end">

          {/* Search */}
          <div className="flex-1 min-w-[200px] relative">
            <Search size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2
                text-gray-400 pointer-events-none" />
            <input
              placeholder="Search name or email..."
              value={search}
              onChange={handleSearchChange}
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300
                rounded-lg focus:outline-none focus:border-primary-500
                focus:ring-1 focus:ring-primary-500"
            />
          </div>

          {/* Role filter */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Role
            </label>
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2
                focus:outline-none focus:border-primary-500"
            >
              <option value="">All roles</option>
              {ROLES.filter(Boolean).map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2
                focus:outline-none focus:border-primary-500"
            >
              <option value="">All statuses</option>
              {STATUSES.filter(Boolean).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Reset */}
          {hasFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-xs text-gray-500
                hover:text-red-600 px-2 py-2 rounded-lg hover:bg-red-50
                transition-colors"
            >
              <X size={13} /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <UsersTable
        users={users}
        loading={loading}
        meta={meta}
        page={page}
        onPageChange={setPage}
        onRefresh={fetchUsers}
        
      />

  

    </div>
  );
};

export default Users;