import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Plus, Trash2, Lock, Unlock, Loader2 } from 'lucide-react';
import { rolesApi } from '../../api/roles';
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
  const [newName, setNewName] = useState('');
  const [newLevel, setNewLevel] = useState('50');

  const loadRoles = () => {
    setLoading(true);
    rolesApi.list().then(({ data }) => setRoles(data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { loadRoles(); }, []);

  const handleCreate = async () => {
    if (!newName.trim()) { toast.error('Role name is required'); return; }
    try {
      await rolesApi.create({ name: newName.trim(), level: parseInt(newLevel) });
      toast.success('Role created');
      setShowCreate(false);
      setNewName('');
      setNewLevel('50');
      loadRoles();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create role');
    }
  };

  const handleDelete = async (role: Role) => {
    if (role.isSystem) { toast.error('Cannot delete system roles'); return; }
    try {
      await rolesApi.delete(role.id);
      toast.success('Role deleted');
      loadRoles();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete role');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
          <p className="text-gray-500 mt-1">Manage roles and what modules each role can access</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
          <Plus className="w-4 h-4" /> Create Role
        </button>
      </div>

      {showCreate && (
        <div className="bg-white border rounded-xl p-6 mb-6">
          <h3 className="font-semibold mb-4">New Custom Role</h3>
          <div className="flex gap-4">
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Role name (e.g. Finance Manager)" className="flex-1 px-3 py-2 border rounded-lg text-sm" />
            <select value={newLevel} onChange={(e) => setNewLevel(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
              <option value="90">Level 90</option>
              <option value="70">Level 70</option>
              <option value="50">Level 50</option>
              <option value="35">Level 35</option>
              <option value="20">Level 20</option>
              <option value="5">Level 5</option>
            </select>
            <button onClick={handleCreate} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">Create</button>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
      ) : (
        <div className="space-y-3">
          {roles.map((role) => (
            <div key={role.id} className="bg-white border rounded-xl p-5 hover:border-blue-200 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{role.name}</span>
                      {role.isSystem ? (
                        <span className="flex items-center gap-1 text-xs text-gray-400"><Lock className="w-3 h-3" /> System</span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-green-500"><Unlock className="w-3 h-3" /> Custom</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">Level {role.level} · {role.modules?.length || 0} modules</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => navigate(`/settings/roles/${role.id}`)} className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg">Edit Modules</button>
                  {!role.isSystem && (
                    <button onClick={() => handleDelete(role)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  )}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(role.modules || []).map((mod) => (
                  <span key={mod} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{mod}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
