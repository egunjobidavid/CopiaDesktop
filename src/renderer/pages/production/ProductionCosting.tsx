import { useState, useEffect } from 'react';
import { DollarSign, Calculator, Loader2, Edit, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/client';
import { PageHeader } from '../../components/PageHeader';

interface CostSummary {
  totalMaterialCost: number;
  totalLaborCost: number;
  totalOverhead: number;
  totalProductionCost: number;
}

interface ProductCost {
  productName: string;
  unitsProduced: number;
  materialCost: number;
  laborCost: number;
  overheadCost: number;
  totalCost: number;
  costPerUnit: number;
  workOrderId?: string;
}

interface WorkOrderCosting {
  id: string;
  orderNumber: string;
  productName: string;
  quantity: number;
  materialCost: number;
  laborCost: number;
  overheadCost: number;
  totalCost: number;
  costPerUnit: number;
  laborHours: number;
  laborRate: number;
  overheadRate: number;
  materials: Array<{
    name: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
  }>;
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n);
}

export function ProductionCosting() {
  const [summary, setSummary] = useState<CostSummary>({
    totalMaterialCost: 0,
    totalLaborCost: 0,
    totalOverhead: 0,
    totalProductionCost: 0,
  });
  const [productCosts, setProductCosts] = useState<ProductCost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWO, setSelectedWO] = useState<WorkOrderCosting | null>(null);
  const [woLoading, setWoLoading] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateForm, setUpdateForm] = useState({ laborHours: '', laborRate: '', overheadRate: '' });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadCosts();
  }, []);

  const loadCosts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/production/reports/costs');
      const data = res.data;
      if (data?.summary) setSummary(data.summary);
      if (Array.isArray(data?.byProduct)) setProductCosts(data.byProduct);
      else if (Array.isArray(data)) setProductCosts(data);
    } catch {
      toast.error('Failed to load production costs');
    } finally {
      setLoading(false);
    }
  };

  const loadWorkOrderCosting = async (workOrderId: string) => {
    try {
      setWoLoading(true);
      setSelectedWO(null);
      const res = await api.get(`/production/work-orders/${workOrderId}/costing`);
      setSelectedWO(res.data);
    } catch {
      toast.error('Failed to load work order costing');
    } finally {
      setWoLoading(false);
    }
  };

  const openUpdateModal = () => {
    if (!selectedWO) return;
    setUpdateForm({
      laborHours: String(selectedWO.laborHours || ''),
      laborRate: String(selectedWO.laborRate || ''),
      overheadRate: String(selectedWO.overheadRate || ''),
    });
    setShowUpdateModal(true);
  };

  const handleUpdateCosts = async () => {
    if (!selectedWO) return;
    try {
      setUpdating(true);
      await api.put(`/production/work-orders/${selectedWO.id}/costing`, {
        laborHours: Number(updateForm.laborHours) || 0,
        laborRate: Number(updateForm.laborRate) || 0,
        overheadRate: Number(updateForm.overheadRate) || 0,
      });
      toast.success('Costs updated');
      setShowUpdateModal(false);
      loadWorkOrderCosting(selectedWO.id);
      loadCosts();
    } catch {
      toast.error('Failed to update costs');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Production Costing" subtitle="Full cost breakdown (materials + labor + overhead)" />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Material Cost', value: summary.totalMaterialCost, color: 'bg-blue-50 text-blue-700', iconColor: 'text-blue-500' },
          { label: 'Total Labor Cost', value: summary.totalLaborCost, color: 'bg-amber-50 text-amber-700', iconColor: 'text-amber-500' },
          { label: 'Total Overhead', value: summary.totalOverhead, color: 'bg-purple-50 text-purple-700', iconColor: 'text-purple-500' },
          { label: 'Total Production Cost', value: summary.totalProductionCost, color: 'bg-green-50 text-green-700', iconColor: 'text-green-500' },
        ].map((card) => (
          <div key={card.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${card.color}`}>
                <DollarSign className={`w-5 h-5 ${card.iconColor}`} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">{card.label}</p>
                <p className="text-lg font-bold text-gray-900">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : formatCurrency(card.value)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cost by Product Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Cost by Product</h3>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
          </div>
        ) : productCosts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Calculator className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p>No cost data available</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Product</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Units</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Material</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Labor</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Overhead</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Total</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Cost/Unit</th>
                </tr>
              </thead>
              <tbody>
                {productCosts.map((row, idx) => (
                  <tr
                    key={idx}
                    onClick={() => row.workOrderId && loadWorkOrderCosting(row.workOrderId)}
                    className={`border-b border-gray-50 transition-colors ${row.workOrderId ? 'cursor-pointer hover:bg-primary-50' : ''}`}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.productName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-right">{row.unitsProduced}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-right">{formatCurrency(row.materialCost)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-right">{formatCurrency(row.laborCost)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-right">{formatCurrency(row.overheadCost)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">{formatCurrency(row.totalCost)}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-primary-700 text-right">{formatCurrency(row.costPerUnit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Work Order Costing Detail */}
      {woLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
          <span className="ml-2 text-sm text-gray-500">Loading work order costing...</span>
        </div>
      )}
      {selectedWO && !woLoading && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Work Order: {selectedWO.orderNumber} — {selectedWO.productName}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Quantity: {selectedWO.quantity}</p>
            </div>
            <button
              onClick={openUpdateModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              Update Costs
            </button>
          </div>

          {/* Cost breakdown */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4">
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs text-blue-600 font-medium">Material Cost</p>
              <p className="text-lg font-bold text-blue-900">{formatCurrency(selectedWO.materialCost)}</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-3">
              <p className="text-xs text-amber-600 font-medium">Labor Cost</p>
              <p className="text-lg font-bold text-amber-900">{formatCurrency(selectedWO.laborCost)}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <p className="text-xs text-purple-600 font-medium">Overhead</p>
              <p className="text-lg font-bold text-purple-900">{formatCurrency(selectedWO.overheadCost)}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-xs text-green-600 font-medium">Total / Cost per Unit</p>
              <p className="text-lg font-bold text-green-900">{formatCurrency(selectedWO.totalCost)}</p>
              <p className="text-xs text-green-700">{formatCurrency(selectedWO.costPerUnit)} / unit</p>
            </div>
          </div>

          {/* Materials breakdown */}
          {selectedWO.materials && selectedWO.materials.length > 0 && (
            <div className="border-t border-gray-100">
              <div className="px-4 py-2.5 bg-gray-50">
                <h4 className="text-xs font-semibold text-gray-500 uppercase">Material Breakdown</h4>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">Material</th>
                    <th className="text-right px-4 py-2 text-xs font-semibold text-gray-500">Qty</th>
                    <th className="text-right px-4 py-2 text-xs font-semibold text-gray-500">Unit Cost</th>
                    <th className="text-right px-4 py-2 text-xs font-semibold text-gray-500">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedWO.materials.map((m, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="px-4 py-2 text-sm text-gray-900">{m.name}</td>
                      <td className="px-4 py-2 text-sm text-gray-600 text-right">{m.quantity}</td>
                      <td className="px-4 py-2 text-sm text-gray-600 text-right">{formatCurrency(m.unitCost)}</td>
                      <td className="px-4 py-2 text-sm font-medium text-gray-900 text-right">{formatCurrency(m.totalCost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Update Costs Modal */}
      {showUpdateModal && selectedWO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Update Costs</h2>
              <button onClick={() => setShowUpdateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Labor Hours</label>
                <input
                  type="number"
                  value={updateForm.laborHours}
                  onChange={(e) => setUpdateForm({ ...updateForm, laborHours: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="e.g. 12"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Labor Rate (per hour)</label>
                <input
                  type="number"
                  value={updateForm.laborRate}
                  onChange={(e) => setUpdateForm({ ...updateForm, laborRate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="e.g. 2500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Overhead Rate (%)</label>
                <input
                  type="number"
                  value={updateForm.overheadRate}
                  onChange={(e) => setUpdateForm({ ...updateForm, overheadRate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="e.g. 15"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => setShowUpdateModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateCosts}
                disabled={updating}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {updating && <Loader2 className="w-4 h-4 animate-spin" />}
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
