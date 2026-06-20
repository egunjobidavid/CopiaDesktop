import { useState, useEffect } from 'react';
import api from '../../api/client';
import { PageHeader } from '../../components/PageHeader';
import toast from 'react-hot-toast';

interface ReconciliationItem {
  id: string;
  date: string;
  description: string;
  amount: number;
  reference?: string;
  reconciled: boolean;
}

export function BankReconciliation() {
  const [items, setItems] = useState<ReconciliationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [bankBalance, setBankBalance] = useState(0);
  const [bookBalance, setBookBalance] = useState(0);

  useEffect(() => {
    loadReconciliation();
  }, []);

  const loadReconciliation = async () => {
    try {
      setLoading(true);
      const res = await api.get('/accounting/bank-reconciliation');
      const data = res.data?.data || res.data || [];
      setItems(Array.isArray(data) ? data : []);
      setBankBalance(res.data?.bankBalance || 0);
      setBookBalance(res.data?.bookBalance || 0);
    } catch (err: any) {
      // Bank reconciliation endpoint might not exist yet
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReconcile = async (id: string) => {
    try {
      await api.patch(`/accounting/bank-reconciliation/${id}/reconcile`);
      toast.success('Item reconciled');
      loadReconciliation();
    } catch (err: any) {
      toast.error('Failed to reconcile');
    }
  };

  const difference = bankBalance - bookBalance;
  const unreconciledTotal = items
    .filter((i) => !i.reconciled)
    .reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bank Reconciliation"
        subtitle="Reconcile bank statements with book records"
      />

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Bank Balance</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {bankBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Book Balance</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {bookBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Difference</p>
          <p className={`text-2xl font-bold mt-1 ${Math.abs(difference) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
            {difference.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Unreconciled items */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">
            Unreconciled Items ({unreconciledTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })})
          </h3>
        </div>
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent mx-auto" />
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">No items to reconcile</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Description</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Reference</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600">{new Date(item.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{item.reference || '-'}</td>
                  <td className={`px-4 py-3 text-sm text-right font-medium ${item.amount >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                    {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${item.reconciled ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {item.reconciled ? 'Reconciled' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {!item.reconciled && (
                      <button
                        onClick={() => handleReconcile(item.id)}
                        className="text-primary-600 text-sm font-medium hover:underline"
                      >
                        Reconcile
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
