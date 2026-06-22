import { useState, useEffect } from 'react';
import api from '../../api/client';
import { PageHeader } from '../../components/PageHeader';
import toast from 'react-hot-toast';
import { DollarSign, Eye, X, Loader2, CheckCircle, Clock, FileText } from 'lucide-react';

interface PayrollRun {
  id: string;
  period_start: string;
  period_end: string;
  status: string;
  total_amount: number;
  employee_count: number;
  created_at: string;
  paid_at: string;
}

interface PayrollLine {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_code: string;
  base_salary: number;
  allowances: number;
  deductions: number;
  net_pay: number;
}

export function Payroll() {
  const [runs, setRuns] = useState<PayrollRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProcess, setShowProcess] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedRun, setSelectedRun] = useState<PayrollRun | null>(null);
  const [runDetails, setRunDetails] = useState<PayrollLine[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [periodStart, setPeriodStart] = useState(() => {
    const d = new Date(); d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [periodEnd, setPeriodEnd] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => { loadRuns(); }, []);

  const loadRuns = async () => {
    try {
      setLoading(true);
      const res = await api.get('/hr/payroll/runs');
      const data = res.data?.data || res.data || [];
      setRuns(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load payroll runs');
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async () => {
    setProcessing(true);
    try {
      await api.post('/hr/payroll/process', {
        periodStart,
        periodEnd,
      });
      toast.success('Payroll processed successfully');
      setShowProcess(false);
      loadRuns();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to process payroll');
    } finally {
      setProcessing(false);
    }
  };

  const viewDetails = async (run: PayrollRun) => {
    setSelectedRun(run);
    setLoadingDetails(true);
    try {
      const res = await api.get(`/hr/payroll/runs/${run.id}`);
      const data = res.data?.lines || res.data?.data || [];
      setRunDetails(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error('Failed to load payroll details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/hr/payroll/runs/${id}/status`, { status });
      toast.success(`Payroll ${status}`);
      loadRuns();
      if (selectedRun?.id === id) setSelectedRun({ ...selectedRun, status });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update status');
    }
  };

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-600',
    processing: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-blue-100 text-blue-700',
    paid: 'bg-green-100 text-green-800',
  };

  const statusIcons: Record<string, any> = {
    draft: FileText,
    processing: Clock,
    approved: CheckCircle,
    paid: DollarSign,
  };

  const formatCurrency = (n: number) => `₦${(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payroll"
        subtitle="Process and manage employee payroll"
        action={{ label: 'Process Payroll', onClick: () => setShowProcess(true) }}
      />

      {/* Status summary */}
      <div className="grid grid-cols-4 gap-4">
        {['draft', 'processing', 'approved', 'paid'].map((status) => {
          const Icon = statusIcons[status];
          const count = runs.filter((r) => r.status === status).length;
          return (
            <div key={status} className="card p-4">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-gray-400" />
                <p className="text-xs text-gray-500 capitalize">{status}</p>
              </div>
              <p className="text-lg font-bold text-gray-900 mt-1">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Payroll runs table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent mx-auto" />
          </div>
        ) : runs.length === 0 ? (
          <div className="p-12 text-center">
            <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No payroll runs yet</p>
            <button onClick={() => setShowProcess(true)} className="mt-2 text-primary-600 text-sm font-medium hover:underline">
              Process your first payroll
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Period</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Employees</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Total Amount</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Created</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr key={run.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {run.period_start} to {run.period_end}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{run.employee_count || 0}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                    {formatCurrency(run.total_amount)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[run.status] || 'bg-gray-100 text-gray-600'}`}>
                      {run.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {run.created_at ? new Date(run.created_at).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => viewDetails(run)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg" title="View Details">
                        <Eye className="w-4 h-4" />
                      </button>
                      {run.status === 'draft' && (
                        <button onClick={() => updateStatus(run.id, 'approved')} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg" title="Approve">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {run.status === 'approved' && (
                        <button onClick={() => updateStatus(run.id, 'paid')} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg" title="Mark as Paid">
                          <DollarSign className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Process Payroll Modal */}
      {showProcess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Process Payroll</h3>
              <button onClick={() => setShowProcess(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                This will process payroll for all active employees with a salary set. Each employee will get a payroll line with their base salary.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Period Start</label>
                  <input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Period End</label>
                  <input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button onClick={() => setShowProcess(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleProcess} disabled={processing} className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2">
                {processing && <Loader2 className="w-4 h-4 animate-spin" />}
                Process Payroll
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedRun && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Payroll Details</h3>
                <p className="text-sm text-gray-500">{selectedRun.period_start} to {selectedRun.period_end}</p>
              </div>
              <button onClick={() => { setSelectedRun(null); setRunDetails([]); }} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColors[selectedRun.status]}`}>
                {selectedRun.status}
              </span>
              <span className="text-sm font-medium text-gray-900">Total: {formatCurrency(selectedRun.total_amount)}</span>
            </div>
            {loadingDetails ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent mx-auto" />
              </div>
            ) : runDetails.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500">No payroll lines found</div>
            ) : (
              <div className="px-6 py-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-xs font-medium text-gray-500">Employee</th>
                      <th className="text-right py-2 text-xs font-medium text-gray-500">Base</th>
                      <th className="text-right py-2 text-xs font-medium text-gray-500">Allowances</th>
                      <th className="text-right py-2 text-xs font-medium text-gray-500">Deductions</th>
                      <th className="text-right py-2 text-xs font-medium text-gray-500">Net Pay</th>
                      <th className="text-right py-2 text-xs font-medium text-gray-500">Payslip</th>
                    </tr>
                  </thead>
                  <tbody>
                    {runDetails.map((line) => (
                      <tr key={line.id} className="border-b border-gray-50">
                        <td className="py-2">
                          <span className="text-xs font-mono text-gray-500">{line.employee_code}</span>
                          <span className="text-xs text-gray-900 ml-2">{line.employee_name}</span>
                        </td>
                        <td className="py-2 text-xs text-right">{formatCurrency(line.base_salary)}</td>
                        <td className="py-2 text-xs text-right text-green-600">{formatCurrency(line.allowances)}</td>
                        <td className="py-2 text-xs text-right text-red-600">{formatCurrency(line.deductions)}</td>
                        <td className="py-2 text-xs text-right font-medium">{formatCurrency(line.net_pay)}</td>
                        <td className="py-2 text-right">
                          <button
                            onClick={() => {
                              const url = `${api.defaults.baseURL}/hr/payroll/runs/${selectedRun?.id}/payslip/${line.employee_id}`;
                              window.open(url, '_blank');
                            }}
                            className="text-xs text-primary-600 hover:text-primary-800 font-medium"
                          >
                            View Payslip
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="flex justify-end px-6 py-4 border-t border-gray-200">
              <button onClick={() => { setSelectedRun(null); setRunDetails([]); }} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
