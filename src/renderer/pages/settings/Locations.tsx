import { useState, useEffect } from 'react';
import { MapPin, Plus, Loader2, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { locationsApi } from '../../api/locations';

interface Location {
  id: string; code: string; name: string; type: string;
  location: string; city: string | null; state: string | null; country: string;
  phone: string | null; email: string | null; isDefault: boolean; isActive: boolean;
}

const LOCATION_TYPES = [
  { value: 'head_office', label: 'Head Office' },
  { value: 'branch_office', label: 'Branch Office' },
  { value: 'shop', label: 'Shop' },
  { value: 'store', label: 'Store' },
  { value: 'warehouse', label: 'Warehouse' },
  { value: 'plant', label: 'Plant/Factory' },
  { value: 'depot', label: 'Depot' },
  { value: 'outlet', label: 'Outlet' },
];

export function Locations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Location | null>(null);
  const [form, setForm] = useState({
    code: '', name: '', type: 'shop', address: '', city: '', state: '', country: 'Nigeria',
    phone: '', email: '', isDefault: false,
  });

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await locationsApi.list();
      setLocations(Array.isArray(data) ? data : []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm({ code: '', name: '', type: 'shop', address: '', city: '', state: '', country: 'Nigeria', phone: '', email: '', isDefault: false });
    setEditing(null);
    setShowForm(false);
  };

  const handleCreate = async () => {
    if (!form.code.trim() || !form.name.trim()) { toast.error('Code and Name are required'); return; }
    try {
      const payload: any = {
        code: form.code.trim(), name: form.name.trim(), type: form.type,
        location: form.address.trim() || undefined, city: form.city.trim() || undefined,
        state: form.state.trim() || undefined, country: form.country.trim() || undefined,
        phone: form.phone.trim() || undefined, email: form.email.trim() || undefined,
        isDefault: form.isDefault,
      };
      if (editing) {
        await locationsApi.update(editing.id, payload);
        toast.success('Location updated');
      } else {
        await locationsApi.create(payload);
        toast.success('Location created');
      }
      resetForm();
      load();
    } catch (err: any) { toast.error(err?.response?.data?.message || 'Failed'); }
  };

  const handleEdit = (loc: Location) => {
    setEditing(loc);
    setForm({
      code: loc.code, name: loc.name, type: loc.type || 'shop',
      address: loc.location || '', city: loc.city || '', state: loc.state || '',
      country: loc.country || 'Nigeria', phone: loc.phone || '', email: loc.email || '',
      isDefault: loc.isDefault,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this location?')) return;
    try { await locationsApi.delete(id); toast.success('Deleted'); load(); }
    catch (err: any) { toast.error(err?.response?.data?.message || 'Failed'); }
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      head_office: 'bg-purple-100 text-purple-700',
      branch_office: 'bg-blue-100 text-blue-700',
      shop: 'bg-green-100 text-green-700',
      store: 'bg-orange-100 text-orange-700',
      warehouse: 'bg-gray-100 text-gray-700',
      plant: 'bg-red-100 text-red-700',
      depot: 'bg-yellow-100 text-yellow-700',
      outlet: 'bg-cyan-100 text-cyan-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Locations</h1>
          <p className="text-gray-500 mt-1">Manage your shops, offices, warehouses, and branches</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
          <Plus className="w-4 h-4" /> Add Location
        </button>
      </div>

      {showForm && (
        <div className="bg-white border rounded-xl p-5 mb-6">
          <h3 className="font-semibold mb-3">{editing ? 'Edit Location' : 'New Location'}</h3>
          <div className="space-y-3">
            <div className="flex gap-3">
              <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="Location Code *" className="flex-1 px-3 py-2 border rounded-lg text-sm" disabled={!!editing} />
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Location Name *" className="flex-1 px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div className="flex gap-3">
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="flex-1 px-3 py-2 border rounded-lg text-sm">
                {LOCATION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} className="rounded" />
                Default location
              </label>
            </div>
            <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Address" className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} />
            <div className="flex gap-3">
              <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City" className="flex-1 px-3 py-2 border rounded-lg text-sm" />
              <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="State" className="flex-1 px-3 py-2 border rounded-lg text-sm" />
              <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="Country" className="flex-1 px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div className="flex gap-3">
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="flex-1 px-3 py-2 border rounded-lg text-sm" />
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="flex-1 px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div className="flex gap-2">
              <button onClick={handleCreate} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">{editing ? 'Update' : 'Create'}</button>
              <button onClick={resetForm} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
      ) : (
        <div className="space-y-2">
          {locations.map((loc) => (
            <div key={loc.id} className="bg-white border rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center"><MapPin className="w-4 h-4 text-blue-600" /></div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{loc.name}</span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getTypeBadge(loc.type)}`}>
                      {loc.type?.replace('_', ' ')}
                    </span>
                    {loc.isDefault && <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">Default</span>}
                  </div>
                  <p className="text-xs text-gray-500">
                    {loc.code}{loc.location ? ` · ${loc.location}` : ''}{loc.city ? `, ${loc.city}` : ''}{loc.state ? `, ${loc.state}` : ''}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(loc)} className="p-2 text-gray-400 hover:text-blue-600 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(loc.id)} className="p-2 text-gray-400 hover:text-red-600 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          {!locations.length && <p className="text-center text-gray-400 py-8 text-sm">No locations yet. Add your first location to get started.</p>}
        </div>
      )}
    </div>
  );
}
