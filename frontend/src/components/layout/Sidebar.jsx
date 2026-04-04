import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { logout as logoutApi } from '../../api/auth.api';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, FileText, Users, LogOut, TrendingUp,
} from 'lucide-react';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'ANALYST','VIEWER', 'SUPER_ADMIN'] },
  { to: '/records',   label: 'Records',   icon: FileText,        roles: ['ADMIN', 'ANALYST', 'SUPER_ADMIN'] },
  { to: '/users',     label: 'Users',     icon: Users,           roles: ['ADMIN', 'SUPER_ADMIN'] },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await logoutApi(); } catch {}
    logout();
    navigate('/login');
    toast.success('Logged out');
  };

  const links = NAV.filter((n) => n.roles.includes(user?.role));

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <TrendingUp className="text-primary-600" size={22} />
          <span className="font-semibold text-gray-900 text-lg">FinanceOS</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
               ${isActive
                 ? 'bg-primary-50 text-primary-700'
                 : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      <div className="px-4 py-4 border-t border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors w-full px-2 py-1.5 rounded-lg hover:bg-red-50"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;