import { useState, useEffect } from 'react';
import api from '../../api/client';
import { PageHeader } from '../../components/PageHeader';
import { exportToCsv } from '../../utils/helpers';
import toast from 'react-hot-toast';

interface TrialBalanceRow {
  accountCode: string;
  accountName: string;
  accountType: string;
  debit: number;
  credit: number;
}

export function TrialBalance() {
  const [rows, setRows] = useState<TrialBalanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadTrialBalance();
  }, [asOfDate]);

  const loadTrialBalance = async () => {
    try {
      setLoading(true);
      const res = await api.get('/accounting/trial-balance', { params: { asOfDate } });
      const data = res.data?.data || res.data?.rows || res.data || [];
      setRows(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error('Failed to load trial balance');
    } finally {
      setLoading(false);
    }
  };

  const totalDebit = rows.reduce((sum, r) => sum + Number(r.debit || 0), 0);
  const totalCredit = rows.reduce((sum, r) => sum + Number(r.credit || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  const handleExport = () => {
    exportToCsv(
      rows,
      [
        { key: 'accountCode', label: 'Account Code' },
        { key: 'accountName', label: 'Account Name' },
        { key: 'accountType', label: 'Type' },
        { key: 'debit', label: 'Debit' },
        { key: 'credit', label: 'Credit' },
      ],
      `trial-balance-${asOfDate}`
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trial Balance"
        subtitle="Verify debits equal credits"
        action={{ label: 'Export CSV', onClick: handleExport }}
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
        <div className={`px-4 py-2 rounded-lg text-sm font-medium ${isBalanced ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {isBalanced ? 'Balanced' : 'Out of Balance'}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent mx-auto" />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">No accounts found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Code</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Account Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Debit</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Credit</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.accountCode} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono text-gray-900">{row.accountCode}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{row.accountName}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 capitalize">{row.accountType}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900">{Number(row.debit || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900">{Number(row.credit || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200 font-semibold">
                <td colSpan={3} className="px-4 py-3 text-sm text-right text-gray-900">Total</td>
                <td className="px-4 py-3 text-sm text-right text-gray-900">{totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className="px-4 py-3 text-sm text-right text-gray-900">{totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
}
