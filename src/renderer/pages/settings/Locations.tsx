import { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Edit3, Loader2 } from 'lucide-react';
import { locationsApi } from '../../api/locations';
import toast from 'react-hot-toast';

const LOCATION_TYPES = ['store', 'warehouse', 'office', 'other'];

interface Location {
  id: string; name: string; type: string;
  address: string | null; city: string | null; state: string | null; zip: string | null;
  isActive: boolean;
}

export function Locations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState('');
  const [form, setForm] = useState({ name: '', type: 'store', address: '', city: '', state: '', zip: '' });

  const load = () => {
    setLoading(true);
    locationsApi.list(filterType || undefined).then(({ data }) => setLocations(data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterType]);

  const resetForm = () => { setForm({ name: '', type: 'store', address: '', city: '', state: '', zip: '' }); setShowCreate(false); setEditId(null); };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    const payload = { ...form, name: form.name.trim(), address: form.address.trim() || undefined, city: form.city.trim() || undefined, state: form.state.trim() || undefined, zip: form.zip.trim() || undefined };
    try {
      if (editId) { await locationsApi.update(editId, payload); toast.success('Updated'); }
      else { await locationsApi.create(payload); toast.success('Created'); }
      resetForm(); load();
    } catch (err: any) { toast.error(err?.response?.data?.message || 'Failed to save'); }
  };

  const handleEdit = (l: Location) => { setEditId(l.id); setForm({ name: l.name, type: l.type, address: l.address || '', city: l.city || '', state: l.state || '', zip: l.zip || '' }); setShowCreate(false); };

  const handleDelete = async (id: string) => {
    try { await locationsApi.delete(id); toast.success('Deleted'); load(); }
    catch (err: any) { toast.error(err?.response?.data?.message || 'Failed to delete'); }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Locations</h1>
          <p className="text-gray-500 mt-1">Manage stores, warehouses, and offices</p>
        </div>
        <button onClick={() => { resetForm(); setShowCreate(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
          <Plus className="w-4 h-4" /> Add Location
        </button>
      </div>

      <div className="mb-4">
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
          <option value="">All types</option>
          {LOCATION_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>
      </div>

      {(showCreate || editId) && (
        <div className="bg-white border rounded-xl p-5 mb-6">
          <h3 className="font-semibold mb-3">{editId ? 'Edit Location' : 'New Location'}</h3>
          <div className="grid grid-cols-2 gap-3">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Location name" className="px-3 py-2 border rounded-lg text-sm" />
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="px-3 py-2 border rounded-lg text-sm">
              {LOCATION_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
            <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Address" className="px-3 py-2 border rounded-lg text-sm col-span-2" />
            <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City" className="px-3 py-2 border rounded-lg text-sm" />
            <div className="flex gap-3">
              <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="State" className="flex-1 px-3 py-2 border rounded-lg text-sm" />
              <input value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} placeholder="ZIP" className="flex-1 px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div className="flex gap-2 col-span-2">
              <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">Save</button>
              <button onClick={resetForm} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
      ) : (
        <div className="space-y-2">
          {locations.map((l) => (
            <div key={l.id} className="bg-white border rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center"><MapPin className="w-4 h-4 text-amber-600" /></div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{l.name}</span>
                    <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">{l.type}</span>
                  </div>
                  <p className="text-xs text-gray-500">{l.address || 'No address'}{l.city ? `, ${l.city}` : ''}{l.state ? `, ${l.state}` : ''}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => handleEdit(l)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg"><Edit3 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(l.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          {!locations.length && <p className="text-center text-gray-400 py-8 text-sm">No locations yet</p>}
        </div>
      )}
    </div>
  );
}
