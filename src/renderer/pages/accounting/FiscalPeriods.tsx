import { useState, useEffect } from 'react';
import api from '../../api/client';
import { PageHeader } from '../../components/PageHeader';
import toast from 'react-hot-toast';
import { Calendar, CheckCircle, XCircle, Plus, Loader2, Lock, Unlock } from 'lucide-react';

interface FiscalPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  closedAt?: string;
}

export function FiscalPeriods() {
  const [periods, setPeriods] = useState<FiscalPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '' });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadPeriods();
  }, []);

  const loadPeriods = async () => {
    try {
      setLoading(true);
      const res = await api.get('/accounting/fiscal-periods');
      setPeriods(res.data?.data || res.data || []);
    } catch (err: any) {
      toast.error('Failed to load fiscal periods');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      if (!form.name || !form.startDate || !form.endDate) {
        toast.error('All fields are required');
        return;
      }
      await api.post('/accounting/fiscal-periods', {
        name: form.name,
        startDate: form.startDate,
        endDate: form.endDate,
      });
      toast.success('Period created');
      setShowForm(false);
      setForm({ name: '', startDate: '', endDate: '' });
      loadPeriods();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create period');
    }
  };

  const handleClose = async (id: string) => {
    try {
      setActionLoading(id);
      await api.post(`/accounting/fiscal-periods/${id}/close`);
      toast.success('Period closed');
      loadPeriods();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to close period');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReopen = async (id: string) => {
    try {
      setActionLoading(id);
      await api.post(`/accounting/fiscal-periods/${id}/reopen`);
      toast.success('Period reopened');
      loadPeriods();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to reopen period');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fiscal Periods"
        subtitle="Manage accounting periods and year-end close"
        action={{ label: 'Create Period', onClick: () => setShowForm(true) }}
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4">
          <p className="text-xs text-gray-500">Total Periods</p>
          <p className="text-lg font-bold text-gray-900">{periods.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500">Open</p>
          <p className="text-lg font-bold text-blue-600">{periods.filter((p) => p.status === 'open').length}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500">Closed</p>
          <p className="text-lg font-bold text-green-600">{periods.filter((p) => p.status === 'closed').length}</p>
        </div>
      </div>

      {loading ? (
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent mx-auto" />
      ) : periods.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">No fiscal periods found</p>
          <button onClick={() => setShowForm(true)} className="mt-2 text-primary-600 text-sm font-medium hover:underline">
            Create your first period
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Start Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">End Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Closed At</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {periods.map((period) => (
                <tr key={period.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{period.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(period.startDate)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(period.endDate)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      period.status === 'closed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {period.status === 'closed' ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      {period.status === 'closed' ? 'Closed' : 'Open'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {period.closedAt ? formatDate(period.closedAt) : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {period.status === 'open' ? (
                        <button
                          onClick={() => handleClose(period.id)}
                          disabled={actionLoading === period.id}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="Close Period"
                        >
                          {actionLoading === period.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Lock className="w-4 h-4" />
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReopen(period.id)}
                          disabled={actionLoading === period.id}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Reopen Period"
                        >
                          {actionLoading === period.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Unlock className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Fiscal Period</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., FY 2026 Q1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleCreate} className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
