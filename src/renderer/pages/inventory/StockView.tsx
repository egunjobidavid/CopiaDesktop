import { useState, useEffect } from 'react';
import { useInventory } from '../../hooks/useInventory';
import { Search, Warehouse, Loader2 } from 'lucide-react';

export function StockView() {
  const { balances, isLoading, fetchBalances } = useInventory();
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  const filtered = search
    ? balances.filter((b) =>
        b.productName.toLowerCase().includes(search.toLowerCase()) ||
        b.productSku.toLowerCase().includes(search.toLowerCase()),
      )
    : balances;

  const totalItems = balances.reduce((sum, b) => sum + b.quantity, 0);
  const lowStock = balances.filter((b) => b.quantity > 0 && b.quantity < 10).length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Inventory Stock</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500">Total Items in Stock</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalItems}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Unique Products</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{balances.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Low Stock Items</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{lowStock}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by product name or SKU..."
          className="input pl-9"
        />
      </div>

      {/* Balances table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Warehouse className="w-12 h-12 mx-auto mb-3" />
            <p className="text-sm">No stock records found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="table-header">Product</th>
                <th className="table-header">SKU</th>
                <th className="table-header">Warehouse</th>
                <th className="table-header">Quantity</th>
                <th className="table-header">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((b, i) => (
                <tr key={`${b.productId}-${b.warehouseId}-${i}`} className="hover:bg-gray-50">
                  <td className="table-cell font-medium">{b.productName}</td>
                  <td className="table-cell text-gray-500 font-mono text-xs">{b.productSku}</td>
                  <td className="table-cell text-gray-500">{b.warehouseName}</td>
                  <td className="table-cell font-bold">
                    <span className={
                      b.quantity === 0 ? 'text-red-500' :
                      b.quantity < 10 ? 'text-amber-600' :
                      'text-gray-900'
                    }>
                      {b.quantity} {b.uom}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      b.quantity === 0 ? 'bg-red-100 text-red-700' :
                      b.quantity < 10 ? 'bg-amber-100 text-amber-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {b.quantity === 0 ? 'Out of Stock' :
                       b.quantity < 10 ? 'Low Stock' : 'In Stock'}
                    </span>
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
