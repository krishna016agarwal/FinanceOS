import { ShieldOff, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { logout as logoutApi } from '../api/auth.api';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

const ViewerHome = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await logoutApi(); } catch {}
    logout();
    navigate('/login');
    toast.success('Logged out');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">

        {/* Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-2xl mb-6">
          <ShieldOff size={28} className="text-amber-600" />
        </div>

        {/* Greeting */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome, {user?.name}
        </h1>
        <p className="text-gray-500 mb-1">
          You are logged in as a <span className="font-medium text-amber-600">Viewer</span>
        </p>
        <p className="text-sm text-gray-400 mb-8">
          Your account does not have access to the dashboard or financial records.
          Please contact an administrator to upgrade your role.
        </p>

        {/* Info card */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 text-left space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Your account</p>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Name</span>
            <span className="font-medium text-gray-900">{user?.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Email</span>
            <span className="font-medium text-gray-900">{user?.email}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Role</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              VIEWER
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Status</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
              {user?.status}
            </span>
          </div>
        </div>

        <Button variant="secondary" onClick={handleLogout} className="w-full">
          Sign out
        </Button>
      </div>
    </div>
  );
};

export default ViewerHome;