import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { capitalize, formatCurrency } from '../../utils/formatters';
import Spinner from '../ui/Spinner';

const COLORS = ['#6366f1','#22c55e','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899','#84cc16'];

const CategoryChart = ({ data, loading }) => {
  const formatted = (data || []).map((c) => ({
    name:  capitalize(c.category),
    total: c.total,
  }));

  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Spending by Category</h3>
      {loading ? (
        <div className="h-64 flex items-center justify-center"><Spinner /></div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={formatted} layout="vertical" margin={{ left: 16 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
            <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false}
              tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} tickLine={false} width={80} />
            <Tooltip formatter={(v) => [formatCurrency(v), 'Total']} />
            <Bar dataKey="total" radius={[0, 4, 4, 0]}>
              {formatted.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default CategoryChart;