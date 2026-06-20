import { useState, useEffect } from 'react';
import api from '../../api/client';
import toast from 'react-hot-toast';

interface TaskDetail {
  id: string; title: string; description: string; status: string; priority: string;
  assigneeId: string; dueDate: string; startDate: string; estimatedHours: string;
  actualHours: string; completedAt: string; createdAt: string;
  labels: { id: string; name: string; color: string }[];
  comments: { id: string; userId: string; content: string; createdAt: string }[];
  subtasks: { id: string; title: string; status: string; priority: string }[];
  activity: { id: string; userId: string; action: string; field: string; oldValue: string; newValue: string; createdAt: string }[];
}

interface Props {
  taskId: string;
  projectId: string;
  onClose: () => void;
}

const STATUS_OPTIONS = [
  { value: 'todo', label: 'To Do', color: '#6b7280' },
  { value: 'in_progress', label: 'In Progress', color: '#3b82f6' },
  { value: 'in_review', label: 'In Review', color: '#f59e0b' },
  { value: 'done', label: 'Done', color: '#10b981' },
  { value: 'cancelled', label: 'Cancelled', color: '#ef4444' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-600' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-700' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-700' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-700' },
];

export function TaskDetailModal({ taskId, projectId, onClose }: Props) {
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState('');
  const [subtaskTitle, setSubtaskTitle] = useState('');

  useEffect(() => { loadTask(); }, [taskId]);

  const loadTask = async () => {
    try {
      const res = await api.get(`/projects/${projectId}/tasks/${taskId}`);
      setTask(res.data);
      setTitle(res.data.title);
    } catch { toast.error('Failed to load task'); }
    finally { setLoading(false); }
  };

  const updateTask = async (field: string, value: any) => {
    try {
      await api.patch(`/projects/${projectId}/tasks/${taskId}`, { [field]: value });
      setTask((prev) => prev ? { ...prev, [field]: value } : null);
    } catch { toast.error('Failed to update'); }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    try {
      await api.post(`/projects/${projectId}/tasks/${taskId}/comments`, { content: comment });
      setComment('');
      loadTask();
    } catch { toast.error('Failed to add comment'); }
  };

  const handleAddSubtask = async () => {
    if (!subtaskTitle.trim()) return;
    try {
      await api.post(`/projects/${projectId}/tasks`, { title: subtaskTitle, parentTaskId: taskId });
      setSubtaskTitle('');
      loadTask();
    } catch { toast.error('Failed to add subtask'); }
  };

  const handleSubtaskToggle = async (subtaskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'done' ? 'todo' : 'done';
    try {
      await api.patch(`/projects/${projectId}/tasks/${subtaskId}`, { status: newStatus });
      loadTask();
    } catch { toast.error('Failed to update subtask'); }
  };

  if (loading) return <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" /></div>;
  if (!task) return null;

  const statusConfig = STATUS_OPTIONS.find((s) => s.value === task.status);
  const priorityConfig = PRIORITY_OPTIONS.find((p) => p.value === task.priority);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 pt-12 overflow-y-auto">
      <div className="bg-white rounded-xl w-full max-w-3xl shadow-2xl mb-12">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div className="flex-1">
            {editingTitle ? (
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                onBlur={() => { updateTask('title', title); setEditingTitle(false); }}
                onKeyDown={(e) => { if (e.key === 'Enter') { updateTask('title', title); setEditingTitle(false); } }}
                className="text-lg font-semibold text-gray-900 w-full border-b-2 border-primary-500 focus:outline-none" autoFocus />
            ) : (
              <h2 onClick={() => setEditingTitle(true)} className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-primary-600">{task.title}</h2>
            )}
            <p className="text-sm text-gray-400 mt-1">Created {new Date(task.createdAt).toLocaleDateString()}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl ml-4">x</button>
        </div>

        <div className="grid grid-cols-3 gap-0">
          {/* Main content */}
          <div className="col-span-2 p-6 space-y-6">
            {/* Description */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Description</label>
              <textarea value={task.description || ''} onChange={(e) => updateTask('description', e.target.value)}
                className="w-full mt-2 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                rows={4} placeholder="Add a description..." />
            </div>

            {/* Subtasks */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Subtasks ({task.subtasks?.length || 0})</label>
              <div className="mt-2 space-y-1">
                {task.subtasks?.map((sub) => (
                  <div key={sub.id} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-gray-50">
                    <input type="checkbox" checked={sub.status === 'done'} onChange={() => handleSubtaskToggle(sub.id, sub.status)}
                      className="w-4 h-4 text-primary-600 rounded" />
                    <span className={`text-sm flex-1 ${sub.status === 'done' ? 'line-through text-gray-400' : 'text-gray-700'}`}>{sub.title}</span>
                  </div>
                ))}
                <div className="flex gap-2 mt-2">
                  <input type="text" value={subtaskTitle} onChange={(e) => setSubtaskTitle(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddSubtask(); }}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary-500" placeholder="Add subtask..." />
                  <button onClick={handleAddSubtask} className="text-primary-600 text-sm font-medium hover:underline">Add</button>
                </div>
              </div>
            </div>

            {/* Comments */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Comments ({task.comments?.length || 0})</label>
              <div className="mt-2 space-y-3">
                {task.comments?.map((c) => (
                  <div key={c.id} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-900">{c.content}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(c.createdAt).toLocaleString()}</p>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input type="text" value={comment} onChange={(e) => setComment(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(); }}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500" placeholder="Write a comment..." />
                  <button onClick={handleAddComment} className="px-3 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700">Send</button>
                </div>
              </div>
            </div>

            {/* Activity */}
            {task.activity && task.activity.length > 0 && (
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Activity</label>
                <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                  {task.activity.map((a) => (
                    <div key={a.id} className="flex items-start gap-2 text-xs text-gray-500 py-1">
                      <span className="text-gray-400">{new Date(a.createdAt).toLocaleTimeString()}</span>
                      <span>{a.action} {a.field && <><span className="font-medium">{a.field}</span> from {a.oldValue} to {a.newValue}</>}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="border-l border-gray-100 p-4 space-y-4">
            {/* Status */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Status</label>
              <select value={task.status} onChange={(e) => updateTask('status', e.target.value)}
                className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500">
                {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Priority</label>
              <select value={task.priority} onChange={(e) => updateTask('priority', e.target.value)}
                className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500">
                {PRIORITY_OPTIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Due Date</label>
              <input type="date" value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
                onChange={(e) => updateTask('dueDate', e.target.value || null)}
                className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500" />
            </div>

            {/* Estimated Hours */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Estimated Hours</label>
              <input type="number" step="0.5" value={task.estimatedHours || ''}
                onChange={(e) => updateTask('estimatedHours', e.target.value || null)}
                className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500" placeholder="0" />
            </div>

            {/* Actual Hours */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Actual Hours</label>
              <p className="text-sm text-gray-700 mt-1">{task.actualHours || '0'}h</p>
            </div>

            {/* Labels */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Labels</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {task.labels?.map((l) => (
                  <span key={l.id} className="px-2 py-0.5 rounded-full text-xs font-medium text-white" style={{ backgroundColor: l.color }}>{l.name}</span>
                ))}
                {(!task.labels || task.labels.length === 0) && <span className="text-xs text-gray-400">No labels</span>}
              </div>
            </div>

            {/* Delete */}
            <button onClick={async () => {
              if (confirm('Delete this task?')) {
                await api.delete(`/projects/${projectId}/tasks/${taskId}`);
                toast.success('Task deleted');
                onClose();
              }
            }} className="w-full px-3 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 mt-4">Delete Task</button>
          </div>
        </div>
      </div>
    </div>
  );
}
