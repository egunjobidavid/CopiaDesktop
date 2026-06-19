import { useState, useEffect } from 'react';
import { Building2, Plus, Trash2, Edit3, Loader2 } from 'lucide-react';
import { departmentsApi } from '../../api/departments';
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
  const [editId, setEditId] = useState<string | null>(null);
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
  };

  const handleEdit = (d: Department) => { setEditId(d.id); setName(d.name); setDescription(d.description || ''); setShowCreate(false); };

  const handleDelete = async (id: string) => {
    try { await departmentsApi.delete(id); toast.success('Deleted'); load(); }
    catch (err: any) { toast.error(err?.response?.data?.message || 'Failed to delete'); }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-500 mt-1">Organize your staff into departments</p>
        </div>
        <button onClick={() => { resetForm(); setShowCreate(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
          <Plus className="w-4 h-4" /> Add Department
        </button>
      </div>

      {(showCreate || editId) && (
        <div className="bg-white border rounded-xl p-5 mb-6">
          <h3 className="font-semibold mb-3">{editId ? 'Edit Department' : 'New Department'}</h3>
          <div className="space-y-3">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Department name" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} />
            <div className="flex gap-2">
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
          {departments.map((d) => (
            <div key={d.id} className="bg-white border rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center"><Building2 className="w-4 h-4 text-indigo-600" /></div>
                <div>
                  <span className="font-medium text-gray-900">{d.name}</span>
                  {d.description && <p className="text-xs text-gray-500">{d.description}</p>}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => handleEdit(d)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg"><Edit3 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(d.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          {!departments.length && <p className="text-center text-gray-400 py-8 text-sm">No departments yet</p>}
        </div>
      )}
    </div>
  );
}
