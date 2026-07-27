import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

const { mockClientGet } = vi.hoisted(() => ({ mockClientGet: vi.fn() }));
vi.mock('../api/client', () => ({
  default: {
    get: mockClientGet,
    post: vi.fn(),
    put: vi.fn(),
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

import { Employees } from '../pages/hr/Employees';
import { Attendance } from '../pages/hr/Attendance';
import { Payroll } from '../pages/hr/Payroll';
import { Leave } from '../pages/hr/Leave';
import { Deductions } from '../pages/hr/Deductions';
import { ExpenseClaims } from '../pages/hr/ExpenseClaims';
import { Onboarding as HROnboarding } from '../pages/hr/Onboarding';

function renderInRouter(Component: () => JSX.Element) {
  return render(<BrowserRouter><Component /></BrowserRouter>);
}

describe('HR Pages', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('Employees', () => {
    it('renders page title', async () => {
      mockClientGet.mockResolvedValue({ data: [] });
      renderInRouter(Employees);
      await waitFor(() => {
        expect(screen.getByText('Employees')).toBeInTheDocument();
      });
    });

    it('shows add employee button', async () => {
      mockClientGet.mockResolvedValue({ data: [] });
      renderInRouter(Employees);
      await waitFor(() => {
        expect(screen.getByText('Add Employee')).toBeInTheDocument();
      });
    });

    it('renders employee data', async () => {
      mockClientGet.mockResolvedValue({
        data: [
          { id: 'e1', full_name: 'Alice', email: 'alice@test.com', department: 'Engineering', position: 'Developer', employee_code: 'EMP-001', salary: 50000, status: 'active' },
          { id: 'e2', full_name: 'Bob', email: 'bob@test.com', department: 'Sales', position: 'Sales Rep', employee_code: 'EMP-002', salary: 40000, status: 'active' },
        ],
      });
      renderInRouter(Employees);
      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
      });
    });

    it('shows empty state', async () => {
      mockClientGet.mockResolvedValue({ data: [] });
      renderInRouter(Employees);
      await waitFor(() => {
        expect(screen.getByText('No employees found')).toBeInTheDocument();
      });
    });
  });

  describe('Attendance', () => {
    it('renders page title', async () => {
      mockClientGet.mockResolvedValue({ data: [] });
      renderInRouter(Attendance);
      await waitFor(() => {
        expect(screen.getByText('Attendance')).toBeInTheDocument();
      });
    });
  });

  describe('Payroll', () => {
    it('renders page title', async () => {
      mockClientGet.mockResolvedValue({ data: [] });
      renderInRouter(Payroll);
      await waitFor(() => {
        expect(screen.getByText('Payroll')).toBeInTheDocument();
      });
    });

    it('shows run payroll button', async () => {
      mockClientGet.mockResolvedValue({ data: [] });
      renderInRouter(Payroll);
      await waitFor(() => {
        expect(screen.getByText('Process Payroll')).toBeInTheDocument();
      });
    });
  });

  describe('Leave', () => {
    it('renders page title', async () => {
      mockClientGet.mockResolvedValue({ data: [] });
      renderInRouter(Leave);
      await waitFor(() => {
        expect(screen.getByText('Leave Management')).toBeInTheDocument();
      });
    });
  });

  describe('Deductions', () => {
    it('renders page title', async () => {
      mockClientGet.mockResolvedValue({ data: [] });
      renderInRouter(Deductions);
      await waitFor(() => {
        expect(screen.getByText('Deduction Configuration')).toBeInTheDocument();
      });
    });
  });

  describe('ExpenseClaims', () => {
    it('renders page title', async () => {
      mockClientGet.mockResolvedValue({ data: [] });
      renderInRouter(ExpenseClaims);
      await waitFor(() => {
        expect(screen.getByText('Expense Claims')).toBeInTheDocument();
      });
    });
  });

  describe('Onboarding', () => {
    it('renders page title', async () => {
      mockClientGet.mockResolvedValue({ data: [] });
      renderInRouter(HROnboarding);
      await waitFor(() => {
        expect(screen.getByText('Employee Onboarding')).toBeInTheDocument();
      });
    });
  });
});
