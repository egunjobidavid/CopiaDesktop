import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

const { mockClientGet } = vi.hoisted(() => ({ mockClientGet: vi.fn() }));
vi.mock('../api/client', () => ({
  default: {
    get: mockClientGet,
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
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

import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Settings } from '../pages/settings/Settings';
import { Billing } from '../pages/settings/Billing';
import { Roles } from '../pages/settings/Roles';
import { RoleDetail } from '../pages/settings/RoleDetail';
import { Staff } from '../pages/settings/Staff';
import { Departments } from '../pages/settings/Departments';
import { Locations } from '../pages/settings/Locations';
import { StaffAudit } from '../pages/settings/StaffAudit';
import { Support } from '../pages/settings/Support';

function renderInRouter(Component: () => JSX.Element) {
  return render(<BrowserRouter><Component /></BrowserRouter>);
}

describe('Settings Pages', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('Settings', () => {
    it('renders page title', async () => {
      mockClientGet.mockResolvedValue({ data: {} });
      renderInRouter(Settings);
      await waitFor(() => {
        expect(screen.getByText('Settings')).toBeInTheDocument();
      });
    });

    it('shows settings form fields', async () => {
      mockClientGet.mockResolvedValue({ data: { name: 'TestCo', email: 'test@test.com', phone: '080-123-4567', address: '123 Test St', currency: 'NGN', timezone: 'Africa/Lagos', taxRate: '7.5' } });
      renderInRouter(Settings);
      await waitFor(() => {
        expect(screen.getByText('Profile')).toBeInTheDocument();
        expect(screen.getByText('Organization')).toBeInTheDocument();
      });
    });
  });

  describe('Billing', () => {
    it('renders page title', async () => {
      mockClientGet.mockResolvedValue({ data: {} });
      renderInRouter(Billing);
      await waitFor(() => {
        expect(screen.getByText('Billing & Subscription')).toBeInTheDocument();
      });
    });

    it('shows current plan info', async () => {
      mockClientGet.mockResolvedValue({ data: { plan: 'starter', status: 'active', nextBillingDate: '2025-02-01' } });
      renderInRouter(Billing);
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Current Plan/ })).toBeInTheDocument();
      });
    });
  });

  describe('Roles', () => {
    it('renders page title', async () => {
      mockClientGet.mockResolvedValue({ data: [] });
      renderInRouter(Roles);
      await waitFor(() => {
        expect(screen.getByText('Roles & Permissions')).toBeInTheDocument();
      });
    });

    it('shows add role button', async () => {
      mockClientGet.mockResolvedValue({ data: [] });
      renderInRouter(Roles);
      await waitFor(() => {
        expect(screen.getByText('Create Role')).toBeInTheDocument();
      });
    });
  });

  describe('RoleDetail', () => {
    it('renders loading spinner', async () => {
      mockClientGet.mockReturnValue(new Promise(() => {}));
      const { container } = render(
        <MemoryRouter initialEntries={['/settings/roles/r1']}>
          <Routes>
            <Route path="/settings/roles/:id" element={<RoleDetail />} />
          </Routes>
        </MemoryRouter>
      );
      expect(container.querySelector('.lucide-loader-circle')).toBeTruthy();
    });
  });

  describe('Staff', () => {
    it('renders page title', async () => {
      mockClientGet.mockResolvedValue({ data: [] });
      renderInRouter(Staff);
      await waitFor(() => {
        expect(screen.getByText('Staff')).toBeInTheDocument();
      });
    });

    it('shows invite staff button', async () => {
      mockClientGet.mockResolvedValue({ data: [] });
      renderInRouter(Staff);
      await waitFor(() => {
        expect(screen.getByText('Add Staff')).toBeInTheDocument();
      });
    });

    it('renders staff data', async () => {
      mockClientGet.mockResolvedValue({
        data: [
          { id: 's1', fullName: 'Alice', email: 'alice@test.com', role: 'Manager', status: 'active' },
          { id: 's2', fullName: 'Bob', email: 'bob@test.com', role: 'Staff', status: 'active' },
        ],
      });
      renderInRouter(Staff);
      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
      });
    });
  });

  describe('Departments', () => {
    it('renders page title', async () => {
      mockClientGet.mockResolvedValue({ data: [] });
      renderInRouter(Departments);
      await waitFor(() => {
        expect(screen.getByText('Departments')).toBeInTheDocument();
      });
    });

    it('shows add department button', async () => {
      mockClientGet.mockResolvedValue({ data: [] });
      renderInRouter(Departments);
      await waitFor(() => {
        expect(screen.getByText('Add Department')).toBeInTheDocument();
      });
    });
  });

  describe('Locations', () => {
    it('renders page title', async () => {
      mockClientGet.mockResolvedValue({ data: [] });
      renderInRouter(Locations);
      await waitFor(() => {
        expect(screen.getByText('Locations')).toBeInTheDocument();
      });
    });

    it('shows add location button', async () => {
      mockClientGet.mockResolvedValue({ data: [] });
      renderInRouter(Locations);
      await waitFor(() => {
        expect(screen.getByText('Add Location')).toBeInTheDocument();
      });
    });
  });

  describe('StaffAudit', () => {
    it('renders page title', async () => {
      mockClientGet.mockResolvedValue({ data: [] });
      renderInRouter(StaffAudit);
      await waitFor(() => {
        expect(screen.getByText('Staff Audit')).toBeInTheDocument();
      });
    });
  });

  describe('Support', () => {
    it('renders page title', async () => {
      mockClientGet.mockResolvedValue({ data: {} });
      renderInRouter(Support);
      await waitFor(() => {
        expect(screen.getByText('Support')).toBeInTheDocument();
      });
    });
  });
});
