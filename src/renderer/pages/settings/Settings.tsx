import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, Shield, Building2, Copy, CheckCircle2, Mail, Plus, X, Loader2, Users, Clock, CheckCircle, Ban, Trash2 } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { Breadcrumbs } from '../../components/Breadcrumbs';
import api from '../../api/client';
import toast from 'react-hot-toast';

const ROLES = ['MD', 'admin', 'Director', 'Manager', 'Accountant', 'Sales Rep', 'Staff'] as const;

const ROLE_HIERARCHY: Record<string, number> = {
  MD: 100,
  admin: 60,
  Director: 80,
  Manager: 60,
  Accountant: 40,
  'Sales Rep': 30,
  member: 30,
  Staff: 10,
  viewer: 5,
};

function hasMinRole(userRole: string, minRole: string): boolean {
  return (ROLE_HIERARCHY[userRole] ?? 0) >= (ROLE_HIERARCHY[minRole] ?? 0);
}

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

interface OrphanUser {
  id: string;
  email: string;
  full_name: string;
  status: string;
  created_at: string;
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
  const [inviteRole, setInviteRole] = useState('Staff');
  const [sending, setSending] = useState(false);
  const [lastInviteLink, setLastInviteLink] = useState('');
  const [orphanUsers, setOrphanUsers] = useState<OrphanUser[]>([]);
  const [loadingOrphans, setLoadingOrphans] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', fullName: '', role: 'Staff' });
  const [creatingUser, setCreatingUser] = useState(false);
  const [changingRole, setChangingRole] = useState<string | null>(null);

  const userRole = user?.role ?? 'Staff';

  const canManage = hasMinRole(userRole, 'Director');

  const loadOrg = () => {
    if (!tenantId) return;
    api.get('/auth/me').then(({ data }) => {
      if (data?.tenants?.length > 0) {
        const t = data.tenants.find((t: any) => t.id === tenantId);
        if (t) setOrgName(t.name);
      }
    }).catch(() => { toast.error('Failed to load organization info'); });
    loadMembers();
    loadInvites();
    loadOrphans();
  };

  const loadMembers = () => {
    setLoadingMembers(true);
    api.get(`/tenants/members?tenantId=${tenantId}`).then(({ data }) => {
      setMembers(Array.isArray(data) ? data : []);
    }).catch(() => { toast.error('Failed to load team members'); }).finally(() => setLoadingMembers(false));
  };

  const loadInvites = () => {
    api.get(`/invites?tenantId=${tenantId}`).then(({ data }) => {
      setInvites(Array.isArray(data) ? data : []);
    }).catch(() => { toast.error('Failed to load invites'); });
  };

  const loadOrphans = () => {
    setLoadingOrphans(true);
    api.get('/tenants/orphan-users').then(({ data }) => {
      setOrphanUsers(Array.isArray(data) ? data : []);
    }).catch(() => { toast.error('Failed to load unassigned users'); }).finally(() => setLoadingOrphans(false));
  };

  const addOrphan = async (email: string) => {
    try {
      await api.post('/tenants/members', { tenantId, email, role: 'Staff' });
      toast.success(`${email} added to your organization`);
      loadMembers();
      loadOrphans();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to add user');
    }
  };

