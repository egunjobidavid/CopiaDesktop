import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useProductSearch } from '../../hooks/useProductSearch';
import { ProductSearch } from './ProductSearch';
import { Cart } from './Cart';
import { CustomerSelect } from './CustomerSelect';
import { CheckoutModal } from './CheckoutModal';
import { ZReportModal } from '../../components/ZReportModal';
import { Search, X, ShoppingCart, User, DollarSign, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface SessionInfo {
  id: string;
  openedAt: string;
  openingBalance: number;
  totalSales: number;
  transactionCount: number;
}

export function Pos() {
  const navigate = useNavigate();
  const { items, addItem, updateQuantity, removeItem, clearCart, total, itemCount } = useCart();
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState<string>('Walk-in Customer');
  const [showCheckout, setShowCheckout] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [showZReport, setShowZReport] = useState(false);
  const [showOpeningBalance, setShowOpeningBalance] = useState(false);
  const [openingBalance, setOpeningBalance] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [isOpeningSession, setIsOpeningSession] = useState(false);
  const barcodeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSession();
  }, []);

  async function fetchSession() {
    try {
      const api = (await import('../../api/client')).default;
      const { data } = await api.get('/pos/session/current');
      setSession(data);
    } catch {
      setSession(null);
    }
  }

  const handleBarcodeSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!barcodeInput.trim()) return;

      try {
        const api = (await import('../../api/client')).default;
        const { data } = await api.get(`/inventory/products?sku=${barcodeInput.trim()}`);
        if (Array.isArray(data) && data.length > 0) {
          addItem({
            productId: data[0].id,
            sku: data[0].sku,
            name: data[0].name,
            quantity: 1,
            unitPrice: Number(data[0].unitPrice),
            lineTotal: Number(data[0].unitPrice),
          });
          toast.success(`${data[0].name} added`);
          setBarcodeInput('');
        } else {
          toast.error('Product not found for this barcode');
        }
      } catch {
        toast.error('Failed to look up barcode');
      }
    },
    [barcodeInput, addItem],
  );

  const handleOpenDrawer = useCallback(async () => {
    setIsOpeningSession(true);
    try {
      const api = (await import('../../api/client')).default;
      await api.post('/pos/session/open', {
        openingBalance: Number(openingBalance) || 0,
      });
      toast.success('Cash drawer opened');
      setShowOpeningBalance(false);
      setOpeningBalance('');
      fetchSession();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to open drawer');
    } finally {
      setIsOpeningSession(false);
    }
  }, [openingBalance]);

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
        fetchSession();
      } catch (err: any) {
        const msg = err?.response?.data?.message || 'Checkout failed';
        toast.error(msg);
      } finally {
        setIsSubmitting(false);
      }
    },
    [items, customerId, total, clearCart],
  );

  if (!session) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Open Cash Drawer</h1>
          <p className="text-sm text-gray-500 mb-6">
            Start your POS session by opening the cash drawer with an initial balance.
          </p>
          <button
            onClick={() => setShowOpeningBalance(true)}
            className="w-full py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            Open Drawer
          </button>
        </div>

        {showOpeningBalance && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Open Cash Drawer</h2>
                <button onClick={() => setShowOpeningBalance(false)} className="p-1 text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Opening Balance (₦)</label>
                  <input
                    type="number"
                    value={openingBalance}
                    onChange={(e) => setOpeningBalance(e.target.value)}
                    placeholder="0.00"
                    min={0}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    autoFocus
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleOpenDrawer}
                    disabled={isOpeningSession}
                    className="flex-1 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isOpeningSession ? (
                      <span className="animate-spin">⟳</span>
                    ) : (
                      <DollarSign className="w-4 h-4" />
                    )}
                    {isOpeningSession ? 'Opening...' : 'Open Drawer'}
                  </button>
                  <button
                    onClick={() => setShowOpeningBalance(false)}
                    className="px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Point of Sale</h1>
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Opened {new Date(session.openedAt).toLocaleTimeString()}
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              ₦{Number(session.totalSales || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} today
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowZReport(true)}
            className="px-4 py-2 bg-red-50 text-red-700 font-medium rounded-lg hover:bg-red-100 transition-colors text-sm flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" /> End of Day
          </button>
          <button
            onClick={() => navigate('/sales')}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            View Sales History
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="mb-3">
            <form onSubmit={handleBarcodeSubmit} className="relative">
              <input
                ref={barcodeRef}
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Scan barcode or enter SKU..."
                className="w-full px-4 py-2.5 pr-20 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono"
              />
              <button
                type="submit"
                disabled={!barcodeInput.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-primary-600 text-white text-xs font-medium rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                Add
              </button>
            </form>
          </div>
          <ProductSearch onSelect={handleSelectProduct} />
        </div>

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

            <div className="border-t border-gray-200 px-4 py-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>₦{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Total</span>
                <span>₦{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              <button
                onClick={() => setShowCheckout(true)}
                disabled={items.length === 0}
                className="w-full mt-2 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base"
              >
                Checkout (₦{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
              </button>
            </div>
          </div>
        </div>
      </div>

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

      {showZReport && <ZReportModal onClose={() => { setShowZReport(false); fetchSession(); }} />}
    </div>
  );
}
