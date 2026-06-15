import { useState } from 'react';
import { useProcurement } from '../../hooks/useProcurement';
import { X, Loader2, Package } from 'lucide-react';
import toast from 'react-hot-toast';

interface GRNItem {
  productId: string;
  productName: string;
  sku: string;
  orderedQuantity: number;
  receivedQuantity: number;
}

export function GRNForm({
  purchaseOrderId,
  items,
  onClose,
  onCompleted,
}: {
  purchaseOrderId: string;
  items: GRNItem[];
  onClose: () => void;
  onCompleted: () => void;
}) {
  const { createGRN } = useProcurement();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [received, setReceived] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    items.forEach((i) => {
      initial[i.productId] = i.orderedQuantity - i.receivedQuantity;
    });
    return initial;
  });

  const allZero = Object.values(received).every((q) => q === 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (allZero) {
      toast.error('At least one item must have a received quantity');
      return;
    }

    setIsSubmitting(true);
    try {
      await createGRN(
        purchaseOrderId,
        Object.entries(received)
          .filter(([_, qty]) => qty > 0)
          .map(([productId, quantity]) => ({ productId, quantity })),
      );
      toast.success('Goods receipt recorded');
      onCompleted();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to record goods receipt');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Goods Receipt</h2>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-gray-500">
            Record received quantities for purchase order <strong>{purchaseOrderId.slice(0, 8)}</strong>
          </p>

          <div className="space-y-3">
            {items.map((item) => {
              const remaining = item.orderedQuantity - item.receivedQuantity;
              return (
                <div key={item.productId} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                      <p className="text-xs text-gray-500">{item.sku}</p>
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      <div>Ordered: {item.orderedQuantity}</div>
                      <div>Previously received: {item.receivedQuantity}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-gray-600">Receiving now:</label>
                    <input
                      type="number"
                      value={received[item.productId] || 0}
                      onChange={(e) =>
                        setReceived((prev) => ({
                          ...prev,
                          [item.productId]: Math.max(0, Math.min(remaining, Number(e.target.value))),
                        }))
                      }
                      className="input w-24 text-center"
                      min="0"
                      max={remaining}
                    />
                    <span className="text-xs text-gray-400">max {remaining}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSubmitting || allZero}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Recording...</>
              ) : (
                'Record Goods Receipt'
              )}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
