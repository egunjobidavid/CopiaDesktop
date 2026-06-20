import { useState, useEffect } from 'react';
import { Users, Plus, Trash2, UserCog, Edit3 } from 'lucide-react';
import { staffApi } from '../../api/staff';
import { departmentsApi } from '../../api/departments';
import { locationsApi } from '../../api/locations';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { EmptyState } from '../../components/EmptyState';
import { ListSkeleton } from '../../components/Skeleton';
import { Breadcrumbs } from '../../components/Breadcrumbs';
import toast from 'react-hot-toast';

interface StaffMember {
  id: string; userId: string; jobTitle: string; employeeCode: string | null;
  departmentName: string | null; locationName: string | null; email: string; fullName: string;
  departmentId: string | null; defaultLocationId: string | null;
  createdAt: string;
}

export function Staff() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<StaffMember | null>(null);
  const [search, setSearch] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [defaultLocationId, setDefaultLocationId] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [sRes, dRes, lRes] = await Promise.all([staffApi.list(), departmentsApi.list(), locationsApi.list()]);
      setStaff(sRes.data || []);
      setDepartments(dRes.data || []);
      setLocations(Array.isArray(lRes.data) ? lRes.data : []);
    } catch (_) {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => { setEmail(''); setFullName(''); setJobTitle(''); setEmployeeCode(''); setDepartmentId(''); setDefaultLocationId(''); setShowCreate(false); };

  const handleCreate = async () => {
    if (!email.trim()) { toast.error('Email is required'); return; }
    if (!jobTitle.trim()) { toast.error('Job Title is required'); return; }
    setSubmitting(true);
    try {
      await staffApi.create({
        email: email.trim(), fullName: fullName.trim() || undefined,
        jobTitle: jobTitle.trim(), employeeCode: employeeCode.trim() || undefined,
        departmentId: departmentId || undefined, defaultLocationId: defaultLocationId || undefined,
      });
      toast.success('Staff member created');
      resetForm();
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create staff member');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await staffApi.delete(deleteTarget.id); toast.success('Staff member removed'); setDeleteTarget(null); load(); }
    catch (err: any) { toast.error(err?.response?.data?.message || 'Failed to delete'); }
  };

  const filtered = staff.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (s.fullName || '').toLowerCase().includes(q) || (s.email || '').toLowerCase().includes(q) || (s.jobTitle || '').toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      <div className="page-header">
        <div>
          <h1 className="page-title">Staff</h1>
          <p className="page-subtitle">Manage your team members and their locations</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Staff
        </button>
      </div>

      {/* Search */}
      {!loading && staff.length > 0 && (
        <div className="flex items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search staff..."
            className="input max-w-sm"
          />
          <span className="text-sm text-gray-500">{filtered.length} of {staff.length}</span>
        </div>
      )}

      {/* Create Form */}
      {showCreate && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">New Staff Member</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Email *</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="staff@company.com" className="input" type="email" />
              </div>
              <div>
                <label className="label">Full Name</label>
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" className="input" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Job Title *</label>
                <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Sales Rep" className="input" />
              </div>
              <div>
                <label className="label">Employee Code</label>
                <input value={employeeCode} onChange={(e) => setEmployeeCode(e.target.value)} placeholder="EMP-001" className="input" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Department</label>
                <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} className="select">
                  <option value="">No department</option>
                  {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Location</label>
                <select value={defaultLocationId} onChange={(e) => setDefaultLocationId(e.target.value)} className="select">
                  <option value="">No location</option>
                  {locations.map((l: any) => <option key={l.id} value={l.id}>{l.name}{l.city ? ` (${l.city})` : ''}</option>)}
                </select>
              </div>
            </div>
            <p className="text-xs text-gray-400">If the email is not yet registered, a new user account will be created with password &quot;changeme123&quot;.</p>
            <div className="flex gap-3 pt-2">
              <button onClick={handleCreate} disabled={submitting} className="btn-primary">
                {submitting && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />}
                Create Staff
              </button>
              <button onClick={resetForm} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Staff List */}
      {loading ? (
        <ListSkeleton rows={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={search ? 'No staff found' : 'No staff members yet'}
          description={search ? 'Try a different search term' : 'Add your first team member to get started'}
          action={!search ? { label: 'Add Staff', onClick: () => setShowCreate(true) } : undefined}
        />
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="table-header text-left">Name</th>
                <th className="table-header text-left">Job Title</th>
                <th className="table-header text-left">Department</th>
                <th className="table-header text-left">Location</th>
                <th className="table-header text-left">Code</th>
                <th className="table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-semibold">
                        {(s.fullName || s.email || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{s.fullName || '—'}</p>
                        <p className="text-xs text-gray-500">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">{s.jobTitle}</td>
                  <td className="table-cell">{s.departmentName || '—'}</td>
                  <td className="table-cell">{s.locationName || '—'}</td>
                  <td className="table-cell text-gray-500">{s.employeeCode || '—'}</td>
                  <td className="table-cell text-right">
                    <button
                      onClick={() => setDeleteTarget(s)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove Staff Member"
        message={`Are you sure you want to remove ${deleteTarget?.fullName || deleteTarget?.email || 'this staff member'}? This action cannot be undone.`}
        confirmLabel="Remove"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
