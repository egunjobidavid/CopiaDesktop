import { useState, useEffect } from 'react';
import api from '../../api/client';
import { PageHeader } from '../../components/PageHeader';
import toast from 'react-hot-toast';
import { Repeat, Plus, Trash2, Play, Loader2, X } from 'lucide-react';

interface RecurringTask {
  id: string;
  title: string;
  description: string;
  project_id: string;
  project_name: string;
  recurrence_type: string;
  interval: number;
  next_due_date: string;
  status: string;
  created_at: string;
}

export function RecurringTasks() {
  const [tasks, setTasks] = useState<RecurringTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    projectId: '',
    recurrenceType: 'daily',
    interval: '1',
    nextDueDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => { loadTasks(); }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/projects/recurring-tasks');
      setTasks(res.data?.data || []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load recurring tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.interval || Number(form.interval) <= 0) { toast.error('Valid interval is required'); return; }
    setSubmitting(true);
    try {
      await api.post('/projects/recurring-tasks', {
        title: form.title,
        description: form.description,
        project_id: form.projectId || undefined,
        recurrence_type: form.recurrenceType,
        interval: Number(form.interval),
        next_due_date: form.nextDueDate,
      });
      toast.success('Recurring task created');
      setShowForm(false);
      loadTasks();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create recurring task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerate = async (id: string) => {
    setGeneratingId(id);
    try {
      await api.post(`/projects/recurring-tasks/${id}/generate`);
      toast.success('Next occurrence generated');
      loadTasks();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to generate task');
    } finally {
      setGeneratingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/projects/recurring-tasks/${id}`);
      toast.success('Recurring task deleted');
      setDeleteConfirmId(null);
      loadTasks();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete recurring task');
    }
  };

  const formatRecurrence = (type: string, interval: number) => {
    const label = type === 'day' ? 'days' : type === 'week' ? 'weeks' : 'months';
    return `Every ${interval} ${label}`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recurring Tasks"
        subtitle="Automated task scheduling"
        action={{ label: 'New Recurring Task', onClick: () => setShowForm(true) }}
      />

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent mx-auto" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-12 text-center">
            <Repeat className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No recurring tasks</p>
            <button onClick={() => setShowForm(true)} className="mt-2 text-primary-600 text-sm font-medium hover:underline">Create your first recurring task</button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Title</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Project</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Recurrence</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Next Due Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{task.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{task.project_name || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatRecurrence(task.recurrence_type, task.interval)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{task.next_due_date?.split('T')[0] || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${task.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleGenerate(task.id)}
                        disabled={generatingId === task.id}
                        className="p-1.5 text-primary-500 hover:text-primary-700 hover:bg-primary-50 rounded-lg disabled:opacity-50"
                        title="Generate next occurrence"
                      >
                        {generatingId === task.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                      </button>
                      {deleteConfirmId === task.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleDelete(task.id)} className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700">Yes</button>
                          <button onClick={() => setDeleteConfirmId(null)} className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300">No</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(task.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* New Recurring Task Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">New Recurring Task</h3>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Weekly team standup"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the task..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                <input
                  value={form.projectId}
                  onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                  placeholder="Project ID (optional)"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recurrence</label>
                  <select
                    value={form.recurrenceType}
                    onChange={(e) => setForm({ ...form, recurrenceType: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Interval *</label>
                  <input
                    type="number"
                    value={form.interval}
                    onChange={(e) => setForm({ ...form, interval: e.target.value })}
                    min="1"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Next Due Date</label>
                  <input
                    type="date"
                    value={form.nextDueDate}
                    onChange={(e) => setForm({ ...form, nextDueDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleSubmit} disabled={submitting} className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
