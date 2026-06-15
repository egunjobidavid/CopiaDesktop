import { useState, useEffect, useCallback, useRef } from 'react';
import { useProductSearch } from '../../hooks/useProductSearch';
import { useBarcode } from '../../hooks/useBarcode';
import { Search, Package, Barcode, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProductResult {
  id: string;
  sku: string;
  name: string;
  unitPrice: string;
  productType: string;
  uom: string;
  stockQuantity: number;
}

export function ProductSearch({ onSelect }: { onSelect: (product: any) => void }) {
  const [query, setQuery] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [category, setCategory] = useState('all');
  const barcodeRef = useRef<HTMLInputElement>(null);
  const { results, isLoading } = useProductSearch(query);

  const handleBarcodeSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!barcodeInput.trim()) return;

      try {
        const api = (await import('../../api/client')).default;
        const { data } = await api.get(`/inventory/products?sku=${barcodeInput.trim()}`);
        if (Array.isArray(data) && data.length > 0) {
          onSelect(data[0]);
          setBarcodeInput('');
        } else {
          toast.error('Product not found for this barcode');
        }
      } catch {
        toast.error('Failed to look up barcode');
      }
    },
    [barcodeInput, onSelect],
  );

  const filtered = category === 'all' ? results : results.filter((p) => p.productType === category);

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Search bar */}
      <div className="p-4 border-b border-gray-200 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products by name or SKU..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            autoFocus
          />
        </div>

        {/* Barcode input */}
        <form onSubmit={handleBarcodeSubmit} className="relative">
          <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            ref={barcodeRef}
            type="text"
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            placeholder="Scan barcode..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm font-mono"
          />
        </form>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 px-4 py-2 border-b border-gray-100 overflow-x-auto">
        {['all', 'raw_material', 'finished_good', 'service'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              category === cat
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat === 'all' ? 'All' : cat.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Product grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400">
            <Package className="w-10 h-10 mb-2" />
            <p className="text-sm">
              {query ? 'No products found' : 'Type to search products'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.map((product) => (
              <button
                key={product.id}
                onClick={() => onSelect(product)}
                className="bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:shadow-sm transition-all text-left"
              >
                <p className="font-medium text-gray-900 text-sm truncate">
                  {product.name}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{product.sku}</p>
                <p className="text-lg font-bold text-blue-600 mt-1">
                  ₦{Number(product.unitPrice).toLocaleString()}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Stock: {product.stockQuantity} {product.uom}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
