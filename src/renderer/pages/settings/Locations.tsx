import { useState, useEffect } from 'react';
import { MapPin, Plus, Pencil, Trash2, X, AlertTriangle } from 'lucide-react';
import { locationsApi } from '../../api/locations';
import { useAuthStore } from '../../store/auth.store';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { EmptyState } from '../../components/EmptyState';
import { ListSkeleton } from '../../components/Skeleton';
import { Breadcrumbs } from '../../components/Breadcrumbs';
import toast from 'react-hot-toast';

const LOCATION_LIMITS: Record<string, number> = {
  free: 1, growth: 3, professional: 15, enterprise: 999,
};

const LOCATION_TYPES = [
  { value: 'head_office', label: 'Head Office' },
  { value: 'branch_office', label: 'Branch Office' },
  { value: 'shop', label: 'Shop' },
  { value: 'store', label: 'Store' },
  { value: 'warehouse', label: 'Warehouse' },
  { value: 'plant', label: 'Plant / Factory' },
  { value: 'depot', label: 'Depot' },
  { value: 'outlet', label: 'Outlet' },
];

const TYPE_COLORS: Record<string, string> = {
  head_office: 'bg-purple-100 text-purple-700',
  branch_office: 'bg-blue-100 text-blue-700',
  shop: 'bg-green-100 text-green-700',
  store: 'bg-orange-100 text-orange-700',
  warehouse: 'bg-gray-100 text-gray-700',
  plant: 'bg-red-100 text-red-700',
  depot: 'bg-amber-100 text-amber-700',
  outlet: 'bg-cyan-100 text-cyan-700',
};

interface Location {
  id: string; code: string; name: string; type: string | null;
  isDefault: boolean | null; location: string | null;
  city: string | null; state: string | null; country: string | null;
  phone: string | null; email: string | null;
}

const defaultForm = { code: '', name: '', type: 'shop', isDefault: false, location: '', city: '', state: '', country: 'Nigeria', phone: '', email: '' };

export function Locations() {
  const user = useAuthStore((s) => s.user);
  const plan = (user as any)?.plan || 'free';
  const maxLocations = LOCATION_LIMITS[plan] || 1;

  const [locations, setLocations] = useState<Location[]>([]);
  const atLimit = locations.length >= maxLocations;
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Location | null>(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(defaultForm);

  const load = async () => {
    setLoading(true);
    try { const { data } = await locationsApi.list(); setLocations(Array.isArray(data) ? data : []); }
    catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const set = (key: string, val: any) => setForm((prev) => ({ ...prev, [key]: val }));

  const resetForm = () => { setForm(defaultForm); setEditId(null); setShowForm(false); };

  const handleEdit = (loc: Location) => {
    setForm({
      code: loc.code, name: loc.name, type: loc.type || 'shop',
      isDefault: loc.isDefault || false, location: loc.location || '',
      city: loc.city || '', state: loc.state || '', country: loc.country || 'Nigeria',
      phone: loc.phone || '', email: loc.email || '',
    });
    setEditId(loc.id);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.code.trim()) { toast.error('Code is required'); return; }
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSubmitting(true);
    try {
      if (editId) {
        const { code, ...updateData } = form;
        await locationsApi.update(editId, updateData);
        toast.success('Location updated');
      } else {
        await locationsApi.create(form);
        toast.success('Location created');
      }
      resetForm(); load();
    } catch (err: any) { toast.error(err?.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await locationsApi.delete(deleteTarget.id); toast.success('Location deleted'); setDeleteTarget(null); load(); }
    catch (err: any) { toast.error(err?.response?.data?.message || 'Failed'); }
  };

  const filtered = locations.filter((l) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return l.name.toLowerCase().includes(q) || l.code.toLowerCase().includes(q) || (l.city || '').toLowerCase().includes(q);
  });

  const inputClass = 'input';

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      <div className="page-header">
        <div>
          <h1 className="page-title">Locations</h1>
          <p className="page-subtitle">Manage your warehouses, shops, offices, and branches</p>
          {plan !== 'enterprise' && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 max-w-xs bg-gray-200 rounded-full h-2">
                <div className={`h-2 rounded-full ${atLimit ? 'bg-red-500' : 'bg-primary-500'}`} style={{ width: `${Math.min(100, (locations.length / maxLocations) * 100)}%` }} />
              </div>
              <span className={`text-xs font-medium ${atLimit ? 'text-red-600' : 'text-gray-500'}`}>
                {locations.length} of {maxLocations} locations
              </span>
              {atLimit && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
            </div>
          )}
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} disabled={atLimit} className={`btn-primary ${atLimit ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <Plus className="w-4 h-4" /> Add Location
        </button>
      </div>

      {/* Search */}
      {!loading && locations.length > 0 && (
        <div className="flex items-center gap-3">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search locations..." className="input max-w-sm" />
          <span className="text-sm text-gray-500">{filtered.length} of {locations.length}</span>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{editId ? 'Edit Location' : 'New Location'}</h3>
            <button onClick={resetForm} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div><label className="label">Code *</label><input value={form.code} onChange={(e) => set('code', e.target.value)} placeholder="LOC-001" className={inputClass} disabled={!!editId} /></div>
              <div><label className="label">Name *</label><input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Main Store" className={inputClass} /></div>
              <div><label className="label">Type</label>
                <select value={form.type} onChange={(e) => set('type', e.target.value)} className="select">
                  {LOCATION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>
            <div><label className="label">Address</label><textarea value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="123 Main Street" className={inputClass} rows={2} /></div>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="label">City</label><input value={form.city} onChange={(e) => set('city', e.target.value)} className={inputClass} /></div>
              <div><label className="label">State</label><input value={form.state} onChange={(e) => set('state', e.target.value)} className={inputClass} /></div>
              <div><label className="label">Country</label><input value={form.country} onChange={(e) => set('country', e.target.value)} className={inputClass} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Phone</label><input value={form.phone} onChange={(e) => set('phone', e.target.value)} className={inputClass} /></div>
              <div><label className="label">Email</label><input value={form.email} onChange={(e) => set('email', e.target.value)} className={inputClass} /></div>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={form.isDefault} onChange={(e) => set('isDefault', e.target.checked)} className="rounded border-gray-300 text-primary-600" />
              Set as default location
            </label>
            <div className="flex gap-3 pt-2">
              <button onClick={handleSubmit} disabled={submitting} className="btn-primary">
                {submitting && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />}
                {editId ? 'Save Changes' : 'Create Location'}
              </button>
              <button onClick={resetForm} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <ListSkeleton rows={4} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title={search ? 'No locations found' : 'No locations yet'}
          description={search ? 'Try a different search' : 'Create your first location to start tracking inventory'}
          action={!search ? { label: 'Add Location', onClick: () => setShowForm(true) } : undefined}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((loc) => (
            <div key={loc.id} className="card py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{loc.name}</span>
                    {loc.type && <span className={`badge ${TYPE_COLORS[loc.type] || 'badge-gray'}`}>{loc.type.replace(/_/g, ' ')}</span>}
                    {loc.isDefault && <span className="badge badge-success">Default</span>}
                  </div>
                  <p className="text-sm text-gray-500">
                    {loc.code}
                    {loc.city ? ` · ${loc.city}` : ''}
                    {loc.state ? `, ${loc.state}` : ''}
                    {loc.country ? ` · ${loc.country}` : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => handleEdit(loc)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => setDeleteTarget(loc)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Location"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
