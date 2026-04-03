import { useState, useEffect, useCallback } from 'react';
import { getRecords, deleteRecord } from '../api/records.api';
import { useAuth } from '../context/AuthContext';
import RecordFilters from '../components/records/RecordFilters';
import RecordTable   from '../components/records/RecordTable';
import RecordModal   from '../components/records/RecordModal';
import Button  from '../components/ui/Button';
import toast   from 'react-hot-toast';
import { Plus } from 'lucide-react';

const EMPTY_FILTERS = { type: '', category: '', from: '', to: '' };

const Records = () => {
  const { user } = useAuth();
  const isAdmin  = user?.role === 'ADMIN';

  const [records,  setRecords]  = useState([]);
  const [meta,     setMeta]     = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [page,     setPage]     = useState(1);
  const [filters,  setFilters]  = useState(EMPTY_FILTERS);
  const [modal,    setModal]    = useState({ open: false, record: null });

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10, sortBy: 'date', order: 'desc' };
      if (filters.type)     params.type     = filters.type;
      if (filters.category) params.category = filters.category;
      if (filters.from)     params.from     = filters.from;
      if (filters.to)       params.to       = filters.to;

      const res = await getRecords(params);
      setRecords(res.data.data.records);
      setMeta(res.data.meta);
    } catch {
      toast.error('Failed to load records');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleFilterChange = (f) => { setFilters(f); setPage(1); };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record? This cannot be undone.')) return;
    try {
      await deleteRecord(id);
      toast.success('Record deleted');
      fetch();
    } catch {
      toast.error('Failed to delete record');
    }
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Records</h1>
          <p className="text-sm text-gray-500 mt-1">
            {meta?.total ?? '—'} total transactions
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setModal({ open: true, record: null })}>
            <Plus size={16} /> New record
          </Button>
        )}
      </div>

      <RecordFilters
        filters={filters}
        onChange={handleFilterChange}
        onReset={() => { setFilters(EMPTY_FILTERS); setPage(1); }}
      />

      <RecordTable
        records={records}
        loading={loading}
        meta={meta}
        page={page}
        onPageChange={setPage}
        onEdit={(r) => setModal({ open: true, record: r })}
        onDelete={handleDelete}
      />

      <RecordModal
        open={modal.open}
        record={modal.record}
        onClose={() => setModal({ open: false, record: null })}
        onSaved={fetch}
      />
    </div>
  );
};

export default Records;