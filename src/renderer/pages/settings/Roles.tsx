import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Plus, Trash2, Lock, Unlock } from 'lucide-react';
import { rolesApi } from '../../api/roles';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { EmptyState } from '../../components/EmptyState';
import { ListSkeleton } from '../../components/Skeleton';
import { Breadcrumbs } from '../../components/Breadcrumbs';
import toast from 'react-hot-toast';

interface Role {
  id: string;
  name: string;
  level: number;
  isSystem: boolean;
  modules: string[];
}

export function Roles() {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
  const [newName, setNewName] = useState('');
  const [newLevel, setNewLevel] = useState('50');

  const loadRoles = () => {
    setLoading(true);
    rolesApi.list().then(({ data }) => setRoles(data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { loadRoles(); }, []);

  const handleCreate = async () => {
    if (!newName.trim()) { toast.error('Role name is required'); return; }
    setSubmitting(true);
    try {
      await rolesApi.create({ name: newName.trim(), level: parseInt(newLevel) });
      toast.success('Role created');
      setShowCreate(false);
      setNewName('');
      setNewLevel('50');
      loadRoles();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create role');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await rolesApi.delete(deleteTarget.id);
      toast.success('Role deleted');
      setDeleteTarget(null);
      loadRoles();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete role');
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      <div className="page-header">
        <div>
          <h1 className="page-title">Roles & Permissions</h1>
          <p className="page-subtitle">Manage roles and what modules each role can access</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Create Role
        </button>
      </div>

      {showCreate && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">New Custom Role</h3>
          <div className="flex gap-4">
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Role name (e.g. Finance Manager)" className="input flex-1" />
            <select value={newLevel} onChange={(e) => setNewLevel(e.target.value)} className="select w-32">
              <option value="90">Level 90</option>
              <option value="70">Level 70</option>
              <option value="50">Level 50</option>
              <option value="35">Level 35</option>
              <option value="20">Level 20</option>
              <option value="5">Level 5</option>
            </select>
            <button onClick={handleCreate} disabled={submitting} className="btn-primary">
              {submitting && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />}
              Create
            </button>
            <button onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <ListSkeleton rows={4} />
      ) : roles.length === 0 ? (
        <EmptyState icon={Shield} title="No roles yet" description="Create your first custom role" action={{ label: 'Create Role', onClick: () => setShowCreate(true) }} />
      ) : (
        <div className="space-y-3">
          {roles.map((role) => (
            <div key={role.id} className="card py-4 hover:border-primary-200 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{role.name}</span>
                      {role.isSystem ? (
                        <span className="badge badge-gray"><Lock className="w-3 h-3 mr-1" /> System</span>
                      ) : (
                        <span className="badge badge-success"><Unlock className="w-3 h-3 mr-1" /> Custom</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">Level {role.level} · {role.modules?.length || 0} modules</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => navigate(`/settings/roles/${role.id}`)} className="btn-ghost text-primary-600">
                    Edit Modules
                  </button>
                  {!role.isSystem && (
                    <button onClick={() => setDeleteTarget(role)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              {role.modules && role.modules.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {role.modules.map((mod) => (
                    <span key={mod} className="badge-primary">{mod}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Role"
        message={`Are you sure you want to delete the "${deleteTarget?.name}" role? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
