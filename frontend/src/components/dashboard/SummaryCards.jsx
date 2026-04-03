import { TrendingUp, TrendingDown, Wallet, Activity } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import Spinner from '../ui/Spinner';

const cards = (data) => [
  {
    label:  'Total Income',
    value:  formatCurrency(data?.income?.total || 0),
    sub:    `${data?.income?.count || 0} transactions`,
    icon:   TrendingUp,
    color:  'text-green-600',
    bg:     'bg-green-50',
  },
  {
    label:  'Total Expenses',
    value:  formatCurrency(data?.expense?.total || 0),
    sub:    `${data?.expense?.count || 0} transactions`,
    icon:   TrendingDown,
    color:  'text-red-600',
    bg:     'bg-red-50',
  },
  {
    label:  'Net Balance',
    value:  formatCurrency(data?.netBalance || 0),
    sub:    'Income minus expenses',
    icon:   Wallet,
    color:  (data?.netBalance || 0) >= 0 ? 'text-primary-600' : 'text-red-600',
    bg:     (data?.netBalance || 0) >= 0 ? 'bg-primary-50' : 'bg-red-50',
  },
  {
    label:  'Total Transactions',
    value:  data?.totalTransactions || 0,
    sub:    'All time',
    icon:   Activity,
    color:  'text-gray-700',
    bg:     'bg-gray-100',
  },
];

const SummaryCards = ({ data, loading }) => {
  if (loading)
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card p-5 h-28 flex items-center justify-center">
            <Spinner />
          </div>
        ))}
      </div>
    );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards(data).map(({ label, value, sub, icon: Icon, color, bg }) => (
        <div key={label} className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <div className={`p-2 rounded-lg ${bg}`}>
              <Icon size={18} className={color} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{sub}</p>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;