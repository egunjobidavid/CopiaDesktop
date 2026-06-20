import { useState, useEffect } from 'react';
import { Building2, Plus, Trash2, Edit3 } from 'lucide-react';
import { departmentsApi } from '../../api/departments';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { EmptyState } from '../../components/EmptyState';
import { ListSkeleton } from '../../components/Skeleton';
import { Breadcrumbs } from '../../components/Breadcrumbs';
import toast from 'react-hot-toast';

interface Department {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}

export function Departments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const load = () => {
    setLoading(true);
    departmentsApi.list().then(({ data }) => setDepartments(data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => { setName(''); setDescription(''); setShowCreate(false); setEditId(null); };

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Name is required'); return; }
    setSubmitting(true);
    try {
      if (editId) {
        await departmentsApi.update(editId, { name: name.trim(), description: description.trim() || undefined });
        toast.success('Department updated');
      } else {
        await departmentsApi.create({ name: name.trim(), description: description.trim() || undefined });
        toast.success('Department created');
      }
      resetForm();
      load();
    } catch (err: any) { toast.error(err?.response?.data?.message || 'Failed to save'); }
    finally { setSubmitting(false); }
  };

  const handleEdit = (d: Department) => { setEditId(d.id); setName(d.name); setDescription(d.description || ''); setShowCreate(false); };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await departmentsApi.delete(deleteTarget.id); toast.success('Department deleted'); setDeleteTarget(null); load(); }
    catch (err: any) { toast.error(err?.response?.data?.message || 'Failed to delete'); }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      <div className="page-header">
        <div>
          <h1 className="page-title">Departments</h1>
          <p className="page-subtitle">Organize your staff into departments</p>
        </div>
        <button onClick={() => { resetForm(); setShowCreate(true); }} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Department
        </button>
      </div>

      {(showCreate || editId) && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{editId ? 'Edit Department' : 'New Department'}</h3>
          <div className="space-y-4">
            <div>
              <label className="label">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sales, Operations" className="input" />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" className="input" rows={2} />
            </div>
            <div className="flex gap-3">
              <button onClick={handleSave} disabled={submitting} className="btn-primary">
                {submitting && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />}
                Save
              </button>
              <button onClick={resetForm} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <ListSkeleton rows={4} />
      ) : departments.length === 0 ? (
        <EmptyState icon={Building2} title="No departments yet" description="Create your first department" action={{ label: 'Add Department', onClick: () => setShowCreate(true) }} />
      ) : (
        <div className="space-y-3">
          {departments.map((d) => (
            <div key={d.id} className="card py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-xl flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-medium text-gray-900">{d.name}</span>
                  {d.description && <p className="text-sm text-gray-500">{d.description}</p>}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => handleEdit(d)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button onClick={() => setDeleteTarget(d)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Department"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
