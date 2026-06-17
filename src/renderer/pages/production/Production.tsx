import { useState, useEffect } from 'react';
import { Factory, Loader2, Package, ClipboardList, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/client';

interface WorkOrder {
  id: string;
  orderNumber: string;
  productName?: string;
  quantity: number;
  status: string;
  dueDate?: string;
  createdAt: string;
}

interface Bom {
  id: string;
  name: string;
  productName?: string;
  status: string;
}

const woStatusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  approved: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-amber-100 text-amber-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export function Production() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [boms, setBoms] = useState<Bom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<'orders' | 'boms'>('orders');

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const [woRes, bomRes] = await Promise.allSettled([
          api.get('/production/work-orders?limit=50'),
          api.get('/production/boms?limit=50'),
        ]);
        if (woRes.status === 'fulfilled') setWorkOrders(Array.isArray(woRes.value.data) ? woRes.value.data : []);
        if (bomRes.status === 'fulfilled') setBoms(Array.isArray(bomRes.value.data) ? bomRes.value.data : []);
      } catch { /* ignore */ } finally { setIsLoading(false); }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Production</h1>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Work Order
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button onClick={() => setTab('orders')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === 'orders' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}>
          <ClipboardList className="w-4 h-4 inline mr-1.5" />Work Orders
        </button>
        <button onClick={() => setTab('boms')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === 'boms' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}>
          <Package className="w-4 h-4 inline mr-1.5" />BOMs
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : tab === 'orders' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {workOrders.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Factory className="w-12 h-12 mx-auto mb-3" />
              <p className="text-sm">No work orders yet</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="table-header">Order #</th>
                  <th className="table-header">Product</th>
                  <th className="table-header">Quantity</th>
                  <th className="table-header">Due Date</th>
                  <th className="table-header">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {workOrders.map((wo) => (
                  <tr key={wo.id} className="hover:bg-gray-50">
                    <td className="table-cell font-mono text-sm">{wo.orderNumber}</td>
                    <td className="table-cell font-medium">{wo.productName || 'N/A'}</td>
                    <td className="table-cell">{wo.quantity}</td>
                    <td className="table-cell text-gray-500 text-sm">
                      {wo.dueDate ? new Date(wo.dueDate).toLocaleDateString('en-GB') : '-'}
                    </td>
                    <td className="table-cell">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${woStatusColors[wo.status] || 'bg-gray-100 text-gray-600'}`}>
                        {wo.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {boms.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Package className="w-12 h-12 mx-auto mb-3" />
              <p className="text-sm">No BOMs yet</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="table-header">Name</th>
                  <th className="table-header">Product</th>
                  <th className="table-header">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {boms.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="table-cell font-medium">{b.name}</td>
                    <td className="table-cell text-gray-500">{b.productName || 'N/A'}</td>
                    <td className="table-cell">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
