import Input from '../ui/Input';
import Button from '../ui/Button';
import { Search, X } from 'lucide-react';

const INITIAL = { type: '', category: '', from: '', to: '' };

const RecordFilters = ({ filters, onChange, onReset }) => (
  <div className="card p-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
        <select
          value={filters.type}
          onChange={(e) => onChange({ ...filters, type: e.target.value })}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
        >
          <option value="">All types</option>
          <option value="INCOME">Income</option>
          <option value="EXPENSE">Expense</option>
        </select>
      </div>

      <Input
        label="Category"
        placeholder="e.g. salary"
        value={filters.category}
        onChange={(e) => onChange({ ...filters, category: e.target.value })}
      />

      <Input
        label="From date"
        type="date"
        value={filters.from}
        onChange={(e) => onChange({ ...filters, from: e.target.value })}
      />

      <Input
        label="To date"
        type="date"
        value={filters.to}
        onChange={(e) => onChange({ ...filters, to: e.target.value })}
      />
    </div>

    <div className="flex justify-end mt-3">
      <Button variant="ghost" size="sm" onClick={() => onReset(INITIAL)}>
        <X size={14} /> Reset filters
      </Button>
    </div>
  </div>
);

export default RecordFilters;