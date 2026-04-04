import { useState } from 'react';
import { updateUserRole, updateUserStatus , deleteUser} from '../../api/users.api';
import { formatDate } from '../../utils/formatters';
import Badge from '../ui/Badge';
import Spinner from '../ui/Spinner';
import Pagination from '../ui/Pagination';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {  Trash2 } from 'lucide-react';
const ROLES    = ['VIEWER', 'ANALYST', 'ADMIN'];
const STATUSES = ['ACTIVE', 'INACTIVE'];

const UsersTable = ({ users, loading, meta, page, onPageChange, onRefresh }) => {
  const { user: me } = useAuth();
  const [updating, setUpdating] = useState(null);

  const handleRole = async (id, role) => {
    setUpdating(id + 'role');
    try {
      await updateUserRole(id, role);
      toast.success('Role updated');
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setUpdating(null); }
  };

  const handleStatus = async (id, status) => {
    setUpdating(id + 'status');
    try {
      await updateUserStatus(id, status);
      toast.success('Status updated');
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setUpdating(null); }
  };
const handleDelete = async (id, name) => {
    if (!window.confirm(
      `Delete user "${name}"? This cannot be undone.`
    )) return;

    setUpdating(id + 'delete');
    try {
      await deleteUser(id);
      toast.success(`User ${name} deleted`);
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    } finally { setUpdating(null); }
  };
  if (loading)
    return <div className="card h-64 flex items-center justify-center"><Spinner size="lg" /></div>;

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {['Name','Email','Role','Status','Joined','Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => {
              const isSelf = u._id === me?._id;
              return (
                <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">{u.name}</span>
                      {isSelf && <span className="text-xs text-gray-400">(you)</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3">
                    {isSelf ? <Badge label={u.role} /> : (
                      <div className="flex items-center gap-1">
                        {updating === u._id + 'role'
                          ? <Spinner size="sm" />
                          : (
                            <select
                              value={u.role}
                              onChange={(e) => handleRole(u._id, e.target.value)}
                              className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-primary-400"
                            >
                              {ROLES.map((r) => <option key={r}>{r}</option>)}
                            </select>
                          )
                        }
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isSelf ? <Badge label={u.status} /> : (
                      <div className="flex items-center gap-1">
                        {updating === u._id + 'status'
                          ? <Spinner size="sm" />
                          : (
                            <select
                              value={u.status}
                              onChange={(e) => handleStatus(u._id, e.target.value)}
                              className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-primary-400"
                            >
                              {STATUSES.map((s) => <option key={s}>{s}</option>)}
                            </select>
                          )
                        }
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3">
                    <Badge label={u.status} />
                  </td>
                  {!isSelf && (
                    <td className="px-4 py-3">
                      {updating === u._id + 'delete' ? (
                        <Spinner size="sm" />
                      ) : (
                         <button
                            onClick={() => handleDelete(u._id, u.name)}
                            className="p-1.5 text-gray-400 hover:text-red-600
                              hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete user"
                          >
                            <Trash2 size={14} />
                          </button>
                      )}
                    </td>
                  )}
                </tr>
                
              );
            })}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={meta?.totalPages || 1} onChange={onPageChange} />
    </div>
  );
};

export default UsersTable;