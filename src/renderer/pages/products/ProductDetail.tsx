import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { useInventory } from '../../hooks/useInventory';
import { ProductForm } from './ProductForm';
import { ArrowLeft, Edit2, Package, Loader2 } from 'lucide-react';

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, fetchProducts } = useProducts();
  const { balances, movements, fetchBalances, fetchMovements } = useInventory();
  const [showEdit, setShowEdit] = useState(false);

  const product = products.find((p) => p.id === id);

  useEffect(() => {
    if (id) {
      fetchProducts();
      fetchBalances(id);
      fetchMovements(id);
    }
  }, [id, fetchProducts, fetchBalances, fetchMovements]);

  if (!product) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/products')} className="p-2 text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-sm text-gray-500">{product.sku}</p>
          </div>
        </div>
        <button onClick={() => setShowEdit(true)} className="btn-secondary flex items-center gap-2">
          <Edit2 className="w-4 h-4" /> Edit
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Info */}
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold">Product Info</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Type</span>
              <span className="font-medium capitalize">{product.productType?.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">UOM</span>
              <span className="font-medium">{product.uom}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Unit Price</span>
              <span className="font-bold text-blue-600">₦{Number(product.unitPrice).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>
              <span className={`font-medium ${product.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                {product.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          {product.description && (
            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Description</p>
              <p className="text-sm text-gray-700">{product.description}</p>
            </div>
          )}
        </div>

        {/* Stock Balances */}
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold">Stock Balances</h2>
          {balances.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Package className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">No stock records</p>
            </div>
          ) : (
            <div className="space-y-2">
              {balances.map((b) => (
                <div key={b.warehouseId} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-700">{b.warehouseName}</span>
                  <span className="font-bold text-gray-900">{b.quantity} {b.uom}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Movement History */}
        <div className="card lg:col-span-3 space-y-4">
          <h2 className="text-lg font-semibold">Movement History</h2>
          {movements.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm">No movements recorded</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="table-header">Date</th>
                    <th className="table-header">Type</th>
                    <th className="table-header">Quantity</th>
                    <th className="table-header">Warehouse</th>
                    <th className="table-header">Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {movements.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="table-cell text-gray-500">
                        {new Date(m.createdAt).toLocaleDateString('en-GB')}
                      </td>
                      <td className="table-cell">
                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                          m.type === 'in' ? 'bg-green-100 text-green-700' :
                          m.type === 'out' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {m.type}
                        </span>
                      </td>
                      <td className="table-cell font-medium">{m.quantity}</td>
                      <td className="table-cell text-gray-500">{m.warehouseName}</td>
                      <td className="table-cell text-gray-500 text-xs">{m.referenceType}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEdit && (
        <ProductForm
          product={product}
          onClose={() => setShowEdit(false)}
          onSaved={() => { setShowEdit(false); fetchProducts(); }}
        />
      )}
    </div>
  );
}
