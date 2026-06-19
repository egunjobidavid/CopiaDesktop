import { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Loader2 } from 'lucide-react';
import { staffApi } from '../../api/staff';
import { departmentsApi } from '../../api/departments';
import toast from 'react-hot-toast';

interface StaffMember {
  id: string; userId: string; jobTitle: string; employeeCode: string | null;
  departmentName: string | null; email: string; fullName: string;
  createdAt: string;
}

export function Staff() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [userId, setUserId] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [departmentId, setDepartmentId] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [sRes, dRes] = await Promise.all([staffApi.list(), departmentsApi.list()]);
      setStaff(sRes.data || []);
      setDepartments(dRes.data || []);
    } catch (_) {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => { setUserId(''); setJobTitle(''); setEmployeeCode(''); setDepartmentId(''); setShowCreate(false); };

  const handleCreate = async () => {
    if (!userId.trim() || !jobTitle.trim()) { toast.error('User ID and Job Title are required'); return; }
    try {
      await staffApi.create({ userId: userId.trim(), jobTitle: jobTitle.trim(), employeeCode: employeeCode.trim() || undefined, departmentId: departmentId || undefined });
      toast.success('Staff created');
      resetForm();
      load();
    } catch (err: any) { toast.error(err?.response?.data?.message || 'Failed to create'); }
  };

  const handleDelete = async (id: string) => {
    try { await staffApi.delete(id); toast.success('Removed'); load(); }
    catch (err: any) { toast.error(err?.response?.data?.message || 'Failed to delete'); }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff</h1>
          <p className="text-gray-500 mt-1">Manage your team members</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
          <Plus className="w-4 h-4" /> Add Staff
        </button>
      </div>

      {showCreate && (
        <div className="bg-white border rounded-xl p-5 mb-6">
          <h3 className="font-semibold mb-3">New Staff Member</h3>
          <div className="space-y-3">
            <input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="User UUID" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <div className="flex gap-3">
              <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Job Title" className="flex-1 px-3 py-2 border rounded-lg text-sm" />
              <input value={employeeCode} onChange={(e) => setEmployeeCode(e.target.value)} placeholder="Employee Code (optional)" className="flex-1 px-3 py-2 border rounded-lg text-sm" />
            </div>
            <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
              <option value="">No department</option>
              {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <div className="flex gap-2">
              <button onClick={handleCreate} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">Create</button>
              <button onClick={resetForm} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
      ) : (
        <div className="space-y-2">
          {staff.map((s) => (
            <div key={s.id} className="bg-white border rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center"><Users className="w-4 h-4 text-green-600" /></div>
                <div>
                  <span className="font-medium text-gray-900">{s.fullName || s.email || s.userId}</span>
                  <p className="text-xs text-gray-500">{s.jobTitle}{s.departmentName ? ` · ${s.departmentName}` : ''}{s.employeeCode ? ` · ${s.employeeCode}` : ''}</p>
                </div>
              </div>
              <button onClick={() => handleDelete(s.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
          {!staff.length && <p className="text-center text-gray-400 py-8 text-sm">No staff added yet</p>}
        </div>
      )}
    </div>
  );
}
