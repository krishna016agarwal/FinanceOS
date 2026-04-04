import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import { formatDate } from '../../utils/formatters';

const UserDetailModal = ({ open, onClose, user }) => {
  if (!user) return null;

  const rows = [
    { label: 'Full name',    value: user.name },
    { label: 'Email',        value: user.email },
    { label: 'Role',         value: <Badge label={user.role} /> },
    { label: 'Status',       value: <Badge label={user.status} /> },
    { label: 'Joined',       value: formatDate(user.createdAt) },
    { label: 'Last login',   value: user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never' },
  ];

  return (
    <Modal open={open} onClose={onClose} title="User details">
      <div className="space-y-4">
        {/* Avatar */}
        <div className="flex items-center gap-4 pb-4
          border-b border-gray-100">
          <div className="w-14 h-14 rounded-full bg-primary-100
            text-primary-700 flex items-center justify-center
            text-xl font-semibold">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-base">
              {user.name}
            </p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>

        {/* Detail rows */}
        <div className="space-y-3">
          {rows.map(({ label, value }) => (
            <div key={label}
              className="flex items-center justify-between text-sm">
              <span className="text-gray-500">{label}</span>
              <span className="font-medium text-gray-900">{value}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-2 py-2 text-sm text-gray-600
            border border-gray-200 rounded-lg hover:bg-gray-50
            transition-colors"
        >
          Close
        </button>
      </div>
    </Modal>
  );
};

export default UserDetailModal;