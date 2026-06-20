import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { PageHeader } from '../../components/PageHeader';
import { TaskDetailModal } from './TaskDetailModal';
import toast from 'react-hot-toast';

interface Project {
  id: string; name: string; description: string; status: string; priority: string;
  dueDate: string; color: string; progress: number; memberCount: number;
  taskCounts: { total: number; todo: number; inProgress: number; inReview: number; done: number };
}

interface Task {
  id: string; title: string; status: string; priority: string; assigneeId: string;
  startDate: string; dueDate: string; estimatedHours: string; actualHours: string;
  labels?: { name: string; color: string }[];
}

interface Milestone {
  id: string; name: string; dueDate: string; status: string; taskCount: number; doneTaskCount: number;
}

const STATUS_CONFIG = {
  todo: { label: 'To Do', color: '#6b7280', bg: 'bg-gray-50' },
  in_progress: { label: 'In Progress', color: '#3b82f6', bg: 'bg-blue-50' },
  in_review: { label: 'In Review', color: '#f59e0b', bg: 'bg-amber-50' },
  done: { label: 'Done', color: '#10b981', bg: 'bg-green-50' },
};

const PRIORITY_BADGES: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'board' | 'list' | 'timeline' | 'milestones'>('board');
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', status: 'todo', priority: 'medium', dueDate: '' });
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [newMilestone, setNewMilestone] = useState({ name: '', dueDate: '' });
  const [showAddMilestone, setShowAddMilestone] = useState(false);

  const loadProject = useCallback(async () => {
    if (!id) return;
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data);
    } catch { toast.error('Failed to load project'); }
  }, [id]);

  const loadTasks = useCallback(async () => {
    if (!id) return;
    try {
      const res = await api.get(`/projects/${id}/tasks`);
      setTasks(res.data?.data || res.data || []);
    } catch { toast.error('Failed to load tasks'); }
  }, [id]);

  const loadMilestones = useCallback(async () => {
    if (!id) return;
    try {
      const res = await api.get(`/projects/${id}/milestones`);
      setMilestones(res.data?.data || res.data || []);
    } catch { /* milestones may not have endpoint yet */ }
  }, [id]);

  useEffect(() => {
    Promise.all([loadProject(), loadTasks(), loadMilestones()]).finally(() => setLoading(false));
  }, [loadProject, loadTasks, loadMilestones]);

  const handleAddTask = async () => {
    if (!newTask.title.trim() || !id) return;
    try {
      await api.post(`/projects/${id}/tasks`, {
        title: newTask.title,
        status: newTask.status,
        priority: newTask.priority,
        dueDate: newTask.dueDate || undefined,
      });
      toast.success('Task created');
      setShowAddTask(false);
      setNewTask({ title: '', status: 'todo', priority: 'medium', dueDate: '' });
      loadTasks();
      loadProject();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create task');
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await api.patch(`/projects/${id}/tasks/${taskId}/status`, { status: newStatus });
      setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status: newStatus } : t));
      loadProject();
    } catch { toast.error('Failed to update task'); }
  };

  const handleAddMilestone = async () => {
    if (!newMilestone.name.trim() || !id) return;
    try {
      await api.post(`/projects/${id}/milestones`, {
        name: newMilestone.name,
        dueDate: newMilestone.dueDate || undefined,
      });
      toast.success('Milestone created');
      setShowAddMilestone(false);
      setNewMilestone({ name: '', dueDate: '' });
      loadMilestones();
    } catch { toast.error('Failed to create milestone'); }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) handleStatusChange(taskId, status);
  };

  const board = Object.entries(STATUS_CONFIG).map(([status, config]) => ({
    status,
    ...config,
    tasks: tasks.filter((t) => t.status === status),
  }));

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" /></div>;
  if (!project) return <div className="text-center py-12"><p className="text-gray-500">Project not found</p></div>;

  return (
    <div className="space-y-6">
      <PageHeader title={project.name} subtitle={project.description}>
        <button onClick={() => setShowAddTask(true)} className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700">+ Add Task</button>
      </PageHeader>

      {/* Project stats */}
      <div className="grid grid-cols-5 gap-4">
        {Object.entries(STATUS_CONFIG).map(([status, config]) => (
          <div key={status} className={`rounded-xl p-4 border border-gray-100 ${config.bg}`}>
            <p className="text-xs font-medium text-gray-500 uppercase">{config.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {status === 'todo' ? project.taskCounts.todo :
               status === 'in_progress' ? project.taskCounts.inProgress :
               status === 'in_review' ? project.taskCounts.inReview :
               project.taskCounts.done}
            </p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5 w-fit">
        {[{ key: 'board', label: 'Board' }, { key: 'list', label: 'List' }, { key: 'timeline', label: 'Timeline' }, { key: 'milestones', label: 'Milestones' }].map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.key ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Kanban Board */}
      {activeTab === 'board' && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {board.map((column) => (
            <div key={column.status} className="min-w-[280px] flex-1"
              onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, column.status)}>
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: column.color }} />
                <span className="text-sm font-semibold text-gray-700">{column.label}</span>
                <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{column.tasks.length}</span>
              </div>
              <div className="space-y-2 min-h-[200px] bg-gray-50 rounded-xl p-2">
                {column.tasks.map((task) => (
                  <div key={task.id} draggable onDragStart={(e) => handleDragStart(e, task.id)}
                    onClick={() => setSelectedTask(task.id)}
                    className="bg-white rounded-lg p-3 border border-gray-200 hover:border-primary-300 hover:shadow-sm cursor-grab active:cursor-grabbing transition-all">
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-medium text-gray-900 flex-1">{task.title}</p>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ml-2 ${PRIORITY_BADGES[task.priority]}`}>
                        {task.priority}
                      </span>
                    </div>
                    {task.labels && task.labels.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {task.labels.map((l, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded text-[10px] font-medium text-white" style={{ backgroundColor: l.color }}>{l.name}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                      {task.dueDate && (
                        <span className={`text-xs ${new Date(task.dueDate) < new Date() && task.status !== 'done' ? 'text-red-500' : 'text-gray-400'}`}>
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {activeTab === 'list' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Task</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Priority</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Due Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Est. Hours</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} onClick={() => setSelectedTask(task.id)} className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{task.title}</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs font-medium capitalize" style={{ backgroundColor: STATUS_CONFIG[task.status as keyof typeof STATUS_CONFIG]?.color + '20', color: STATUS_CONFIG[task.status as keyof typeof STATUS_CONFIG]?.color }}>
                    {task.status.replace('_', ' ')}</span></td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${PRIORITY_BADGES[task.priority]}`}>{task.priority}</span></td>
                  <td className="px-4 py-3 text-sm text-gray-500">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{task.estimatedHours || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Timeline View */}
      {activeTab === 'timeline' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="text-center py-8">
            <p className="text-gray-500 mb-2">Timeline / Gantt View</p>
            <p className="text-sm text-gray-400">Tasks are displayed by start and due dates</p>
            <div className="mt-6 space-y-2">
              {tasks.filter((t) => t.dueDate).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).map((task) => {
                const start = task.startDate ? new Date(task.startDate) : new Date();
                const end = new Date(task.dueDate);
                const daysDiff = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000));
                const config = STATUS_CONFIG[task.status as keyof typeof STATUS_CONFIG];
                return (
                  <div key={task.id} className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg cursor-pointer" onClick={() => setSelectedTask(task.id)}>
                    <span className="text-sm text-gray-700 w-48 truncate">{task.title}</span>
                    <div className="flex-1 h-6 bg-gray-100 rounded relative">
                      <div className="absolute h-full rounded" style={{ backgroundColor: config?.color || '#6b7280', width: `${Math.min(daysDiff * 3, 100)}%`, minWidth: '24px', left: '5%' }} />
                    </div>
                    <span className="text-xs text-gray-400 w-20 text-right">{daysDiff}d</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Milestones */}
      {activeTab === 'milestones' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowAddMilestone(true)} className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700">+ Add Milestone</button>
          </div>
          {milestones.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <p className="text-gray-500">No milestones yet</p>
            </div>
          ) : (
            milestones.map((m) => {
              const pct = m.taskCount > 0 ? Math.round((m.doneTaskCount / m.taskCount) * 100) : 0;
              return (
                <div key={m.id} className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{m.name}</h4>
                      {m.dueDate && <p className="text-sm text-gray-400 mt-1">Due {new Date(m.dueDate).toLocaleDateString()}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-700">{m.doneTaskCount}/{m.taskCount} tasks</p>
                      <div className="w-32 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-primary-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">New Task</h3>
            <div className="space-y-3">
              <input type="text" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Task title" autoFocus />
              <div className="grid grid-cols-2 gap-3">
                <select value={newTask.status} onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500">
                  <option value="todo">To Do</option><option value="in_progress">In Progress</option><option value="in_review">In Review</option><option value="done">Done</option>
                </select>
                <select value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500">
                  <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
                </select>
              </div>
              <input type="date" value={newTask.dueDate} onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500" />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowAddTask(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleAddTask} className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Milestone Modal */}
      {showAddMilestone && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">New Milestone</h3>
            <div className="space-y-3">
              <input type="text" value={newMilestone.name} onChange={(e) => setNewMilestone({ ...newMilestone, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500" placeholder="Milestone name" autoFocus />
              <input type="date" value={newMilestone.dueDate} onChange={(e) => setNewMilestone({ ...newMilestone, dueDate: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500" />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowAddMilestone(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleAddMilestone} className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTask && id && (
        <TaskDetailModal taskId={selectedTask} projectId={id} onClose={() => { setSelectedTask(null); loadTasks(); loadProject(); }} />
      )}
    </div>
  );
}
