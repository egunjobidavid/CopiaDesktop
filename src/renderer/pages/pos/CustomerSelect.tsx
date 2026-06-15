import { useState, useCallback, useRef, useEffect } from 'react';
import { User, ChevronDown, Search } from 'lucide-react';
import toast from 'react-hot-toast';

interface CustomerResult {
  id: string;
  name: string;
  email: string;
  phone: string;
  customerCode: string;
}

export function CustomerSelect({
  onSelect,
  customerName,
}: {
  onSelect: (customer: any) => void;
  customerName: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState<CustomerResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const searchCustomers = useCallback(async (q: string) => {
    if (!q.trim()) {
      setCustomers([]);
      return;
    }
    setIsLoading(true);
    try {
      const api = (await import('../../api/client')).default;
      const { data } = await api.get(`/customers?search=${encodeURIComponent(q)}&limit=10`);
      setCustomers(Array.isArray(data) ? data : []);
    } catch {
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => searchCustomers(search), 300);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [search, searchCustomers]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = (customer: CustomerResult) => {
    onSelect(customer);
    setIsOpen(false);
    setSearch('');
  };

  const handleWalkIn = () => {
    onSelect({ id: null, name: 'Walk-in Customer' });
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3 flex items-center justify-between hover:border-gray-300 transition-colors"
      >
        <div className="flex items-center gap-3">
          <User className="w-5 h-5 text-gray-400" />
          <div className="text-left">
            <p className="text-sm font-medium text-gray-900">{customerName}</p>
            <p className="text-xs text-gray-500">
              {customerName === 'Walk-in Customer' ? 'No customer selected' : 'Customer'}
            </p>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search customers..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto">
            <button
              onClick={handleWalkIn}
              className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 text-left"
            >
              Walk-in Customer
            </button>

            {isLoading ? (
              <div className="px-4 py-3 text-sm text-gray-400 text-center">
                Searching...
              </div>
            ) : customers.length > 0 ? (
              customers.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleSelect(c)}
                  className="w-full px-4 py-2.5 text-sm hover:bg-gray-50 text-left border-t border-gray-100"
                >
                  <span className="font-medium text-gray-900">{c.name}</span>
                  {c.phone && <span className="text-gray-500 ml-2">{c.phone}</span>}
                  {c.email && <span className="text-gray-400 text-xs block">{c.email}</span>}
                </button>
              ))
            ) : search ? (
              <div className="px-4 py-3 text-sm text-gray-400 text-center">
                No customers found
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
