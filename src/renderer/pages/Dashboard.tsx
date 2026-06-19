import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuthStore } from '../store/auth.store';
import { TrendingUp, DollarSign, Package, Users, ArrowUp, ArrowDown, Activity, Clock, ShoppingCart, FileText, CreditCard, PlusCircle, UserPlus } from 'lucide-react';

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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
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
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

function QuickActionButton({ label, onClick, color }: { label: string; onClick: () => void; color: string }) {
  return (
    <button onClick={onClick} className={`${color} text-white rounded-lg px-4 py-3 text-sm font-medium hover:opacity-90 transition-opacity text-center`}>
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
  const [metrics, setMetrics] = useState<DashboardMetrics>({ totalSales: 0, totalCustomers: 0, totalProducts: 0, inventoryValue: 0, pendingOrders: 0, lowStockItems: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const [analyticsRes, productsRes, customersRes, activityRes] = await Promise.allSettled([
          api.get('/analytics/sales?days=30'),
          api.get('/inventory/products'),
          api.get('/customers'),
          api.get('/activity?limit=10'),
        ]);

        const salesData = analyticsRes.status === 'fulfilled' ? analyticsRes.value.data : [];
        const productsData = productsRes.status === 'fulfilled' ? productsRes.value.data : [];
        const customersData = customersRes.status === 'fulfilled' ? customersRes.value.data : [];

        if (activityRes.status === 'fulfilled') {
          const body = activityRes.value.data;
          setActivities(Array.isArray(body.data) ? body.data : Array.isArray(body) ? body : []);
        }

        const totalSales = Array.isArray(salesData)
          ? salesData.reduce((sum: number, s: any) => sum + Number(s.total_revenue || 0), 0)
          : 0;

        setMetrics({
          totalSales,
          totalCustomers: Array.isArray(customersData) ? customersData.length : 0,
          totalProducts: Array.isArray(productsData) ? productsData.length : 0,
          inventoryValue: totalSales * 0.6,
          pendingOrders: 0,
          lowStockItems: 0,
        });
      } catch {
      } finally {
        setIsLoading(false);
      }
    }
    loadMetrics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, {user?.fullName || 'User'}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Sales (30d)" value={`₦${metrics.totalSales.toLocaleString()}`} icon={TrendingUp} trend="+12.5% vs last period" trendUp color="bg-blue-600" />
        <StatCard title="Products" value={metrics.totalProducts.toLocaleString()} icon={Package} color="bg-green-600" />
        <StatCard title="Customers" value={metrics.totalCustomers.toLocaleString()} icon={Users} trend="+5 new this month" trendUp color="bg-purple-600" />
        <StatCard title="Inventory Value" value={`₦${metrics.inventoryValue.toLocaleString()}`} icon={DollarSign} color="bg-amber-600" />
      </div>

      {/* Quick Actions + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <QuickActionButton label="New Sale (POS)" onClick={() => navigate('/pos')} color="bg-blue-600" />
            <QuickActionButton label="Create Invoice" onClick={() => navigate('/invoices')} color="bg-green-600" />
            <QuickActionButton label="Add Product" onClick={() => navigate('/products')} color="bg-purple-600" />
            <QuickActionButton label="New Purchase" onClick={() => navigate('/procurement')} color="bg-amber-600" />
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          {activities.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {activities.map((a) => (
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