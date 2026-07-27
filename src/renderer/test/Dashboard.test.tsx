import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Dashboard } from '../pages/Dashboard';

vi.mock('../store/auth.store', () => ({
  useAuthStore: vi.fn((selector?: any) => {
    const state = {
      user: { id: 'u1', email: 'test@test.com', fullName: 'Test User', role: 'MD' },
      isAuthenticated: true,
      tenantId: 't1',
      locationName: 'Head Office',
    };
    return selector ? selector(state) : state;
  }),
}));

const { mockClientGet } = vi.hoisted(() => ({ mockClientGet: vi.fn() }));
vi.mock('../api/client', () => ({
  default: {
    get: mockClientGet,
    post: vi.fn(),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
}));

vi.mock('../components/Breadcrumbs', () => ({
  Breadcrumbs: () => <nav data-testid="breadcrumbs">Breadcrumbs</nav>,
}));

vi.mock('../components/DashboardSection', () => ({
  DashboardSection: ({ children }: any) => <div data-testid="dashboard-section">{children}</div>,
  SectionSkeleton: () => <div data-testid="section-skeleton" />,
  KpiSkeleton: () => <div data-testid="kpi-skeleton" />,
  StatCardSkeleton: () => <div data-testid="statcard-skeleton" />,
  ActivitySkeleton: () => <div data-testid="activity-skeleton" />,
}));

function renderDashboard() {
  return render(
    <BrowserRouter>
      <Dashboard />
    </BrowserRouter>,
  );
}

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders welcome text with user name', async () => {
    const mockGet = vi.fn()
      .mockResolvedValueOnce({
        data: {
          revenue: 500000,
          receivables: 100000,
          pendingApprovals: { leaveRequests: 2, expenseClaims: 1, purchaseOrders: 3 },
          lowStockCount: 5,
          activeSalesOrders: 10,
          outstandingInvoices: 8,
          totalCustomers: 50,
          totalProducts: 200,
          totalStaff: 15,
          monthlyExpenses: 200000,
          monthlyPurchases: 150000,
          topProducts: [{ name: 'Product A', total_sold: 100 }],
          monthlySalesCount: 45,
          overdueInvoices: 3,
          collectedPayments: 450000,
        },
      })
      .mockResolvedValueOnce({ data: { data: [] } });
    mockClientGet.mockImplementation(mockGet);

    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/Welcome back/)).toBeInTheDocument();
      expect(screen.getByText(/Test User/)).toBeInTheDocument();
    });
  });

  it('shows executive dashboard for MD role', async () => {
    const mockGet = vi.fn()
      .mockResolvedValueOnce({ data: { revenue: 500000, monthlyExpenses: 200000, collectedPayments: 450000, monthlySalesCount: 45, totalProducts: 200, totalCustomers: 50, totalStaff: 15, lowStockCount: 0, overdueInvoices: 0, outstandingInvoices: 0, activeSalesOrders: 0, pendingApprovals: { leaveRequests: 0, expenseClaims: 0, purchaseOrders: 0 }, monthlyPurchases: 0, topProducts: [], receivables: 0 } })
      .mockResolvedValueOnce({ data: { data: [] } });
    mockClientGet.mockImplementation(mockGet);

    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('Executive Dashboard')).toBeInTheDocument();
    });
  });

  it('shows location name when available', async () => {
    const mockGet = vi.fn()
      .mockResolvedValueOnce({ data: { revenue: 500000, monthlyExpenses: 200000, collectedPayments: 450000, monthlySalesCount: 45, totalProducts: 200, totalCustomers: 50, totalStaff: 15, lowStockCount: 0, overdueInvoices: 0, outstandingInvoices: 0, activeSalesOrders: 0, pendingApprovals: { leaveRequests: 0, expenseClaims: 0, purchaseOrders: 0 }, monthlyPurchases: 0, topProducts: [], receivables: 0 } })
      .mockResolvedValueOnce({ data: { data: [] } });
    mockClientGet.mockImplementation(mockGet);

    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/Head Office/)).toBeInTheDocument();
    });
  });

  it('shows skeleton while loading', () => {
    mockClientGet.mockReturnValue(new Promise(() => {}));
    renderDashboard();
    expect(screen.getByTestId('kpi-skeleton')).toBeInTheDocument();
  });

  it('shows Quick Actions', async () => {
    const mockGet = vi.fn()
      .mockResolvedValueOnce({ data: { revenue: 500000, monthlyExpenses: 200000, collectedPayments: 450000, monthlySalesCount: 45, totalProducts: 200, totalCustomers: 50, totalStaff: 15, lowStockCount: 0, overdueInvoices: 0, outstandingInvoices: 0, activeSalesOrders: 0, pendingApprovals: { leaveRequests: 0, expenseClaims: 0, purchaseOrders: 0 }, monthlyPurchases: 0, topProducts: [], receivables: 0 } })
      .mockResolvedValueOnce({ data: { data: [] } });
    mockClientGet.mockImplementation(mockGet);

    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('New Sale')).toBeInTheDocument();
      expect(screen.getByText('Invoice')).toBeInTheDocument();
    });
  });

  it('shows no activity message', async () => {
    const mockGet = vi.fn()
      .mockResolvedValueOnce({ data: { revenue: 500000, monthlyExpenses: 200000, collectedPayments: 450000, monthlySalesCount: 45, totalProducts: 200, totalCustomers: 50, totalStaff: 15, lowStockCount: 0, overdueInvoices: 0, outstandingInvoices: 0, activeSalesOrders: 0, pendingApprovals: { leaveRequests: 0, expenseClaims: 0, purchaseOrders: 0 }, monthlyPurchases: 0, topProducts: [], receivables: 0 } })
      .mockResolvedValueOnce({ data: { data: [] } });
    mockClientGet.mockImplementation(mockGet);

    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('No recent activity')).toBeInTheDocument();
    });
  });

  it('shows revenue stat card', async () => {
    const mockGet = vi.fn()
      .mockResolvedValueOnce({ data: { revenue: 500000, monthlyExpenses: 200000, collectedPayments: 450000, monthlySalesCount: 45, totalProducts: 200, totalCustomers: 50, totalStaff: 15, lowStockCount: 0, overdueInvoices: 0, outstandingInvoices: 0, activeSalesOrders: 0, pendingApprovals: { leaveRequests: 0, expenseClaims: 0, purchaseOrders: 0 }, monthlyPurchases: 0, topProducts: [], receivables: 0 } })
      .mockResolvedValueOnce({ data: { data: [] } });
    mockClientGet.mockImplementation(mockGet);

    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/Revenue/)).toBeInTheDocument();
    });
  });

  it('handles API error gracefully', async () => {
    mockClientGet.mockRejectedValue(new Error('Network error'));
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/Welcome back/)).toBeInTheDocument();
    });
  });
});
