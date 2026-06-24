import { useState, useEffect } from 'react';
import api from '../../api/client';
import { PageHeader } from '../../components/PageHeader';
import { Scale, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface BSLineItem {
  accountCode: string;
  accountName: string;
  balance: number;
}

interface BSData {
  assets: BSLineItem[];
  liabilities: BSLineItem[];
  equity: BSLineItem[];
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
}

export function BalanceSheet() {
  const [data, setData] = useState<BSData | null>(null);
  const [loading, setLoading] = useState(true);
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadReport();
  }, [asOfDate]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const res = await api.get('/accounting/reports/balance-sheet', {
        params: { asOfDate },
      });
      const raw = res.data?.data || res.data || null;
      if (!raw) { setData(null); return; }
      setData({
        assets: raw.assets?.accounts || raw.assets || [],
        liabilities: raw.liabilities?.accounts || raw.liabilities || [],
        equity: raw.equity?.accounts || raw.equity || [],
        totalAssets: raw.assets?.total ?? raw.totalAssets ?? 0,
        totalLiabilities: raw.liabilities?.total ?? raw.totalLiabilities ?? 0,
        totalEquity: raw.equity?.total ?? raw.totalEquity ?? 0,
      });
    } catch {
      toast.error('Failed to load balance sheet');
    } finally {
      setLoading(false);
    }
  };

  const assets = data?.assets || [];
  const liabilities = data?.liabilities || [];
  const equity = data?.equity || [];
  const totalAssets = data?.totalAssets ?? (Array.isArray(assets) ? assets : []).reduce((s, r) => s + r.balance, 0);
  const totalLiabilities = data?.totalLiabilities ?? (Array.isArray(liabilities) ? liabilities : []).reduce((s, r) => s + r.balance, 0);
  const totalEquity = data?.totalEquity ?? (Array.isArray(equity) ? equity : []).reduce((s, r) => s + r.balance, 0);
  const equationBalanced = Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01;

  const renderSection = (title: string, items: BSLineItem[], total: number, color: string) => (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      </div>
      {items.length === 0 ? (
        <div className="p-8 text-center text-gray-500 text-sm">No accounts</div>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Code</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Account</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Balance</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.accountCode} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-mono text-gray-900">{r.accountCode}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{r.accountName}</td>
                <td className={`px-4 py-3 text-sm text-right font-medium ${color}`}>
                  {Number(r.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-200 font-semibold">
              <td colSpan={2} className="px-4 py-3 text-sm text-right text-gray-700">Total {title}</td>
              <td className={`px-4 py-3 text-sm text-right ${color}`}>
                {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
            </tr>
          </tfoot>
        </table>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Balance Sheet"
        subtitle="Financial position as of date"
      />

      <div className="flex items-center gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">As of Date</label>
          <input
            type="date"
            value={asOfDate}
            onChange={(e) => setAsOfDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div className={`px-4 py-2 rounded-lg text-sm font-medium ${equationBalanced ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {equationBalanced ? 'Equation Balanced' : 'Out of Balance'}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      ) : (
        <>
          {renderSection('Assets', assets, totalAssets, 'text-blue-700')}
          {renderSection('Liabilities', liabilities, totalLiabilities, 'text-red-700')}
          {renderSection('Equity', equity, totalEquity, 'text-purple-700')}

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-center gap-3 text-sm font-semibold text-gray-700">
              <Scale className="h-5 w-5" />
              <span>Accounting Equation</span>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 text-lg font-bold">
              <div className="text-center">
                <p className="text-xs font-medium text-gray-500 mb-1">Assets</p>
                <p className="text-blue-700">{totalAssets.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              </div>
              <span className="text-gray-400 text-2xl">=</span>
              <div className="text-center">
                <p className="text-xs font-medium text-gray-500 mb-1">Liabilities</p>
                <p className="text-red-700">{totalLiabilities.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              </div>
              <span className="text-gray-400 text-2xl">+</span>
              <div className="text-center">
                <p className="text-xs font-medium text-gray-500 mb-1">Equity</p>
                <p className="text-purple-700">{totalEquity.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
