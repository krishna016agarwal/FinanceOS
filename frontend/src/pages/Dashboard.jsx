import { useEffect, useState } from 'react';
import { getSummary, getByCategory, getTrends, getRecentActivity } from '../api/dashboard.api';
import SummaryCards   from '../components/dashboard/SummaryCards';
import TrendChart     from '../components/dashboard/TrendChart';
import CategoryChart  from '../components/dashboard/CategoryChart';
import RecentActivity from '../components/dashboard/RecentActivity';

const Dashboard = () => {
  const [summary,  setSummary]  = useState(null);
  const [category, setCategory] = useState([]);
  const [trends,   setTrends]   = useState([]);
  const [recent,   setRecent]   = useState([]);
  const [loading,  setLoading]  = useState({ summary: true, category: true, trends: true, recent: true });

  const load = (key, fn, setter) =>
    fn().then((r) => setter(r.data.data))
       .catch(console.error)
       .finally(() => setLoading((p) => ({ ...p, [key]: false })));

  useEffect(() => {
    load('summary',  getSummary,                  setSummary);
    load('category', getByCategory,               setCategory);
    load('trends',   () => getTrends('monthly'),  setTrends);
    load('recent',   () => getRecentActivity(8),  setRecent);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Financial overview at a glance</p>
      </div>

      <SummaryCards data={summary} loading={loading.summary} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendChart    data={trends}   loading={loading.trends}   />
        <CategoryChart data={category} loading={loading.category} />
      </div>

      <RecentActivity data={recent} loading={loading.recent} />
    </div>
  );
};

export default Dashboard;