import { useState } from 'react';
import { updateUserRole, updateUserStatus, deleteUser } from '../../api/users.api';
import { formatDate } from '../../utils/formatters';
import Badge      from '../ui/Badge';
import Spinner    from '../ui/Spinner';
import Pagination from '../ui/Pagination';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';

const STATUSES = ['ACTIVE', 'INACTIVE'];

const UsersTable = ({ users, loading, meta, page, onPageChange, onRefresh }) => {
  const { user: me } = useAuth();
  const isSuperAdmin  = me?.role === 'SUPER_ADMIN';
  const isAdmin       = me?.role === 'ADMIN';

  const [updating, setUpdating] = useState(null);

  // What roles can the current user assign in the dropdown
  // ADMIN can only assign VIEWER and ANALYST — cannot create/promote to ADMIN
  // SUPER_ADMIN can assign any role except SUPER_ADMIN (blocked by backend too)
  const assignableRoles = isSuperAdmin
    ? ['VIEWER', 'ANALYST', 'ADMIN']
    : ['VIEWER', 'ANALYST'];

  // Can the logged-in user edit this target user's role/status
  const canEdit = (target) => {
    if (target._id === me?._id)           return false; // cannot edit self
    if (target.role === 'SUPER_ADMIN')     return false; // nobody edits super admin
    if (target.role === 'ADMIN' && isAdmin) return false; // admin cannot edit another admin
    return true;
  };

  // Can the logged-in user delete this target user
  const canDelete = (target) => {
    if (target._id === me?._id)           return false; // cannot delete self
    if (target.role === 'SUPER_ADMIN')     return false; // nobody deletes super admin
    if (isSuperAdmin)                      return true;  // super admin deletes anyone else
    if (isAdmin && target.role === 'ADMIN') return false; // admin cannot delete another admin
    if (isAdmin)                           return true;  // admin deletes viewer/analyst
    return false;
  };

  const handleRole = async (id, role) => {
    setUpdating(id + 'role');
    try {
      await updateUserRole(id, role);
      toast.success('Role updated successfully');
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    } finally {
      setUpdating(null);
    }
  };

  const handleStatus = async (id, status) => {
    setUpdating(id + 'status');
    try {
      await updateUserStatus(id, status);
      toast.success('Status updated successfully');
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (id, name, role) => {
    const confirmMsg = role === 'ADMIN'
      ? `Delete admin "${name}"? This will permanently remove their account.`
      : `Delete user "${name}"? This cannot be undone.`;

    if (!window.confirm(confirmMsg)) return;

    setUpdating(id + 'delete');
    try {
      await deleteUser(id);
      toast.success(`User "${name}" deleted successfully`);
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setUpdating(null);
    }
  };

  if (loading)
    return (
      <div className="card h-64 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {['User', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold
                    text-gray-500 uppercase tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {users.map((u) => {
              const isSelf       = u._id === me?._id;
              const editable     = canEdit(u);
              const deletable    = canDelete(u);
              const isDeleting   = updating === u._id + 'delete';
              const isUpdatingRole   = updating === u._id + 'role';
              const isUpdatingStatus = updating === u._id + 'status';

              return (
                <tr key={u._id} className="hover:bg-gray-50 transition-colors">

                  {/* User info */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary-100
                        text-primary-700 flex items-center justify-center
                        text-xs font-semibold flex-shrink-0">
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-gray-900 truncate">
                            {u.name}
                          </span>
                          {isSelf && (
                            <span className="text-xs px-1.5 py-0.5 rounded
                              bg-gray-200 text-gray-700 font-medium">You</span>
                          )}
                          {u.role === 'SUPER_ADMIN' && (
                            <span className="text-xs px-1.5 py-0.5 rounded
                              bg-purple-100 text-purple-700 font-medium">
                              Owner
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 truncate">
                          {u.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Role — editable dropdown or static badge */}
                  <td className="px-4 py-3">
                    {!editable ? (
                      <Badge label={u.role} />
                    ) : isUpdatingRole ? (
                      <Spinner size="sm" />
                    ) : (
                      <select
                        value={u.role}
                        onChange={(e) => handleRole(u._id, e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg
                          px-2 py-1.5 focus:outline-none focus:border-primary-400
                          bg-white cursor-pointer"
                      >
                        {assignableRoles.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    )}
                  </td>

                  {/* Status — editable dropdown or static badge */}
                  <td className="px-4 py-3">
                    {!editable ? (
                      <Badge label={u.status} />
                    ) : isUpdatingStatus ? (
                      <Spinner size="sm" />
                    ) : (
                      <select
                        value={u.status}
                        onChange={(e) => handleStatus(u._id, e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg
                          px-2 py-1.5 focus:outline-none focus:border-primary-400
                          bg-white cursor-pointer"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    )}
                  </td>

                  {/* Joined date */}
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {formatDate(u.createdAt)}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    {deletable ? (
                      isDeleting ? (
                        <Spinner size="sm" />
                      ) : (
                        <button
                          onClick={() => handleDelete(u._id, u.name, u.role)}
                          className="p-1.5 text-gray-400 hover:text-red-600
                            hover:bg-red-50 rounded-lg transition-colors"
                          title={`Delete ${u.name}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      )
                    ) : (
                      // Show a locked placeholder so the column stays aligned
                      !isSelf && (
                        <span
                          className="text-xs text-gray-300 px-1"
                          title="Cannot delete this user"
                        >
                          —
                        </span>
                      )
                    )}
                  </td>

                </tr>
              );
            })}

            {!users.length && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-12 text-center text-sm text-gray-400"
                >
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        totalPages={meta?.totalPages || 1}
        onChange={onPageChange}
      />
    </div>
  );
};

export default UsersTable;