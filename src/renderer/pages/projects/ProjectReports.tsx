import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { PageHeader } from '../../components/PageHeader';
import { exportToCsv } from '../../utils/helpers';
import toast from 'react-hot-toast';

interface ProjectOverview {
  totalProjects: number;
  projectsByStatus: { status: string; count: number }[];
  totalTasks: number;
  tasksByStatus: { status: string; count: number }[];
  tasksByPriority: { priority: string; count: number }[];
  overdueTasks: number;
}

const STATUS_COLORS: Record<string, string> = {
  todo: '#6b7280',
  in_progress: '#3b82f6',
  in_review: '#f59e0b',
  done: '#10b981',
  cancelled: '#ef4444',
};

const STATUS_LABELS: Record<string, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  in_review: 'In Review',
  done: 'Done',
  active: 'Active',
  on_hold: 'On Hold',
  completed: 'Completed',
};

const PRIORITY_COLORS: Record<string, string> = {
  low: '#9ca3af',
  medium: '#3b82f6',
  high: '#f97316',
  urgent: '#ef4444',
};

export function ProjectReports() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<ProjectOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeReport, setActiveReport] = useState<'overview' | 'team' | 'time'>('overview');

  useEffect(() => { loadReports(); }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const res = await api.get('/projects/reports/overview');
      setOverview(res.data);
    } catch {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleExportOverview = () => {
    if (!overview) return;
    exportToCsv(
      overview.tasksByStatus.map((t) => ({ Status: STATUS_LABELS[t.status] || t.status, Count: t.count })),
      [{ key: 'Status', label: 'Status' }, { key: 'Count', label: 'Count' }],
      'project-overview'
    );
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Project Reports" subtitle="Analytics and insights across all projects">
        <button onClick={handleExportOverview} className="px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Export CSV</button>
      </PageHeader>

      {/* Report tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5 w-fit">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'team', label: 'Team Workload' },
          { key: 'time', label: 'Time Tracking' },
        ].map((tab) => (
          <button key={tab.key} onClick={() => setActiveReport(tab.key as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeReport === tab.key ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Report */}
      {activeReport === 'overview' && overview && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500">Total Projects</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{overview.totalProjects}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500">Total Tasks</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{overview.totalTasks}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500">Overdue Tasks</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{overview.overdueTasks}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500">Completion Rate</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {overview.totalTasks > 0
                  ? Math.round(((overview.tasksByStatus.find((s) => s.status === 'done')?.count || 0) / overview.totalTasks) * 100)
                  : 0}%
              </p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Tasks by Status */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Tasks by Status</h3>
              <div className="space-y-3">
                {overview.tasksByStatus.map((item) => {
                  const pct = overview.totalTasks > 0 ? Math.round((item.count / overview.totalTasks) * 100) : 0;
                  return (
                    <div key={item.status}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{STATUS_LABELS[item.status] || item.status}</span>
                        <span className="text-gray-900 font-medium">{item.count} ({pct}%)</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: STATUS_COLORS[item.status] || '#6b7280' }} />
                      </div>
                    </div>
                  );
                })}
                {overview.tasksByStatus.length === 0 && <p className="text-sm text-gray-400">No tasks yet</p>}
              </div>
            </div>

            {/* Tasks by Priority */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Tasks by Priority</h3>
              <div className="space-y-3">
                {overview.tasksByPriority.map((item) => {
                  const pct = overview.totalTasks > 0 ? Math.round((item.count / overview.totalTasks) * 100) : 0;
                  return (
                    <div key={item.priority}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 capitalize">{item.priority}</span>
                        <span className="text-gray-900 font-medium">{item.count} ({pct}%)</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: PRIORITY_COLORS[item.priority] || '#6b7280' }} />
                      </div>
                    </div>
                  );
                })}
                {overview.tasksByPriority.length === 0 && <p className="text-sm text-gray-400">No tasks yet</p>}
              </div>
            </div>
          </div>

          {/* Projects by Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Projects by Status</h3>
            <div className="grid grid-cols-4 gap-4">
              {overview.projectsByStatus.map((item) => (
                <div key={item.status} className="text-center p-4 rounded-xl bg-gray-50">
                  <p className="text-2xl font-bold text-gray-900">{item.count}</p>
                  <p className="text-xs text-gray-500 mt-1 capitalize">{STATUS_LABELS[item.status] || item.status}</p>
                </div>
              ))}
              {overview.projectsByStatus.length === 0 && <p className="text-sm text-gray-400 col-span-4">No projects yet</p>}
            </div>
          </div>
        </>
      )}

      {/* Team Workload */}
      {activeReport === 'team' && (
        <TeamWorkloadReport />
      )}

      {/* Time Tracking */}
      {activeReport === 'time' && (
        <TimeTrackingReport />
      )}
    </div>
  );
}

