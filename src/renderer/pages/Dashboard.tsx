import { useState, useEffect, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuthStore } from '../store/auth.store';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { DashboardSection, KpiSkeleton, StatCardSkeleton, ActivitySkeleton } from '../components/DashboardSection';
import { TrendingUp, TrendingDown, DollarSign, Package, Users, ArrowUp, ArrowDown, Activity, Clock, ShoppingCart, FileText, CreditCard, UserPlus, PackagePlus, PlusCircle, AlertTriangle, CheckCircle, ClipboardList, Receipt, BarChart3, Banknote, Building2, Star, AlertOctagon } from 'lucide-react';

interface DashboardMetrics {
  revenue: number;
  receivables: number;
  pendingApprovals: { leaveRequests: number; expenseClaims: number; purchaseOrders: number };
  lowStockCount: number;
  activeSalesOrders: number;
  outstandingInvoices: number;
  totalCustomers: number;
  totalProducts: number;
  totalStaff: number;
  monthlyExpenses: number;
  monthlyPurchases: number;
  topProducts: { name: string; total_sold: number }[];
  monthlySalesCount: number;
  overdueInvoices: number;
  collectedPayments: number;
}

interface ActivityItem {
  id: string;
  user_name: string;
  action: string;
  entity_type: string;
  metadata: any;
  created_at: string;
}

function StatCard({ title, value, icon: Icon, trend, trendUp, color, subtitle, onClick }: { title: string; value: string; icon: any; trend?: string; trendUp?: boolean; color: string; subtitle?: string; onClick?: () => void }) {
  return (
    <div onClick={onClick} className={`card flex items-center justify-between hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''}`}>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
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

// --- Progressive Section Components ---

function ExecutiveKPISection({ metrics }: { metrics: DashboardMetrics }) {
  const netProfit = metrics.revenue - metrics.monthlyExpenses;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="Revenue (Month)" value={`₦${metrics.revenue.toLocaleString()}`} icon={TrendingUp} color="bg-primary-600" subtitle={`${metrics.monthlySalesCount} sales`} />
      <StatCard title="Expenses (Month)" value={`₦${metrics.monthlyExpenses.toLocaleString()}`} icon={TrendingDown} color="bg-red-500" subtitle={`${metrics.monthlyPurchases.toLocaleString()} in purchases`} />
      <StatCard title="Net Profit" value={`₦${netProfit.toLocaleString()}`} icon={netProfit >= 0 ? TrendingUp : TrendingDown} color={netProfit >= 0 ? 'bg-green-600' : 'bg-red-600'} subtitle={netProfit >= 0 ? 'Profitable' : 'Loss'} />
      <StatCard title="Cash Collected" value={`₦${metrics.collectedPayments.toLocaleString()}`} icon={Banknote} color="bg-emerald-600" subtitle="Total payments received" />
    </div>
  );
}

function OperationsSection({ metrics }: { metrics: DashboardMetrics }) {
  const pendingTotal = metrics.pendingApprovals.leaveRequests + metrics.pendingApprovals.expenseClaims + metrics.pendingApprovals.purchaseOrders;
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="Products" value={metrics.totalProducts.toLocaleString()} icon={Package} color="bg-green-600" />
      <StatCard title="Customers" value={metrics.totalCustomers.toLocaleString()} icon={Users} color="bg-purple-600" />
      <StatCard title="Active Staff" value={metrics.totalStaff.toLocaleString()} icon={Building2} color="bg-blue-600" />
      {metrics.lowStockCount > 0 && (
        <StatCard title="Low Stock Alerts" value={metrics.lowStockCount.toString()} icon={AlertTriangle} color="bg-red-600" />
      )}
      {metrics.overdueInvoices > 0 && (
        <StatCard title="Overdue Invoices" value={metrics.overdueInvoices.toString()} icon={AlertOctagon} color="bg-orange-600" onClick={() => navigate('/invoices')} />
      )}
      {metrics.outstandingInvoices > 0 && (
        <StatCard title="Outstanding Invoices" value={metrics.outstandingInvoices.toString()} icon={FileText} color="bg-amber-600" onClick={() => navigate('/invoices')} />
      )}
      {metrics.activeSalesOrders > 0 && (
        <StatCard title="Active Orders" value={metrics.activeSalesOrders.toString()} icon={ShoppingCart} color="bg-blue-600" />
      )}
      {pendingTotal > 0 && (
        <StatCard title="Pending Approvals" value={pendingTotal.toString()} icon={ClipboardList} color="bg-indigo-600" onClick={() => navigate('/approvals')} />
      )}
    </div>
  );
}

function QuickActionsSection() {
  const navigate = useNavigate();
  const userRole = useAuthStore((s) => s.user?.role ?? 'Staff');
  return (
    <div className="card">
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
        {(userRole === 'MD' || userRole === 'Director' || userRole === 'Manager') && (
          <>
            <QuickActionButton label="Reports" onClick={() => navigate('/reports')} color="bg-teal-600" icon={BarChart3} />
            <QuickActionButton label="Approvals" onClick={() => navigate('/approvals')} color="bg-orange-600" icon={CheckCircle} />
          </>
        )}
      </div>
    </div>
  );
}

