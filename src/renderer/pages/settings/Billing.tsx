import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, XCircle, Loader2, ExternalLink, Zap, Shield, Clock, AlertTriangle, Wallet, Users, FolderKanban, Briefcase, Factory, ShoppingBag, MapPin, BarChart3, Crown, Package, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { Breadcrumbs } from '../../components/Breadcrumbs';
import api from '../../api/client';
import toast from 'react-hot-toast';

const ICON_MAP: Record<string, any> = {
  Wallet, Users, FolderKanban, Briefcase, Factory, ShoppingBag, MapPin, BarChart3, CheckCircle, Crown, Package,
};

const PLAN_FEATURES: Record<string, string[]> = {
  starter: ['inventory', 'sales', 'pos', 'quotes', 'invoices', 'customers', 'basic_reports'],
  business: ['inventory', 'sales', 'pos', 'quotes', 'invoices', 'customers', 'basic_reports', 'sales_orders', 'advanced_reports', 'export'],
  professional: ['inventory', 'sales', 'pos', 'quotes', 'invoices', 'customers', 'basic_reports', 'sales_orders', 'advanced_reports', 'export', 'phone_support'],
  enterprise: ['inventory', 'sales', 'pos', 'quotes', 'invoices', 'customers', 'basic_reports', 'sales_orders', 'advanced_reports', 'export', 'phone_support', 'api_access', 'priority_support', 'custom_integrations'],
};

const PLAN_LIMITS: Record<string, Record<string, number | string>> = {
  starter: { max_users: 2, max_products: 25, max_transactions: 200, max_locations: 1, max_storage_mb: 500, data_retention_days: 90, currencies: 1 },
  business: { max_users: 10, max_products: 500, max_transactions: 5000, max_locations: 3, max_storage_mb: 5120, data_retention_days: 365, currencies: 2 },
  professional: { max_users: 30, max_products: 5000, max_transactions: 50000, max_locations: 15, max_storage_mb: 51200, data_retention_days: 1095, currencies: -1 },
  enterprise: { max_users: 100, max_products: -1, max_transactions: -1, max_locations: 25, max_storage_mb: -1, data_retention_days: 2555, currencies: -1 },
};

const CORE_PLANS = [
  {
    name: 'Starter',
    key: 'starter',
    monthlyPrice: 0,
    annualPrice: 0,
    description: 'For micro businesses getting started',
    features: [
      '2 Users', '25 Products', '200 Transactions/mo', '1 Location',
      'POS & Sales', 'Inventory', 'Quotes & Invoices', 'Customers',
    ],
    limits: 'Users: 2 | Products: 25 | Locations: 1',
  },
  {
    name: 'Business',
    key: 'business',
    monthlyPrice: 12000,
    annualPrice: 9600,
    description: 'For small businesses needing core features',
    features: [
      '10 Users', '500 Products', '5,000 Transactions/mo', '3 Locations',
      'All Starter features', 'Sales Orders', 'Advanced Reports', 'CSV/PDF Export',
    ],
    limits: 'Users: 10 | Products: 500 | Locations: 3',
    popular: true,
  },
  {
    name: 'Professional',
    key: 'professional',
    monthlyPrice: 32000,
    annualPrice: 25600,
    description: 'For established businesses needing phone support',
    features: [
      '30 Users', '5,000 Products', '50,000 Transactions/mo', '15 Locations',
      'All Business features', 'Phone Support', 'Priority Email',
    ],
    limits: 'Users: 30 | Products: 5,000 | Locations: 15',
  },
  {
    name: 'Enterprise',
    key: 'enterprise',
    monthlyPrice: 75000,
    annualPrice: 60000,
    description: 'For large organizations needing premium access',
    features: [
      '100 Users', 'Unlimited Products', 'Unlimited Transactions',
      '25 Locations', 'All Professional features', 'API Access',
      'Priority Support', 'Custom Integrations', 'Dedicated Account Manager',
    ],
    limits: 'Users: 100 | Products: Unlimited | Locations: 25',
  },
];

