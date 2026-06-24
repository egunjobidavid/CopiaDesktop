import { useState, useEffect } from 'react';
import api from '../../api/client';
import { PageHeader } from '../../components/PageHeader';
import toast from 'react-hot-toast';
import { Receipt, Plus, CheckCircle, XCircle, Loader2, X } from 'lucide-react';

interface ExpenseClaim {
  id: string;
  employee_name: string;
  employee_id: string;
  category: string;
  amount: number;
  description: string;
  expense_date: string;
  receipt_url: string;
  status: string;
  created_at: string;
}

interface ClaimSummary {
  pending: number;
  approved: number;
  total_amount: number;
}

const CATEGORIES = ['Travel', 'Meals', 'Transport', 'Supplies', 'Other'];
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-700',
};

export function ExpenseClaims() {
  const [claims, setClaims] = useState<ExpenseClaim[]>([]);
  const [summary, setSummary] = useState<ClaimSummary>({ pending: 0, approved: 0, total_amount: 0 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [form, setForm] = useState({
    employeeId: '',
    category: 'Travel',
    amount: '',
    description: '',
    expenseDate: new Date().toISOString().split('T')[0],
    receiptUrl: '',
  });

  useEffect(() => { loadClaims(); }, []);

  const loadClaims = async () => {
    try {
      setLoading(true);
      const [claimsRes, summaryRes] = await Promise.all([
        api.get('/hr/expense-claims'),
        api.get('/hr/expense-claims/summary'),
      ]);
      const claimsPayload = claimsRes.data?.data || claimsRes.data || {};
      setClaims(Array.isArray(claimsPayload) ? claimsPayload : claimsPayload.data || []);
      setSummary(summaryRes.data?.data || summaryRes.data || { pending_count: 0, pending_amount: 0, approved_count: 0, approved_amount: 0, rejected_count: 0, rejected_amount: 0, total_count: 0, total_amount: 0 });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load expense claims');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.employeeId.trim()) { toast.error('Employee is required'); return; }
    if (!form.amount || Number(form.amount) <= 0) { toast.error('Valid amount is required'); return; }
    setSubmitting(true);
    try {
      await api.post('/hr/expense-claims', {
        employee_id: form.employeeId,
        category: form.category,
        amount: Number(form.amount),
        description: form.description,
        expense_date: form.expenseDate,
        receipt_url: form.receiptUrl || undefined,
      });
      toast.success('Expense claim created');
      setShowForm(false);
      loadClaims();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create expense claim');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setActionLoading(id);
    try {
      await api.patch(`/hr/expense-claims/${id}/${action}`);
      toast.success(`Claim ${action === 'approve' ? 'approved' : 'rejected'}`);
      loadClaims();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || `Failed to ${action} claim`);
    } finally {
      setActionLoading(null);
    }
  };

  const formatCurrency = (n: number) => `₦${(n || 0).toLocaleString()}`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expense Claims"
        subtitle="Employee expense management"
        action={{ label: 'New Claim', onClick: () => setShowForm(true) }}
      />

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4">
          <p className="text-xs text-gray-500">Pending Claims</p>
          <p className="text-lg font-bold text-yellow-600">{summary.pending}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500">Approved Claims</p>
          <p className="text-lg font-bold text-green-600">{summary.approved}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500">Total Amount</p>
          <p className="text-lg font-bold text-gray-900">{formatCurrency(summary.total_amount)}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent mx-auto" />
          </div>
        ) : claims.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No expense claims</p>
            <button onClick={() => setShowForm(true)} className="mt-2 text-primary-600 text-sm font-medium hover:underline">Submit your first claim</button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Employee</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Category</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((claim) => (
                <tr key={claim.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{claim.employee_name || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{claim.category}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">{formatCurrency(claim.amount)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{claim.expense_date?.split('T')[0] || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[claim.status] || 'bg-gray-100 text-gray-600'}`}>
                      {claim.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {claim.status === 'pending' && (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleAction(claim.id, 'approve')}
                          disabled={actionLoading === claim.id}
                          className="p-1.5 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-lg disabled:opacity-50"
                          title="Approve"
                        >
                          {actionLoading === claim.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleAction(claim.id, 'reject')}
                          disabled={actionLoading === claim.id}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg disabled:opacity-50"
                          title="Reject"
                        >
                          {actionLoading === claim.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* New Claim Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">New Expense Claim</h3>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee *</label>
                <input
                  value={form.employeeId}
                  onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                  placeholder="Employee ID"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₦) *</label>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    placeholder="0"
                    min="0"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the expense..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expense Date</label>
                  <input
                    type="date"
                    value={form.expenseDate}
                    onChange={(e) => setForm({ ...form, expenseDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Receipt URL</label>
                  <input
                    value={form.receiptUrl}
                    onChange={(e) => setForm({ ...form, receiptUrl: e.target.value })}
                    placeholder="Optional"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleSubmit} disabled={submitting} className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Submit Claim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