  const createUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.fullName) { toast.error('All fields required'); return; }
    setCreatingUser(true);
    try {
      await api.post('/auth/admin/create-user', newUser, { headers: { 'x-tenant-id': tenantId } });
      toast.success(`User ${newUser.email} created`);
      setShowCreateUser(false);
      setNewUser({ email: '', password: '', fullName: '', role: 'Staff' });
      loadMembers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create user');
    } finally {
      setCreatingUser(false);
    }
  };

  useEffect(loadOrg, [tenantId]);

  const sendInvite = async () => {
    if (!inviteEmail.trim()) { toast.error('Email is required'); return; }
    setSending(true);
    try {
      const { data } = await api.post('/invites', { tenantId, email: inviteEmail.trim(), role: inviteRole });
      if (data.inviteLink) {
        setLastInviteLink(data.inviteLink);
        toast.success('Email delivery unavailable — share the invite link manually');
      } else {
        toast.success(`Invitation sent to ${inviteEmail}`);
        setShowInviteForm(false);
        setInviteEmail('');
      }
      loadInvites();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to send invite');
    } finally {
      setSending(false);
    }
  };

  const changeMemberRole = async (memberId: string, newRole: string) => {
    setChangingRole(memberId);
    try {
      await api.patch(`/tenants/members/${memberId}/role`, { tenantId, role: newRole });
      toast.success('Role updated');
      loadMembers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to change role');
    } finally {
      setChangingRole(null);
    }
  };

  const removeMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Remove ${memberName} from your organization?`)) return;
    try {
      await api.delete(`/tenants/members/${memberId}?tenantId=${tenantId}`);
      toast.success(`${memberName} removed from organization`);
      loadMembers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to remove member');
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
      <Breadcrumbs />
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your account, organization, and team</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
              <User className="w-5 h-5 text-primary-600" />
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
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-600" />
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
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Team</h2>
              <p className="text-xs text-gray-500">{members.length} member{members.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          {canManage && (
            <button onClick={() => setShowInviteForm(true)} className="btn-primary flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" /> Invite User
            </button>
          )}
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
                  <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary-600">
                      {(m.full_name || m.email)[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{m.full_name || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">{m.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {canManage && m.id !== user?.id ? (
                    <select
                      className="text-xs border border-gray-200 rounded-md px-2 py-1 bg-white"
                      value={m.role}
                      onChange={(e) => changeMemberRole(m.id, e.target.value)}
                      disabled={changingRole === m.id}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize bg-primary-100 text-primary-700">{m.role}</span>
                  )}
                  <span className="text-xs text-gray-400">
                    Joined {new Date(m.joined_at).toLocaleDateString('en-GB')}
                  </span>
                  {canManage && m.id !== user?.id && (
                    <button
                      onClick={() => removeMember(m.id, m.full_name || m.email)}
                      className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                      title="Remove from organization"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
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
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
                      <Clock className="w-3 h-3" /> Pending
                    </span>
                    <span className="text-xs text-gray-500">{inv.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Orphan Users — registered without tenant */}
      {canManage && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Unassigned Users</h2>
                <p className="text-xs text-gray-500">Users who registered without an organization</p>
              </div>
            </div>
            <button onClick={loadOrphans} className="btn-secondary text-sm flex items-center gap-2">
              <Loader2 className={`w-4 h-4 ${loadingOrphans ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
          {loadingOrphans ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : orphanUsers.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-400 text-sm">
              No unassigned users
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {orphanUsers.map((u) => (
                <div key={u.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary-600">
                        {(u.full_name || u.email)[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{u.full_name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                  </div>
                  <button onClick={() => addOrphan(u.email)}
                    className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add to Org
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create User — Director+ directly creates user accounts */}
      {canManage && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                <User className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Create User</h2>
                <p className="text-xs text-gray-500">Directly create user accounts in your organization</p>
              </div>
            </div>
            <button onClick={() => setShowCreateUser(!showCreateUser)}
              className="btn-primary text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" /> {showCreateUser ? 'Cancel' : 'New User'}
            </button>
          </div>
          {showCreateUser && (
            <div className="px-6 py-4 space-y-3">
              <input type="text" placeholder="Full name *" className="input w-full text-sm"
                value={newUser.fullName} onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })} />
              <input type="email" placeholder="Email *" className="input w-full text-sm"
                value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
              <input type="password" placeholder="Temporary password * (min 6 chars)" className="input w-full text-sm"
                value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
              <select className="input w-full text-sm" value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <p className="text-xs text-amber-600">The user will use this password to log in. Share it securely.</p>
              <button onClick={createUser} disabled={creatingUser}
                className="btn-primary text-sm w-full flex items-center justify-center gap-2 disabled:opacity-50">
                {creatingUser ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : 'Create User Account'}
              </button>
            </div>
          )}
        </div>
      )}

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
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
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