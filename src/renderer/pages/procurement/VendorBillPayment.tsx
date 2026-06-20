import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Loader2, Search, DollarSign } from 'lucide-react';
import api from '../../api/client';
import { Breadcrumbs } from '../../components/Breadcrumbs';
import toast from 'react-hot-toast';

interface Payable {
  id: string;
  vendorId: string;
  billId: string | null;
  amount: number;
  outstanding: number;
  status: string;
  createdAt: string;
}

export function VendorBillPayment() {
  const navigate = useNavigate();
  const [payables, setPayables] = useState<Payable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayable, setSelectedPayable] = useState<Payable | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    method: 'bank_transfer',
    notes: '',
    paymentReference: '',
  });

  useEffect(() => { fetchPayables(); }, []);

  async function fetchPayables() {
    setIsLoading(true);
    try {
      const { data } = await api.get('/procurement/payables');
      setPayables(Array.isArray(data) ? data : []);
    } catch { setPayables([]); } finally { setIsLoading(false); }
  }

  const filtered = payables.filter((p) => {
    if (search) {
      const s = search.toLowerCase();
      return (p.id || '').toLowerCase().includes(s) || (p.vendorId || '').toLowerCase().includes(s);
    }
    return true;
  });

  const openPaymentModal = (payable: Payable) => {
    setSelectedPayable(payable);
    setPaymentForm({ amount: payable.outstanding, method: 'bank_transfer', notes: '', paymentReference: '' });
    setShowPaymentModal(true);
  };

  async function submitPayment() {
    if (!selectedPayable) return;
    try {
      await api.post('/procurement/vendor-payments', {
        vendorId: selectedPayable.vendorId,
        billId: selectedPayable.billId,
        amount: paymentForm.amount,
        method: paymentForm.method,
        notes: paymentForm.notes || undefined,
        paymentReference: paymentForm.paymentReference || undefined,
      });
      toast.success('Payment recorded');
      setShowPaymentModal(false);
      fetchPayables();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Payment failed');
    }
  }

  const totalOutstanding = payables.reduce((s, p) => s + Number(p.outstanding), 0);

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      <div className="page-header">
        <div>
          <h1 className="page-title">Vendor Bill Payments</h1>
          <p className="page-subtitle">Track and pay outstanding vendor bills</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500">Total Outstanding</p>
          <p className="text-2xl font-bold text-red-600 mt-1">₦{totalOutstanding.toLocaleString()}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Open Bills</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{payables.filter(p => p.status === 'open').length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Partial</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{payables.filter(p => p.status === 'partial').length}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search payables..." className="input pl-9" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <CreditCard className="w-12 h-12 mx-auto mb-3" />
            <p className="text-sm">No outstanding payables</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="table-header">Bill ID</th>
                <th className="table-header">Total Amount</th>
                <th className="table-header">Outstanding</th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="table-cell font-mono text-sm">{p.billId ? p.billId.slice(0, 8) + '...' : '—'}</td>
                  <td className="table-cell font-medium">₦{Number(p.amount).toLocaleString()}</td>
                  <td className="table-cell font-medium text-red-600">₦{Number(p.outstanding).toLocaleString()}</td>
                  <td className="table-cell">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      p.status === 'open' ? 'bg-red-100 text-red-700' :
                      p.status === 'partial' ? 'bg-amber-100 text-amber-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="table-cell">
                    {p.status !== 'closed' && (
                      <button onClick={() => openPaymentModal(p)}
                        className="btn-primary text-xs px-3 py-1.5">
                        <DollarSign className="w-3.5 h-3.5" /> Pay
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showPaymentModal && selectedPayable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowPaymentModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Record Payment</h2>
            <div>
              <label className="label">Amount (max ₦{Number(selectedPayable.outstanding).toLocaleString()})</label>
              <input type="number" value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                className="input" max={selectedPayable.outstanding} />
            </div>
            <div>
              <label className="label">Payment Method</label>
              <select value={paymentForm.method}
                onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                className="select">
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
                <option value="cheque">Cheque</option>
                <option value="card">Card</option>
              </select>
            </div>
            <div>
              <label className="label">Payment Reference (optional)</label>
              <input type="text" value={paymentForm.paymentReference}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentReference: e.target.value })}
                className="input" placeholder="e.g. TRF-12345" />
            </div>
            <div>
              <label className="label">Notes (optional)</label>
              <textarea value={paymentForm.notes}
                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                className="input" rows={2} />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowPaymentModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={submitPayment} className="btn-primary"
                disabled={paymentForm.amount <= 0 || paymentForm.amount > Number(selectedPayable.outstanding)}>
                Record Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
