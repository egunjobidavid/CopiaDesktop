import { useState, useEffect } from 'react';
import api from '../../api/client';
import { PageHeader } from '../../components/PageHeader';
import { TrendingUp, TrendingDown, DollarSign, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface PLLineItem {
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  net: number;
}

interface PLData {
  revenue: PLLineItem[];
  expenses: PLLineItem[];
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
}

export function ProfitAndLoss() {
  const [data, setData] = useState<PLData | null>(null);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split('T')[0];
  const firstDay = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(today);

  useEffect(() => {
    loadReport();
  }, [startDate, endDate]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const res = await api.get('/accounting/reports/profit-and-loss', {
        params: { startDate, endDate },
      });
      setData(res.data?.data || res.data || null);
    } catch {
      toast.error('Failed to load profit & loss report');
    } finally {
      setLoading(false);
    }
  };

  const revenue = data?.revenue || [];
  const expenses = data?.expenses || [];
  const totalRevenue = data?.totalRevenue ?? (Array.isArray(revenue) ? revenue : []).reduce((s, r) => s + r.net, 0);
  const totalExpenses = data?.totalExpenses ?? (Array.isArray(expenses) ? expenses : []).reduce((s, r) => s + r.net, 0);
  const netProfit = data?.netProfit ?? totalRevenue - totalExpenses;
  const isProfit = netProfit >= 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profit & Loss Statement"
        subtitle="Income statement for the period"
      />

      <div className="flex items-center gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      ) : (
        <>
          <div className={`flex items-center gap-4 p-6 rounded-xl border ${isProfit ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            {isProfit ? (
              <TrendingUp className="h-10 w-10 text-green-600" />
            ) : (
              <TrendingDown className="h-10 w-10 text-red-600" />
            )}
            <div>
              <p className="text-sm font-medium text-gray-500">Net Profit / Loss</p>
              <p className={`text-3xl font-bold ${isProfit ? 'text-green-700' : 'text-red-700'}`}>
                {isProfit ? '+' : ''}{netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" /> Revenue
              </h3>
            </div>
            {revenue.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">No revenue accounts for this period</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Code</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Account</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Debit</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Credit</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {revenue.map((r) => (
                    <tr key={r.accountCode} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono text-gray-900">{r.accountCode}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{r.accountName}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900">{Number(r.debit || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900">{Number(r.credit || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-green-700">{Number(r.net || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-200 font-semibold">
                    <td colSpan={4} className="px-4 py-3 text-sm text-right text-gray-700">Total Revenue</td>
                    <td className="px-4 py-3 text-sm text-right text-green-700">{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-600" /> Expenses
              </h3>
            </div>
            {expenses.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">No expense accounts for this period</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Code</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Account</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Debit</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Credit</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((r) => (
                    <tr key={r.accountCode} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono text-gray-900">{r.accountCode}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{r.accountName}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900">{Number(r.debit || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900">{Number(r.credit || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-red-700">{Number(r.net || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-200 font-semibold">
                    <td colSpan={4} className="px-4 py-3 text-sm text-right text-gray-700">Total Expenses</td>
                    <td className="px-4 py-3 text-sm text-right text-red-700">{totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>

          <div className={`flex items-center justify-between p-4 rounded-xl border ${isProfit ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <DollarSign className="h-5 w-5" />
              Net {isProfit ? 'Profit' : 'Loss'}
            </div>
            <span className={`text-xl font-bold ${isProfit ? 'text-green-700' : 'text-red-700'}`}>
              {isProfit ? '+' : ''}{netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
