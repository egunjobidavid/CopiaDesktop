import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, XCircle, Loader2, ExternalLink, Zap, Shield, Users, Package, TrendingUp } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import api from '../../api/client';
import toast from 'react-hot-toast';

const PLAN_NAMES: Record<string, string> = { free: 'Free', monthly: 'Monthly', yearly: 'Yearly' };

export function Billing() {
  const tenantId = useAuthStore((s) => s.tenantId);
  const [sub, setSub] = useState<any>(null);
  const [plans, setPlans] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!tenantId) return;
    Promise.all([
      api.get('/billing/subscription'),
      api.get('/billing/paystack/plans'),
    ]).then(([s, p]) => {
      setSub(s.data);
      setPlans(p.data);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [tenantId]);

  const payWithPaystack = async (planName: string) => {
    try {
      const { data } = await api.post('/billing/paystack/initialize', {
        email: useAuthStore.getState().user?.email,
        tenantId,
        plan: planName,
      });
      window.open(data.authorizationUrl, '_blank');
      toast.success('Redirected to Paystack checkout');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to initialize payment');
    }
  };

  if (loading) return <div className="flex h-48 items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <p className="text-gray-500 mt-1">Manage your subscription and payment methods</p>
      </div>

      {/* Current Plan */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Current Plan</h2>
            <p className="text-xs text-gray-500">{PLAN_NAMES[sub?.plan] || sub?.plan || 'Free'}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 rounded-lg bg-gray-50">
            <p className="text-xs text-gray-500">Status</p>
            <p className="text-sm font-semibold flex items-center gap-1 mt-0.5">
              {sub?.status === 'active' ? <><CheckCircle className="w-3.5 h-3.5 text-green-500" /> Active</> : <><XCircle className="w-3.5 h-3.5 text-amber-500" /> {sub?.status || 'Inactive'}</>}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-gray-50">
            <p className="text-xs text-gray-500">Max Users</p>
            <p className="text-sm font-semibold mt-0.5">{sub?.limits?.max_users || '-'}</p>
          </div>
          <div className="p-3 rounded-lg bg-gray-50">
            <p className="text-xs text-gray-500">Max Products</p>
            <p className="text-sm font-semibold mt-0.5">{sub?.limits?.max_products || '-'}</p>
          </div>
          <div className="p-3 rounded-lg bg-gray-50">
            <p className="text-xs text-gray-500">Features</p>
            <p className="text-sm font-semibold mt-0.5">{sub?.features?.length || 0} enabled</p>
          </div>
        </div>
        {sub?.features?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {sub.features.map((f: string) => (
              <span key={f} className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-green-50 text-green-700">
                <CheckCircle className="w-3 h-3" /> {f.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Available Plans */}
      {plans?.plans?.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Zap className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Upgrade Plan</h2>
              <p className="text-xs text-gray-500">Paystack (Nigeria) — secure card payments</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plans.plans.map((p: any) => (
              <div key={p.name} className={`p-4 rounded-xl border-2 transition-colors ${sub?.plan === p.name.toLowerCase() ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold">{p.name}</h3>
                  <p className="text-lg font-bold text-blue-600">₦{(p.amount / 100).toLocaleString()}</p>
                </div>
                <p className="text-xs text-gray-500 mb-3">{p.description}</p>
                {sub?.plan !== p.name.toLowerCase() && (
                  <button onClick={() => payWithPaystack(p.name.toLowerCase())} className="btn-primary text-sm w-full flex items-center justify-center gap-2">
                    <ExternalLink className="w-4 h-4" /> Subscribe with Paystack
                  </button>
                )}
                {sub?.plan === p.name.toLowerCase() && (
                  <p className="text-sm text-blue-600 font-medium text-center">Current plan</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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
        <p className="text-sm text-gray-500">Stripe integration for USD/EUR payments is in development. You'll be able to subscribe using international cards here.</p>
      </div>
    </div>
  );
}
