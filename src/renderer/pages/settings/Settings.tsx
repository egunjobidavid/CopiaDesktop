import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, Shield, Key, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import toast from 'react-hot-toast';

export function Settings() {
  const user = useAuthStore((s) => s.user);
  const tenantId = useAuthStore((s) => s.tenantId);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold">Profile</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide">Full Name</label>
              <p className="text-gray-900 font-medium">{user?.fullName || '-'}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide">Email</label>
              <p className="text-gray-900 font-medium">{user?.email || '-'}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide">Role</label>
              <p className="text-gray-900 font-medium capitalize">{user?.role || '-'}</p>
            </div>
          </div>
        </div>

        {/* Tenant */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-lg font-semibold">Organization</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide">Tenant ID</label>
              <p className="text-gray-900 font-medium font-mono text-sm">{tenantId || 'Not set'}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide">API Base URL</label>
              <p className="text-gray-500 text-sm font-mono">https://copiaos-backend.onrender.com/api/v1</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button onClick={() => { navigator.clipboard.writeText(tenantId || ''); toast.success('Tenant ID copied'); }}
              className="btn-secondary text-sm">Copy Tenant ID</button>
          </div>
        </div>
      </div>
    </div>
  );
}