function TopProductsSection({ products }: { products: DashboardMetrics['topProducts'] }) {
  if (products.length === 0) return null;
  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-5 h-5 text-amber-500" />
        <h2 className="text-lg font-semibold text-gray-900">Top Products This Month</h2>
      </div>
      <div className="space-y-3">
        {products.map((p, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-gray-400 w-6">{i + 1}</span>
              <span className="text-sm font-medium text-gray-900">{p.name}</span>
            </div>
            <span className="text-sm font-semibold text-primary-600">{p.total_sold} sold</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityFeedSection({ activities }: { activities: ActivityItem[] }) {
  return (
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
  );
}

// --- Main Dashboard with Progressive Loading ---

export function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const locationName = useAuthStore((s) => s.locationName);
  const userRole = user?.role ?? 'Staff';
  const isExecutive = ['MD', 'Director', 'Manager', 'admin'].includes(userRole);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    revenue: 0, receivables: 0, pendingApprovals: { leaveRequests: 0, expenseClaims: 0, purchaseOrders: 0 },
    lowStockCount: 0, activeSalesOrders: 0, outstandingInvoices: 0,
    totalCustomers: 0, totalProducts: 0, totalStaff: 0,
    monthlyExpenses: 0, monthlyPurchases: 0, topProducts: [],
    monthlySalesCount: 0, overdueInvoices: 0, collectedPayments: 0,
  });
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [kpiLoaded, setKpiLoaded] = useState(false);
  const [activityLoaded, setActivityLoaded] = useState(false);

  // Progressive loading: KPIs first, then activity
  useEffect(() => {
    async function loadKPIs() {
      try {
        const { data: d } = await api.get('/analytics/dashboard');
        setMetrics({
          revenue: Number(d?.revenue ?? 0),
          receivables: Number(d?.receivables ?? 0),
          pendingApprovals: d?.pendingApprovals ?? { leaveRequests: 0, expenseClaims: 0, purchaseOrders: 0 },
          lowStockCount: Number(d?.lowStockCount ?? 0),
          activeSalesOrders: Number(d?.activeSalesOrders ?? 0),
          outstandingInvoices: Number(d?.outstandingInvoices ?? 0),
          totalCustomers: Number(d?.totalCustomers ?? 0),
          totalProducts: Number(d?.totalProducts ?? 0),
          totalStaff: Number(d?.totalStaff ?? 0),
          monthlyExpenses: Number(d?.monthlyExpenses ?? 0),
          monthlyPurchases: Number(d?.monthlyPurchases ?? 0),
          topProducts: d?.topProducts ?? [],
          monthlySalesCount: Number(d?.monthlySalesCount ?? 0),
          overdueInvoices: Number(d?.overdueInvoices ?? 0),
          collectedPayments: Number(d?.collectedPayments ?? 0),
        });
      } catch {}
      setKpiLoaded(true);
    }
    loadKPIs();
  }, []);

  useEffect(() => {
    if (!kpiLoaded) return;
    async function loadActivity() {
      try {
        const { data: body } = await api.get('/activity?limit=10');
        setActivities(Array.isArray(body?.data) ? body.data : Array.isArray(body) ? body : []);
      } catch {}
      setActivityLoaded(true);
    }
    loadActivity();
  }, [kpiLoaded]);

  if (!kpiLoaded) {
    return (
      <div className="space-y-6">
        <Breadcrumbs />
        <KpiSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {isExecutive ? 'Executive Dashboard' : 'Dashboard'}
          </h1>
          <p className="page-subtitle">
            Welcome back, {user?.fullName || 'User'}
            {locationName && <span className="text-primary-600 font-medium"> · {locationName}</span>}
          </p>
        </div>
      </div>

      {/* Executive KPI Row — loads first */}
      {isExecutive && (
        <DashboardSection fallback={<KpiSkeleton />}>
          <ExecutiveKPISection metrics={metrics} />
        </DashboardSection>
      )}

      {/* Operations Row — loads with KPIs */}
      <DashboardSection fallback={
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      }>
        <OperationsSection metrics={metrics} />
      </DashboardSection>

      {/* Quick Actions + Top Products + Activity — independent Suspense */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <DashboardSection fallback={<SectionSkeleton lines={2} />}>
            <QuickActionsSection />
          </DashboardSection>

          {isExecutive && (
            <DashboardSection fallback={null}>
              <TopProductsSection products={metrics.topProducts} />
            </DashboardSection>
          )}
        </div>

        <DashboardSection fallback={<ActivitySkeleton />}>
          <ActivityFeedSection activities={activities} />
        </DashboardSection>
      </div>
    </div>
  );
}
