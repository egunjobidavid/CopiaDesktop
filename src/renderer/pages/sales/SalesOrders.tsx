import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Loader2, Eye, ShoppingCart, Search, Download } from 'lucide-react';
import api from '../../api/client';
import { Breadcrumbs } from '../../components/Breadcrumbs';
import { DataTable } from '../../components/DataTable';
import { TableSkeleton } from '../../components/Skeleton';
import { exportToCsv } from '../../utils/helpers';
import type { ColumnDef } from '@tanstack/react-table';

interface SalesOrder {
  id: string;
  orderNumber: string;
  customerName?: string;
  total: number;
  status: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-amber-100 text-amber-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export function SalesOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => { fetchOrders(); }, []);

  async function fetchOrders() {
    setIsLoading(true);
    try {
      const { data } = await api.get('/sales/orders?limit=100');
      setOrders(Array.isArray(data) ? data : []);
    } catch { setOrders([]); } finally { setIsLoading(false); }
  }

  const filtered = orders.filter((o) => {
    if (filter !== 'all' && o.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (o.orderNumber || '').toLowerCase().includes(q) || (o.customerName || '').toLowerCase().includes(q);
    }
    return true;
  });
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
      accessorKey: 'total',
      header: 'Total',
      cell: ({ row }) => <span className="font-medium">₦{Number(row.original.total).toLocaleString()}</span>,
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
      cell: () => (
        <button className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
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
            { key: 'total', label: 'Total' },
            { key: 'status', label: 'Status' },
          ], 'sales-orders')} className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={() => navigate('/pos')} className="btn-primary flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" /> New Sale (POS)
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order # or customer..." className="input pl-9" />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{orders.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
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
        {['all', 'draft', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === s ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
    </div>
  );
}