function TeamWorkloadReport() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/projects/reports/team-workload')
      .then((res) => setData(res.data))
      .catch(() => { toast.error('Failed to load team workload'); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-600 border-t-transparent" /></div>;
  if (!data) return <p className="text-gray-400 text-center py-8">No workload data available</p>;

  const assigneeMap = new Map<string, { todo: number; in_progress: number; in_review: number; overdue: number }>();

  for (const item of data.activeTasks || []) {
    if (!item.assigneeId) continue;
    const entry = assigneeMap.get(item.assigneeId) || { todo: 0, in_progress: 0, in_review: 0, overdue: 0 };
    if (item.status === 'todo') entry.todo += item.count;
    if (item.status === 'in_progress') entry.in_progress += item.count;
    if (item.status === 'in_review') entry.in_review += item.count;
    assigneeMap.set(item.assigneeId, entry);
  }

  for (const item of data.overdueByAssignee || []) {
    if (!item.assigneeId) continue;
    const entry = assigneeMap.get(item.assigneeId) || { todo: 0, in_progress: 0, in_review: 0, overdue: 0 };
    entry.overdue = item.count;
    assigneeMap.set(item.assigneeId, entry);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">Team Workload</h3>
      </div>
      {assigneeMap.size === 0 ? (
        <div className="p-8 text-center text-gray-400">No assigned tasks yet</div>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Member</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase">To Do</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase">In Progress</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase">In Review</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Overdue</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Total Active</th>
            </tr>
          </thead>
          <tbody>
            {Array.from(assigneeMap.entries()).map(([userId, stats]) => (
              <tr key={userId} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-5 py-3 text-sm font-medium text-gray-900">{userId.slice(0, 8)}...</td>
                <td className="px-5 py-3 text-sm text-center text-gray-600">{stats.todo}</td>
                <td className="px-5 py-3 text-sm text-center text-blue-600">{stats.in_progress}</td>
                <td className="px-5 py-3 text-sm text-center text-amber-600">{stats.in_review}</td>
                <td className="px-5 py-3 text-sm text-center text-red-600">{stats.overdue}</td>
                <td className="px-5 py-3 text-sm text-center font-medium text-gray-900">{stats.todo + stats.in_progress + stats.in_review}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function TimeTrackingReport() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/projects/reports/time-tracking')
      .then((res) => setData(res.data))
      .catch(() => { toast.error('Failed to load time tracking'); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-600 border-t-transparent" /></div>;
  if (!data) return <p className="text-gray-400 text-center py-8">No time tracking data available</p>;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Total Time Logged</h3>
        <p className="text-4xl font-bold text-primary-600">{data.totalHours}h</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">By Task</h3>
          {data.byTask?.length > 0 ? (
            <div className="space-y-2">
              {data.byTask.map((item: any) => (
                <div key={item.taskId} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.taskId.slice(0, 8)}...</span>
                  <span className="font-medium text-gray-900">{Math.round(Number(item.totalMinutes) / 60 * 100) / 100}h ({item.entryCount} entries)</span>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-gray-400">No time entries yet</p>}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">By Team Member</h3>
          {data.byUser?.length > 0 ? (
            <div className="space-y-2">
              {data.byUser.map((item: any) => (
                <div key={item.userId} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.userId.slice(0, 8)}...</span>
                  <span className="font-medium text-gray-900">{Math.round(Number(item.totalMinutes) / 60 * 100) / 100}h ({item.entryCount} entries)</span>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-gray-400">No time entries yet</p>}
        </div>
      </div>
    </div>
  );
}
