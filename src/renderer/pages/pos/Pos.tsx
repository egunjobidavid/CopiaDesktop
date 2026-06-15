import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useProductSearch } from '../../hooks/useProductSearch';
import { ProductSearch } from './ProductSearch';
import { Cart } from './Cart';
import { CustomerSelect } from './CustomerSelect';
import { CheckoutModal } from './CheckoutModal';
import { Search, X, ShoppingCart, User } from 'lucide-react';
import toast from 'react-hot-toast';

export function Pos() {
  const navigate = useNavigate();
  const { items, addItem, updateQuantity, removeItem, clearCart, total, itemCount } = useCart();
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState<string>('Walk-in Customer');
  const [showCheckout, setShowCheckout] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectProduct = useCallback(
    (product: any) => {
      addItem({
        productId: product.id,
        sku: product.sku,
        name: product.name,
        quantity: 1,
        unitPrice: Number(product.unitPrice),
        lineTotal: Number(product.unitPrice),
      });
      toast.success(`${product.name} added`);
    },
    [addItem],
  );

  const handleSelectCustomer = useCallback(
    (customer: any) => {
      setCustomerId(customer.id);
      setCustomerName(customer.name);
    },
    [],
  );

  const handleCheckout = useCallback(
    async (method: string, amountTendered: number) => {
      setIsSubmitting(true);
      try {
        const api = (await import('../../api/client')).default;

        const orderRes = await api.post('/sales/orders', {
          customerId,
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          })),
        });

        const invoiceRes = await api.post('/sales/invoices', {
          customerId,
          salesOrderId: orderRes.data.id,
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          })),
          tax: 0,
        });

        if (method === 'cash') {
          const change = amountTendered - total;
          await api.post('/payments', {
            customerId,
            invoiceId: invoiceRes.data.id,
            amount: total,
            method: 'cash',
            amountTendered,
            change: Math.max(0, change),
          });
        }

        toast.success(`Sale complete! Invoice #${invoiceRes.data.invoiceNumber || ''}`);
        clearCart();
        setCustomerId(null);
        setCustomerName('Walk-in Customer');
        setShowCheckout(false);
      } catch (err: any) {
        const msg = err?.response?.data?.message || 'Checkout failed';
        toast.error(msg);
      } finally {
        setIsSubmitting(false);
      }
    },
    [items, customerId, total, clearCart],
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Point of Sale</h1>
        <button
          onClick={() => navigate('/sales')}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          View Sales History
        </button>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Left: Product Search */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <ProductSearch onSelect={handleSelectProduct} />
        </div>

        {/* Right: Cart + Customer */}
        <div className="w-96 flex flex-col gap-4 overflow-y-auto">
          <CustomerSelect onSelect={handleSelectCustomer} customerName={customerName} />

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 flex flex-col">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-900">Cart</span>
              </div>
              <span className="text-sm text-gray-500">{itemCount} items</span>
            </div>

            <Cart
              items={items}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeItem}
            />

            {/* Totals */}
            <div className="border-t border-gray-200 px-4 py-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>₦{total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Total</span>
                <span>₦{total.toLocaleString()}</span>
              </div>

              <button
                onClick={() => setShowCheckout(true)}
                disabled={items.length === 0}
                className="w-full mt-2 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base"
              >
                Checkout (₦{total.toLocaleString()})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <CheckoutModal
          total={total}
          items={items}
          customerName={customerName}
          isSubmitting={isSubmitting}
          onConfirm={handleCheckout}
          onClose={() => !isSubmitting && setShowCheckout(false)}
        />
      )}
    </div>
  );
}
