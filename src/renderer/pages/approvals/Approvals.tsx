import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Loader2, Filter, FileText, Receipt, ShoppingCart, CreditCard, UserCheck, ClipboardCheck } from 'lucide-react';
import api from '../../api/client';
import { useAuthStore } from '../../store/auth.store';
import toast from 'react-hot-toast';

interface ApprovalItem {
  id: string;
  type: string;
  typeName: string;
  icon: any;
  title: string;
  subtitle: string;
  amount?: number;
  status: string;
  date: string;
  data: any;
}

const TYPE_ICONS: Record<string, any> = {
  leave_request: UserCheck,
  expense_claim: Receipt,
  purchase_order: ShoppingCart,
  credit_memo: CreditCard,
  stock_transfer: FileText,
  journal_entry: ClipboardCheck,
};

const TYPE_COLORS: Record<string, string> = {
  leave_request: 'bg-blue-100 text-blue-700',
  expense_claim: 'bg-amber-100 text-amber-700',
  purchase_order: 'bg-green-100 text-green-700',
  credit_memo: 'bg-purple-100 text-purple-700',
  stock_transfer: 'bg-indigo-100 text-indigo-700',
  journal_entry: 'bg-gray-100 text-gray-700',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  posted: 'bg-green-100 text-green-700',
  draft: 'bg-gray-100 text-gray-600',
};

