import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import api from '../api/client';
import toast from 'react-hot-toast';
import {
  Building2, MapPin, Package, UserPlus, Check, ArrowRight, ArrowLeft,
  Store, Globe, Phone, Mail, Hash, Landmark,
} from 'lucide-react';

interface OnboardingData {
  orgName: string;
  orgAddress: string;
  orgCity: string;
  orgState: string;
  orgPhone: string;
  orgEmail: string;
  locationName: string;
  locationType: string;
  productName: string;
  productSku: string;
  productPrice: string;
  staffEmail: string;
  staffName: string;
}

const steps = [
  { title: 'Organization', subtitle: 'Tell us about your business', icon: Building2 },
  { title: 'First Location', subtitle: 'Set up your first location', icon: MapPin },
  { title: 'First Product', subtitle: 'Add your first product', icon: Package },
  { title: 'Accounting', subtitle: 'Set up your chart of accounts', icon: Landmark },
  { title: 'Invite Staff', subtitle: 'Add your team members', icon: UserPlus },
  { title: 'All Done!', subtitle: "You're ready to go", icon: Check },
];

export function OnboardingWizard() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    orgName: '',
    orgAddress: '',
    orgCity: '',
    orgState: '',
    orgPhone: '',
    orgEmail: user?.email || '',
    locationName: 'Head Office',
    locationType: 'head_office',
    productName: '',
    productSku: '',
    productPrice: '',
    staffEmail: '',
    staffName: '',
  });

  const [accounts, setAccounts] = useState([
    { code: '1000', name: 'Cash', type: 'asset', enabled: true },
    { code: '1100', name: 'Accounts Receivable', type: 'asset', enabled: true },
    { code: '2000', name: 'Accounts Payable', type: 'liability', enabled: true },
    { code: '3000', name: 'Owner\'s Equity', type: 'equity', enabled: true },
    { code: '4000', name: 'Sales Revenue', type: 'revenue', enabled: true },
    { code: '5000', name: 'Cost of Goods Sold', type: 'expense', enabled: true },
    { code: '5100', name: 'Rent Expense', type: 'expense', enabled: true },
    { code: '5200', name: 'Utilities Expense', type: 'expense', enabled: true },
  ]);

  const update = (field: keyof OnboardingData, value: string) =>
    setData((prev) => ({ ...prev, [field]: value }));

  async function handleFinish() {
    setIsSubmitting(true);
    try {
      if (data.orgName) {
        await api.patch('/tenants', { name: data.orgName, address: data.orgAddress, city: data.orgCity, state: data.orgState, phone: data.orgPhone }).catch(() => null);
      }
      if (data.locationName) {
        await api.post('/locations', { name: data.locationName, type: data.locationType, city: data.orgCity, state: data.orgState }).catch(() => null);
      }
      if (data.productName && data.productSku) {
        await api.post('/inventory/products', { name: data.productName, sku: data.productSku, productType: 'goods', uom: 'unit', unitPrice: Number(data.productPrice) || 0 }).catch(() => null);
      }
      const enabledAccounts = accounts.filter((a) => a.enabled);
      for (const acc of enabledAccounts) {
        await api.post('/accounting/accounts', {
          accountCode: acc.code,
          name: acc.name,
          accountType: acc.type,
        }).catch(() => null);
      }
      if (data.staffEmail && data.staffName) {
        await api.post('/invites', { email: data.staffEmail, role: 'Staff' }).catch(() => null);
      }
      toast.success('Onboarding complete!');
      navigate('/dashboard');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  }

  function canNext() {
    if (step === 0) return data.orgName.trim().length > 0;
    return true;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                i < step ? 'bg-primary-600 text-white' :
                i === step ? 'bg-primary-600 text-white ring-4 ring-primary-100' :
                'bg-gray-200 text-gray-500'
              }`}>
                {i < step ? <Check className="w-5 h-5" /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-1 transition-colors ${i < step ? 'bg-primary-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step header */}
        <div className="text-center mb-6">
          {(() => {
            const Icon = steps[step].icon;
            return <Icon className="w-8 h-8 text-primary-600 mx-auto mb-2" />;
          })()}
          <h1 className="text-2xl font-bold text-gray-900">{steps[step].title}</h1>
          <p className="text-gray-500 mt-1">{steps[step].subtitle}</p>
        </div>

        {/* Step content */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <label className="label">Business Name *</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={data.orgName} onChange={(e) => update('orgName', e.target.value)}
                    className="input pl-10" placeholder="My Business Ltd" />
                </div>
              </div>
              <div>
                <label className="label">Address</label>
                <input type="text" value={data.orgAddress} onChange={(e) => update('orgAddress', e.target.value)}
                  className="input" placeholder="123 Business Street" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">City</label>
                  <input type="text" value={data.orgCity} onChange={(e) => update('orgCity', e.target.value)}
                    className="input" placeholder="Lagos" />
                </div>
                <div>
                  <label className="label">State</label>
                  <input type="text" value={data.orgState} onChange={(e) => update('orgState', e.target.value)}
                    className="input" placeholder="Lagos State" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="tel" value={data.orgPhone} onChange={(e) => update('orgPhone', e.target.value)}
                      className="input pl-10" placeholder="+234 800 000 0000" />
                  </div>
                </div>
                <div>
                  <label className="label">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="email" value={data.orgEmail} onChange={(e) => update('orgEmail', e.target.value)}
                      className="input pl-10" placeholder="hello@business.com" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="label">Location Name</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={data.locationName} onChange={(e) => update('locationName', e.target.value)}
                    className="input pl-10" placeholder="Head Office" />
                </div>
              </div>
              <div>
                <label className="label">Location Type</label>
                <select value={data.locationType} onChange={(e) => update('locationType', e.target.value)} className="select">
                  <option value="head_office">Head Office</option>
                  <option value="branch_office">Branch Office</option>
                  <option value="shop">Shop</option>
                  <option value="warehouse">Warehouse</option>
                  <option value="store">Store</option>
                  <option value="plant">Plant</option>
                </select>
              </div>
              <p className="text-xs text-gray-400">You can add more locations later in Settings.</p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="label">Product Name</label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={data.productName} onChange={(e) => update('productName', e.target.value)}
                    className="input pl-10" placeholder="Widget Pro" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">SKU</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" value={data.productSku} onChange={(e) => update('productSku', e.target.value)}
                      className="input pl-10" placeholder="WGT-001" />
                  </div>
                </div>
                <div>
                  <label className="label">Price (₦)</label>
                  <input type="number" value={data.productPrice} onChange={(e) => update('productPrice', e.target.value)}
                    className="input" placeholder="0" min="0" />
                </div>
              </div>
              <p className="text-xs text-gray-400">You can add more products later in Products.</p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Set up your Chart of Accounts. These are the accounts you'll use for journal entries and financial reporting. You can add more later in <strong>Accounting &gt; Chart of Accounts</strong>.
              </p>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Code</th>
                      <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Name</th>
                      <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Type</th>
                      <th className="text-center px-3 py-2 text-xs font-medium text-gray-500">Include</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.map((acc, idx) => (
                      <tr key={acc.code} className="border-b border-gray-50 last:border-b-0">
                        <td className="px-3 py-2 font-mono text-xs">{acc.code}</td>
                        <td className="px-3 py-2 text-xs">{acc.name}</td>
                        <td className="px-3 py-2 text-xs capitalize">{acc.type}</td>
                        <td className="px-3 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={acc.enabled}
                            onChange={(e) => {
                              const updated = [...accounts];
                              updated[idx] = { ...updated[idx], enabled: e.target.checked };
                              setAccounts(updated);
                            }}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-400">
                {accounts.filter((a) => a.enabled).length} accounts selected. You can always add more later.
              </p>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label className="label">Staff Name</label>
                <div className="relative">
                  <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={data.staffName} onChange={(e) => update('staffName', e.target.value)}
                    className="input pl-10" placeholder="John Doe" />
                </div>
              </div>
              <div>
                <label className="label">Staff Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" value={data.staffEmail} onChange={(e) => update('staffEmail', e.target.value)}
                    className="input pl-10" placeholder="john@business.com" />
                </div>
              </div>
              <p className="text-xs text-gray-400">An invitation email will be sent. You can add more staff in Settings.</p>
            </div>
          )}

          {step === 5 && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">You're all set!</h2>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                Your business is configured. Explore the dashboard, add more products, invite your team, and start selling.
              </p>
              <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto text-left">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500" /> Organization set up
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500" /> Location created
                </div>
                {data.productName && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500" /> First product added
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500" /> Chart of Accounts ({accounts.filter((a) => a.enabled).length} accounts)
                </div>
                {data.staffEmail && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500" /> Team invite sent
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 0}
              className="btn-secondary disabled:opacity-30"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            {step < steps.length - 1 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canNext()}
                className="btn-primary"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={isSubmitting}
                className="btn-primary"
              >
                {isSubmitting ? 'Setting up...' : 'Go to Dashboard'} <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Skip */}
        {step < steps.length - 1 && (
          <button
            onClick={() => navigate('/dashboard')}
            className="block mx-auto mt-4 text-sm text-gray-400 hover:text-gray-600"
          >
            Skip onboarding
          </button>
        )}
      </div>
    </div>
  );
}
