import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, XCircle, Loader2, ExternalLink, Zap, Shield, Clock, AlertTriangle, Lock, Wallet, Users, FolderKanban, Briefcase, Factory, ShoppingBag, MapPin, BarChart3, Crown, Package } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { Breadcrumbs } from '../../components/Breadcrumbs';
import api from '../../api/client';
import toast from 'react-hot-toast';

const ICON_MAP: Record<string, any> = {
  Wallet, Users, FolderKanban, Briefcase, Factory, ShoppingBag, MapPin, BarChart3, CheckCircle, Crown, Package,
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
      '50 Users', '5,000 Products', '50,000 Transactions/mo', '15 Locations',
      'All Business features', 'Phone Support', 'Priority Email',
    ],
    limits: 'Users: 50 | Products: 5,000 | Locations: 15',
  },
  {
    name: 'Enterprise',
    key: 'enterprise',
    monthlyPrice: 75000,
    annualPrice: 60000,
    description: 'For large organizations needing unlimited access',
    features: [
      'Unlimited Users', 'Unlimited Products', 'Unlimited Transactions',
      'Unlimited Locations', 'All Professional features', 'API Access',
      'Priority Support', 'Custom Integrations', 'Dedicated Account Manager',
    ],
    limits: 'Unlimited everything',
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

type Tab = 'plans' | 'modules' | 'bundles';

export function Billing() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const [sub, setSub] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [activeTab, setActiveTab] = useState<Tab>('plans');

  useEffect(() => {
    if (!tenantId) return;
    api.get('/billing/subscription')
      .then((res) => setSub(res.data))
      .catch(() => {})
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