const MODULES = [
  { id: 'accounting', name: 'Accounting Suite', description: 'Chart of Accounts, Journal Entries, Trial Balance, Bank Reconciliation, Tax Config', monthly: 10000, annual: 8000, icon: 'Wallet' },
  { id: 'hr', name: 'HR & Payroll', description: 'Employees, Attendance, Payroll Processing, Departments', monthly: 10000, annual: 8000, icon: 'Users' },
  { id: 'projects', name: 'Projects & Time', description: 'Projects, Tasks, Kanban Board, Time Tracking, Gantt View', monthly: 20000, annual: 16000, icon: 'FolderKanban' },
  { id: 'crm', name: 'CRM Pipeline', description: 'Deals, Pipeline, Activities, Lead Scoring, Deal Conversion', monthly: 10000, annual: 8000, icon: 'Briefcase' },
  { id: 'production', name: 'Production & BOM', description: 'BOMs, Work Orders, Stages, Quality, Equipment, Maintenance', monthly: 20000, annual: 16000, icon: 'Factory' },
  { id: 'procurement', name: 'Procurement', description: 'Vendors, Purchase Orders, Bill Payments', monthly: 10000, annual: 8000, icon: 'ShoppingBag' },
  { id: 'multi_location', name: 'Multi-Location', description: 'Extra locations beyond plan limit (+5 each)', monthly: 5000, annual: 4000, icon: 'MapPin' },
  { id: 'analytics', name: 'Analytics Pro', description: 'Advanced reports, custom dashboards, CSV/Excel exports', monthly: 5000, annual: 4000, icon: 'BarChart3' },
];

const BUNDLES = [
  { id: 'finance', name: 'Finance Bundle', description: 'Accounting + Procurement', moduleIds: ['accounting', 'procurement'], monthly: 20000, annual: 16000, icon: 'Wallet', color: 'purple' },
  { id: 'project', name: 'Project Bundle', description: 'HR + Projects + Time', moduleIds: ['hr', 'projects'], monthly: 25000, annual: 20000, icon: 'FolderKanban', color: 'indigo' },
  { id: 'operations', name: 'Operations Bundle', description: 'Production + Procurement + Multi-Location', moduleIds: ['production', 'procurement', 'multi_location'], monthly: 30000, annual: 24000, icon: 'Factory', color: 'amber' },
  { id: 'full_suite', name: 'Full Suite', description: 'All 8 modules included', moduleIds: MODULES.map((m) => m.id), monthly: 60000, annual: 48000, icon: 'CheckCircle', color: 'green' },
  { id: 'enterprise_suite', name: 'Enterprise + Full Suite', description: 'All modules + unlimited + priority + custom integrations', moduleIds: MODULES.map((m) => m.id), monthly: 200000, annual: 160000, icon: 'Crown', color: 'yellow' },
];

const PLAN_NAMES: Record<string, string> = { starter: 'Starter', business: 'Business', professional: 'Professional', enterprise: 'Enterprise', free: 'Starter', growth: 'Business' };

type Tab = 'plans' | 'modules' | 'bundles' | 'compare';

