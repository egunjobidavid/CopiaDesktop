import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { register } from '../api/auth';
import api from '../api/client';
import toast from 'react-hot-toast';
import { Building2, User, MapPin, Briefcase, ArrowRight, ArrowLeft, Check, ChevronDown, Mail } from 'lucide-react';

const COUNTRIES = [
  'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Uganda', 'Tanzania',
  'United States', 'United Kingdom', 'Canada', 'Other',
];

const COMMON_SERVICES = [
  'Retail & Wholesale', 'Manufacturing', 'Food & Beverage', 'Logistics',
  'Professional Services', 'Healthcare', 'Education', 'Technology',
  'Construction', 'Agriculture',
];

interface Props {
  onBack: () => void;
}

export function RegisterForm({ onBack }: Props) {
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('token');
  const [inviteValid, setInviteValid] = useState(false);
  const [inviteTenantId, setInviteTenantId] = useState('');
  const [inviteOrgName, setInviteOrgName] = useState('');

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(!!inviteToken);

  const [form, setForm] = useState({
    email: '', password: '', fullName: '',
    tenantName: '',
    tenantAddress: '', tenantCity: '', tenantState: '',
    tenantCountry: '', tenantPostalCode: '', tenantPhone: '',
    tenantServices: '',
  });
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  useEffect(() => {
    if (inviteToken) {
      api.get(`/invites/validate?token=${inviteToken}`).then(({ data }) => {
        setInviteValid(true);
        setInviteTenantId(data.tenantId);
        setInviteOrgName(data.orgName || 'an organization');
        if (data.email) setForm((f) => ({ ...f, email: data.email }));
        setValidating(false);
      }).catch(() => {
        toast.error('Invalid or expired invitation link');
        setValidating(false);
      });
    }
  }, [inviteToken]);

  const update = (field: string, value: string) => setForm({ ...form, [field]: value });

  const toggleService = (s: string) => {
    const next = selectedServices.includes(s)
      ? selectedServices.filter((x) => x !== s)
      : [...selectedServices, s];
    setSelectedServices(next);
    update('tenantServices', next.join(', '));
  };

  const canProceed = (s: number) => {
    if (inviteToken) return form.email && form.password.length >= 6 && form.fullName;
    if (s === 1) return form.email && form.password.length >= 6 && form.fullName && form.tenantName;
    if (s === 2) return true;
    if (s === 3) return true;
    return false;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload: any = inviteToken
        ? { email: form.email, password: form.password, fullName: form.fullName, token: inviteToken, tenantId: inviteTenantId }
        : { ...form, tenantServices: form.tenantServices || (selectedServices.length > 0 ? selectedServices.join(', ') : undefined) };
      await register(payload);
      toast.success(inviteToken ? 'Welcome to your organization!' : 'Organization created!');
      onBack();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm";

  if (validating) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  // Invite-based registration — simplified form
  if (inviteToken) {
    return (
      <div className="space-y-4">
        <div className="text-center mb-4">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
            <Mail className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="text-lg font-semibold">Join {inviteOrgName}</h2>
          <p className="text-sm text-gray-500">Create your account to get started</p>
        </div>
        <input className={inputClass} type="text" placeholder="Your full name *" value={form.fullName}
          onChange={(e) => update('fullName', e.target.value)} />
        <input className={inputClass} type="email" placeholder="Email address *" value={form.email}
          onChange={(e) => update('email', e.target.value)} disabled={!!form.email && inviteValid} />
        <input className={inputClass} type="password" placeholder="Password (min 6 chars) *" value={form.password}
          onChange={(e) => update('password', e.target.value)} />
        <div className="flex gap-3 mt-6">
          <button onClick={onBack} className="btn-secondary flex-1">Sign In</button>
          <button onClick={handleSubmit} disabled={loading || !canProceed(1)}
            className="btn-primary flex-1 disabled:opacity-50">
            {loading ? 'Joining...' : 'Join Organization'}
          </button>
        </div>
      </div>
    );
  }

  // Normal org registration — multi-step
  return (
    <div className="w-full">
      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              s < step ? 'bg-green-500 text-white' :
              s === step ? 'bg-blue-600 text-white' :
              'bg-gray-200 text-gray-500'
            }`}>
              {s < step ? <Check className="w-4 h-4" /> : s}
            </div>
            <div className={`h-0.5 flex-1 ${s < 3 ? (s < step ? 'bg-green-500' : 'bg-gray-200') : 'hidden'}`} />
          </div>
        ))}
      </div>

      {/* Step 1: Account & Organization */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Your Account</h2>
              <p className="text-xs text-gray-500">Create your admin account</p>
            </div>
          </div>
          <input className={inputClass} type="text" placeholder="Your full name *" value={form.fullName}
            onChange={(e) => update('fullName', e.target.value)} />
          <input className={inputClass} type="email" placeholder="Email address *" value={form.email}
            onChange={(e) => update('email', e.target.value)} />
          <input className={inputClass} type="password" placeholder="Password (min 6 chars) *" value={form.password}
            onChange={(e) => update('password', e.target.value)} />
          <hr className="border-gray-200" />
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Organization</h2>
              <p className="text-xs text-gray-500">Tell us about your business</p>
            </div>
          </div>
          <input className={inputClass} type="text" placeholder="Organization name *" value={form.tenantName}
            onChange={(e) => update('tenantName', e.target.value)} />
          <input className={inputClass} type="tel" placeholder="Phone number" value={form.tenantPhone}
            onChange={(e) => update('tenantPhone', e.target.value)} />
        </div>
      )}

      {/* Step 2: Address */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Address</h2>
              <p className="text-xs text-gray-500">Where is your business located?</p>
            </div>
          </div>
          <textarea className={inputClass} rows={2} placeholder="Street address" value={form.tenantAddress}
            onChange={(e) => update('tenantAddress', e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <input className={inputClass} type="text" placeholder="City" value={form.tenantCity}
              onChange={(e) => update('tenantCity', e.target.value)} />
            <input className={inputClass} type="text" placeholder="State/Region" value={form.tenantState}
              onChange={(e) => update('tenantState', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <button type="button" onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                className={`${inputClass} text-left flex items-center justify-between`}>
                <span className={form.tenantCountry ? 'text-gray-900' : 'text-gray-400'}>{form.tenantCountry || 'Country'}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              {showCountryDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {COUNTRIES.map((c) => (
                    <button key={c} type="button" onClick={() => { update('tenantCountry', c); setShowCountryDropdown(false); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 ${form.tenantCountry === c ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <input className={inputClass} type="text" placeholder="Postal code" value={form.tenantPostalCode}
              onChange={(e) => update('tenantPostalCode', e.target.value)} />
          </div>
        </div>
      )}

      {/* Step 3: Services */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Services</h2>
              <p className="text-xs text-gray-500">What does your business do?</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {COMMON_SERVICES.map((s) => (
              <button key={s} type="button" onClick={() => toggleService(s)}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium border transition-colors text-left ${
                  selectedServices.includes(s)
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                }`}>
                {s}
              </button>
            ))}
          </div>
          <textarea className={inputClass} rows={2} placeholder="Or describe your services..." value={form.tenantServices}
            onChange={(e) => update('tenantServices', e.target.value)} />
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 mt-6">
        {step > 1 ? (
          <button onClick={() => setStep(step - 1)} className="btn-secondary flex-1 flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        ) : (
          <button onClick={onBack} className="btn-secondary flex-1 flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Sign In
          </button>
        )}
        {step < 3 ? (
          <button onClick={() => setStep(step + 1)} disabled={!canProceed(step)}
            className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
            Next <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={loading}
            className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? (
              <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Creating...</>
            ) : 'Create Organization'}
          </button>
        )}
      </div>
    </div>
  );
}
