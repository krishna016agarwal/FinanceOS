import { formatCurrency, formatDate, capitalize } from '../../utils/formatters';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import Pagination from '../ui/Pagination';
import { Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const RecordTable = ({ records, loading, meta, page, onPageChange, onEdit, onDelete }) => {
  const { user } = useAuth();
  const isAdmin  = user?.role === 'ADMIN';

  if (loading)
    return <div className="card h-64 flex items-center justify-center"><Spinner size="lg" /></div>;

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {['Date','Category','Type','Amount','Created by','Notes', isAdmin && 'Actions']
                .filter(Boolean).map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {records.map((r) => (
              <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(r.date)}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{capitalize(r.category)}</td>
                <td className="px-4 py-3"><Badge label={r.type} /></td>
                <td className={`px-4 py-3 font-semibold whitespace-nowrap
                  ${r.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                  {r.type === 'INCOME' ? '+' : '-'}{formatCurrency(r.amount)}
                </td>
                <td className="px-4 py-3 text-gray-500">{r.createdBy?.name || '—'}</td>
                <td className="px-4 py-3 text-gray-400 max-w-[180px] truncate">{r.notes || '—'}</td>
                {isAdmin && (
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => onEdit(r)} className="p-1.5">
                        <Pencil size={14} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onDelete(r._id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 hover:text-red-600">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {!records.length && (
              <tr>
                <td colSpan={isAdmin ? 7 : 6} className="px-4 py-12 text-center text-gray-400">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={meta?.totalPages || 1} onChange={onPageChange} />
    </div>
  );
};

export default RecordTable;