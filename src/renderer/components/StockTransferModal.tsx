import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Loader2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

interface TransferItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitCost: number;
}

interface Warehouse {
  id: string;
  name: string;
}

export function StockTransferModal({ onClose }: { onClose: () => void }) {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [fromWarehouse, setFromWarehouse] = useState('');
  const [toWarehouse, setToWarehouse] = useState('');
  const [items, setItems] = useState<TransferItem[]>([{ productId: '', productName: '', sku: '', quantity: 1, unitCost: 0 }]);
  const [productSearchResults, setProductSearchResults] = useState<any[]>([]);
  const [searchingIndex, setSearchingIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchWarehouses();
  }, []);

  async function fetchWarehouses() {
    try {
      const { default: api } = await import('../api/client');
      const { data } = await api.get('/inventory/warehouses');
      const list = Array.isArray(data) ? data : data?.data || data?.rows || [];
      setWarehouses(list);
      if (list.length > 0 && !fromWarehouse) {
        setFromWarehouse(list[0].id);
        setToWarehouse(list.length > 1 ? list[1].id : list[0].id);
      }
    } catch {
      setWarehouses([]);
    }
  }

  async function searchProducts(query: string, index: number) {
    if (!query.trim()) {
      setProductSearchResults([]);
      return;
    }
    try {
      const { default: api } = await import('../api/client');
      const { data } = await api.get(`/inventory/products?search=${encodeURIComponent(query)}&limit=10`);
      setProductSearchResults(Array.isArray(data) ? data : []);
      setSearchingIndex(index);
    } catch {
      setProductSearchResults([]);
    }
  }

  function selectProduct(product: any, index: number) {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      unitCost: Number(product.costPrice || product.unitPrice || 0),
    };
    setItems(updated);
    setProductSearchResults([]);
    setSearchQuery('');
    setSearchingIndex(null);
  }

  function addItem() {
    setItems([...items, { productId: '', productName: '', sku: '', quantity: 1, unitCost: 0 }]);
  }

  function removeItem(index: number) {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: keyof TransferItem, value: any) {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    setItems(updated);
  }

  async function handleSubmit() {
    if (!fromWarehouse || !toWarehouse) {
      toast.error('Please select source and destination warehouses');
      return;
    }
    if (fromWarehouse === toWarehouse) {
      toast.error('Source and destination warehouses must be different');
      return;
    }
    const validItems = items.filter((i) => i.productId && i.quantity > 0);
    if (validItems.length === 0) {
      toast.error('Please add at least one product');
      return;
    }

    setIsSubmitting(true);
    try {
      const { default: api } = await import('../api/client');
      await api.post('/inventory/transfers', {
        fromWarehouseId: fromWarehouse,
        toWarehouseId: toWarehouse,
        items: validItems.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          unitCost: i.unitCost,
        })),
      });
      toast.success('Stock transfer created');
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Transfer failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Stock Transfer</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Warehouse *</label>
              <select
                value={fromWarehouse}
                onChange={(e) => setFromWarehouse(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select warehouse</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Warehouse *</label>
              <select
                value={toWarehouse}
                onChange={(e) => setToWarehouse(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select warehouse</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700">Items</h3>
              <button
                onClick={addItem}
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 relative">
                      <label className="block text-xs text-gray-500 mb-1">Product *</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={searchingIndex === index ? searchQuery : item.productName || ''}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            searchProducts(e.target.value, index);
                          }}
                          onFocus={() => {
                            if (item.productName) {
                              setSearchQuery('');
                              setSearchingIndex(null);
                            }
                          }}
                          placeholder="Search product..."
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      {searchingIndex === index && productSearchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                          {productSearchResults.map((p) => (
                            <button
                              key={p.id}
                              onClick={() => selectProduct(p, index)}
                              className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 border-b border-gray-100 last:border-0"
                            >
                              <span className="font-medium">{p.name}</span>
                              <span className="text-gray-500 ml-2">{p.sku}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="w-24">
                      <label className="block text-xs text-gray-500 mb-1">Qty *</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', Math.max(1, Number(e.target.value)))}
                        min={1}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div className="w-28">
                      <label className="block text-xs text-gray-500 mb-1">Unit Cost</label>
                      <input
                        type="number"
                        value={item.unitCost}
                        onChange={(e) => updateItem(index, 'unitCost', Number(e.target.value))}
                        step="0.01"
                        min={0}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <button
                      onClick={() => removeItem(index)}
                      disabled={items.length <= 1}
                      className="mt-5 p-2 text-gray-400 hover:text-red-500 disabled:opacity-30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {item.productName && (
                    <p className="text-xs text-gray-500">{item.sku} — Selected</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isSubmitting ? 'Processing...' : 'Create Transfer'}
            </button>
            <button onClick={onClose} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}
