import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Loader2, Search, ArrowRight, Trash2, Eye } from 'lucide-react';
import api from '../../api/client';
import { Breadcrumbs } from '../../components/Breadcrumbs';
import toast from 'react-hot-toast';

interface Quote {
  id: string;
  quoteNumber: string;
  customerId: string | null;
  status: string;
  total: number;
  currency: string;
  notes: string | null;
  createdAt: string;
  items: any[];
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  sent: 'bg-blue-100 text-blue-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  converted: 'bg-purple-100 text-purple-700',
  expired: 'bg-amber-100 text-amber-700',
};

export function Quotes() {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => { fetchQuotes(); }, []);

  async function fetchQuotes() {
    setIsLoading(true);
    try {
      const { data } = await api.get('/quotes?limit=100');
      setQuotes(data?.rows || []);
    } catch { setQuotes([]); } finally { setIsLoading(false); }
  }

  const filtered = quotes.filter((q) => {
    if (filter !== 'all' && q.status !== filter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (q.quoteNumber || '').toLowerCase().includes(s);
    }
    return true;
  });

  const statusCounts = quotes.reduce((acc, q) => { acc[q.status] = (acc[q.status] || 0) + 1; return acc; }, {} as Record<string, number>);

  async function convertToSO(quoteId: string) {
    try {
      await api.post(`/quotes/${quoteId}/convert-to-sales-order`);
      toast.success('Converted to sales order');
      fetchQuotes();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to convert');
    }
  }

  async function convertToInvoice(quoteId: string) {
    try {
      await api.post(`/quotes/${quoteId}/convert-to-invoice`);
      toast.success('Converted to invoice');
      fetchQuotes();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to convert');
    }
  }

  async function deleteQuote(quoteId: string) {
    if (!confirm('Delete this quote?')) return;
    try {
      await api.delete(`/quotes/${quoteId}`);
      toast.success('Quote deleted');
      fetchQuotes();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      <div className="page-header">
        <div>
          <h1 className="page-title">Quotes</h1>
          <p className="page-subtitle">Create and manage quotes, convert to sales orders or invoices</p>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by quote #..." className="input pl-9" />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {['all', 'draft', 'sent', 'accepted', 'rejected', 'converted', 'expired'].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === s ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            {statusCounts[s] > 0 && <span className="ml-1.5 text-xs">({statusCounts[s]})</span>}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-3" />
            <p className="text-sm">No quotes found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="table-header">Quote #</th>
                <th className="table-header">Date</th>
                <th className="table-header">Items</th>
                <th className="table-header">Total</th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((q) => (
                <tr key={q.id} className="hover:bg-gray-50">
                  <td className="table-cell font-mono text-sm">{q.quoteNumber}</td>
                  <td className="table-cell text-gray-500 text-sm">
                    {new Date(q.createdAt).toLocaleDateString('en-GB')}
                  </td>
                  <td className="table-cell text-sm">{q.items?.length || 0} item(s)</td>
                  <td className="table-cell font-medium">₦{Number(q.total).toLocaleString()}</td>
                  <td className="table-cell">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[q.status] || 'bg-gray-100 text-gray-600'}`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1">
                      {q.status === 'draft' || q.status === 'sent' ? (
                        <>
                          <button onClick={() => convertToSO(q.id)}
                            className="btn-ghost text-xs text-green-600 hover:text-green-700"
                            title="Convert to Sales Order">
                            <ArrowRight className="w-3.5 h-3.5" /> SO
                          </button>
                          <button onClick={() => convertToInvoice(q.id)}
                            className="btn-ghost text-xs text-blue-600 hover:text-blue-700"
                            title="Convert to Invoice">
                            <ArrowRight className="w-3.5 h-3.5" /> Invoice
                          </button>
                          <button onClick={() => deleteQuote(q.id)}
                            className="btn-ghost text-xs text-red-500 hover:text-red-600"
                            title="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
