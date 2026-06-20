import { useState, useEffect } from 'react';
import { X, Loader2, DollarSign, CreditCard, Banknote, Smartphone, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import api from '../api/client';
import toast from 'react-hot-toast';

interface SessionData {
  id: string;
  openedAt: string;
  openingBalance: number;
  totalSales: number;
  transactionCount: number;
  paymentMethodBreakdown: { method: string; count: number; total: number }[];
  expectedCash: number;
  actualCash: number;
  difference: number;
}

export function ZReportModal({ onClose }: { onClose: () => void }) {
  const [session, setSession] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const [actualCash, setActualCash] = useState(0);

  useEffect(() => {
    fetchSession();
  }, []);

  async function fetchSession() {
    setIsLoading(true);
    try {
      const { data } = await api.get('/pos/session/current');
      setSession(data);
      setActualCash(data?.expectedCash || 0);
    } catch {
      toast.error('Failed to load session data');
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCloseSession() {
    setIsClosing(true);
    try {
      await api.post('/pos/session/close', { actualCash });
      toast.success('Session closed successfully');
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to close session');
    } finally {
      setIsClosing(false);
    }
  }

  const paymentIcons: Record<string, any> = {
    cash: Banknote,
    transfer: Smartphone,
    pos: CreditCard,
    card: CreditCard,
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">End of Day — Z-Report</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : !session ? (
          <div className="p-6 text-center text-gray-500">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-amber-400" />
            <p className="font-medium">No active session found</p>
            <p className="text-sm mt-1">Open the cash drawer to start a new session.</p>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>Opened: {new Date(session.openedAt).toLocaleString()}</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500">Total Sales</p>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  ₦{Number(session.totalSales || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500">Transactions</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{session.transactionCount || 0}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500">Opening Balance</p>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  ₦{Number(session.openingBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Payment Method Breakdown</h3>
              <div className="space-y-2">
                {(session.paymentMethodBreakdown || []).map((pm) => {
                  const Icon = paymentIcons[pm.method] || DollarSign;
                  return (
                    <div key={pm.method} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700 capitalize">{pm.method}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">₦{Number(pm.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        <p className="text-xs text-gray-500">{pm.count || 0} txn(s)</p>
                      </div>
                    </div>
                  );
                })}
                {(!session.paymentMethodBreakdown || session.paymentMethodBreakdown.length === 0) && (
                  <p className="text-sm text-gray-400 text-center py-2">No transactions today</p>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Cash Drawer Count</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Expected Cash</span>
                  <span className="font-medium">₦{Number(session.expectedCash || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Actual Cash Count (₦)</label>
                  <input
                    type="number"
                    value={actualCash}
                    onChange={(e) => setActualCash(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    step="0.01"
                  />
                </div>
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-gray-500">Difference</span>
                  <span className={actualCash - (session.expectedCash || 0) >= 0 ? 'text-green-600' : 'text-red-600'}>
                    ₦{(actualCash - (session.expectedCash || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleCloseSession}
                disabled={isClosing}
                className="flex-1 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isClosing ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                {isClosing ? 'Closing...' : 'Close Session'}
              </button>
              <button onClick={onClose} className="btn-secondary">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
