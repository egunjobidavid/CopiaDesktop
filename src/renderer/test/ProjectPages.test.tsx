import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

const { mockClientGet } = vi.hoisted(() => ({ mockClientGet: vi.fn() }));
vi.mock('../api/client', () => ({
  default: {
    get: mockClientGet,
    post: vi.fn(),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
}));

vi.mock('../store/auth.store', () => ({
  useAuthStore: vi.fn((selector?: any) => {
    const state = { user: { id: 'u1', role: 'MD' }, isAuthenticated: true, tenantId: 't1' };
    return selector ? selector(state) : state;
  }),
}));

vi.mock('../components/Breadcrumbs', () => ({
  Breadcrumbs: () => <nav data-testid="breadcrumbs" />,
}));

import { Projects } from '../pages/projects/Projects';
import { ProjectDetail } from '../pages/projects/ProjectDetail';
import { GanttView } from '../pages/projects/GanttView';
import { ProjectReports } from '../pages/projects/ProjectReports';
import { RecurringTasks } from '../pages/projects/RecurringTasks';
import { TaskDetailModal } from '../pages/projects/TaskDetailModal';

function renderInRouter(Component: () => JSX.Element) {
  return render(<BrowserRouter><Component /></BrowserRouter>);
}

describe('Project Pages', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('Projects', () => {
    it('renders page title', async () => {
      mockClientGet.mockResolvedValue({ data: [] });
      renderInRouter(Projects);
      await waitFor(() => {
        expect(screen.getByText('Projects')).toBeInTheDocument();
      });
    });

    it('shows new project button', async () => {
      mockClientGet.mockResolvedValue({ data: [] });
      renderInRouter(Projects);
      await waitFor(() => {
        expect(screen.getByText('New Project')).toBeInTheDocument();
      });
    });

    it('renders project data', async () => {
      mockClientGet.mockResolvedValue({
        data: [
          { id: 'pr1', name: 'Project Alpha', status: 'active', priority: 'high', deadline: '2025-06-01' },
          { id: 'pr2', name: 'Project Beta', status: 'planning', priority: 'medium', deadline: '2025-07-01' },
        ],
      });
      renderInRouter(Projects);
      await waitFor(() => {
        expect(screen.getByText('Project Alpha')).toBeInTheDocument();
        expect(screen.getByText('Project Beta')).toBeInTheDocument();
      });
    });

    it('shows empty state', async () => {
      mockClientGet.mockResolvedValue({ data: [] });
      renderInRouter(Projects);
      await waitFor(() => {
        expect(screen.getByText('No projects found')).toBeInTheDocument();
      });
    });
  });

  describe('ProjectDetail', () => {
    it('shows loading state', async () => {
      mockClientGet.mockReturnValue(new Promise(() => {}));
      const { container } = render(<BrowserRouter><ProjectDetail /></BrowserRouter>);
      await waitFor(() => {
        expect(container.querySelector('.animate-spin')).toBeInTheDocument();
      });
    });
  });

  describe('GanttView', () => {
    it('renders page title', async () => {
      mockClientGet.mockResolvedValue({ data: [] });
      renderInRouter(GanttView);
      await waitFor(() => {
        expect(screen.getByText('Project Timeline')).toBeInTheDocument();
      });
    });
  });

  describe('ProjectReports', () => {
    it('renders page title', async () => {
      mockClientGet.mockResolvedValue({
        data: { totalProjects: 0, projectsByStatus: [], totalTasks: 0, tasksByStatus: [], tasksByPriority: [], overdueTasks: 0 },
      });
      renderInRouter(ProjectReports);
      await waitFor(() => {
        expect(screen.getByText('Project Reports')).toBeInTheDocument();
      });
    });
  });

  describe('RecurringTasks', () => {
    it('renders page title', async () => {
      mockClientGet.mockResolvedValue({ data: [] });
      renderInRouter(RecurringTasks);
      await waitFor(() => {
        expect(screen.getByText('Recurring Tasks')).toBeInTheDocument();
      });
    });
  });

  describe('TaskDetailModal', () => {
    it('shows loading spinner on mount', () => {
      mockClientGet.mockReturnValue(new Promise(() => {}));
      const { container } = render(<TaskDetailModal taskId="t1" projectId="p1" onClose={vi.fn()} />);
      expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('renders task details when loaded', async () => {
      const taskData = { id: 't1', title: 'Task 1', status: 'todo', priority: 'high', createdAt: '2025-01-01', subtasks: [], comments: [], labels: [], activity: [] };
      mockClientGet.mockResolvedValueOnce({ data: taskData }).mockResolvedValueOnce({ data: [] });
      render(<TaskDetailModal taskId="t1" projectId="p1" onClose={vi.fn()} />);
      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument();
      });
    });
  });
});
