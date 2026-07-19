import { useState, useEffect } from 'react';
import { FileText, Loader2, Search, ArrowRight, Trash2, Download, Mail, Plus, MessageCircle } from 'lucide-react';
import api from '../../api/client';
import { Breadcrumbs } from '../../components/Breadcrumbs';
import { EmailSendModal } from '../../components/EmailSendModal';
import { CreateQuoteModal } from './CreateQuoteModal';
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
  validUntil?: string;
  version?: number;
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
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [emailQuote, setEmailQuote] = useState<Quote | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => { fetchQuotes(); }, [filter]);
  useEffect(() => {
    const t = setTimeout(() => fetchQuotes(), 300);
    return () => clearTimeout(t);
  }, [search]);

  async function fetchQuotes() {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (search) params.set('search', search);
      if (filter !== 'all') params.set('status', filter);
      const { data } = await api.get(`/quotes?${params.toString()}`);
      setQuotes(data?.data || []);
    } catch { setQuotes([]); } finally { setIsLoading(false); }
  }

  const filtered = quotes;

  const statusCounts = quotes.reduce((acc, q) => { acc[q.status] = (acc[q.status] || 0) + 1; return acc; }, {} as Record<string, number>);

  function isExpired(validUntil?: string): boolean {
    if (!validUntil) return false;
    return new Date(validUntil) < new Date();
  }

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

  async function downloadPdf(quote: Quote) {
    try {
      const { default: apiClient } = await import('../../api/client');
      const { data } = await apiClient.get(`/quotes/${quote.id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${quote.quoteNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      const printWindow = window.open('', '_blank');
      if (!printWindow) { toast.error('Pop-up blocked'); return; }
      const itemsHtml = (quote.items || []).map((item: any) =>
        `<tr><td>${item.productName || item.name || ''}</td><td style="text-align:center">${item.quantity}</td><td style="text-align:right">₦${Number(item.unitPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td><td style="text-align:right">₦${Number(item.lineTotal || item.quantity * (item.unitPrice || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td></tr>`
      ).join('');
      printWindow.document.write(`<html><head><title>${quote.quoteNumber}</title><style>body{font-family:sans-serif;padding:40px}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}h1{margin:0}h2{color:#666;font-size:14px}</style></head><body><h1>QUOTE</h1><h2>${quote.quoteNumber}</h2><p>Date: ${new Date(quote.createdAt).toLocaleDateString('en-GB')}</p>${quote.validUntil ? `<p>Valid Until: ${new Date(quote.validUntil).toLocaleDateString('en-GB')}</p>` : ''}<table><thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Unit Price</th><th style="text-align:right">Total</th></tr></thead><tbody>${itemsHtml}</tbody></table><p style="text-align:right;font-size:18px;margin-top:20px"><strong>Total: ₦${Number(quote.total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></p>${quote.notes ? `<p><strong>Notes:</strong> ${quote.notes}</p>` : ''}</body></html>`);
      printWindow.document.close();
      printWindow.print();
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
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Quote
        </button>
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
                <th className="table-header">Valid Until</th>
                <th className="table-header">Items</th>
                <th className="table-header">Total</th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((q) => {
                const expired = isExpired(q.validUntil);
                const effectiveStatus = expired && q.status !== 'accepted' && q.status !== 'rejected' && q.status !== 'converted' ? 'expired' : q.status;
                return (
                  <tr key={q.id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-sm">{q.quoteNumber}</span>
                        {q.version && q.version > 1 && (
                          <span className="text-xs text-gray-400">v{q.version}</span>
                        )}
                      </div>
                    </td>
                    <td className="table-cell text-gray-500 text-sm">
                      {new Date(q.createdAt).toLocaleDateString('en-GB')}
                    </td>
                    <td className="table-cell text-sm">
                      {q.validUntil ? (
                        <div className="flex items-center gap-1">
                          <span className={expired ? 'text-red-500' : 'text-gray-600'}>
                            {new Date(q.validUntil).toLocaleDateString('en-GB')}
                          </span>
                          {expired && (
                            <span className="inline-flex px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-red-100 text-red-600">
                              Expired
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="table-cell text-sm">{q.items?.length || 0} item(s)</td>
                    <td className="table-cell font-medium">₦{Number(q.total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="table-cell">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[effectiveStatus] || 'bg-gray-100 text-gray-600'}`}>
                        {effectiveStatus}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => downloadPdf(q)}
                          className="btn-ghost text-xs text-gray-600 hover:text-gray-800"
                          title="Download PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEmailQuote(q)}
                          className="btn-ghost text-xs text-primary-600 hover:text-primary-700"
                          title="Send Email"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            const msg = `Hello! 👋\n\nYour quote *${q.quoteNumber}* is ready.\n\n💰 Amount: *₦${Number(q.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}*\n📅 Valid until: ${q.validUntil ? new Date(q.validUntil).toLocaleDateString('en-GB') : 'N/A'}\n\nThank you! 🙏`;
                            window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
                          }}
                          className="btn-ghost text-xs text-green-600 hover:text-green-700"
                          title="Share on WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </button>
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
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {emailQuote && (
        <EmailSendModal
          documentType="quote"
          documentNumber={emailQuote.quoteNumber}
          documentId={emailQuote.id}
          onClose={() => setEmailQuote(null)}
        />
      )}

      {showCreate && (
        <CreateQuoteModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); fetchQuotes(); }}
        />
      )}
    </div>
  );
}
