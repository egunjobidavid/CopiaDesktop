import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Clock, Loader2, Shield } from 'lucide-react';
import api from '../../api/client';
import { PageHeader } from '../../components/PageHeader';
import toast from 'react-hot-toast';

interface ApprovalItem {
  id: string;
  poNumber: string;
  vendorName: string;
  total: number;
  createdAt: string;
  status: string;
  processedBy?: string;
  processedAt?: string;
}

export function ApprovalQueue() {
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [pending, setPending] = useState<ApprovalItem[]>([]);
  const [history, setHistory] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [rejectModal, setRejectModal] = useState<{ open: boolean; poId: string | null }>({ open: false, poId: null });
  const [rejectReason, setRejectReason] = useState('');
  const [submittingReject, setSubmittingReject] = useState(false);

  const fetchPending = useCallback(async () => {
    try {
      const { data } = await api.get('/procurement/approvals/queue');
      const items = data?.data ?? (Array.isArray(data) ? data : []);
      setPending(items);
    } catch {
      toast.error('Failed to load pending approvals');
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const { data } = await api.get('/procurement/approvals/history');
      const items = data?.data ?? (Array.isArray(data) ? data : []);
      setHistory(items);
    } catch {
      toast.error('Failed to load approval history');
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchPending(), fetchHistory()]).finally(() => setLoading(false));
  }, [fetchPending, fetchHistory]);

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      await api.post(`/procurement/purchase-orders/${id}/approve`);
      toast.success('Purchase order approved');
      await Promise.all([fetchPending(), fetchHistory()]);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Approval failed');
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectModal = (id: string) => {
    setRejectModal({ open: true, poId: id });
    setRejectReason('');
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Rejection reason is required');
      return;
    }
    if (!rejectModal.poId) return;
    setSubmittingReject(true);
    try {
      await api.post(`/procurement/purchase-orders/${rejectModal.poId}/reject`, { reason: rejectReason });
      toast.success('Purchase order rejected');
      setRejectModal({ open: false, poId: null });
      await Promise.all([fetchPending(), fetchHistory()]);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Rejection failed');
    } finally {
      setSubmittingReject(false);
    }
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      pending: 'bg-amber-100 text-amber-700',
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${colors[status] || 'bg-gray-100 text-gray-600'}`}>
        {status === 'approved' && <CheckCircle className="w-3 h-3" />}
        {status === 'rejected' && <XCircle className="w-3 h-3" />}
        {status === 'pending' && <Clock className="w-3 h-3" />}
        {status}
      </span>
    );
  };

  const tabs = [
    { key: 'pending' as const, label: 'Pending Approval', count: pending.length },
    { key: 'history' as const, label: 'Approval History', count: history.length },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Approval Queue" subtitle="Purchase order approvals" />

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-px">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === t.key
                ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className="ml-1.5 text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : activeTab === 'pending' ? (
          pending.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Shield className="w-12 h-12 mx-auto mb-3" />
              <p className="text-sm">No pending approvals</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="table-header">PO Number</th>
                  <th className="table-header">Vendor</th>
                  <th className="table-header">Amount</th>
                  <th className="table-header">Date</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pending.map((po) => (
                  <tr key={po.id} className="hover:bg-gray-50">
                    <td className="table-cell font-mono text-sm">{po.poNumber}</td>
                    <td className="table-cell font-medium">{po.vendorName || 'N/A'}</td>
                    <td className="table-cell font-medium">
                      ₦{Number(po.total || 0).toLocaleString()}
                    </td>
                    <td className="table-cell text-gray-500 text-sm">
                      {new Date(po.createdAt).toLocaleDateString('en-GB')}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApprove(po.id)}
                          disabled={processingId === po.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {processingId === po.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircle className="w-3.5 h-3.5" />
                          )}
                          Approve
                        </button>
                        <button
                          onClick={() => openRejectModal(po.id)}
                          disabled={processingId === po.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : history.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Clock className="w-12 h-12 mx-auto mb-3" />
            <p className="text-sm">No approval history</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="table-header">PO Number</th>
                <th className="table-header">Vendor</th>
                <th className="table-header">Amount</th>
                <th className="table-header">Status</th>
                <th className="table-header">Processed By</th>
                <th className="table-header">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {history.map((po) => (
                <tr key={po.id} className="hover:bg-gray-50">
                  <td className="table-cell font-mono text-sm">{po.poNumber}</td>
                  <td className="table-cell font-medium">{po.vendorName || 'N/A'}</td>
                  <td className="table-cell font-medium">
                    ₦{Number(po.total || 0).toLocaleString()}
                  </td>
                  <td className="table-cell">{statusBadge(po.status)}</td>
                  <td className="table-cell text-gray-500 text-sm">{po.processedBy || 'N/A'}</td>
                  <td className="table-cell text-gray-500 text-sm">
                    {po.processedAt
                      ? new Date(po.processedAt).toLocaleDateString('en-GB')
                      : new Date(po.createdAt).toLocaleDateString('en-GB')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <h2 className="text-lg font-semibold text-gray-900">Reject Purchase Order</h2>
            </div>
            <p className="text-sm text-gray-500">
              Please provide a reason for rejecting this purchase order.
            </p>
            <textarea
              className="input w-full text-sm min-h-[80px]"
              placeholder="Rejection reason *"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectModal({ open: false, poId: null })}
                className="btn-secondary text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={submittingReject}
                className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50"
              >
                {submittingReject ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Rejecting...
                  </>
                ) : (
                  'Reject'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
