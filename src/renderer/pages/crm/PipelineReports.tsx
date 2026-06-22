import { useState, useEffect } from 'react';
import api from '../../api/client';
import { PageHeader } from '../../components/PageHeader';
import toast from 'react-hot-toast';
import { BarChart3, TrendingUp, Target, DollarSign, Loader2 } from 'lucide-react';

interface PipelineReport {
  totalDeals: number;
  pipelineValue: number;
  winRate: number;
  avgDealValue: number;
  expectedRevenue: number;
  dealsByStage: { stage: string; count: number; value: number; color: string }[];
  dealsBySource: { source: string; count: number; value: number }[];
  closingThisMonth: number;
}

export function PipelineReports() {
  const [report, setReport] = useState<PipelineReport | null>(null);
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pipelineRes, forecastRes] = await Promise.all([
        api.get('/crm/reports/pipeline'),
        api.get('/crm/reports/forecast'),
      ]);
      setReport(pipelineRes.data?.data || pipelineRes.data || {});
      setForecast(forecastRes.data);
    } catch {
      toast.error('Failed to load pipeline reports');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary-600" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="p-6">
        <PageHeader title="Pipeline Reports" subtitle="Sales pipeline analytics and forecasting" />
        <p className="text-gray-500 mt-4">No data available.</p>
      </div>
    );
  }

  const maxStageCount = Math.max(...(report.dealsByStage || []).map(s => s.count), 1);

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Pipeline Reports" subtitle="Sales pipeline analytics and forecasting" />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Target className="w-5 h-5 text-indigo-600" />
            </div>
            <span className="text-sm text-gray-500">Total Deals</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{report.totalDeals}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Pipeline Value</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">${report.pipelineValue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-sm text-gray-500">Win Rate</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{report.winRate.toFixed(1)}%</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-50 rounded-lg">
              <BarChart3 className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-sm text-gray-500">Avg Deal Value</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">${report.avgDealValue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-violet-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-violet-600" />
            </div>
            <span className="text-sm text-gray-500">Expected Revenue</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">${report.expectedRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Deals by Stage */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Deals by Stage</h3>
        <div className="space-y-3">
          {(report.dealsByStage || []).map((stage) => (
            <div key={stage.stage} className="flex items-center gap-4">
              <span className="text-sm text-gray-600 w-32 truncate">{stage.stage}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(stage.count / maxStageCount) * 100}%`,
                    backgroundColor: stage.color || '#6366f1',
                  }}
                />
              </div>
              <span className="text-sm font-medium text-gray-700 w-16 text-right">{stage.count}</span>
              <span className="text-sm text-gray-500 w-24 text-right">${stage.value.toLocaleString()}</span>
            </div>
          ))}
          {(report.dealsByStage || []).length === 0 && (
            <p className="text-sm text-gray-400">No deals in pipeline.</p>
          )}
        </div>
      </div>

      {/* Deals by Source & Closing This Month */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Deals by Source</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="pb-2 font-medium">Source</th>
                <th className="pb-2 font-medium text-right">Deals</th>
                <th className="pb-2 font-medium text-right">Value</th>
              </tr>
            </thead>
            <tbody>
              {(report.dealsBySource || []).map((src) => (
                <tr key={src.source} className="border-b border-gray-50">
                  <td className="py-2.5 text-gray-700">{src.source || 'Unknown'}</td>
                  <td className="py-2.5 text-right text-gray-600">{src.count}</td>
                  <td className="py-2.5 text-right text-gray-600">${src.value.toLocaleString()}</td>
                </tr>
              ))}
              {(report.dealsBySource || []).length === 0 && (
                <tr><td colSpan={3} className="py-3 text-gray-400 text-center">No data</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Closing This Month</h3>
          <p className="text-5xl font-bold text-primary-600">{report.closingThisMonth}</p>
          <p className="text-sm text-gray-500 mt-2">deals expected to close</p>
        </div>
      </div>
    </div>
  );
}
