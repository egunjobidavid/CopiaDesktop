import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Loader2, Plus, ThumbsUp, ThumbsDown, Settings2 } from 'lucide-react';
import api from '../../api/client';
import { useAuthStore } from '../../store/auth.store';
import toast from 'react-hot-toast';

const ROLE_HIERARCHY: Record<string, number> = { MD: 100, admin: 60, Director: 80, Manager: 60, Accountant: 40, 'Sales Rep': 30, member: 30, Staff: 10, viewer: 5 };

function hasMinRole(userRole: string, minRole: string) {
  return (ROLE_HIERARCHY[userRole] ?? 0) >= (ROLE_HIERARCHY[minRole] ?? 0);
}

export function Approvals() {
  const user = useAuthStore((s) => s.user);
  const userRole = user?.role ?? 'Staff';
  const canApprove = hasMinRole(userRole, 'Manager');
  const canManageRules = hasMinRole(userRole, 'Director');

  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ entityType: 'purchase_order', amount: 0, reason: '' });
  const [submitting, setSubmitting] = useState(false);
  const [rules, setRules] = useState<any[]>([]);
  const [showRules, setShowRules] = useState(false);
  const [ruleForm, setRuleForm] = useState({ entityType: 'purchase_order', minAmount: 0, requiredApprovers: 1 });

  const loadRequests = () => {
    setLoading(true);
    api.get(`/approvals?status=${filter}`).then(({ data }) => {
      const items = data?.data ? (Array.isArray(data.data) ? data.data : []) : (Array.isArray(data) ? data : []);
      setRequests(items);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  const loadRules = () => {
    api.get('/approvals/rules').then(({ data }) => {
      setRules(Array.isArray(data) ? data : []);
    }).catch(() => {});
  };

  useEffect(() => { loadRequests(); }, [filter]);

  const handleVote = async (id: string, decision: string) => {
    try {
      const { data } = await api.patch(`/approvals/${id}/vote`, { decision });
      toast.success(data.message);
      loadRequests();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Vote failed');
    }
  };

  const handleCreate = async () => {
    if (!form.amount || !form.reason) { toast.error('Amount and reason required'); return; }
    setSubmitting(true);
    try {
      await api.post('/approvals', form);
      toast.success('Approval request created');
      setShowCreate(false);
      setForm({ entityType: 'purchase_order', amount: 0, reason: '' });
      loadRequests();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRuleSave = async () => {
    try {
      await api.post('/approvals/rules', ruleForm);
      toast.success('Rule saved');
      loadRules();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save rule');
    }
  };

  const statusBadge = (status: string) => {
    const s: Record<string, string> = { pending: 'bg-amber-100 text-amber-700', approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700' };
    return <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${s[status] || ''}`}>{status}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Approvals</h1>
          <p className="text-gray-500 mt-1">Manage approval requests for purchases, payments, and expenses</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowRules(!showRules)} className="btn-secondary text-sm flex items-center gap-2">
            <Settings2 className="w-4 h-4" /> Rules
          </button>
          <button onClick={() => setShowCreate(true)} className="btn-primary text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Request
          </button>
        </div>
      </div>

      {/* Rules Panel */}
      {showRules && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Approval Rules</h2>
          <div className="space-y-4">
            {['purchase_order', 'payment', 'expense'].map((et) => {
              const existing = rules.find((r) => r.entity_type === et);
              return (
                <div key={et} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                  <span className="text-sm font-medium capitalize min-w-[140px]">{et.replace('_', ' ')}</span>
                  <input type="number" placeholder="Min amount" className="input text-sm flex-1"
                    defaultValue={existing?.min_amount || 0}
                    onBlur={(e) => setRuleForm({ ...ruleForm, entityType: et, minAmount: Number(e.target.value) })} />
                  <input type="number" placeholder="Required approvers" className="input text-sm w-24"
                    defaultValue={existing?.required_approvers || 1}
                    onBlur={(e) => setRuleForm({ ...ruleForm, entityType: et, requiredApprovers: Number(e.target.value) })} />
                </div>
              );
            })}
            <button onClick={handleRuleSave} className="btn-primary text-sm">Save Rules</button>
          </div>
        </div>
      )}

      {/* Create Form */}
      {showCreate && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">New Approval Request</h2>
          <div className="space-y-3 max-w-md">
            <select className="input w-full text-sm" value={form.entityType} onChange={(e) => setForm({ ...form, entityType: e.target.value })}>
              <option value="purchase_order">Purchase Order</option>
              <option value="payment">Payment</option>
              <option value="expense">Expense</option>
            </select>
            <input type="number" placeholder="Amount *" className="input w-full text-sm" value={form.amount || ''} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
            <textarea placeholder="Reason for approval *" className="input w-full text-sm min-h-[80px]" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
            <div className="flex gap-2">
              <button onClick={handleCreate} disabled={submitting} className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50">
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : 'Submit Request'}
              </button>
              <button onClick={() => setShowCreate(false)} className="btn-secondary text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2">
        {['pending', 'approved', 'rejected'].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${filter === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>
        ))}
      </div>

      {/* Requests list */}
      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : requests.length === 0 ? (
        <div className="card text-center text-gray-400 py-12">No {filter} requests</div>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <div key={r.id} className="card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    {r.status === 'pending' ? <Clock className="w-5 h-5 text-blue-600" /> : r.status === 'approved' ? <CheckCircle className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-red-600" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 capitalize">{r.entity_type.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-gray-500">{r.reason || 'No reason provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-semibold">₦{Number(r.amount).toLocaleString()}</p>
                  {statusBadge(r.status)}
                  <p className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString('en-GB')}</p>
                  {r.status === 'pending' && canApprove && (
                    <div className="flex gap-1">
                      <button onClick={() => handleVote(r.id, 'approved')} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Approve"><ThumbsUp className="w-4 h-4" /></button>
                      <button onClick={() => handleVote(r.id, 'rejected')} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Reject"><ThumbsDown className="w-4 h-4" /></button>
                    </div>
                  )}
                </div>
              </div>
              {r.votes?.length > 0 && (
                <div className="mt-2 pl-[52px] flex gap-2">
                  {r.votes.map((v: any) => (
                    <span key={v.id} className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${v.decision === 'approved' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {v.decision === 'approved' ? <ThumbsUp className="w-3 h-3" /> : <ThumbsDown className="w-3 h-3" />}
                      Vote
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
