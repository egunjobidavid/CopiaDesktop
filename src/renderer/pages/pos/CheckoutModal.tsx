import { useState, useCallback } from 'react';
import { X, CreditCard, Banknote, Smartphone, Loader2 } from 'lucide-react';

interface CartItem {
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

const paymentMethods = [
  { id: 'cash', label: 'Cash', icon: Banknote },
  { id: 'transfer', label: 'Transfer', icon: Smartphone },
  { id: 'pos', label: 'POS Terminal', icon: CreditCard },
];

export function CheckoutModal({
  total,
  items,
  customerName,
  isSubmitting,
  onConfirm,
  onClose,
}: {
  total: number;
  items: CartItem[];
  customerName: string;
  isSubmitting: boolean;
  onConfirm: (method: string, amountTendered: number) => void;
  onClose: () => void;
}) {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountTendered, setAmountTendered] = useState(total);
  const [showReceipt, setShowReceipt] = useState(false);
  const [confirmedInvoice, setConfirmedInvoice] = useState<any>(null);

  const change = Math.max(0, amountTendered - total);
  const isExactAmount = Math.abs(amountTendered - total) < 0.01;

  const handleConfirm = useCallback(() => {
    if (paymentMethod === 'cash' && amountTendered < total) {
      return;
    }
    onConfirm(paymentMethod, amountTendered);
  }, [paymentMethod, amountTendered, total, onConfirm]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Checkout</h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {showReceipt && confirmedInvoice ? (
          /* Receipt view */
          <div className="p-6 space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Payment Successful</h3>
              <p className="text-sm text-gray-500 mt-1">Invoice #{confirmedInvoice.invoiceNumber}</p>
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Customer</span>
                <span className="font-medium">{customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment</span>
                <span className="font-medium capitalize">{paymentMethod}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>₦{total.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setShowReceipt(false);
                setConfirmedInvoice(null);
                onClose();
              }}
              className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              New Sale
            </button>
          </div>
        ) : (
          <>
            {/* Order summary */}
            <div className="px-6 py-4 border-b border-gray-100">
              <p className="text-sm text-gray-500 mb-2">Order Summary</p>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="text-gray-700 truncate">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-medium text-gray-900">
                      ₦{item.lineTotal.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-lg font-bold mt-3 pt-3 border-t border-gray-200">
                <span>Total Due</span>
                <span>₦{total.toLocaleString()}</span>
              </div>
            </div>

            {/* Customer */}
            <div className="px-6 py-3 border-b border-gray-100">
              <p className="text-xs text-gray-500">Customer</p>
              <p className="text-sm font-medium text-gray-900">{customerName}</p>
            </div>

            {/* Payment method */}
            <div className="px-6 py-4 border-b border-gray-100">
              <p className="text-sm text-gray-500 mb-3">Payment Method</p>
              <div className="grid grid-cols-3 gap-2">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-lg border-2 transition-all text-sm ${
                        paymentMethod === method.id
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{method.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Amount tendered (cash only) */}
            {paymentMethod === 'cash' && (
              <div className="px-6 py-4 border-b border-gray-100">
                <label className="block text-sm text-gray-500 mb-2">
                  Amount Tendered (₦)
                </label>
                <input
                  type="number"
                  value={amountTendered}
                  onChange={(e) => setAmountTendered(Number(e.target.value))}
                  min={total}
                  step="100"
                  className="w-full px-4 py-2.5 text-lg font-bold text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  autoFocus
                />
                {amountTendered < total && (
                  <p className="text-xs text-red-500 mt-1">
                    Amount must be at least ₦{total.toLocaleString()}
                  </p>
                )}
                {amountTendered >= total && (
                  <p className="text-xs text-green-600 mt-1">
                    Change: ₦{change.toLocaleString()}
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="px-6 py-4 space-y-2">
              <button
                onClick={handleConfirm}
                disabled={
                  isSubmitting ||
                  total <= 0 ||
                  (paymentMethod === 'cash' && amountTendered < total)
                }
                className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Confirm Payment — ₦${total.toLocaleString()}`
                )}
              </button>
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="w-full py-2.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
