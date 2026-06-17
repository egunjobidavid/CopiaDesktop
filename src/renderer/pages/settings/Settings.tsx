import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, Shield, Building2, Copy, CheckCircle2, Mail, Plus, X, Loader2, Users, Clock, CheckCircle, Ban } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import api from '../../api/client';
import toast from 'react-hot-toast';

interface Member {
  id: string;
  email: string;
  full_name: string;
  role: string;
  status: string;
  joined_at: string;
}

interface Invite {
  id: string;
  email: string;
  role: string;
  status: string;
  expires_at: string;
  created_at: string;
  created_by_name: string;
}

export function Settings() {
  const user = useAuthStore((s) => s.user);
  const tenantId = useAuthStore((s) => s.tenantId);
  const [orgName, setOrgName] = useState('');
  const [copied, setCopied] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [sending, setSending] = useState(false);

  const loadOrg = () => {
    if (!tenantId) return;
    api.get('/auth/me').then(({ data }) => {
      if (data?.tenants?.length > 0) {
        const t = data.tenants.find((t: any) => t.id === tenantId);
        if (t) setOrgName(t.name);
      }
    }).catch(() => {});
    loadMembers();
    loadInvites();
  };

  const loadMembers = () => {
    setLoadingMembers(true);
    api.get(`/tenants/members?tenantId=${tenantId}`).then(({ data }) => {
      setMembers(Array.isArray(data) ? data : []);
    }).catch(() => {}).finally(() => setLoadingMembers(false));
  };

  const loadInvites = () => {
    api.get(`/invites?tenantId=${tenantId}`).then(({ data }) => {
      setInvites(Array.isArray(data) ? data : []);
    }).catch(() => {});
  };

  useEffect(loadOrg, [tenantId]);

  const sendInvite = async () => {
    if (!inviteEmail.trim()) { toast.error('Email is required'); return; }
    setSending(true);
    try {
      await api.post('/invites', { tenantId, email: inviteEmail.trim(), role: inviteRole });
      toast.success(`Invitation sent to ${inviteEmail}`);
      setShowInviteForm(false);
      setInviteEmail('');
      loadInvites();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to send invite');
    } finally {
      setSending(false);
    }
  };

  const copyId = () => {
    navigator.clipboard.writeText(tenantId || '');
    setCopied(true);
    toast.success('Organization ID copied');
    setTimeout(() => setCopied(false), 2000);
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'accepted': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Ban className="w-4 h-4 text-red-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account, organization, and team</p>
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

      {/* Team Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Team</h2>
              <p className="text-xs text-gray-500">{members.length} member{members.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button onClick={() => setShowInviteForm(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Invite User
          </button>
        </div>

        {/* Members list */}
        {loadingMembers ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {members.map((m) => (
              <div key={m.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-600">
                      {(m.full_name || m.email)[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{m.full_name || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">{m.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize
                    bg-blue-100 text-blue-700">{m.role}</span>
                  <span className="text-xs text-gray-400">
                    Joined {new Date(m.joined_at).toLocaleDateString('en-GB')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pending invites */}
        {invites.length > 0 && (
          <>
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pending Invitations</p>
            </div>
            <div className="divide-y divide-gray-200">
              {invites.filter((i) => i.status === 'pending').map((inv) => (
                <div key={inv.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-amber-500" />
                    <div>
                      <p className="text-sm text-gray-900">{inv.email || 'No email'}</p>
                      <p className="text-xs text-gray-500">
                        By {inv.created_by_name || 'Unknown'} &middot; Expires {new Date(inv.expires_at).toLocaleDateString('en-GB')}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
                    <Clock className="w-3 h-3" /> Pending
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Invite Form Modal */}
      {showInviteForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Invite Team Member</h2>
              <button onClick={() => setShowInviteForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              They'll receive an email with a link to join <strong>{orgName}</strong>.
            </p>
            <div className="space-y-3">
              <input type="email" placeholder="Email address" className="input w-full" value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)} />
              <select className="input w-full" value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
                <option value="member">Member</option>
                <option value="admin">Admin</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <button onClick={() => setShowInviteForm(false)} className="btn-secondary">Cancel</button>
              <button onClick={sendInvite} disabled={sending}
                className="btn-primary flex items-center gap-2 disabled:opacity-50">
                {sending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                ) : (
                  <><Mail className="w-4 h-4" /> Send Invite</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
