import { useState, useEffect } from 'react';
import { Factory, Loader2, Package, ClipboardList, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/client';
import { PageHeader } from '../../components/PageHeader';

interface WorkOrder {
  id: string;
  orderNumber: string;
  productName?: string;
  quantity: number;
  status: string;
  dueDate?: string;
  createdAt: string;
  notes?: string;
}

interface Bom {
  id: string;
  name: string;
  bomCode?: string;
  productName?: string;
  productId?: string;
  status: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
}

const woStatusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  approved: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-amber-100 text-amber-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export function Production() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [boms, setBoms] = useState<Bom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<'orders' | 'boms'>('orders');
  const [showCreateWO, setShowCreateWO] = useState(false);
  const [showCreateBom, setShowCreateBom] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => { load(); loadProducts(); }, []);

  const load = async () => {
    setIsLoading(true);
    try {
      const [woRes, bomRes] = await Promise.allSettled([
        api.get('/production/work-orders?limit=50'),
        api.get('/production/boms?limit=50'),
      ]);
      if (woRes.status === 'fulfilled') {
        const raw = woRes.value.data;
        setWorkOrders(Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw) ? raw : []));
      }
      if (bomRes.status === 'fulfilled') {
        const raw = bomRes.value.data;
        setBoms(Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw) ? raw : []));
      }
    } catch { /* ignore */ } finally { setIsLoading(false); }
  };

  const loadProducts = async () => {
    try {
      const res = await api.get('/inventory/products?limit=200');
      setProducts(res.data?.data || res.data || []);
    } catch { /* ignore */ }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Production"
        subtitle={`${workOrders.length} work orders • ${boms.length} BOMs`}
        action={{
          label: tab === 'orders' ? 'New Work Order' : 'New BOM',
          onClick: () => tab === 'orders' ? setShowCreateWO(true) : setShowCreateBom(true),
        }}
      />

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button onClick={() => setTab('orders')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === 'orders' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}>
          <ClipboardList className="w-4 h-4 inline mr-1.5" />Work Orders
        </button>
        <button onClick={() => setTab('boms')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === 'boms' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}>
          <Package className="w-4 h-4 inline mr-1.5" />BOMs
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : tab === 'orders' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {workOrders.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Factory className="w-12 h-12 mx-auto mb-3" />
              <p className="text-sm">No work orders yet</p>
              <button onClick={() => setShowCreateWO(true)} className="mt-3 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700">New Work Order</button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="table-header">Order #</th>
                  <th className="table-header">Product</th>
                  <th className="table-header">Quantity</th>
                  <th className="table-header">Due Date</th>
                  <th className="table-header">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {workOrders.map((wo) => (
                  <tr key={wo.id} className="hover:bg-gray-50">
                    <td className="table-cell font-mono text-sm">{wo.orderNumber}</td>
                    <td className="table-cell font-medium">{wo.productName || 'N/A'}</td>
                    <td className="table-cell">{wo.quantity}</td>
                    <td className="table-cell text-gray-500 text-sm">
                      {wo.dueDate ? new Date(wo.dueDate).toLocaleDateString('en-GB') : '-'}
                    </td>
                    <td className="table-cell">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${woStatusColors[wo.status] || 'bg-gray-100 text-gray-600'}`}>
                        {wo.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {boms.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Package className="w-12 h-12 mx-auto mb-3" />
              <p className="text-sm">No BOMs yet</p>
              <button onClick={() => setShowCreateBom(true)} className="mt-3 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700">New BOM</button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="table-header">Code</th>
                  <th className="table-header">Product</th>
                  <th className="table-header">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {boms.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="table-cell font-mono text-sm">{b.bomCode || b.name}</td>
                    <td className="table-cell font-medium">{b.productName || 'N/A'}</td>
                    <td className="table-cell">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {showCreateWO && <CreateWorkOrderModal products={products} boms={boms} onClose={() => setShowCreateWO(false)} onCreate={load} />}
      {showCreateBom && <CreateBomModal products={products} onClose={() => setShowCreateBom(false)} onCreate={load} />}
    </div>
  );
}

function CreateWorkOrderModal({ products, boms, onClose, onCreate }: { products: Product[]; boms: Bom[]; onClose: () => void; onCreate: () => void }) {
  const [form, setForm] = useState({ bomId: '', productId: '', quantity: '', notes: '', plannedStart: '', plannedEnd: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.bomId) { toast.error('Select a BOM'); return; }
    if (!form.productId) { toast.error('Select a product'); return; }
    if (!form.quantity || Number(form.quantity) <= 0) { toast.error('Enter a valid quantity'); return; }
    try {
      setLoading(true);
      await api.post('/production/work-orders', {
        bomId: form.bomId,
        productId: form.productId,
        quantityToProduce: Number(form.quantity),
        notes: form.notes || undefined,
        plannedStart: form.plannedStart || undefined,
        plannedEnd: form.plannedEnd || undefined,
      });
      toast.success('Work order created');
      onCreate();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create work order');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">New Work Order</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">BOM *</label>
            <select value={form.bomId} onChange={(e) => setForm({ ...form, bomId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
              <option value="">{boms.length === 0 ? 'No BOMs available — create a BOM first' : 'Select BOM'}</option>
              {boms.map((b) => <option key={b.id} value={b.id}>{b.bomCode || b.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Finished Product *</label>
            <select value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
              <option value="">Select product</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity to Produce *</label>
              <input type="number" min="0.01" step="any" value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Planned Start</label>
              <input type="datetime-local" value={form.plannedStart}
                onChange={(e) => setForm({ ...form, plannedStart: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" placeholder="Optional notes" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium disabled:opacity-50">{loading ? 'Creating...' : 'Create Work Order'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CreateBomModal({ products, onClose, onCreate }: { products: Product[]; onClose: () => void; onCreate: () => void }) {
  const [productId, setProductId] = useState('');
  const [bomCode, setBomCode] = useState('');
  const [items, setItems] = useState<Array<{ componentProductId: string; quantity: string; uom: string }>>([
    { componentProductId: '', quantity: '', uom: 'unit' },
  ]);
  const [loading, setLoading] = useState(false);

  const addItem = () => setItems([...items, { componentProductId: '', quantity: '', uom: 'unit' }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: string, value: string) => {
    const next = [...items];
    (next[i] as any)[field] = value;
    setItems(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) { toast.error('Select a finished product'); return; }
    if (!bomCode.trim()) { toast.error('BOM code is required'); return; }
    const validItems = items.filter((it) => it.componentProductId && Number(it.quantity) > 0);
    if (validItems.length === 0) { toast.error('Add at least one component'); return; }
    try {
      setLoading(true);
      await api.post('/production/boms', {
        productId,
        bomCode,
        items: validItems.map((it) => ({
          componentProductId: it.componentProductId,
          quantity: Number(it.quantity),
          uom: it.uom || 'unit',
        })),
      });
      toast.success('BOM created');
      onCreate();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create BOM');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">New Bill of Materials</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Finished Product *</label>
            <select value={productId} onChange={(e) => setProductId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
              <option value="">Select product</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">BOM Code *</label>
            <input type="text" value={bomCode} onChange={(e) => setBomCode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" placeholder="e.g. BOM-001" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Components *</label>
              <button type="button" onClick={addItem} className="text-xs text-primary-600 hover:text-primary-700 font-medium">+ Add component</button>
            </div>
            <div className="space-y-2">
              {items.map((item, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <select value={item.componentProductId} onChange={(e) => updateItem(i, 'componentProductId', e.target.value)}
                    className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-xs">
                    <option value="">Raw material</option>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <input type="number" min="0.01" step="any" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', e.target.value)}
                    className="w-20 px-2 py-1.5 border border-gray-300 rounded-lg text-xs" placeholder="Qty" />
                  <input type="text" value={item.uom} onChange={(e) => updateItem(i, 'uom', e.target.value)}
                    className="w-16 px-2 py-1.5 border border-gray-300 rounded-lg text-xs" placeholder="unit" />
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(i)} className="p-1 text-gray-400 hover:text-red-500"><X className="w-3 h-3" /></button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium disabled:opacity-50">{loading ? 'Creating...' : 'Create BOM'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
