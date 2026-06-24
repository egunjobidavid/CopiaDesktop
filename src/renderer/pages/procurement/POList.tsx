import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProcurement, PurchaseOrder } from '../../hooks/useProcurement';
import { Plus, ClipboardList, Loader2, Eye, Search } from 'lucide-react';

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  sent: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-purple-100 text-purple-700',
  received: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export function POList() {
  const navigate = useNavigate();
  const { orders, isLoading, fetchOrders, deleteOrder } = useProcurement();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchOrders(search || undefined);
  }, [fetchOrders, search]);

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  const totalValue = filtered.reduce((sum, o) => sum + Number(o.total || 0), 0);

  const statusCounts = orders.reduce(
    (acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1>
        <button onClick={() => navigate('/procurement/new')} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New PO
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{orders.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Total Value</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">₦{totalValue.toLocaleString()}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {(statusCounts['sent'] || 0) + (statusCounts['confirmed'] || 0)}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Received</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{statusCounts['received'] || 0}</p>
        </div>
      </div>

      {/* Search & Status filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search PO number..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
        </div>
        <div className="flex gap-2 overflow-x-auto">
        {['all', 'draft', 'sent', 'confirmed', 'received', 'cancelled'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === s
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            {statusCounts[s] > 0 && (
              <span className="ml-1.5 text-xs">({statusCounts[s]})</span>
            )}
          </button>
        ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <ClipboardList className="w-12 h-12 mx-auto mb-3" />
            <p className="text-sm">No purchase orders found</p>
            <button onClick={() => navigate('/procurement/new')} className="text-blue-600 text-sm mt-2 hover:underline">
              Create your first PO
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="table-header">PO #</th>
                <th className="table-header">Vendor</th>
                <th className="table-header">Date</th>
                <th className="table-header">Total</th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((po) => (
                <tr key={po.id} className="hover:bg-gray-50">
                  <td className="table-cell font-mono text-sm">{po.orderNumber}</td>
                  <td className="table-cell font-medium">{po.vendorName || 'N/A'}</td>
                  <td className="table-cell text-gray-500 text-sm">
                    {new Date(po.createdAt).toLocaleDateString('en-GB')}
                  </td>
                  <td className="table-cell font-medium">
                    ₦{Number(po.total || 0).toLocaleString()}
                  </td>
                  <td className="table-cell">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[po.status] || 'bg-gray-100 text-gray-600'}`}>
                      {po.status}
                    </span>
                  </td>
                  <td className="table-cell">
                    <button
                      onClick={() => navigate(`/procurement/${po.id}`)}
                      className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
