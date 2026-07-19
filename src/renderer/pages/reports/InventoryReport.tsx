import { useState, useEffect } from 'react';
import api from '../../api/client';
import { KPICard } from '../../components/charts/KPICard';
import { Package, DollarSign, AlertTriangle, TrendingUp, Loader2 } from 'lucide-react';

export function InventoryReport() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const [prodRes, balRes] = await Promise.allSettled([
          api.get('/inventory/products?limit=200'),
          api.get('/inventory/stock'),
        ]);
        const prodData = prodRes.status === 'fulfilled' ? prodRes.value.data : [];
        const balData = balRes.status === 'fulfilled' ? balRes.value.data : [];

        const stockMap: Record<string, number> = {};
        (Array.isArray(balData) ? balData : []).forEach((b: any) => {
          stockMap[b.productId] = (stockMap[b.productId] || 0) + (b.quantity || 0);
        });

        const enriched = (Array.isArray(prodData) ? prodData : []).map((p: any) => ({
          ...p,
          stockQuantity: stockMap[p.id] || 0,
          stockValue: (stockMap[p.id] || 0) * Number(p.unitPrice || 0),
        }));

        setProducts(enriched);
      } catch {
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const totalValue = products.reduce((s, p) => s + p.stockValue, 0);
  const totalQty = products.reduce((s, p) => s + p.stockQuantity, 0);
  const lowStock = products.filter((p) => p.stockQuantity > 0 && p.stockQuantity < 10).length;
  const outOfStock = products.filter((p) => p.stockQuantity === 0).length;

  if (isLoading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Inventory Report</h1>

      <div className="grid grid-cols-4 gap-4">
        <KPICard title="Total Stock Value" value={`₦${totalValue.toLocaleString()}`} color="bg-blue-600" icon={DollarSign} />
        <KPICard title="Total Units" value={totalQty.toLocaleString()} color="bg-green-600" icon={Package} />
        <KPICard title="Low Stock Items" value={lowStock.toString()} subtitle="Less than 10 units" color="bg-amber-600" icon={AlertTriangle} />
        <KPICard title="Out of Stock" value={outOfStock.toString()} color="bg-red-600" icon={AlertTriangle} />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="table-header">Product</th>
              <th className="table-header">SKU</th>
              <th className="table-header">Type</th>
              <th className="table-header">Quantity</th>
              <th className="table-header">Unit Price</th>
              <th className="table-header">Stock Value</th>
              <th className="table-header">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="table-cell font-medium">{p.name}</td>
                <td className="table-cell text-gray-500 font-mono text-xs">{p.sku}</td>
                <td className="table-cell text-gray-500 text-sm">{p.productType?.replace('_', ' ')}</td>
                <td className="table-cell">{p.stockQuantity}</td>
                <td className="table-cell">₦{Number(p.unitPrice).toLocaleString()}</td>
                <td className="table-cell font-medium">₦{p.stockValue.toLocaleString()}</td>
                <td className="table-cell">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    p.stockQuantity === 0 ? 'bg-red-100 text-red-700' :
                    p.stockQuantity < 10 ? 'bg-amber-100 text-amber-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {p.stockQuantity === 0 ? 'Out' : p.stockQuantity < 10 ? 'Low' : 'OK'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
