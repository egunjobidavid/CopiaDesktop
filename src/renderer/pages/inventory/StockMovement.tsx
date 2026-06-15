import { useState, useEffect } from 'react';
import { useInventory } from '../../hooks/useInventory';
import { Search, Loader2, ArrowUpDown } from 'lucide-react';

export function StockMovement() {
  const { movements, isLoading, fetchMovements } = useInventory();
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  const filtered = search
    ? movements.filter((m) =>
        m.productName.toLowerCase().includes(search.toLowerCase()) ||
        m.referenceType.toLowerCase().includes(search.toLowerCase()),
      )
    : movements;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Stock Movements</h1>

      {/* Filters */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by product or reference..."
          className="input pl-9"
        />
      </div>

      {/* Movements table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <ArrowUpDown className="w-12 h-12 mx-auto mb-3" />
            <p className="text-sm">No movements recorded</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="table-header">Date & Time</th>
                <th className="table-header">Product</th>
                <th className="table-header">Type</th>
                <th className="table-header">Quantity</th>
                <th className="table-header">Warehouse</th>
                <th className="table-header">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="table-cell text-gray-500 text-sm">
                    {new Date(m.createdAt).toLocaleString('en-GB')}
                  </td>
                  <td className="table-cell font-medium">{m.productName}</td>
                  <td className="table-cell">
                    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                      m.type === 'in' ? 'bg-green-100 text-green-700' :
                      m.type === 'out' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {m.type === 'in' ? 'IN' : m.type === 'out' ? 'OUT' : 'ADJ'}
                    </span>
                  </td>
                  <td className={`table-cell font-bold ${
                    m.type === 'in' ? 'text-green-600' :
                    m.type === 'out' ? 'text-red-600' :
                    'text-yellow-600'
                  }`}>
                    {m.type === 'in' ? '+' : m.type === 'out' ? '-' : '±'}{m.quantity}
                  </td>
                  <td className="table-cell text-gray-500">{m.warehouseName}</td>
                  <td className="table-cell text-gray-500 text-xs">{m.referenceType}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
