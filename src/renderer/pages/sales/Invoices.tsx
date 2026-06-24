import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Loader2, Search, Mail, CreditCard, AlertCircle, X, Ban, Plus } from 'lucide-react';
import api from '../../api/client';
import { Breadcrumbs } from '../../components/Breadcrumbs';
import { DataTable } from '../../components/DataTable';
import { TableSkeleton } from '../../components/Skeleton';
import { EmailSendModal } from '../../components/EmailSendModal';
import { CreateInvoiceModal } from './CreateInvoiceModal';
import toast from 'react-hot-toast';
import type { ColumnDef } from '@tanstack/react-table';

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName?: string;
  customerId?: string;
  total: number;
  amountPaid?: number;
  status: string;
  createdAt: string;
  dueDate?: string;
  paymentTerms?: string;
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  sent: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
  partial: 'bg-amber-100 text-amber-700',
  overdue: 'bg-red-100 text-red-700',
  voided: 'bg-gray-100 text-gray-400',
};

export function Invoices() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [emailInvoice, setEmailInvoice] = useState<Invoice | null>(null);
  const [showCreditMemo, setShowCreditMemo] = useState<Invoice | null>(null);
  const [creditMemoAmount, setCreditMemoAmount] = useState('');
  const [creditMemoReason, setCreditMemoReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => { fetchInvoices(); }, []);

  async function fetchInvoices(statusFilter?: string, searchQuery?: string) {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);
      if (searchQuery) params.set('search', searchQuery);
      const { data } = await api.get(`/sales/invoices?${params.toString()}`);
      setInvoices(data?.data ?? (Array.isArray(data) ? data : data?.rows || []));
    } catch { setInvoices([]); } finally { setIsLoading(false); }
  }

  function handleFilterChange(newFilter: string) {
    setFilter(newFilter);
    fetchInvoices(newFilter, search);
  }

  function handleSearch(q: string) {
    setSearch(q);
    fetchInvoices(filter, q);
  }

  const filtered = invoices;

  const statusCounts = invoices.reduce((acc, inv) => { acc[inv.status] = (acc[inv.status] || 0) + 1; return acc; }, {} as Record<string, number>);

  async function voidInvoice(invoiceId: string) {
    if (!confirm('Are you sure you want to void this invoice? This action cannot be undone.')) return;
    try {
      await api.patch(`/sales/invoices/${invoiceId}/void`);
      toast.success('Invoice voided');
      fetchInvoices();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to void invoice');
    }
  }

  async function createCreditMemo() {
    if (!showCreditMemo) return;
    if (!creditMemoAmount || Number(creditMemoAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post(`/sales/invoices/${showCreditMemo.id}/credit-memo`, {
        amount: Number(creditMemoAmount),
        reason: creditMemoReason.trim(),
      });
      toast.success('Credit memo created');
      setShowCreditMemo(null);
      setCreditMemoAmount('');
      setCreditMemoReason('');
      fetchInvoices();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create credit memo');
    } finally {
      setIsSubmitting(false);
    }
  }

  const columns: ColumnDef<Invoice, any>[] = [
    {
      accessorKey: 'invoiceNumber',
      header: 'Invoice #',
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.invoiceNumber}</span>,
    },
    {
      accessorKey: 'customerName',
      header: 'Customer',
      cell: ({ row }) => <span className="font-medium">{row.original.customerName || 'Walk-in'}</span>,
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString('en-GB'),
    },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: ({ row }) => {
        const due = row.original.dueDate;
        if (!due) return <span className="text-gray-400 text-sm">—</span>;
        const isOverdue = new Date(due) < new Date() && row.original.status !== 'paid' && row.original.status !== 'voided';
        return (
          <span className={`text-sm ${isOverdue ? 'text-red-500 font-medium' : ''}`}>
            {new Date(due).toLocaleDateString('en-GB')}
          </span>
        );
      },
    },
    {
      accessorKey: 'total',
      header: 'Total',
      cell: ({ row }) => <span className="font-medium">₦{Number(row.original.total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>,
    },
    {
      accessorKey: 'paymentTerms',
      header: 'Terms',
      cell: ({ row }) => row.original.paymentTerms
        ? <span className="text-xs text-gray-600">{row.original.paymentTerms}</span>
        : <span className="text-gray-400 text-xs">—</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[row.original.status] || 'bg-gray-100 text-gray-600'}`}>
          {row.original.status}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const inv = row.original;
        return (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setEmailInvoice(inv)}
              className="btn-ghost text-xs text-primary-600 hover:text-primary-700"
              title="Send Email"
            >
              <Mail className="w-3.5 h-3.5" />
            </button>
            {inv.status !== 'voided' && inv.status !== 'paid' && (
              <>
                <button
                  onClick={() => { setShowCreditMemo(inv); setCreditMemoAmount(''); setCreditMemoReason(''); }}
                  className="btn-ghost text-xs text-amber-600 hover:text-amber-700"
                  title="Create Credit Memo"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => voidInvoice(inv.id)}
                  className="btn-ghost text-xs text-red-500 hover:text-red-600"
                  title="Void Invoice"
                >
                  <Ban className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      <div className="page-header">
        <div>
          <h1 className="page-title">Invoices</h1>
          <p className="page-subtitle">Manage invoices, payments, and credit memos</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Invoice
        </button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(search)}
            placeholder="Search by invoice # or customer..." className="input pl-9" />
        </div>
        <button onClick={() => handleSearch(search)} className="btn-secondary">Search</button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500">Total Invoices</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{invoices.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Total Outstanding</p>
          <p className="text-2xl font-bold text-primary-600 mt-1">
            ₦{invoices.filter(i => i.status !== 'paid' && i.status !== 'voided').reduce((s, i) => s + Number(i.total || 0), 0).toLocaleString()}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Overdue</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{statusCounts['overdue'] || 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Paid</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{statusCounts['paid'] || 0}</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {['all', 'draft', 'sent', 'partial', 'paid', 'overdue', 'voided'].map((s) => (
          <button key={s} onClick={() => handleFilterChange(s)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === s ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            {statusCounts[s] > 0 && <span className="ml-1.5 text-xs">({statusCounts[s]})</span>}
          </button>
        ))}
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : (
        <DataTable
          data={filtered}
          columns={columns}
          searchPlaceholder="Search by invoice # or customer..."
          emptyMessage="No invoices found"
          emptyIcon={FileText}
        />
      )}

      {emailInvoice && (
        <EmailSendModal
          documentType="invoice"
          documentNumber={emailInvoice.invoiceNumber}
          documentId={emailInvoice.id}
          onClose={() => setEmailInvoice(null)}
        />
      )}

      {showCreditMemo && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Create Credit Memo</h2>
              <button onClick={() => setShowCreditMemo(null)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <p className="text-gray-500">Invoice</p>
                <p className="font-medium">{showCreditMemo.invoiceNumber}</p>
                <p className="text-gray-500 mt-1">Original Amount: ₦{Number(showCreditMemo.total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Credit Amount (₦) *</label>
                <input
                  type="number"
                  value={creditMemoAmount}
                  onChange={(e) => setCreditMemoAmount(e.target.value)}
                  min={0.01}
                  max={showCreditMemo.total}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <textarea
                  value={creditMemoReason}
                  onChange={(e) => setCreditMemoReason(e.target.value)}
                  rows={3}
                  placeholder="Reason for credit memo..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-y"
                />
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={createCreditMemo}
                  disabled={isSubmitting || !creditMemoAmount || Number(creditMemoAmount) <= 0}
                  className="flex-1 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                  {isSubmitting ? 'Creating...' : 'Create Credit Memo'}
                </button>
                <button onClick={() => setShowCreditMemo(null)} className="btn-secondary">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreate && (
        <CreateInvoiceModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); fetchInvoices(); }}
        />
      )}
    </div>
  );
}
