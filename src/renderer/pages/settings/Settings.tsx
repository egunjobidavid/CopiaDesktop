import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, Shield, Building2, Copy, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import api from '../../api/client';
import toast from 'react-hot-toast';

export function Settings() {
  const user = useAuthStore((s) => s.user);
  const tenantId = useAuthStore((s) => s.tenantId);
  const [orgName, setOrgName] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (tenantId) {
      api.get('/auth/me').then(({ data }) => {
        if (data?.tenants?.length > 0) {
          const t = data.tenants.find((t: any) => t.id === tenantId);
          if (t) setOrgName(t.name);
        }
      }).catch(() => {});
    }
  }, [tenantId]);

  const copyId = () => {
    navigator.clipboard.writeText(tenantId || '');
    setCopied(true);
    toast.success('Organization ID copied');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account and organization</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Profile</h2>
              <p className="text-xs text-gray-500">Your account details</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Full Name</label>
              <p className="text-gray-900 font-medium mt-0.5">{user?.fullName || '-'}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Email</label>
              <p className="text-gray-900 font-medium mt-0.5">{user?.email || '-'}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Role</label>
              <p className="text-gray-900 font-medium capitalize mt-0.5">{user?.role || '-'}</p>
            </div>
          </div>
        </div>

        {/* Organization */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Organization</h2>
              <p className="text-xs text-gray-500">{orgName || 'Loading...'}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Organization ID</label>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-gray-900 font-medium font-mono text-sm bg-gray-50 px-2 py-1 rounded border border-gray-200 truncate max-w-[280px]">
                  {tenantId || 'Not set'}
                </p>
                <button onClick={copyId} className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors" title="Copy ID">
                  {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
