import { Users, UserCheck, Shield, BarChart2 } from 'lucide-react';

const UserStatsCards = ({ stats }) => {
  if (!stats) return null;

  const cards = [
    {
      label: 'Total users',
      value: stats.totalUsers   || 0,
      icon:  Users,
      bg:    'bg-blue-50',
      color: 'text-blue-600',
    },
    {
      label: 'Active accounts',
      value: stats.totalActive  || 0,
      icon:  UserCheck,
      bg:    'bg-green-50',
      color: 'text-green-600',
    },
    {
      label: 'Admins',
      value: stats.totalAdmin   || 0,
      icon:  Shield,
      bg:    'bg-purple-50',
      color: 'text-purple-600',
    },
    {
      label: 'Analysts',
      value: stats.totalAnalyst || 0,
      icon:  BarChart2,
      bg:    'bg-amber-50',
      color: 'text-amber-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, icon: Icon, bg, color }) => (
        <div key={label} className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-gray-500">{label}</p>
            <div className={`p-1.5 rounded-lg ${bg}`}>
              <Icon size={14} className={color} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      ))}
    </div>
  );
};

export default UserStatsCards;