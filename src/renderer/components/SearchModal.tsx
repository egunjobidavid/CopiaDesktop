import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Package, Users, ShoppingBag, FileText, Receipt, X } from 'lucide-react';
import api from '../api/client';

interface SearchResult {
  type: string;
  id: string;
  title: string;
  subtitle: string;
  path: string;
  icon: any;
}

const TYPE_ICONS: Record<string, any> = {
  product: Package,
  customer: Users,
  vendor: ShoppingBag,
  order: FileText,
  invoice: Receipt,
};

export function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const search = useCallback(async (q: string) => {
    if (!q || q.length < 2) { setResults([]); return; }
    setIsLoading(true);
    try {
      const searches = [
        api.get(`/inventory/products?search=${encodeURIComponent(q)}&limit=5`).then(({ data }) =>
          (Array.isArray(data) ? data : []).map((p: any) => ({
            type: 'product', id: p.id, title: p.name, subtitle: p.sku,
            path: `/products/${p.id}`, icon: Package,
          }))
        ),
        api.get(`/customers?search=${encodeURIComponent(q)}&limit=5`).then(({ data }) =>
          (Array.isArray(data) ? data : []).map((c: any) => ({
            type: 'customer', id: c.id, title: c.name, subtitle: c.email || '',
            path: '/customers', icon: Users,
          }))
        ),
        api.get(`/vendors?search=${encodeURIComponent(q)}&limit=5`).then(({ data }) =>
          (Array.isArray(data) ? data : []).map((v: any) => ({
            type: 'vendor', id: v.id, title: v.name, subtitle: v.email || '',
            path: '/vendors', icon: ShoppingBag,
          }))
        ),
        api.get(`/sales/orders?limit=50`).then(({ data }) =>
          (Array.isArray(data) ? data : []).filter((o: any) =>
            (o.orderNumber || '').toLowerCase().includes(q.toLowerCase())
          ).slice(0, 5).map((o: any) => ({
            type: 'order', id: o.id, title: o.orderNumber, subtitle: `₦${Number(o.total).toLocaleString()}`,
            path: '/sales', icon: FileText,
          }))
        ),
      ];
      const all = await Promise.allSettled(searches);
      const combined = all
        .filter((r): r is PromiseFulfilledResult<SearchResult[]> => r.status === 'fulfilled')
        .flatMap(r => r.value);
      setResults(combined.slice(0, 15));
    } catch {} finally { setIsLoading(false); }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  useEffect(() => {
    if (!open) { setQuery(''); setResults([]); }
  }, [open]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (open) onClose(); else onClose(); // toggle handled by parent
      }
      if (e.key === 'Escape' && open) onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={onClose}>
      <div className="fixed inset-0 bg-black/40" />
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
          <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, customers, vendors, orders..."
            className="flex-1 text-sm outline-none bg-transparent"
          />
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">ESC</kbd>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {isLoading && (
            <div className="py-8 text-center text-sm text-gray-400">Searching...</div>
          )}
          {!isLoading && query.length >= 2 && results.length === 0 && (
            <div className="py-8 text-center text-sm text-gray-400">No results found</div>
          )}
          {!isLoading && results.length > 0 && (
            <div className="py-2">
              {results.map((r) => {
                const Icon = r.icon;
                return (
                  <button
                    key={`${r.type}-${r.id}`}
                    onClick={() => { navigate(r.path); onClose(); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{r.title}</p>
                      <p className="text-xs text-gray-500 truncate">{r.subtitle}</p>
                    </div>
                    <span className="text-xs text-gray-400 capitalize">{r.type}</span>
                  </button>
                );
              })}
            </div>
          )}
          {query.length < 2 && (
            <div className="py-8 text-center text-sm text-gray-400">
              Type at least 2 characters to search
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
