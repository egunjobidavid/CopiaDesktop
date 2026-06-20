import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, XCircle, Loader2, ExternalLink, Zap, Shield, Clock, AlertTriangle, Lock } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { Breadcrumbs } from '../../components/Breadcrumbs';
import api from '../../api/client';
import toast from 'react-hot-toast';

const PLAN_DETAILS = [
  {
    name: 'Starter',
    key: 'free',
    monthlyPrice: 0,
    annualPrice: 0,
    description: 'For small businesses getting started',
    features: [
      '2 Users', '25 Products', '200 Transactions/mo', '1 Location',
      'POS & Sales', 'Inventory', 'CRM', 'Production (30-day trial)',
      'Projects (30-day trial)', 'Time Tracking (30-day trial)',
      'Local + USD Currency', '90-day data retention',
    ],
    limits: 'Users: 2 | Products: 25 | Locations: 1',
  },
  {
    name: 'Growth',
    key: 'growth',
    monthlyPrice: 9000,
    annualPrice: 7500,
    description: 'For growing businesses needing accounting',
    features: [
      '10 Users', '500 Products', '5,000 Transactions/mo', '3 Locations',
      'All Starter features', 'Accounting', 'Procurement', 'Approvals',
      'Analytics & Reports', 'Multi-Location', 'Export (CSV/PDF)',
      'Production (full)', 'Local + USD Currency', '1-year data retention',
    ],
    limits: 'Users: 10 | Products: 500 | Locations: 3',
    popular: false,
  },
  {
    name: 'Professional',
    key: 'professional',
    monthlyPrice: 27000,
    annualPrice: 22500,
    description: 'For established businesses needing full ERP + PM',
    features: [
      '50 Users', '5,000 Products', '50,000 Transactions/mo', '15 Locations',
      'All Growth features', 'Projects & Kanban', 'Time Tracking', 'HR & Payroll',
      'Fixed Assets', 'Gantt Charts', 'Milestones', 'Any Currency',
      '3-year data retention',
    ],
    limits: 'Users: 50 | Products: 5,000 | Locations: 15',
    popular: true,
  },
  {
    name: 'Enterprise',
    key: 'enterprise',
    monthlyPrice: 66000,
    annualPrice: 55000,
    description: 'For large organizations needing unlimited access',
    features: [
      'Unlimited Users', 'Unlimited Products', 'Unlimited Transactions',
      'Unlimited Locations', 'All Professional features', 'Priority Support',
      'API Access', 'Custom Integrations', 'Dedicated Account Manager',
      '7-year data retention',
    ],
    limits: 'Unlimited everything',
  },
];

const PLAN_NAMES: Record<string, string> = { free: 'Starter', growth: 'Growth', professional: 'Professional', enterprise: 'Enterprise' };

export function Billing() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const [sub, setSub] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  useEffect(() => {
    if (!tenantId) return;
    api.get('/billing/subscription')
      .then((res) => setSub(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tenantId]);

  const payWithPaystack = async (planKey: string) => {
    try {
      const plan = PLAN_DETAILS.find((p) => p.key === planKey);
      const amount = billingCycle === 'annual' ? plan!.annualPrice : plan!.monthlyPrice;
      const { data } = await api.post('/billing/paystack/initialize', {
        email: useAuthStore.getState().user?.email,
        tenantId,
        plan: planKey,
        amount,
        billingCycle,
      });
      window.open(data.authorizationUrl, '_blank');
      toast.success('Redirected to Paystack checkout');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to initialize payment');
    }
  };

  const currentPlan = sub?.plan || 'free';
  const currentPlanName = PLAN_NAMES[currentPlan] || 'Starter';

  if (loading) return <div className="flex h-48 items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      <div>
        <h1 className="page-title">Billing & Subscription</h1>
        <p className="page-subtitle">Manage your plan and payments</p>
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
            <p className="text-xs text-gray-500">Features</p>
            <p className="text-sm font-semibold mt-0.5">{sub?.features?.length || 6} enabled</p>
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
            Annual <span className="text-green-600 text-xs ml-1">Save 18%</span>
          </button>
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLAN_DETAILS.map((plan) => {
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

              {isCurrent ? (
                <div className="w-full py-2.5 text-center text-sm font-medium text-primary-700 bg-primary-100 rounded-lg">
                  Current Plan
                </div>
              ) : plan.monthlyPrice === 0 ? (
                <div className="w-full py-2.5 text-center text-sm font-medium text-gray-500 bg-gray-100 rounded-lg">
                  Free Forever
                </div>
              ) : (
                <button onClick={() => payWithPaystack(plan.key)} className="w-full py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 flex items-center justify-center gap-2">
                  <ExternalLink className="w-4 h-4" /> Upgrade
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Stripe section */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
            <Shield className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">International Payments</h2>
            <p className="text-xs text-gray-500">Stripe — coming soon for overseas customers</p>
          </div>
        </div>
        <p className="text-sm text-gray-500">Stripe integration for USD/EUR payments is in development.</p>
      </div>
    </div>
  );
}
