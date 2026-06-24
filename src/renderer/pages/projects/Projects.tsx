import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { PageHeader } from '../../components/PageHeader';
import { exportToCsv } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { Search } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  color: string;
  progress: number;
  memberCount: number;
  taskCount: number;
  doneTaskCount: number;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  on_hold: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-blue-100 text-blue-800',
  archived: 'bg-gray-100 text-gray-600',
};

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

export function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', description: '', priority: 'medium', dueDate: '', color: '#2563eb' });

  useEffect(() => { loadProjects(); }, [statusFilter, search]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (search) params.set('search', search);
      const qs = params.toString();
      const res = await api.get(`/projects${qs ? '?' + qs : ''}`);
      setProjects(res.data?.data || res.data || []);
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.name.trim()) { toast.error('Project name is required'); return; }
    try {
      await api.post('/projects', {
        name: form.name,
        description: form.description || undefined,
        priority: form.priority,
        dueDate: form.dueDate || undefined,
        color: form.color,
      });
      toast.success('Project created');
      setShowCreate(false);
      setForm({ name: '', description: '', priority: 'medium', dueDate: '', color: '#2563eb' });
      loadProjects();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create project');
    }
  };

  const filtered = projects;

  const getProgress = (p: Project) => {
    if (p.taskCount === 0) return 0;
    return Math.round((p.doneTaskCount / p.taskCount) * 100);
  };

  const handleExport = () => {
    exportToCsv(
      filtered.map((p) => ({
        Name: p.name,
        Status: p.status,
        Priority: p.priority,
        Tasks: p.taskCount,
        'Done Tasks': p.doneTaskCount,
        'Due Date': p.dueDate ? new Date(p.dueDate).toLocaleDateString() : '',
        'Created': new Date(p.createdAt).toLocaleDateString(),
      })),
      [{ key: 'Name', label: 'Name' }, { key: 'Status', label: 'Status' }, { key: 'Priority', label: 'Priority' },
       { key: 'Tasks', label: 'Tasks' }, { key: 'Done Tasks', label: 'Done Tasks' },
       { key: 'Due Date', label: 'Due Date' }, { key: 'Created', label: 'Created' }],
      'projects'
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        subtitle={`${projects.length} total projects`}
        action={{ label: 'New Project', onClick: () => setShowCreate(true) }}
      >
        <button onClick={handleExport} className="px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Export</button>
      </PageHeader>

      {/* Filters */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
          </div>
          <div className="flex gap-2">
          {['all', 'active', 'on_hold', 'completed', 'archived'].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s === 'all' ? 'All' : s.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
            </button>
          ))}
          </div>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
          <button onClick={() => setView('grid')} className={`px-3 py-1 rounded text-sm ${view === 'grid' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>Grid</button>
          <button onClick={() => setView('list')} className={`px-3 py-1 rounded text-sm ${view === 'list' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>List</button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <div className="text-gray-400 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" /></svg>
          </div>
          <p className="text-gray-600 font-medium">No projects found</p>
          <p className="text-gray-400 text-sm mt-1">Create your first project to get started</p>
          <button onClick={() => setShowCreate(true)} className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">New Project</button>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project) => {
            const progress = getProgress(project);
            return (
              <div key={project.id} onClick={() => navigate(`/projects/${project.id}`)}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-primary-200 transition-all cursor-pointer group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[project.status] || ''}`}>
                      {project.status.replace('_', ' ')}
                    </span>
                  </div>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[project.priority] || ''}`}>
                    {project.priority}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">{project.name}</h3>
                {project.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{project.description}</p>}

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{project.doneTaskCount}/{project.taskCount} tasks</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
                    {project.memberCount} members
                  </div>
                  {project.dueDate && (
                    <span className="text-xs text-gray-400">Due {new Date(project.dueDate).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Project</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Priority</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Progress</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Members</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Due Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((project) => (
                <tr key={project.id} onClick={() => navigate(`/projects/${project.id}`)}
                  className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: project.color }} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{project.name}</p>
                        <p className="text-xs text-gray-400 line-clamp-1">{project.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[project.status]}`}>{project.status.replace('_', ' ')}</span></td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${PRIORITY_COLORS[project.priority]}`}>{project.priority}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-primary-500 rounded-full" style={{ width: `${getProgress(project)}%` }} /></div>
                      <span className="text-xs text-gray-500">{getProgress(project)}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{project.memberCount}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{project.dueDate ? new Date(project.dueDate).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">New Project</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Project name" autoFocus />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  rows={3} placeholder="Brief description" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <div className="flex gap-2">
                  {['#2563eb', '#16a34a', '#ea580c', '#9333ea', '#e11d48', '#0891b2'].map((c) => (
                    <button key={c} onClick={() => setForm({ ...form, color: c })}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${form.color === c ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleCreate} className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">Create Project</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
