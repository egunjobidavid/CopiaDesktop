import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProcurement } from '../../hooks/useProcurement';
import { ArrowLeft, Plus, Trash2, Loader2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

interface LineItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export function POForm() {
  const navigate = useNavigate();
  const { createOrder, searchVendors, searchProducts } = useProcurement();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vendorSearch, setVendorSearch] = useState('');
  const [vendorResults, setVendorResults] = useState<any[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [productSearch, setProductSearch] = useState('');
  const [productResults, setProductResults] = useState<any[]>([]);
  const [items, setItems] = useState<LineItem[]>([]);
  const [notes, setNotes] = useState('');
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  const searchVendor = useCallback(async (q: string) => {
    setVendorSearch(q);
    if (q.trim().length < 2) { setVendorResults([]); return; }
    const res = await searchVendors(q);
    setVendorResults(res);
  }, [searchVendors]);

  const searchProd = useCallback(async (q: string) => {
    setProductSearch(q);
    if (q.trim().length < 2) { setProductResults([]); return; }
    const res = await searchProducts(q);
    setProductResults(res);
  }, [searchProducts]);

  const addItem = (product: any) => {
    setItems((prev) => {
      if (prev.find((i) => i.productId === product.id)) {
        toast('Product already added');
        return prev;
      }
      return [...prev, {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        quantity: 1,
        unitPrice: Number(product.unitPrice),
        lineTotal: Number(product.unitPrice),
      }];
    });
    setProductSearch('');
    setProductResults([]);
  };

  const updateItem = (productId: string, field: string, value: number) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.productId !== productId) return i;
        const updated = { ...i, [field]: value };
        updated.lineTotal = updated.quantity * updated.unitPrice;
        return updated;
      }),
    );
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const total = items.reduce((sum, i) => sum + i.lineTotal, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendor) { toast.error('Please select a vendor'); return; }
    if (items.length === 0) { toast.error('Add at least one item'); return; }

    setIsSubmitting(true);
    try {
      await createOrder({
        vendorId: selectedVendor.id,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
        notes: notes || undefined,
      });
      navigate('/procurement');
    } catch {
      toast.error('Failed to create purchase order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/procurement')} className="p-2 text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">New Purchase Order</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Vendor Selection */}
        <div className="card">
          <label className="label">Vendor</label>
          {selectedVendor ? (
            <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div>
                <p className="font-medium text-gray-900">{selectedVendor.name}</p>
                <p className="text-sm text-gray-500">{selectedVendor.vendorCode}</p>
              </div>
              <button
                type="button"
                onClick={() => { setSelectedVendor(null); setVendorSearch(''); }}
                className="text-sm text-red-600 hover:underline"
              >
                Change
              </button>
            </div>
          ) : (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={vendorSearch}
                onChange={(e) => { searchVendor(e.target.value); setShowVendorDropdown(true); }}
                onFocus={() => setShowVendorDropdown(true)}
                placeholder="Search vendors by name or code..."
                className="input pl-9"
              />
              {showVendorDropdown && vendorResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {vendorResults.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => { setSelectedVendor(v); setShowVendorDropdown(false); setVendorSearch(''); }}
                      className="w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50 border-b border-gray-100 last:border-0"
                    >
                      <span className="font-medium">{v.name}</span>
                      <span className="text-gray-500 ml-2">{v.vendorCode}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Line Items */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Items</h2>
          </div>

          {/* Product search add */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={productSearch}
              onChange={(e) => { searchProd(e.target.value); setShowProductDropdown(true); }}
              onFocus={() => setShowProductDropdown(true)}
              placeholder="Search products to add..."
              className="input pl-9"
            />
            {showProductDropdown && productResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                {productResults.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => { addItem(p); setShowProductDropdown(false); }}
                    className="w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50 border-b border-gray-100 last:border-0 flex justify-between"
                  >
                    <span><span className="font-medium">{p.name}</span> <span className="text-gray-400">{p.sku}</span></span>
                    <span className="text-blue-600">₦{Number(p.unitPrice).toLocaleString()}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {items.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No items added yet. Search and add products above.</p>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
                    <p className="text-xs text-gray-500">{item.sku}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.productId, 'quantity', Math.max(1, Number(e.target.value)))}
                      className="w-16 input text-sm text-center"
                      min="1"
                    />
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(item.productId, 'unitPrice', Math.max(0, Number(e.target.value)))}
                      className="w-24 input text-sm text-right"
                      min="0"
                      step="0.01"
                    />
                    <span className="text-sm font-medium text-gray-900 w-24 text-right">
                      ₦{item.lineTotal.toLocaleString()}
                    </span>
                    <button type="button" onClick={() => removeItem(item.productId)} className="p-1 text-gray-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end mt-4 pt-4 border-t border-gray-200">
            <div className="text-right">
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-xl font-bold text-gray-900">₦{total.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="card">
          <label className="label">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="input min-h-[80px] resize-y"
            placeholder="Internal notes for this purchase order..."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting || !selectedVendor || items.length === 0}
            className="btn-primary flex-1 flex items-center justify-center gap-2 py-3"
          >
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
            ) : (
              `Create Purchase Order — ₦${total.toLocaleString()}`
            )}
          </button>
          <button type="button" onClick={() => navigate('/procurement')} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
