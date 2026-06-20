import { useState, useEffect, useCallback } from 'react';
import api from '../../api/client';
import { KPICard } from '../../components/charts/KPICard';
import { SalesChart } from '../../components/charts/SalesChart';
import { exportToCsv } from '../../utils/helpers';
import { TrendingUp, DollarSign, ShoppingCart, Users, Loader2, Download } from 'lucide-react';

export function SalesReport() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<any[]>([]);
  const [summary, setSummary] = useState({ revenue: 0, orders: 0, customers: 0, avgOrder: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [salesRes, ordersRes] = await Promise.allSettled([
        api.get(`/analytics/sales?days=${days}`),
        api.get(`/sales/orders?limit=500`),
      ]);

      const salesData = salesRes.status === 'fulfilled' ? salesRes.value.data : [];
      const ordersData = ordersRes.status === 'fulfilled' ? ordersRes.value.data : [];

      // Aggregate by date
      const byDate: Record<string, { revenue: number; orders: number }> = {};
      const parsed = Array.isArray(salesData) ? salesData : [];
      parsed.forEach((s: any) => {
        const date = s.date ? new Date(s.date).toLocaleDateString('en-GB') : 'Unknown';
        if (!byDate[date]) byDate[date] = { revenue: 0, orders: 0 };
        byDate[date].revenue += Number(s.total_revenue || 0);
        byDate[date].orders += Number(s.order_count || 1);
      });

      // Fill last N days
      const chart: any[] = [];
      const now = new Date();
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString('en-GB');
        chart.push({
          date: key,
          revenue: byDate[key]?.revenue || 0,
          orders: byDate[key]?.orders || 0,
        });
      }

      setData(chart);
      setSummary({
        revenue: chart.reduce((s, d) => s + d.revenue, 0),
        orders: chart.reduce((s, d) => s + d.orders, 0),
        customers: Array.isArray(ordersData) ? new Set(ordersData.map((o: any) => o.customerId)).size : 0,
        avgOrder: chart.reduce((s, d) => s + d.revenue, 0) / Math.max(1, chart.reduce((s, d) => s + d.orders, 0)),
      });
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  }, [days]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (isLoading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Sales Report</h1>
        <div className="flex gap-2">
          {[7, 30, 90].map((d) => (
            <button key={d} onClick={() => setDays(d)} className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${days === d ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {d}d
            </button>
          ))}
          <div className="w-px bg-gray-200 mx-1" />
          <button onClick={() => setChartType('bar')} className={`px-3 py-1.5 text-sm rounded-lg ${chartType === 'bar' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>Bar</button>
          <button onClick={() => setChartType('line')} className={`px-3 py-1.5 text-sm rounded-lg ${chartType === 'line' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>Line</button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <KPICard title="Total Revenue" value={`₦${summary.revenue.toLocaleString()}`} subtitle={`Last ${days} days`} trend={12.5} color="bg-blue-600" icon={DollarSign} />
        <KPICard title="Orders" value={summary.orders.toLocaleString()} subtitle={`Last ${days} days`} trend={8.3} color="bg-green-600" icon={ShoppingCart} />
        <KPICard title="Avg Order Value" value={`₦${Math.round(summary.avgOrder).toLocaleString()}`} color="bg-purple-600" icon={TrendingUp} />
        <KPICard title="Customers" value={summary.customers.toLocaleString()} subtitle={`Last ${days} days`} color="bg-amber-600" icon={Users} />
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Revenue Trend</h2>
          <button onClick={() => exportToCsv(data, [
            { key: 'date', label: 'Date' },
            { key: 'revenue', label: 'Revenue' },
            { key: 'orders', label: 'Orders' },
          ], `sales-report-${days}d`)} className="btn-ghost text-xs">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
        <SalesChart data={data} type={chartType} dataKeys={[{ key: 'revenue', color: '#2563eb', name: 'Revenue' }]} />
      </div>
    </div>
  );
}
