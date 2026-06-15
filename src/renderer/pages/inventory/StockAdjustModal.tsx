import { useState } from 'react';
import { useInventory } from '../../hooks/useInventory';
import { X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface StockAdjustModalProps {
  productId?: string;
  productName?: string;
  onClose: () => void;
  onCompleted: () => void;
}

export function StockAdjustModal({ productId, productName, onClose, onCompleted }: StockAdjustModalProps) {
  const { adjustStock } = useInventory();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    productId: productId || '',
    quantity: 0,
    reason: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.productId) {
      toast.error('Please select a product');
      return;
    }
    if (form.quantity === 0) {
      toast.error('Quantity must be non-zero');
      return;
    }
    if (!form.reason.trim()) {
      toast.error('Please provide a reason for adjustment');
      return;
    }

    setIsSubmitting(true);
    try {
      await adjustStock(form.productId, form.quantity, form.reason);
      toast.success('Stock adjusted successfully');
      onCompleted();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to adjust stock');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Adjust Stock</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {productName && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Product</p>
              <p className="text-sm font-medium text-gray-900">{productName}</p>
            </div>
          )}

          {!productId && (
            <div>
              <label className="label">Product ID</label>
              <input
                type="text"
                value={form.productId}
                onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value }))}
                className="input"
                placeholder="Enter product ID"
                required
              />
            </div>
          )}

          <div>
            <label className="label">
              Quantity Adjustment
              <span className="text-xs text-gray-400 ml-2">(positive = add, negative = remove)</span>
            </label>
            <input
              type="number"
              value={form.quantity}
              onChange={(e) => setForm((f) => ({ ...f, quantity: Number(e.target.value) }))}
              className="input"
              placeholder="e.g. 10 or -5"
              required
            />
          </div>

          <div>
            <label className="label">Reason</label>
            <textarea
              value={form.reason}
              onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
              className="input min-h-[80px] resize-y"
              placeholder="e.g. Damaged goods, cycle count correction, theft..."
              required
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
              ) : (
                'Apply Adjustment'
              )}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
