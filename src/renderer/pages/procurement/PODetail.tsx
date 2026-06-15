import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProcurement, PurchaseOrder } from '../../hooks/useProcurement';
import { GRNForm } from './GRNForm';
import { ArrowLeft, ClipboardList, Loader2, Package, Edit3 } from 'lucide-react';

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  sent: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-purple-100 text-purple-700',
  received: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const statusActions: Record<string, string[]> = {
  draft: ['sent', 'cancelled'],
  sent: ['confirmed', 'cancelled'],
  confirmed: ['received', 'cancelled'],
  received: [],
  cancelled: ['draft'],
};

export function PODetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orders, fetchOrders, fetchOrder, updateStatus } = useProcurement();
  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showGRN, setShowGRN] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      fetchOrder(id)
        .then(setOrder)
        .catch(() => setOrder(null))
        .finally(() => setIsLoading(false));
    }
  }, [id, fetchOrder]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!id) return;
    setIsUpdating(true);
    try {
      await updateStatus(id, newStatus);
      const updated = await fetchOrder(id);
      setOrder(updated);
    } catch {
      // error handled in hook
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Purchase order not found</p>
        <button onClick={() => navigate('/procurement')} className="text-blue-600 text-sm mt-2 hover:underline">Back to POs</button>
      </div>
    );
  }

  const totalReceived = (order.items || []).reduce((sum, i) => sum + (i.receivedQuantity || 0), 0);
  const totalOrdered = (order.items || []).reduce((sum, i) => sum + i.quantity, 0);
  const completionPct = totalOrdered > 0 ? Math.round((totalReceived / totalOrdered) * 100) : 0;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/procurement')} className="p-2 text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{order.orderNumber}</h1>
            <p className="text-sm text-gray-500">Created {new Date(order.createdAt).toLocaleDateString('en-GB')}</p>
          </div>
        </div>
        <span className={`px-3 py-1.5 text-sm font-medium rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
          {order.status}
        </span>
      </div>

      {/* Progress + Actions */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500">Vendor</p>
          <p className="text-lg font-semibold text-gray-900 mt-1">{order.vendorName || 'N/A'}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Total Value</p>
          <p className="text-lg font-bold text-blue-600 mt-1">₦{Number(order.total || 0).toLocaleString()}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Receipt Progress</p>
          <p className="text-lg font-semibold text-gray-900 mt-1">{completionPct}%</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div className="bg-blue-600 rounded-full h-2 transition-all" style={{ width: `${completionPct}%` }} />
          </div>
        </div>
      </div>

      {/* Status Actions */}
      {statusActions[order.status]?.length > 0 && (
        <div className="card flex items-center gap-3">
          <span className="text-sm text-gray-500">Update Status:</span>
          {statusActions[order.status].map((s) => (
            <button
              key={s}
              onClick={() => handleStatusUpdate(s)}
              disabled={isUpdating}
              className="btn-secondary text-sm"
            >
              {isUpdating ? 'Updating...' : `Mark as ${s.charAt(0).toUpperCase() + s.slice(1)}`}
            </button>
          ))}
          {order.status === 'confirmed' && (
            <button onClick={() => setShowGRN(true)} className="btn-primary text-sm flex items-center gap-1.5">
              <Package className="w-4 h-4" /> Receive Goods
            </button>
          )}
        </div>
      )}

      {/* Items Table */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Line Items</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="table-header">Product</th>
              <th className="table-header">SKU</th>
              <th className="table-header">Ordered</th>
              <th className="table-header">Received</th>
              <th className="table-header">Unit Price</th>
              <th className="table-header">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {(order.items || []).map((item) => (
              <tr key={item.id || item.productId} className="hover:bg-gray-50">
                <td className="table-cell font-medium">{item.productName || 'N/A'}</td>
                <td className="table-cell text-gray-500 font-mono text-xs">{item.sku || ''}</td>
                <td className="table-cell">{item.quantity}</td>
                <td className="table-cell">
                  <span className={item.receivedQuantity >= item.quantity ? 'text-green-600 font-medium' : 'text-amber-600'}>
                    {item.receivedQuantity || 0}
                  </span>
                </td>
                <td className="table-cell">₦{Number(item.unitPrice).toLocaleString()}</td>
                <td className="table-cell font-medium">₦{item.lineTotal.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Notes</p>
          <p className="text-sm text-gray-700">{order.notes}</p>
        </div>
      )}

      {/* GRN Modal */}
      {showGRN && id && (
        <GRNForm
          purchaseOrderId={id}
          items={(order.items || []).map((i) => ({
            productId: i.productId,
            productName: i.productName || '',
            sku: i.sku || '',
            orderedQuantity: i.quantity,
            receivedQuantity: i.receivedQuantity || 0,
          }))}
          onClose={() => setShowGRN(false)}
          onCompleted={async () => {
            setShowGRN(false);
            const updated = await fetchOrder(id);
            setOrder(updated);
          }}
        />
      )}
    </div>
  );
}
