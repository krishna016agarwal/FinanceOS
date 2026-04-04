import { useEffect, useState } from 'react';
import { getSummary, getByCategory, getTrends, getRecentActivity } from '../api/dashboard.api';
import { useAuth } from '../context/AuthContext';
import SummaryCards   from '../components/dashboard/SummaryCards';
import TrendChart     from '../components/dashboard/TrendChart';
import CategoryChart  from '../components/dashboard/CategoryChart';
import RecentActivity from '../components/dashboard/RecentActivity';

const Dashboard = () => {
  const { user } = useAuth();
  const isViewer = user?.role === 'VIEWER';

  const [summary,  setSummary]  = useState(null);
  const [category, setCategory] = useState([]);
  const [trends,   setTrends]   = useState([]);
  const [recent,   setRecent]   = useState([]);
  const [loading,  setLoading]  = useState({
    summary: true, category: true, trends: true, recent: true,
  });

  const load = (key, fn, setter) =>
    fn()
      .then((r) => setter(r.data.data))
      .catch(console.error)
      .finally(() => setLoading((p) => ({ ...p, [key]: false })));

  useEffect(() => {
    load('summary',  getSummary,                 setSummary);
    load('category', getByCategory,              setCategory);
    load('trends',   () => getTrends('monthly'), setTrends);

    // Only fetch recent activity if user is not a VIEWER
    if (!isViewer) {
      load('recent', () => getRecentActivity(8), setRecent);
    } else {
      setLoading((p) => ({ ...p, recent: false }));
    }
  }, [isViewer]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Financial overview at a glance
        </p>
      </div>

      <SummaryCards data={summary} loading={loading.summary} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendChart    data={trends}   loading={loading.trends}   />
        <CategoryChart data={category} loading={loading.category} />
      </div>

      {/* Only show recent activity to ADMIN and ANALYST */}
      {isViewer ? (
        <ViewerRecentBlock />
      ) : (
        <RecentActivity data={recent} loading={loading.recent} />
      )}
    </div>
  );
};

// What viewer sees instead of recent transactions
const ViewerRecentBlock = () => (
  <div className="card p-6 flex flex-col items-center justify-center text-center gap-3 min-h-[160px]">
    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="#854F0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    </div>
    <div>
      <p className="text-sm font-medium text-gray-900">
        Recent transactions are restricted
      </p>
      <p className="text-xs text-gray-400 mt-1">
        Contact an administrator to upgrade your role to Analyst or Admin.
      </p>
    </div>
  </div>
);

export default Dashboard;