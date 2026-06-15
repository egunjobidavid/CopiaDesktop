import { useState, useEffect } from 'react';
import api from '../../api/client';
import { KPICard } from '../../components/charts/KPICard';
import { DollarSign, TrendingUp, TrendingDown, BookOpen, Loader2 } from 'lucide-react';

export function FinancialReport() {
  const [trialBalance, setTrialBalance] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const { data } = await api.get('/accounting/trial-balance');
        setTrialBalance(Array.isArray(data) ? data : []);
      } catch {
        setTrialBalance([]);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const totalDebits = trialBalance.reduce((s, a) => s + Number(a.debit || 0), 0);
  const totalCredits = trialBalance.reduce((s, a) => s + Number(a.credit || 0), 0);
  const revenue = trialBalance.filter((a) => a.accountType === 'revenue').reduce((s, a) => s + Number(a.balance || 0), 0);
  const expenses = trialBalance.filter((a) => a.accountType === 'expense').reduce((s, a) => s + Number(a.balance || 0), 0);
  const netIncome = revenue - expenses;
  const assets = trialBalance.filter((a) => a.accountType === 'asset').reduce((s, a) => s + Number(a.balance || 0), 0);
  const liabilities = trialBalance.filter((a) => a.accountType === 'liability').reduce((s, a) => s + Number(a.balance || 0), 0);

  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

  if (isLoading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Financial Report</h1>

      <div className="grid grid-cols-4 gap-4">
        <KPICard title="Total Revenue" value={`₦${revenue.toLocaleString()}`} trend={15.2} color="bg-green-600" icon={TrendingUp} />
        <KPICard title="Total Expenses" value={`₦${expenses.toLocaleString()}`} trend={-3.1} color="bg-red-600" icon={TrendingDown} />
        <KPICard title="Net Income" value={`₦${netIncome.toLocaleString()}`} trend={netIncome >= 0 ? 12.4 : undefined} color="bg-blue-600" icon={DollarSign} />
        <KPICard title="Total Assets" value={`₦${assets.toLocaleString()}`} color="bg-purple-600" icon={BookOpen} />
      </div>

      {/* Trial Balance */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Trial Balance</h2>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full ${isBalanced ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isBalanced ? 'bg-green-500' : 'bg-red-500'}`} />
            {isBalanced ? 'Balanced' : 'Out of Balance'}
          </span>
        </div>

        {trialBalance.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <BookOpen className="w-12 h-12 mx-auto mb-3" />
            <p className="text-sm">No trial balance data available</p>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="table-header">Account Code</th>
                  <th className="table-header">Account Name</th>
                  <th className="table-header">Type</th>
                  <th className="table-header text-right">Debit (₦)</th>
                  <th className="table-header text-right">Credit (₦)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {trialBalance.map((acc: any) => (
                  <tr key={acc.accountId || acc.accountCode} className="hover:bg-gray-50">
                    <td className="table-cell font-mono text-xs text-gray-500">{acc.accountCode}</td>
                    <td className="table-cell font-medium">{acc.accountName}</td>
                    <td className="table-cell">
                      <span className={`text-xs font-medium capitalize ${
                        acc.accountType === 'revenue' ? 'text-green-600' :
                        acc.accountType === 'expense' ? 'text-red-600' :
                        acc.accountType === 'asset' ? 'text-blue-600' :
                        acc.accountType === 'liability' ? 'text-purple-600' : 'text-gray-600'
                      }`}>
                        {acc.accountType}
                      </span>
                    </td>
                    <td className="table-cell text-right font-mono">
                      {Number(acc.debit || 0) > 0 ? `₦${Number(acc.debit).toLocaleString()}` : '-'}
                    </td>
                    <td className="table-cell text-right font-mono">
                      {Number(acc.credit || 0) > 0 ? `₦${Number(acc.credit).toLocaleString()}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-end gap-12 text-sm font-bold">
              <span>Total Debits: ₦{totalDebits.toLocaleString()}</span>
              <span>Total Credits: ₦{totalCredits.toLocaleString()}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
