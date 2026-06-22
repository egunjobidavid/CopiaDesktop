import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { DollarSign, TrendingUp, Building2, Loader2 } from 'lucide-react';
import api from '../../api/client';

interface SpendSummary {
  totalSpend: number;
  totalPOs: number;
  totalBills: number;
  outstandingBills: number;
}

interface VendorSpend {
  vendorName: string;
  count: number;
  totalAmount: number;
}

interface MonthlySpend {
  month: string;
  total: number;
}

export function SpendReports() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SpendSummary>({
    totalSpend: 0,
    totalPOs: 0,
    totalBills: 0,
    outstandingBills: 0,
  });
  const [vendorSpend, setVendorSpend] = useState<VendorSpend[]>([]);
  const [monthlySpend, setMonthlySpend] = useState<MonthlySpend[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const { data } = await api.get('/procurement/reports/spend', { params });
      setSummary(data.summary || { totalSpend: 0, totalPOs: 0, totalBills: 0, outstandingBills: 0 });
      setVendorSpend(data.vendorSpend || []);
      setMonthlySpend(data.monthlySpend || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleFilter = () => {
    fetchReport();
  };

  const maxMonthly = Math.max(...monthlySpend.map((m) => m.total), 1);

  const cards = [
    { label: 'Total Spend', value: `₦${summary.totalSpend.toLocaleString()}`, icon: DollarSign, color: 'text-blue-600 bg-blue-50' },
    { label: 'Total POs', value: summary.totalPOs, icon: TrendingUp, color: 'text-purple-600 bg-purple-50' },
    { label: 'Total Bills', value: summary.totalBills, icon: Building2, color: 'text-green-600 bg-green-50' },
    { label: 'Outstanding Bills', value: summary.outstandingBills, icon: DollarSign, color: 'text-red-600 bg-red-50' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Spend Reports" subtitle="Procurement spend analysis" />

      {/* Date Range Filter */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">From</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">To</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <button onClick={handleFilter} className="btn-primary">
          Apply Filter
        </button>
        {(startDate || endDate) && (
          <button
            onClick={() => { setStartDate(''); setEndDate(''); }}
            className="btn-secondary"
          >
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-4 gap-4">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${card.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="text-sm text-gray-500">{card.label}</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Spend by Vendor Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Spend by Vendor</h2>
              </div>
              {vendorSpend.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No vendor spend data</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="table-header">Vendor Name</th>
                      <th className="table-header">Count</th>
                      <th className="table-header">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {vendorSpend.map((v) => (
                      <tr key={v.vendorName} className="hover:bg-gray-50">
                        <td className="table-cell font-medium">{v.vendorName}</td>
                        <td className="table-cell text-gray-500">{v.count}</td>
                        <td className="table-cell font-medium">
                          ₦{Number(v.totalAmount).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Spend by Month */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Spend by Month</h2>
              </div>
              {monthlySpend.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No monthly spend data</p>
              ) : (
                <div className="p-5 space-y-3">
                  {monthlySpend.map((m) => (
                    <div key={m.month} className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 w-20 flex-shrink-0">{m.month}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                        <div
                          className="bg-primary-500 h-full rounded-full transition-all"
                          style={{ width: `${(m.total / maxMonthly) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-28 text-right">
                        ₦{Number(m.total).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Top 10 Vendors */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Top 10 Vendors</h2>
            </div>
            {vendorSpend.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No vendor data</p>
            ) : (
              <div className="p-5">
                <div className="space-y-3">
                  {vendorSpend.slice(0, 10).map((v, i) => (
                    <div key={v.vendorName} className="flex items-center gap-4">
                      <span className="text-sm font-bold text-gray-400 w-6 text-center">{i + 1}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{v.vendorName}</p>
                        <p className="text-xs text-gray-500">{v.count} order(s)</p>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        ₦{Number(v.totalAmount).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
