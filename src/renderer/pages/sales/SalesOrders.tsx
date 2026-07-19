import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Loader2, Eye, ShoppingCart, Search, Download, AlertTriangle, Plus } from 'lucide-react';
import api from '../../api/client';
import { Breadcrumbs } from '../../components/Breadcrumbs';
import { DataTable } from '../../components/DataTable';
import { TableSkeleton } from '../../components/Skeleton';
import { exportToCsv } from '../../utils/helpers';
import { CreateOrderModal } from './CreateOrderModal';
import toast from 'react-hot-toast';
import type { ColumnDef } from '@tanstack/react-table';

interface SalesOrder {
  id: string;
  orderNumber: string;
  customerName?: string;
  customerId?: string;
  total: number;
  status: string;
  createdAt: string;
  deliveryDate?: string;
  paymentTerms?: string;
  items?: { discount?: number }[];
  customer?: { creditLimit?: number; outstandingBalance?: number };
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-amber-100 text-amber-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  invoiced: 'bg-purple-100 text-purple-700',
  cancelled: 'bg-red-100 text-red-700',
};

export function SalesOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [creditWarning, setCreditWarning] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => { fetchOrders(); }, []);

  async function fetchOrders(statusFilter?: string, searchQuery?: string) {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);
      if (searchQuery) params.set('search', searchQuery);
      const { data } = await api.get(`/sales/orders?${params.toString()}`);
      setOrders(data?.data ?? (Array.isArray(data) ? data : []));
    } catch { setOrders([]); } finally { setIsLoading(false); }
  }

  function handleFilterChange(newFilter: string) {
    setFilter(newFilter);
    fetchOrders(newFilter, search);
  }

  function handleSearch(q: string) {
    setSearch(q);
    fetchOrders(filter, q);
  }

  const filtered = orders;
  const statusCounts = orders.reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {} as Record<string, number>);

  const columns: ColumnDef<SalesOrder, any>[] = [
    {
      accessorKey: 'orderNumber',
      header: 'Order #',
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.orderNumber}</span>,
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
      accessorKey: 'deliveryDate',
      header: 'Delivery',
      cell: ({ row }) => row.original.deliveryDate
        ? <span className="text-sm">{new Date(row.original.deliveryDate).toLocaleDateString('en-GB')}</span>
        : <span className="text-gray-400 text-sm">—</span>,
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
      cell: ({ row }) => (
        <button
          onClick={() => {
            const o = row.original;
            toast(`Order ${o.orderNumber}\nCustomer: ${o.customerName || 'N/A'}\nTotal: ₦${Number(o.total).toLocaleString()}\nStatus: ${o.status}`, { icon: '📋' });
          }}
          className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"
        >
          <Eye className="w-3.5 h-3.5" /> View
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      <div className="page-header">
        <div>
          <h1 className="page-title">Sales Orders</h1>
          <p className="page-subtitle">View and manage all sales orders</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportToCsv(filtered, [
            { key: 'orderNumber', label: 'Order #' },
            { key: 'customerName', label: 'Customer' },
            { key: 'createdAt', label: 'Date' },
            { key: 'deliveryDate', label: 'Delivery' },
            { key: 'total', label: 'Total' },
            { key: 'paymentTerms', label: 'Terms' },
            { key: 'status', label: 'Status' },
          ], 'sales-orders')} className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={() => navigate('/pos')} className="btn-primary flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" /> New Sale (POS)
          </button>
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Order
          </button>
        </div>
      </div>

      {creditWarning && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-700">{creditWarning}</p>
          <button onClick={() => setCreditWarning(null)} className="ml-auto text-amber-500 hover:text-amber-700">
            ×
          </button>
        </div>
      )}

      <div className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(search)}
            placeholder="Search by order #..." className="input pl-9" />
        </div>
        <button onClick={() => handleSearch(search)} className="btn-secondary">Search</button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{orders.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-2xl font-bold text-primary-600 mt-1">
            ₦{orders.reduce((s, o) => s + Number(o.total || 0), 0).toLocaleString()}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {(statusCounts['confirmed'] || 0) + (statusCounts['processing'] || 0)}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Delivered</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{statusCounts['delivered'] || 0}</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {['all', 'draft', 'confirmed', 'processing', 'shipped', 'delivered', 'invoiced', 'cancelled'].map((s) => (
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
          searchPlaceholder="Search by order # or customer..."
          emptyMessage="No sales orders found"
          emptyIcon={FileText}
        />
      )}

      {showCreate && (
        <CreateOrderModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); fetchOrders(); }}
        />
      )}
    </div>
  );
}
