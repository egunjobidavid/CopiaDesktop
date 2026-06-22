import { useState, useEffect } from 'react';
import api from '../../api/client';
import { PageHeader } from '../../components/PageHeader';
import toast from 'react-hot-toast';
import { UserCheck, Plus, CheckCircle, Circle, Loader2, ClipboardList, X } from 'lucide-react';

interface Employee {
  id: string;
  employee_code: string;
  full_name: string;
}

interface OnboardingItem {
  id: string;
  item_text: string;
  is_completed: boolean;
  completed_at: string | null;
}

interface OnboardingProgress {
  total: number;
  completed: number;
  percentage: number;
}

export function Onboarding() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [checklist, setChecklist] = useState<OnboardingItem[]>([]);
  const [loadingChecklist, setLoadingChecklist] = useState(false);
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newItems, setNewItems] = useState('');
  const [creatingItems, setCreatingItems] = useState(false);

  useEffect(() => { loadEmployees(); }, []);

  useEffect(() => {
    if (selectedEmployeeId) {
      loadChecklist();
      loadProgress();
    }
  }, [selectedEmployeeId]);

  const loadEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const res = await api.get('/hr/employees');
      setEmployees(res.data?.data || res.data || []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load employees');
    } finally {
      setLoadingEmployees(false);
    }
  };

  const loadChecklist = async () => {
    try {
      setLoadingChecklist(true);
      const res = await api.get(`/hr/onboarding/${selectedEmployeeId}`);
      setChecklist(res.data?.data || res.data || []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load onboarding checklist');
    } finally {
      setLoadingChecklist(false);
    }
  };

  const loadProgress = async () => {
    try {
      const res = await api.get(`/hr/onboarding/${selectedEmployeeId}/progress`);
      setProgress(res.data?.data || res.data || null);
    } catch {
      // Progress endpoint may not exist yet, silently ignore
    }
  };

  const handleToggleItem = async (item: OnboardingItem) => {
    try {
      await api.post(`/hr/onboarding/${item.id}/complete`);
      setChecklist((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? { ...i, is_completed: !i.is_completed, completed_at: !i.is_completed ? new Date().toISOString() : null }
            : i
        )
      );
      if (item.is_completed) {
        // Uncompleting
        setProgress((prev) => {
          if (!prev) return prev;
          return { ...prev, completed: Math.max(0, prev.completed - 1), percentage: Math.max(0, prev.percentage - (100 / prev.total)) };
        });
      } else {
        // Completing
        setProgress((prev) => {
          if (!prev) return prev;
          const newCompleted = prev.completed + 1;
          return { ...prev, completed: newCompleted, percentage: Math.round((newCompleted / prev.total) * 100) };
        });
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update item');
    }
  };

  const handleCreateChecklist = async () => {
    if (!newItems.trim()) { toast.error('Enter at least one item'); return; }
    setCreatingItems(true);
    try {
      const items = newItems
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
      if (items.length === 0) { toast.error('Enter at least one item'); setCreatingItems(false); return; }
      await api.post(`/hr/onboarding/${selectedEmployeeId}`, { items });
      toast.success(`${items.length} item(s) added`);
      setShowCreateModal(false);
      setNewItems('');
      loadChecklist();
      loadProgress();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create checklist');
    } finally {
      setCreatingItems(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employee Onboarding"
        subtitle="Track new employee onboarding progress"
      />

      {/* Employee Selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Employee</label>
        {loadingEmployees ? (
          <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
        ) : (
          <select
            value={selectedEmployeeId}
            onChange={(e) => setSelectedEmployeeId(e.target.value)}
            className="w-full max-w-md border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">-- Select an employee --</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.full_name} ({emp.employee_code})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Onboarding Content */}
      {selectedEmployeeId && (
        <>
          {/* Progress Bar */}
          {progress && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">Onboarding Progress</p>
                <p className="text-sm text-gray-600">{progress.completed} of {progress.total} completed</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress.percentage || 0}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{progress.percentage || 0}% complete</p>
            </div>
          )}

          {/* Checklist */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-900">Onboarding Checklist</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Items
              </button>
            </div>

            {loadingChecklist ? (
              <div className="p-12 text-center">
                <Loader2 className="w-8 h-8 text-primary-600 animate-spin mx-auto" />
              </div>
            ) : checklist.length === 0 ? (
              <div className="p-12 text-center">
                <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No onboarding items yet</p>
                <button onClick={() => setShowCreateModal(true)} className="mt-2 text-primary-600 text-sm font-medium hover:underline">Add checklist items</button>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {checklist.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                    <button onClick={() => handleToggleItem(item)} className="flex-shrink-0">
                      {item.is_completed ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300 hover:text-gray-400" />
                      )}
                    </button>
                    <span className={`text-sm ${item.is_completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                      {item.item_text}
                    </span>
                    {item.completed_at && (
                      <span className="text-xs text-gray-400 ml-auto">
                        {new Date(item.completed_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Create Items Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Add Onboarding Items</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-3">Enter one item per line:</p>
              <textarea
                value={newItems}
                onChange={(e) => setNewItems(e.target.value)}
                rows={8}
                placeholder={"Complete tax forms\nSet up direct deposit\nSign employee handbook\nSubmit ID verification\nReview company policies"}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
              />
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleCreateChecklist} disabled={creatingItems} className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2">
                {creatingItems && <Loader2 className="w-4 h-4 animate-spin" />}
                Add Items
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
