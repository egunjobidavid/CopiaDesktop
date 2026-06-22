import { useState, useEffect } from 'react';
import api from '../../api/client';
import { PageHeader } from '../../components/PageHeader';
import toast from 'react-hot-toast';
import { Settings, Plus, Trash2, Edit, CheckCircle, XCircle, Loader2, X } from 'lucide-react';

interface DeductionConfig {
  id: string;
  name: string;
  code: string;
  type: string;
  value: number;
  is_taxable: boolean;
  is_active: boolean;
}

export function Deductions() {
  const [deductions, setDeductions] = useState<DeductionConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<DeductionConfig | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<DeductionConfig | null>(null);

  const [form, setForm] = useState({
    name: '',
    code: '',
    type: 'percentage',
    value: '',
    isTaxable: true,
    isActive: true,
  });

  useEffect(() => { loadDeductions(); }, []);

  const loadDeductions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/hr/deduction-configs');
      setDeductions(res.data?.data || res.data || []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load deductions');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ name: '', code: '', type: 'percentage', value: '', isTaxable: true, isActive: true });
  };

  const openCreate = () => { resetForm(); setEditing(null); setShowForm(true); };

  const openEdit = (item: DeductionConfig) => {
    setEditing(item);
    setForm({
      name: item.name,
      code: item.code,
      type: item.type,
      value: item.value?.toString() || '',
      isTaxable: item.is_taxable,
      isActive: item.is_active,
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    if (!form.code.trim()) { toast.error('Code is required'); return; }
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        code: form.code,
        type: form.type,
        value: Number(form.value) || 0,
        is_taxable: form.isTaxable,
        is_active: form.isActive,
      };
      if (editing) {
        await api.patch(`/hr/deduction-configs/${editing.id}`, payload);
        toast.success('Deduction updated');
      } else {
        await api.post('/hr/deduction-configs', payload);
        toast.success('Deduction created');
      }
      setShowForm(false);
      loadDeductions();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save deduction');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await api.delete(`/hr/deduction-configs/${deleteConfirm.id}`);
      toast.success('Deduction deleted');
      setDeleteConfirm(null);
      loadDeductions();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete deduction');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Deduction Configuration"
        subtitle="Configure payroll deductions"
        action={{ label: 'Add Deduction', onClick: openCreate }}
      />

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin mx-auto" />
          </div>
        ) : deductions.length === 0 ? (
          <div className="p-12 text-center">
            <Settings className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No deductions configured</p>
            <button onClick={openCreate} className="mt-2 text-primary-600 text-sm font-medium hover:underline">Add your first deduction</button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Code</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Value</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Taxable</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Active</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {deductions.map((item) => (
                <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">{item.name}</td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-600">{item.code}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                      {item.type === 'percentage' ? '%' : 'Fixed'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900">
                    {item.type === 'percentage' ? `${item.value}%` : `₦${(item.value || 0).toLocaleString()}`}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {item.is_taxable ? (
                      <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-300 mx-auto" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {item.is_active ? (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>
                    ) : (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">Inactive</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(item)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteConfirm(item)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{editing ? 'Edit Deduction' : 'Add Deduction'}</h3>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Pension Contribution" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                  <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. PENS" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                  <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder="0" min="0" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                </div>
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isTaxable} onChange={(e) => setForm({ ...form, isTaxable: e.target.checked })} className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                  <span className="text-sm text-gray-700">Is Taxable</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                  <span className="text-sm text-gray-700">Is Active</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleSubmit} disabled={submitting} className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {editing ? 'Save Changes' : 'Create Deduction'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Deduction</h3>
            <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
