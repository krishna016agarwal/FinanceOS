import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import Spinner from '../ui/Spinner';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const formatData = (raw = []) =>
  [...raw].reverse().map((item) => ({
    name:    `${MONTHS[(item.period?.month || 1) - 1]} ${item.period?.year || ''}`,
    Income:  item.income  || 0,
    Expense: item.expense || 0,
    Net:     item.net     || 0,
  }));

const TrendChart = ({ data, loading }) => (
  <div className="card p-5">
    <h3 className="text-sm font-semibold text-gray-900 mb-4">Monthly Trends</h3>
    {loading ? (
      <div className="h-64 flex items-center justify-center"><Spinner /></div>
    ) : (
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={formatData(data)} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="income"  x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0}   />
            </linearGradient>
            <linearGradient id="expense" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}   />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} />
          <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false}
            tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
          <Tooltip formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, '']} />
          <Legend />
          <Area type="monotone" dataKey="Income"  stroke="#22c55e" fill="url(#income)"  strokeWidth={2} />
          <Area type="monotone" dataKey="Expense" stroke="#ef4444" fill="url(#expense)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    )}
  </div>
);

export default TrendChart;