export function Billing() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const [sub, setSub] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [activeTab, setActiveTab] = useState<Tab>('plans');
  const [switching, setSwitching] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [selectedModules, setSelectedModules] = useState<string[]>([]);

  useEffect(() => {
    if (!tenantId) return;
    api.get('/billing/subscription')
      .then((res) => setSub(res.data))
      .catch(() => { toast.error('Failed to load subscription info'); })
      .finally(() => setLoading(false));

    const params = new URLSearchParams(window.location.search);
    const reference = params.get('reference');
    if (reference) {
      toast.loading('Verifying payment...', { id: 'paystack-verify' });
      api.get(`/billing/paystack/verify?reference=${reference}&tenantId=${tenantId}`)
        .then((res) => {
          if (res.data.verified) {
            toast.success(`Upgraded to ${res.data.plan} plan!`, { id: 'paystack-verify' });
            api.get('/billing/subscription').then((r) => setSub(r.data));
          } else {
            toast.error('Payment verification failed', { id: 'paystack-verify' });
          }
        })
        .catch(() => toast.error('Could not verify payment', { id: 'paystack-verify' }))
        .finally(() => {
          window.history.replaceState({}, '', window.location.pathname);
        });
    }
  }, [tenantId]);

  const payWithPaystack = async (planKey: string, amount: number, type: string = 'plan') => {
    try {
      const { data } = await api.post('/billing/paystack/initialize', {
        email: useAuthStore.getState().user?.email,
        tenantId,
        plan: planKey,
        amount,
        billingCycle,
        type,
      });
      window.open(data.authorizationUrl, '_blank');
      toast.success('Redirected to Paystack checkout');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to initialize payment');
    }
  };

  const switchPlan = async (plan: string, modules: string[]) => {
    setSwitching(true);
    try {
      await api.post('/billing/dev/switch-plan', { plan, modules });
      toast.success(`Switched to ${plan} plan`);
      // Refresh subscription data
      const { data } = await api.get('/billing/subscription');
      setSub(data);
      setSelectedPlan(plan);
      setSelectedModules(modules);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to switch plan');
    } finally {
      setSwitching(false);
    }
  };

  const toggleModule = (moduleId: string) => {
    setSelectedModules((prev) =>
      prev.includes(moduleId) ? prev.filter((m) => m !== moduleId) : [...prev, moduleId]
    );
  };

  const currentPlan = sub?.plan || 'starter';
  const currentPlanName = PLAN_NAMES[currentPlan] || 'Starter';

  const getBundleSavings = (bundle: typeof BUNDLES[0]) => {
    const individual = bundle.moduleIds.reduce((sum, mid) => {
      const mod = MODULES.find((m) => m.id === mid);
      return sum + (billingCycle === 'annual' ? (mod?.annual || 0) : (mod?.monthly || 0));
    }, 0);
    const bundlePrice = billingCycle === 'annual' ? bundle.annual : bundle.monthly;
    return { individual, bundle: bundlePrice, saved: individual - bundlePrice, percent: individual > 0 ? Math.round(((individual - bundlePrice) / individual) * 100) : 0 };
  };

  if (loading) return <div className="flex h-48 items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      <div>
        <h1 className="page-title">Billing & Subscription</h1>
        <p className="page-subtitle">Manage your plan, modules, and payments</p>
      </div>

      {/* Current Plan */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Current Plan: {currentPlanName}</h2>
            <p className="text-xs text-gray-500">
              {sub?.status === 'active' ? 'Active' : sub?.status || 'Free tier'}
              {sub?.expiresAt && ` — renews ${new Date(sub.expiresAt).toLocaleDateString()}`}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 rounded-lg bg-gray-50">
            <p className="text-xs text-gray-500">Status</p>
            <p className="text-sm font-semibold flex items-center gap-1 mt-0.5">
              {sub?.status === 'active' ? <><CheckCircle className="w-3.5 h-3.5 text-green-500" /> Active</> : <><Clock className="w-3.5 h-3.5 text-amber-500" /> Free Tier</>}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-gray-50">
            <p className="text-xs text-gray-500">Users</p>
            <p className="text-sm font-semibold mt-0.5">{sub?.limits?.max_users || '2'}</p>
          </div>
          <div className="p-3 rounded-lg bg-gray-50">
            <p className="text-xs text-gray-500">Products</p>
            <p className="text-sm font-semibold mt-0.5">{sub?.limits?.max_products || '25'}</p>
          </div>
          <div className="p-3 rounded-lg bg-gray-50">
            <p className="text-xs text-gray-500">Modules</p>
            <p className="text-sm font-semibold mt-0.5">{sub?.modules?.length || 0} add-ons</p>
          </div>
        </div>
      </div>

      {/* Billing cycle toggle */}
      <div className="flex justify-center">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
          <button onClick={() => setBillingCycle('monthly')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${billingCycle === 'monthly' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>
            Monthly
          </button>
          <button onClick={() => setBillingCycle('annual')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${billingCycle === 'annual' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>
            Annual <span className="text-green-600 text-xs ml-1">Save 20%</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
          {([
            { key: 'plans', label: 'Core Plans', icon: Package },
            { key: 'modules', label: 'Individual Modules', icon: Zap },
            { key: 'bundles', label: 'Bundles', icon: Crown },
            { key: 'compare', label: 'Compare Plans', icon: ArrowRight },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setActiveTab(key)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === key ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* CORE PLANS TAB */}
      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {CORE_PLANS.map((plan) => {
            const isCurrent = currentPlan === plan.key;
            const price = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;

            return (
              <div key={plan.key} className={`relative rounded-xl border-2 p-5 transition-all ${
                isCurrent ? 'border-primary-500 bg-primary-50' :
                plan.popular ? 'border-primary-300 shadow-md' :
                'border-gray-200 hover:border-primary-200'
              }`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-primary-600 text-white text-xs font-semibold rounded-full">
                    Most Popular
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 bg-primary-600 text-white text-xs font-medium rounded-full">
                    Current
                  </div>
                )}

                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                <p className="text-xs text-gray-500 mt-1 mb-3">{plan.description}</p>

                <div className="mb-4">
                  {plan.monthlyPrice === 0 ? (
                    <span className="text-3xl font-bold text-gray-900">Free</span>
                  ) : (
                    <div>
                      <span className="text-3xl font-bold text-gray-900">₦{price.toLocaleString()}</span>
                      <span className="text-sm text-gray-500">/mo</span>
                      {billingCycle === 'annual' && (
                        <div className="text-xs text-gray-400 mt-0.5">
                          <span className="line-through">₦{plan.monthlyPrice.toLocaleString()}/mo</span>
                          <span className="text-green-600 ml-1">billed annually</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <ul className="space-y-1.5 mb-5">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <p className="text-[10px] text-gray-400 mb-3">{plan.limits}</p>

                {isCurrent ? (
                  <div className="w-full py-2.5 text-center text-sm font-medium text-primary-700 bg-primary-100 rounded-lg">
                    Current Plan
                  </div>
                ) : plan.monthlyPrice === 0 ? (
                  <div className="w-full py-2.5 text-center text-sm font-medium text-gray-500 bg-gray-100 rounded-lg">
                    Free Forever
                  </div>
                ) : (
                  <button onClick={() => payWithPaystack(plan.key, price)} className="w-full py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 flex items-center justify-center gap-2">
                    <ExternalLink className="w-4 h-4" /> Upgrade
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* INDIVIDUAL MODULES TAB */}
      {activeTab === 'modules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {MODULES.map((mod) => {
            const price = billingCycle === 'annual' ? mod.annual : mod.monthly;
            const Icon = ICON_MAP[mod.icon] || Zap;
            const isSubscribed = sub?.modules?.includes(mod.id);

            return (
              <div key={mod.id} className={`rounded-xl border-2 p-5 transition-all ${isSubscribed ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-primary-200'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{mod.name}</h3>
                    {isSubscribed && <span className="text-[10px] text-green-600 font-medium">Active</span>}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-3">{mod.description}</p>
                <div className="mb-4">
                  <span className="text-2xl font-bold text-gray-900">₦{price.toLocaleString()}</span>
                  <span className="text-sm text-gray-500">/mo</span>
                  {billingCycle === 'annual' && (
                    <div className="text-xs text-gray-400 mt-0.5">
                      <span className="line-through">₦{mod.monthly.toLocaleString()}/mo</span>
                      <span className="text-green-600 ml-1">billed annually</span>
                    </div>
                  )}
                </div>
                {isSubscribed ? (
                  <div className="w-full py-2.5 text-center text-sm font-medium text-green-700 bg-green-100 rounded-lg flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Active
                  </div>
                ) : (
                  <button onClick={() => payWithPaystack(mod.id, price, 'module')} className="w-full py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 flex items-center justify-center gap-2">
                    <ExternalLink className="w-4 h-4" /> Add Module
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* BUNDLES TAB */}
      {activeTab === 'bundles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {BUNDLES.map((bundle) => {
            const savings = getBundleSavings(bundle);
            const price = billingCycle === 'annual' ? bundle.annual : bundle.monthly;
            const Icon = ICON_MAP[bundle.icon] || Package;
            const isSubscribed = bundle.moduleIds.every((mid) => sub?.modules?.includes(mid));
            const colorMap: Record<string, string> = {
              purple: 'bg-purple-100 text-purple-600',
              indigo: 'bg-indigo-100 text-indigo-600',
              amber: 'bg-amber-100 text-amber-600',
              green: 'bg-green-100 text-green-600',
              yellow: 'bg-yellow-100 text-yellow-600',
            };

            return (
              <div key={bundle.id} className={`rounded-xl border-2 p-5 transition-all ${isSubscribed ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-primary-200'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[bundle.color] || 'bg-gray-100'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{bundle.name}</h3>
                    {savings.percent > 0 && (
                      <span className="text-[10px] text-green-600 font-medium">Save {savings.percent}%</span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-2">{bundle.description}</p>
                <div className="text-xs text-gray-400 mb-3">
                  Includes: {bundle.moduleIds.map((mid) => MODULES.find((m) => m.id === mid)?.name).filter(Boolean).join(', ')}
                </div>
                <div className="mb-4">
                  <span className="text-2xl font-bold text-gray-900">₦{price.toLocaleString()}</span>
                  <span className="text-sm text-gray-500">/mo</span>
                  {savings.saved > 0 && (
                    <div className="text-xs text-gray-400 mt-0.5">
                      <span className="line-through">₦{savings.individual.toLocaleString()}/mo</span>
                      <span className="text-green-600 ml-1">Save ₦{savings.saved.toLocaleString()}/mo</span>
                    </div>
                  )}
                </div>
                {isSubscribed ? (
                  <div className="w-full py-2.5 text-center text-sm font-medium text-green-700 bg-green-100 rounded-lg flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Active
                  </div>
                ) : (
                  <button onClick={() => payWithPaystack(bundle.id, price, 'bundle')} className="w-full py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 flex items-center justify-center gap-2">
                    <ExternalLink className="w-4 h-4" /> Get Bundle
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* COMPARE PLANS TAB */}
      {activeTab === 'compare' && (
        <div className="space-y-6">
          {/* Dev Plan Switcher */}
          <div className="card border-2 border-dashed border-amber-300 bg-amber-50">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-semibold text-amber-800">Dev Plan Switcher</h3>
              <span className="text-[10px] bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">Testing Only</span>
            </div>
            <p className="text-xs text-amber-700 mb-4">Switch your tenant's plan and modules to test feature gating. Changes take effect immediately.</p>

            {/* Plan Buttons */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-600 mb-2">Core Plan</p>
              <div className="flex gap-2 flex-wrap">
                {CORE_PLANS.map((plan) => (
                  <button
                    key={plan.key}
                    disabled={switching}
                    onClick={() => setSelectedPlan(plan.key)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                      (selectedPlan || currentPlan) === plan.key
                        ? 'border-primary-500 bg-primary-50 text-primary-700 ring-2 ring-primary-200'
                        : 'border-gray-200 text-gray-600 hover:border-primary-300'
                    } ${switching ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {plan.name}
                    {plan.monthlyPrice > 0 && <span className="text-[10px] text-gray-400 ml-1">₦{plan.monthlyPrice.toLocaleString()}</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Module Toggles */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-600 mb-2">Active Modules</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {MODULES.map((mod) => {
                  const isActive = selectedModules.includes(mod.id) || sub?.modules?.includes(mod.id);
                  return (
                    <button
                      key={mod.id}
                      disabled={switching}
                      onClick={() => toggleModule(mod.id)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium border-2 transition-all text-left ${
                        isActive
                          ? 'border-green-400 bg-green-50 text-green-800'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      } ${switching ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center gap-1.5">
                        {isActive ? <CheckCircle className="w-3 h-3 text-green-500" /> : <XCircle className="w-3 h-3 text-gray-300" />}
                        {mod.name}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">₦{mod.monthly.toLocaleString()}/mo</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Apply Button */}
            <button
              disabled={switching || (!selectedPlan && selectedModules.length === 0)}
              onClick={() => switchPlan(selectedPlan || currentPlan, selectedModules)}
              className="px-6 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {switching ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Switching...</>
              ) : (
                <><Zap className="w-4 h-4" /> Apply Changes</>
              )}
            </button>
          </div>

          {/* Plan Toggle for Preview */}
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Preview Plan — Toggle to see what each plan includes</h3>
            <div className="flex gap-2 flex-wrap">
              {CORE_PLANS.map((plan) => (
                <button
                  key={plan.key}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                    currentPlan === plan.key
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 text-gray-600 hover:border-primary-300'
                  }`}
                >
                  {plan.name}
                  {currentPlan === plan.key && <span className="ml-1.5 text-[10px] bg-primary-600 text-white px-1.5 py-0.5 rounded-full">Current</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Full Comparison Matrix */}
          <div className="card overflow-x-auto">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Plan Comparison Matrix</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 w-64">Feature</th>
                  {CORE_PLANS.map((plan) => (
                    <th key={plan.key} className={`text-center py-3 px-3 text-xs font-semibold ${currentPlan === plan.key ? 'text-primary-700 bg-primary-50 rounded-t-lg' : 'text-gray-500'}`}>
                      {plan.name}
                      {plan.popular && <div className="text-[10px] text-primary-600 font-medium">Popular</div>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Limits Section */}
                <tr className="border-b border-gray-100">
                  <td colSpan={5} className="py-2 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50">Limits</td>
                </tr>
                {[
                  { label: 'Users', key: 'max_users' },
                  { label: 'Products', key: 'max_products' },
                  { label: 'Transactions/mo', key: 'max_transactions' },
                  { label: 'Locations', key: 'max_locations' },
                  { label: 'Storage (MB)', key: 'max_storage_mb' },
                  { label: 'Data Retention (days)', key: 'data_retention_days' },
                  { label: 'Currencies', key: 'currencies' },
                ].map(({ label, key }) => (
                  <tr key={key} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2.5 px-3 text-xs text-gray-700 font-medium">{label}</td>
                    {CORE_PLANS.map((plan) => {
                      const limits = PLAN_LIMITS[plan.key] || PLAN_LIMITS.starter;
                      const val = limits[key];
                      const display = val === -1 ? 'Unlimited' : val === 0 ? '—' : val?.toLocaleString();
                      return (
                        <td key={plan.key} className={`text-center py-2.5 px-3 text-xs ${currentPlan === plan.key ? 'bg-primary-50' : ''} ${val === -1 ? 'text-green-600 font-semibold' : val === 0 ? 'text-gray-300' : 'text-gray-700'}`}>
                          {display}
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* Core Features Section */}
                <tr className="border-b border-gray-100">
                  <td colSpan={5} className="py-2 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50">Core Features</td>
                </tr>
                {[
                  { label: 'POS & Sales', feature: 'pos' },
                  { label: 'Inventory Management', feature: 'inventory' },
                  { label: 'Quotes & Invoices', feature: 'quotes' },
                  { label: 'Customers', feature: 'customers' },
                  { label: 'Basic Reports', feature: 'basic_reports' },
                  { label: 'Sales Orders', feature: 'sales_orders' },
                  { label: 'Advanced Reports', feature: 'advanced_reports' },
                  { label: 'CSV/PDF Export', feature: 'export' },
                  { label: 'Phone Support', feature: 'phone_support' },
                  { label: 'API Access', feature: 'api_access' },
                  { label: 'Priority Support', feature: 'priority_support' },
                  { label: 'Custom Integrations', feature: 'custom_integrations' },
                ].map(({ label, feature }) => (
                  <tr key={feature} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2.5 px-3 text-xs text-gray-700 font-medium">{label}</td>
                    {CORE_PLANS.map((plan) => {
                      const features = PLAN_FEATURES[plan.key] || PLAN_FEATURES.starter;
                      const has = features.includes(feature);
                      return (
                        <td key={plan.key} className={`text-center py-2.5 px-3 ${currentPlan === plan.key ? 'bg-primary-50' : ''}`}>
                          {has ? (
                            <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                          ) : (
                            <XCircle className="w-4 h-4 text-gray-200 mx-auto" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* Modules Section */}
                <tr className="border-b border-gray-100">
                  <td colSpan={5} className="py-2 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50">Modules (Add-on purchases)</td>
                </tr>
                {MODULES.map((mod) => (
                  <tr key={mod.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2.5 px-3 text-xs text-gray-700 font-medium">
                      {mod.name}
                      <div className="text-[10px] text-gray-400 font-normal">{mod.description.split(',')[0]}</div>
                    </td>
                    {CORE_PLANS.map((plan) => {
                      const isSubscribed = sub?.modules?.includes(mod.id);
                      return (
                        <td key={plan.key} className={`text-center py-2.5 px-3 ${currentPlan === plan.key ? 'bg-primary-50' : ''}`}>
                          {isSubscribed ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                              <CheckCircle className="w-3 h-3" /> Active
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-400">₦{mod.monthly.toLocaleString()}/mo</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* Pricing Row */}
                <tr className="border-t-2 border-gray-200 bg-gray-50">
                  <td className="py-3 px-3 text-xs font-bold text-gray-900">Monthly Price</td>
                  {CORE_PLANS.map((plan) => (
                    <td key={plan.key} className={`text-center py-3 px-3 ${currentPlan === plan.key ? 'bg-primary-50' : ''}`}>
                      <span className="text-sm font-bold text-gray-900">
                        {plan.monthlyPrice === 0 ? 'Free' : `₦${plan.monthlyPrice.toLocaleString()}`}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr className="bg-gray-50">
                  <td className="py-3 px-3 text-xs font-bold text-gray-900">Annual Price (per mo)</td>
                  {CORE_PLANS.map((plan) => (
                    <td key={plan.key} className={`text-center py-3 px-3 ${currentPlan === plan.key ? 'bg-primary-50' : ''}`}>
                      <span className="text-sm font-bold text-green-700">
                        {plan.annualPrice === 0 ? 'Free' : `₦${plan.annualPrice.toLocaleString()}`}
                      </span>
                      {plan.annualPrice > 0 && <div className="text-[10px] text-green-600">Save 20%</div>}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Quick Module Pricing */}
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Module Add-on Pricing (per module, per month)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {MODULES.map((mod) => (
                <div key={mod.id} className="p-3 rounded-lg border border-gray-200 hover:border-primary-200 transition-colors">
                  <p className="text-xs font-semibold text-gray-900">{mod.name}</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">₦{mod.monthly.toLocaleString()}<span className="text-xs text-gray-400 font-normal">/mo</span></p>
                  <p className="text-[10px] text-green-600">Annual: ₦{mod.annual.toLocaleString()}/mo</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bundle Savings */}
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Bundle Savings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {BUNDLES.filter(b => b.id !== 'enterprise_suite').map((bundle) => {
                const savings = getBundleSavings(bundle);
                return (
                  <div key={bundle.id} className="p-3 rounded-lg border border-gray-200">
                    <p className="text-xs font-semibold text-gray-900">{bundle.name}</p>
                    <p className="text-[10px] text-gray-500 mb-2">{bundle.description}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-gray-900">₦{bundle.monthly.toLocaleString()}</span>
                      <span className="text-[10px] text-gray-400 line-through">₦{savings.individual.toLocaleString()}</span>
                    </div>
                    {savings.percent > 0 && (
                      <span className="text-[10px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full mt-1 inline-block">
                        Save {savings.percent}% (₦{savings.saved.toLocaleString()}/mo)
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
            <Shield className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">How Billing Works</h2>
            <p className="text-xs text-gray-500">Core plans + modules are billed separately via Paystack</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
          <div className="p-3 rounded-lg bg-gray-50">
            <p className="font-medium text-gray-900 mb-1">Core Plans</p>
            <p>Choose a core plan based on your team size and transaction limits. This is your base subscription.</p>
          </div>
          <div className="p-3 rounded-lg bg-gray-50">
            <p className="font-medium text-gray-900 mb-1">Add Modules</p>
            <p>Buy individual modules or bundles on top of your core plan. Modules work with any paid plan.</p>
          </div>
          <div className="p-3 rounded-lg bg-gray-50">
            <p className="font-medium text-gray-900 mb-1">Annual Savings</p>
            <p>Pay annually and save 20% on all plans and modules. That's 2 months free every year.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