export function Approvals() {
  const user = useAuthStore((s) => s.user);
  const userRole = user?.role ?? 'Staff';
  const [items, setItems] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadAllPending();
  }, []);

  async function loadAllPending() {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        api.get('/hr/leave/requests?status=pending'),
        api.get('/hr/expense-claims?status=pending'),
        api.get('/procurement/purchase-orders?status=pending'),
        api.get('/credit-memos?status=posted'),
        api.get('/accounting/journal?search=pending'),
      ]);

      const allItems: ApprovalItem[] = [];

      // Leave Requests
      if (results[0].status === 'fulfilled') {
        const d = results[0].value.data;
        const rows = d?.data ?? (Array.isArray(d) ? d : []);
        for (const r of rows) {
          allItems.push({
            id: r.id, type: 'leave_request', typeName: 'Leave Request',
            icon: UserCheck, title: `Leave Request`,
            subtitle: `${r.employee_name || r.employeeId} — ${r.leave_type || r.leaveType || 'Leave'}`,
            status: r.status, date: r.created_at || r.createdAt,
            data: r,
          });
        }
      }

      // Expense Claims
      if (results[1].status === 'fulfilled') {
        const d = results[1].value.data;
        const rows = d?.data ?? (Array.isArray(d) ? d : []);
        for (const r of rows) {
          allItems.push({
            id: r.id, type: 'expense_claim', typeName: 'Expense Claim',
            icon: Receipt, title: r.category || 'Expense Claim',
            subtitle: `${r.employee_name || r.employeeId} — ₦${Number(r.amount).toLocaleString()}`,
            amount: Number(r.amount), status: r.status, date: r.created_at || r.createdAt,
            data: r,
          });
        }
      }

      // Purchase Orders
      if (results[2].status === 'fulfilled') {
        const d = results[2].value.data;
        const rows = d?.data ?? (Array.isArray(d) ? d : []);
        for (const r of rows) {
          allItems.push({
            id: r.id, type: 'purchase_order', typeName: 'Purchase Order',
            icon: ShoppingCart, title: r.po_number || r.poNumber || 'PO',
            subtitle: `${r.vendor_name || r.vendorId || 'Vendor'} — ₦${Number(r.total).toLocaleString()}`,
            amount: Number(r.total), status: r.status, date: r.created_at || r.createdAt,
            data: r,
          });
        }
      }

      // Credit Memos (posted = ready to apply)
      if (results[3].status === 'fulfilled') {
        const d = results[3].value.data;
        const rows = d?.data ?? (Array.isArray(d) ? d : []);
        for (const r of rows) {
          allItems.push({
            id: r.id, type: 'credit_memo', typeName: 'Credit Memo',
            icon: CreditCard, title: r.memo_number || r.memoNumber || 'CM',
            subtitle: `₦${Number(r.total).toLocaleString()} — ${r.reason || 'No reason'}`,
            amount: Number(r.total), status: r.status, date: r.created_at || r.createdAt,
            data: r,
          });
        }
      }

      // Journal Entries (pending)
      if (results[4].status === 'fulfilled') {
        const d = results[4].value.data;
        const rows = d?.data ?? (Array.isArray(d) ? d : []);
        for (const r of rows) {
          if (r.status === 'pending') {
            allItems.push({
              id: r.id, type: 'journal_entry', typeName: 'Journal Entry',
              icon: ClipboardCheck, title: r.journal_number || r.journalNumber || 'JE',
              subtitle: r.description || 'No description',
              status: r.status, date: r.created_at || r.createdAt,
              data: r,
            });
          }
        }
      }

      // Sort by date descending
      allItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setItems(allItems);
    } catch (err: any) {
      toast.error('Failed to load approvals');
    } finally {
      setLoading(false);
    }
  }

  async function approveItem(item: ApprovalItem) {
    setProcessing(item.id);
    try {
      switch (item.type) {
        case 'leave_request':
          await api.patch(`/hr/leave/requests/${item.id}/approve`);
          break;
        case 'expense_claim':
          await api.post(`/hr/expense-claims/${item.id}/approve`);
          break;
        case 'purchase_order':
          await api.post(`/procurement/purchase-orders/${item.id}/approve`);
          break;
        case 'credit_memo':
          await api.post(`/credit-memos/${item.id}/approve`);
          break;
        case 'journal_entry':
          await api.post(`/accounting/journal/${item.id}/approve`);
          break;
        default:
          toast.error('Unknown approval type');
          return;
      }
      toast.success(`${item.typeName} approved`);
      loadAllPending();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Approval failed');
    } finally {
      setProcessing(null);
    }
  }

  async function rejectItem(item: ApprovalItem, reason?: string) {
    setProcessing(item.id);
    try {
      switch (item.type) {
        case 'leave_request':
          await api.patch(`/hr/leave/requests/${item.id}/reject`, { rejectionReason: reason || 'Rejected by manager' });
          break;
        case 'expense_claim':
          await api.post(`/hr/expense-claims/${item.id}/reject`, { reason: reason || 'Rejected' });
          break;
        case 'purchase_order':
          await api.post(`/procurement/purchase-orders/${item.id}/reject`, { reason: reason || 'Rejected' });
          break;
        case 'credit_memo':
          await api.post(`/credit-memos/${item.id}/reject`, { reason: reason || 'Rejected' });
          break;
        case 'journal_entry':
          await api.post(`/accounting/journal/${item.id}/reject`, { reason: reason || 'Rejected' });
          break;
        default:
          return;
      }
      toast.success(`${item.typeName} rejected`);
      loadAllPending();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Rejection failed');
    } finally {
      setProcessing(null);
    }
  }

  const filtered = filter === 'all' ? items : items.filter((i) => i.type === filter);
  const typeCounts = items.reduce((acc, i) => { acc[i.type] = (acc[i.type] || 0) + 1; return acc; }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Approvals</h1>
        <p className="text-gray-500 mt-1">Review and approve pending items across all modules</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <button onClick={() => setFilter('all')}
          className={`card text-left p-3 transition-all ${filter === 'all' ? 'ring-2 ring-primary-500 border-primary-300' : 'hover:border-gray-300'}`}>
          <p className="text-2xl font-bold text-gray-900">{items.length}</p>
          <p className="text-xs text-gray-500">All Pending</p>
        </button>
        {Object.entries(typeCounts).map(([type, count]) => {
          const Icon = TYPE_ICONS[type] || FileText;
          return (
            <button key={type} onClick={() => setFilter(type)}
              className={`card text-left p-3 transition-all ${filter === type ? 'ring-2 ring-primary-500 border-primary-300' : 'hover:border-gray-300'}`}>
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-gray-500" />
                <p className="text-2xl font-bold text-gray-900">{count}</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">{type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
            </button>
          );
        })}
      </div>

      {/* Items List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <p className="text-gray-500">No pending approvals</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.id} className="card p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${TYPE_COLORS[item.type] || 'bg-gray-100'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{item.title}</span>
                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${TYPE_COLORS[item.type]}`}>
                          {item.typeName}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-0.5">{item.subtitle}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {item.amount && (
                      <span className="text-lg font-bold text-gray-900">₦{item.amount.toLocaleString()}</span>
                    )}
                    <button
                      onClick={() => approveItem(item)}
                      disabled={processing === item.id}
                      className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                    >
                      {processing === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      Approve
                    </button>
                    <button
                      onClick={() => rejectItem(item)}
                      disabled={processing === item.id}
                      className="px-3 py-1.5 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 disabled:opacity-50 flex items-center gap-1 border border-red-200"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
