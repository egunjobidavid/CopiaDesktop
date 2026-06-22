import { useState, useEffect } from 'react';
import api from '../../api/client';
import { PageHeader } from '../../components/PageHeader';
import toast from 'react-hot-toast';
import { GanttChart, Loader2 } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  color: string;
  progress: number;
  startDate: string;
  dueDate: string;
  tasks: { id: string; name: string; progress: number }[];
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a);
  const db = new Date(b);
  return Math.max(1, Math.ceil((db.getTime() - da.getTime()) / (1000 * 60 * 60 * 24)));
}

export function GanttView() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/projects');
      const list = res.data?.data || res.data || [];
      setProjects(
        list.map((p: any) => ({
          id: p.id,
          name: p.name,
          color: p.color || '#6366f1',
          progress: p.progress || 0,
          startDate: p.startDate || p.start_date || p.createdAt || p.created_at || formatDate(new Date()),
          dueDate: p.dueDate || p.due_date || formatDate(new Date(Date.now() + 30 * 86400000)),
          tasks: p.tasks || [],
        }))
      );
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary-600" />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="p-6">
        <PageHeader title="Project Timeline" subtitle="Gantt view of all projects" />
        <p className="text-gray-500 mt-4">No projects found.</p>
      </div>
    );
  }

  // Determine overall timeline
  const allDates = projects.flatMap(p => [p.startDate, p.dueDate]);
  const validDates = allDates.filter(Boolean);
  if (validDates.length === 0) return null;
  const minDate = new Date(validDates.reduce((a, b) => a < b ? a : b));
  const maxDate = new Date(validDates.reduce((a, b) => a > b ? a : b));
  const totalDays = daysBetween(formatDate(minDate), formatDate(maxDate));
  const today = formatDate(new Date());

  // Generate day labels
  const dayLabels: string[] = [];
  const d = new Date(minDate);
  while (d <= maxDate) {
    dayLabels.push(formatDate(d));
    d.setDate(d.getDate() + 1);
  }

  // Group into weeks for the header
  const weeks: { start: string; days: number }[] = [];
  let i = 0;
  while (i < dayLabels.length) {
    const weekStart = dayLabels[i];
    let weekDays = 0;
    while (i < dayLabels.length && weekDays < 7) {
      weekDays++;
      i++;
    }
    weeks.push({ start: weekStart, days: weekDays });
  }

  const rowHeight = 56;

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Project Timeline" subtitle="Gantt view of all projects" />

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Week header */}
          <div className="flex border-b border-gray-200">
            <div className="w-48 flex-shrink-0 px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50 border-r border-gray-200">
              Project
            </div>
            <div className="flex-1 flex">
              {weeks.map((w, wi) => (
                <div
                  key={wi}
                  className="text-[10px] text-gray-500 text-center py-2 border-r border-gray-100 last:border-r-0"
                  style={{ width: `${(w.days / totalDays) * 100}%`, minWidth: `${w.days * 30}px` }}
                >
                  {new Date(w.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              ))}
            </div>
          </div>

          {/* Project rows */}
          {projects.map((project) => {
            const barOffset = ((new Date(project.startDate).getTime() - minDate.getTime()) / (maxDate.getTime() - minDate.getTime())) * 100;
            const barWidth = (daysBetween(project.startDate, project.dueDate) / totalDays) * 100;

            return (
              <div
                key={project.id}
                className="flex border-b border-gray-100 last:border-b-0"
                style={{ height: rowHeight }}
              >
                <div className="w-48 flex-shrink-0 px-4 py-3 border-r border-gray-200 flex flex-col justify-center">
                  <span className="text-sm font-medium text-gray-900 truncate">{project.name}</span>
                  <span className="text-xs text-gray-400">{project.tasks.length} tasks</span>
                </div>
                <div className="flex-1 relative py-2">
                  {/* Grid lines */}
                  {dayLabels.map((dl, di) => {
                    if (di % 7 === 0) {
                      return (
                        <div
                          key={di}
                          className="absolute top-0 bottom-0 border-l border-gray-50"
                          style={{ left: `${(di / totalDays) * 100}%` }}
                        />
                      );
                    }
                    return null;
                  })}

                  {/* Today line */}
                  {today >= formatDate(minDate) && today <= formatDate(maxDate) && (
                    <div
                      className="absolute top-0 bottom-0 border-l-2 border-red-400 border-dashed z-10"
                      style={{ left: `${(daysBetween(formatDate(minDate), today) / totalDays) * 100}%` }}
                    />
                  )}

                  {/* Project bar */}
                  <div
                    className="absolute top-3 h-10 rounded-lg flex items-center overflow-hidden"
                    style={{
                      left: `${barOffset}%`,
                      width: `${barWidth}%`,
                      minWidth: '24px',
                      backgroundColor: `${project.color}22`,
                      border: `1px solid ${project.color}`,
                    }}
                  >
                    {/* Progress fill */}
                    <div
                      className="absolute inset-y-0 left-0 rounded-l-lg transition-all duration-500"
                      style={{
                        width: `${project.progress}%`,
                        backgroundColor: `${project.color}44`,
                      }}
                    />
                    <span className="relative z-10 text-[11px] font-medium px-2 truncate" style={{ color: project.color }}>
                      {project.progress}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
