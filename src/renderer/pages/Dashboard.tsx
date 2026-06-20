import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuthStore } from '../store/auth.store';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { TrendingUp, DollarSign, Package, Users, ArrowUp, ArrowDown, Activity, Clock, ShoppingCart, FileText, CreditCard, UserPlus, PackagePlus, PlusCircle } from 'lucide-react';

interface DashboardMetrics {
  totalSales: number;
  totalCustomers: number;
  totalProducts: number;
  inventoryValue: number;
  pendingOrders: number;
  lowStockItems: number;
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
  const [metrics, setMetrics] = useState<DashboardMetrics>({ totalSales: 0, totalCustomers: 0, totalProducts: 0, inventoryValue: 0, pendingOrders: 0, lowStockItems: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const locParam = locationId ? `&locationId=${locationId}` : '';
        const [analyticsRes, productsRes, customersRes, stockRes, activityRes] = await Promise.allSettled([
          api.get(`/analytics/sales?days=30${locParam}`),
          api.get('/inventory/products'),
          api.get('/customers'),
          api.get(`/inventory/stock${locParam ? `?locationId=${locParam.slice(1)}` : ''}`),
          api.get('/activity?limit=10'),
        ]);

        const salesData = analyticsRes.status === 'fulfilled' ? analyticsRes.value.data : [];
        const productsData = productsRes.status === 'fulfilled' ? productsRes.value.data : [];
        const customersData = customersRes.status === 'fulfilled' ? customersRes.value.data : [];
        const stockData = stockRes.status === 'fulfilled' ? stockRes.value.data : [];

        if (activityRes.status === 'fulfilled') {
          const body = activityRes.value.data;
          setActivities(Array.isArray(body.data) ? body.data : Array.isArray(body) ? body : []);
        }

        const totalSales = Array.isArray(salesData)
          ? salesData.reduce((sum: number, s: any) => sum + Number(s.total || s.total_revenue || 0), 0)
          : 0;

        const inventoryValue = Array.isArray(stockData)
          ? stockData.reduce((sum: number, s: any) => sum + Number(s.quantity || 0) * Number(s.unit_price || 0), 0)
          : 0;

        const lowStockItems = Array.isArray(stockData)
          ? stockData.filter((s: any) => Number(s.quantity || 0) < 10).length
          : 0;

        setMetrics({
          totalSales,
          totalCustomers: Array.isArray(customersData) ? customersData.length : 0,
          totalProducts: Array.isArray(productsData) ? productsData.length : 0,
          inventoryValue,
          pendingOrders: 0,
          lowStockItems,
        });
      } catch {
      } finally {
        setIsLoading(false);
      }
    }
    loadMetrics();
  }, [locationId]);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" />
      </div>
    );
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
        <StatCard title="Sales (30d)" value={`₦${metrics.totalSales.toLocaleString()}`} icon={TrendingUp} color="bg-primary-600" />
        <StatCard title="Products" value={metrics.totalProducts.toLocaleString()} icon={Package} color="bg-green-600" />
        <StatCard title="Customers" value={metrics.totalCustomers.toLocaleString()} icon={Users} color="bg-purple-600" />
        <StatCard title="Inventory Value" value={`₦${metrics.inventoryValue.toLocaleString()}`} icon={DollarSign} color="bg-amber-600" />
      </div>

      {/* Quick Actions + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <QuickActionButton label="New Sale" onClick={() => navigate('/pos')} color="bg-primary-600" icon={ShoppingCart} />
            <QuickActionButton label="Invoice" onClick={() => navigate('/invoices')} color="bg-green-600" icon={FileText} />
            <QuickActionButton label="Add Product" onClick={() => navigate('/products')} color="bg-purple-600" icon={PackagePlus} />
            <QuickActionButton label="Purchase" onClick={() => navigate('/procurement')} color="bg-amber-600" icon={PlusCircle} />
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
