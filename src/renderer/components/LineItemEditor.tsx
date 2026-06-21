import { useState, useEffect } from 'react';
import { Plus, Trash2, Search } from 'lucide-react';
import api from '../api/client';

interface LineItem {
  productId: string;
  itemName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
  unit: string;
}

interface LineItemEditorProps {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  currency?: string;
}

export function LineItemEditor({ items, onChange, currency = 'NGN' }: LineItemEditorProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [searchIdx, setSearchIdx] = useState<number | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    api.get('/inventory/products?limit=200').then(({ data }) => {
      setProducts(Array.isArray(data) ? data : data?.rows || []);
    }).catch(() => {});
  }, []);

  const symbol = currency === 'NGN' ? '\u20A6' : currency + ' ';

  function addItem() {
    onChange([...items, {
      productId: '',
      itemName: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      taxRate: 0,
      unit: 'unit',
    }]);
  }

  function updateItem(idx: number, field: keyof LineItem, value: any) {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: value };
    onChange(updated);
  }

  function removeItem(idx: number) {
    onChange(items.filter((_, i) => i !== idx));
  }

  function selectProduct(idx: number, product: any) {
    const updated = [...items];
    updated[idx] = {
      ...updated[idx],
      productId: product.id,
      itemName: product.name,
      unitPrice: Number(product.unitPrice || product.sellingPrice || 0),
      description: product.description || '',
      unit: product.uom || 'unit',
    };
    onChange(updated);
    setSearchIdx(null);
    setQuery('');
  }

  function getLineTotal(item: LineItem): number {
    const sub = item.quantity * item.unitPrice - item.discount;
    return sub + sub * (item.taxRate / 100);
  }

  const filteredProducts = query
    ? products.filter(p => (p.name || '').toLowerCase().includes(query.toLowerCase()) || (p.sku || '').toLowerCase().includes(query.toLowerCase()))
    : products;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">Line Items</label>
        <button type="button" onClick={addItem}
          className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
          <Plus className="w-3.5 h-3.5" /> Add Item
        </button>
      </div>

      {items.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4 border border-dashed border-gray-200 rounded-lg">
          Click "Add Item" to add line items. You can use inventory products or type custom item names.
        </p>
      )}

      {items.map((item, idx) => (
        <div key={idx} className="border border-gray-200 rounded-lg p-3 space-y-2">
          <div className="flex items-start gap-2">
            <div className="flex-1 space-y-2">
              {/* Product search or custom name */}
              <div className="relative">
                <input
                  type="text"
                  value={searchIdx === idx ? query : (item.itemName || item.description || '')}
                  onChange={(e) => {
                    setSearchIdx(idx);
                    setQuery(e.target.value);
                    if (!item.productId) {
                      updateItem(idx, 'itemName', e.target.value);
                    }
                  }}
                  onFocus={() => { setSearchIdx(idx); setQuery(''); }}
                  placeholder="Search product or type custom item name..."
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                {searchIdx === idx && query && filteredProducts.length > 0 && (
                  <div className="absolute z-10 top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                    {filteredProducts.slice(0, 8).map(p => (
                      <button key={p.id} type="button"
                        onClick={() => selectProduct(idx, p)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm">
                        <span className="font-medium">{p.name}</span>
                        <span className="text-gray-400 ml-2">{p.sku}</span>
                        <span className="text-gray-500 float-right">{symbol}{Number(p.unitPrice || 0).toLocaleString()}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <input
                type="text"
                value={item.description}
                onChange={(e) => updateItem(idx, 'description', e.target.value)}
                placeholder="Description (optional)"
                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-500 focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Quantity */}
            <div className="w-20">
              <label className="text-[10px] text-gray-400 uppercase">Qty</label>
              <input type="number" min="0.01" step="0.01"
                value={item.quantity}
                onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Unit Price */}
            <div className="w-28">
              <label className="text-[10px] text-gray-400 uppercase">Unit Price</label>
              <input type="number" min="0" step="0.01"
                value={item.unitPrice}
                onChange={(e) => updateItem(idx, 'unitPrice', Number(e.target.value))}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-right focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Discount */}
            <div className="w-20">
              <label className="text-[10px] text-gray-400 uppercase">Disc</label>
              <input type="number" min="0" step="0.01"
                value={item.discount}
                onChange={(e) => updateItem(idx, 'discount', Number(e.target.value))}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-right focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Tax Rate */}
            <div className="w-20">
              <label className="text-[10px] text-gray-400 uppercase">Tax %</label>
              <input type="number" min="0" step="0.01"
                value={item.taxRate}
                onChange={(e) => updateItem(idx, 'taxRate', Number(e.target.value))}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-right focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Line Total */}
            <div className="w-28 text-right pt-4">
              <span className="text-sm font-medium text-gray-900">
                {symbol}{getLineTotal(item).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Remove */}
            <button type="button" onClick={() => removeItem(idx)}
              className="p-1 text-red-400 hover:text-red-600 mt-3">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}

      {items.length > 0 && (
        <div className="text-right pt-2 border-t border-gray-100">
          <span className="text-sm font-semibold text-gray-900">
            Total: {symbol}{items.reduce((sum, i) => sum + getLineTotal(i), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
      )}
    </div>
  );
}

export type { LineItem };
