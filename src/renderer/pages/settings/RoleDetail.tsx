import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Shield } from 'lucide-react';
import { rolesApi } from '../../api/roles';
import toast from 'react-hot-toast';

const ALL_MODULES = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'pos', label: 'Point of Sale' },
  { id: 'products', label: 'Products' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'customers', label: 'Customers' },
  { id: 'sales', label: 'Sales Orders' },
  { id: 'invoices', label: 'Invoices' },
  { id: 'vendors', label: 'Vendors' },
  { id: 'procurement', label: 'Procurement' },
  { id: 'production', label: 'Production' },
  { id: 'expenses', label: 'Expenses' },
  { id: 'accounting', label: 'Accounting' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'reports', label: 'Reports' },
  { id: 'approvals', label: 'Approvals' },
  { id: 'support', label: 'Support' },
  { id: 'hr', label: 'HR' },
  { id: 'fixed_assets', label: 'Fixed Assets' },
  { id: 'multi_currency', label: 'Multi-Currency' },
];

const LEVEL_OPTIONS = [
  { value: 90, label: 'Director (90)' },
  { value: 70, label: 'VP (70)' },
  { value: 60, label: 'Manager (60)' },
  { value: 50, label: 'Team Lead (50)' },
  { value: 35, label: 'Senior (35)' },
  { value: 20, label: 'Junior (20)' },
  { value: 5, label: 'Viewer (5)' },
];

export function RoleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [role, setRole] = useState<any>(null);
  const [roleName, setRoleName] = useState('');
  const [roleLevel, setRoleLevel] = useState(50);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingMeta, setSavingMeta] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    rolesApi.get(id).then(({ data }) => {
      setRole(data);
      setRoleName(data.name || '');
      setRoleLevel(data.level || 50);
      setSelected(data.modules || []);
    }).catch(() => { navigate('/settings/roles'); }).finally(() => setLoading(false));
  }, [id, navigate]);

  const toggleModule = (moduleId: string) => {
    setSelected((prev) => prev.includes(moduleId) ? prev.filter((m) => m !== moduleId) : [...prev, moduleId]);
  };

  const handleSaveModules = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await rolesApi.setModules(id, selected);
      toast.success('Permissions updated');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update permissions');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveMeta = async () => {
    if (!id) return;
    if (!roleName.trim()) { toast.error('Role name is required'); return; }
    setSavingMeta(true);
    try {
      await rolesApi.update(id, { name: roleName.trim(), level: roleLevel });
      toast.success('Role details updated');
      setRole({ ...role, name: roleName.trim(), level: roleLevel });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update role');
    } finally {
      setSavingMeta(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-6">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/settings/roles')} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{role?.name}</h1>
          <p className="text-gray-500 text-sm">Edit role details and module permissions</p>
        </div>
      </div>

      {/* Role Details */}
      <div className="bg-white border rounded-xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-primary-600" />
          <h2 className="font-semibold text-gray-900">Role Details</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Role Name</label>
            <input value={roleName} onChange={(e) => setRoleName(e.target.value)} className="input" placeholder="e.g. Sales Manager" />
          </div>
          <div>
            <label className="label">Access Level</label>
            <select value={roleLevel} onChange={(e) => setRoleLevel(Number(e.target.value))} className="select">
              {LEVEL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">Higher levels can manage lower-level users</p>
          </div>
        </div>
        <div className="mt-4">
          <button onClick={handleSaveMeta} disabled={savingMeta} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium disabled:opacity-50">
            {savingMeta ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Role Details
          </button>
        </div>
      </div>

      {/* Module Permissions */}
      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Module Permissions</h2>
        <div className="grid grid-cols-2 gap-3">
          {ALL_MODULES.map((mod) => (
            <label key={mod.id} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input type="checkbox" checked={selected.includes(mod.id)} onChange={() => toggleModule(mod.id)} className="w-4 h-4 text-blue-600 rounded border-gray-300" />
              <span className="text-sm font-medium text-gray-700">{mod.label}</span>
            </label>
          ))}
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button onClick={handleSaveModules} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Permissions
          </button>
          <span className="text-xs text-gray-400">{selected.length} of {ALL_MODULES.length} modules enabled</span>
        </div>
      </div>
    </div>
  );
}
