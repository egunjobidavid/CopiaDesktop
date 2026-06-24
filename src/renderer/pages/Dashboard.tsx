import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuthStore } from '../store/auth.store';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { DashboardSkeleton } from '../components/Skeleton';
import { TrendingUp, DollarSign, Package, Users, ArrowUp, ArrowDown, Activity, Clock, ShoppingCart, FileText, CreditCard, UserPlus, PackagePlus, PlusCircle, AlertTriangle, CheckCircle, ClipboardList, Receipt } from 'lucide-react';

interface DashboardMetrics {
  revenue: number;
  receivables: number;
  pendingApprovals: { leaveRequests: number; expenseClaims: number; purchaseOrders: number };
  lowStockCount: number;
  activeSalesOrders: number;
  outstandingInvoices: number;
  totalCustomers: number;
  totalProducts: number;
}

interface ActivityItem {
  id: string;
  user_name: string;
  action: string;
  entity_type: string;
  metadata: any;
  created_at: string;
}

function StatCard({ title, value, icon: Icon, trend, trendUp, color }: { title: string; value: string; icon: any; trend?: string; trendUp?: boolean; color: string }) {
  return (
    <div className="card flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {trend && (
          <div className={`flex items-center gap-1 mt-2 text-sm ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
            {trendUp ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            <span>{trend}</span>
          </div>
        )}
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  );
}

function QuickActionButton({ label, onClick, color, icon: Icon }: { label: string; onClick: () => void; color: string; icon: any }) {
  return (
    <button onClick={onClick} className={`${color} text-white rounded-xl px-4 py-3 text-sm font-medium hover:opacity-90 transition-opacity text-center flex flex-col items-center gap-2`}>
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );
}

const ACTION_ICONS: Record<string, any> = {
  'sale.completed': ShoppingCart,
  'payment.received': CreditCard,
  'invoice.created': FileText,
  'product.created': Package,
  'user.invited': UserPlus,
  'user.joined': UserPlus,
};

function ActivityIcon({ action }: { action: string }) {
  const Icon = ACTION_ICONS[action] || Activity;
  return <Icon className="w-4 h-4 text-gray-500" />;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function Dashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const locationId = useAuthStore((s) => s.locationId);
  const locationName = useAuthStore((s) => s.locationName);
  const userRole = user?.role ?? 'Staff';
  const [metrics, setMetrics] = useState<DashboardMetrics>({ revenue: 0, receivables: 0, pendingApprovals: { leaveRequests: 0, expenseClaims: 0, purchaseOrders: 0 }, lowStockCount: 0, activeSalesOrders: 0, outstandingInvoices: 0, totalCustomers: 0, totalProducts: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const [dashRes, productsRes, customersRes, activityRes] = await Promise.allSettled([
          api.get('/analytics/dashboard'),
          api.get('/inventory/products?limit=1'),
          api.get('/customers?limit=1'),
          api.get('/activity?limit=10'),
        ]);

        if (dashRes.status === 'fulfilled') {
          const d = dashRes.value.data;
          setMetrics({
            revenue: Number(d?.revenue ?? 0),
            receivables: Number(d?.receivables ?? 0),
            pendingApprovals: d?.pendingApprovals ?? { leaveRequests: 0, expenseClaims: 0, purchaseOrders: 0 },
            lowStockCount: Number(d?.lowStockCount ?? 0),
            activeSalesOrders: Number(d?.activeSalesOrders ?? 0),
            outstandingInvoices: Number(d?.outstandingInvoices ?? 0),
            totalCustomers: Number(customersRes.status === 'fulfilled' ? (customersRes.value.data?.total ?? 0) : 0),
            totalProducts: Number(productsRes.status === 'fulfilled' ? (productsRes.value.data?.total ?? 0) : 0),
          });
        }

        if (activityRes.status === 'fulfilled') {
          const body = activityRes.value.data;
          setActivities(Array.isArray(body.data) ? body.data : Array.isArray(body) ? body : []);
        }
      } catch {
      } finally {
        setIsLoading(false);
      }
    }
    loadMetrics();
  }, [locationId]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Welcome back, {user?.fullName || 'User'}
            {locationName && <span className="text-primary-600 font-medium"> · {locationName}</span>}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {(userRole === 'MD' || userRole === 'Manager' || userRole === 'Director') && (
          <>
            <StatCard title="Revenue (Month)" value={`₦${metrics.revenue.toLocaleString()}`} icon={TrendingUp} color="bg-primary-600" />
            <StatCard title="Receivables" value={`₦${metrics.receivables.toLocaleString()}`} icon={DollarSign} color="bg-amber-600" />
          </>
        )}
        <StatCard title="Products" value={metrics.totalProducts.toLocaleString()} icon={Package} color="bg-green-600" />
        <StatCard title="Customers" value={metrics.totalCustomers.toLocaleString()} icon={Users} color="bg-purple-600" />
        {metrics.lowStockCount > 0 && (
          <StatCard title="Low Stock Alerts" value={metrics.lowStockCount.toString()} icon={AlertTriangle} color="bg-red-600" />
        )}
        {(userRole === 'MD' || userRole === 'Manager' || userRole === 'Accountant') && (
          <>
            {metrics.outstandingInvoices > 0 && (
              <StatCard title="Outstanding Invoices" value={metrics.outstandingInvoices.toString()} icon={FileText} color="bg-orange-600" />
            )}
            {metrics.activeSalesOrders > 0 && (
              <StatCard title="Active Orders" value={metrics.activeSalesOrders.toString()} icon={ShoppingCart} color="bg-blue-600" />
            )}
          </>
        )}
        {(metrics.pendingApprovals.leaveRequests + metrics.pendingApprovals.expenseClaims + metrics.pendingApprovals.purchaseOrders) > 0 && (
          <StatCard title="Pending Approvals" value={(metrics.pendingApprovals.leaveRequests + metrics.pendingApprovals.expenseClaims + metrics.pendingApprovals.purchaseOrders).toString()} icon={ClipboardList} color="bg-indigo-600" />
        )}
      </div>

      {/* Quick Actions + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(userRole === 'Sales Rep' || userRole === 'MD' || userRole === 'Manager') && (
              <QuickActionButton label="New Sale" onClick={() => navigate('/pos')} color="bg-primary-600" icon={ShoppingCart} />
            )}
            <QuickActionButton label="Invoice" onClick={() => navigate('/invoices')} color="bg-green-600" icon={FileText} />
            {(userRole === 'MD' || userRole === 'Manager' || userRole === 'Director') && (
              <>
                <QuickActionButton label="Add Product" onClick={() => navigate('/products')} color="bg-purple-600" icon={PackagePlus} />
                <QuickActionButton label="Purchase" onClick={() => navigate('/procurement')} color="bg-amber-600" icon={PlusCircle} />
              </>
            )}
            {(userRole === 'Accountant' || userRole === 'MD' || userRole === 'Manager') && (
              <>
                <QuickActionButton label="Quotes" onClick={() => navigate('/quotes')} color="bg-indigo-600" icon={ClipboardList} />
                <QuickActionButton label="Expenses" onClick={() => navigate('/expenses')} color="bg-rose-600" icon={Receipt} />
              </>
            )}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          {activities.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {activities.slice(0, 8).map((a) => (
                <div key={a.id} className="flex items-start gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ActivityIcon action={a.action} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-gray-900">
                      <span className="font-medium">{a.user_name || 'Someone'}</span>{' '}
                      {a.action.replace(/\./g, ' ')}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> {formatTime(a.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
