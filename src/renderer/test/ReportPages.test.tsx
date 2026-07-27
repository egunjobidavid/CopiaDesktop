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

import { Reports } from '../pages/reports/Reports';
import { SalesReport } from '../pages/reports/SalesReport';
import { InventoryReport } from '../pages/reports/InventoryReport';
import { FinancialReport } from '../pages/reports/FinancialReport';

function renderInRouter(Component: () => JSX.Element) {
  return render(<BrowserRouter><Component /></BrowserRouter>);
}

describe('Report Pages', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('Reports', () => {
    it('renders page title', async () => {
      mockClientGet.mockResolvedValue({ data: [] });
      renderInRouter(Reports);
      await waitFor(() => {
        expect(screen.getByText('Reports')).toBeInTheDocument();
      });
    });

    it('shows report category cards', async () => {
      mockClientGet.mockResolvedValue({ data: [] });
      renderInRouter(Reports);
      await waitFor(() => {
        expect(screen.getByText('Sales Report')).toBeInTheDocument();
        expect(screen.getByText('Inventory Report')).toBeInTheDocument();
        expect(screen.getByText('Financial Report')).toBeInTheDocument();
      });
    });
  });

  describe('SalesReport', () => {
    it('renders page title', async () => {
      mockClientGet.mockResolvedValue({ data: [] });
      renderInRouter(SalesReport);
      await waitFor(() => {
        expect(screen.getByText('Sales Report')).toBeInTheDocument();
      });
    });

    it('shows date range filter', async () => {
      mockClientGet.mockResolvedValue({ data: [] });
      renderInRouter(SalesReport);
      await waitFor(() => {
        expect(screen.getByText('30d')).toBeInTheDocument();
      });
    });
  });

  describe('InventoryReport', () => {
    it('renders page title', async () => {
      mockClientGet.mockResolvedValue({ data: [] });
      renderInRouter(InventoryReport);
      await waitFor(() => {
        expect(screen.getByText('Inventory Report')).toBeInTheDocument();
      });
    });
  });

  describe('FinancialReport', () => {
    it('renders page title', async () => {
      mockClientGet.mockResolvedValue({ data: [] });
      renderInRouter(FinancialReport);
      await waitFor(() => {
        expect(screen.getByText('Financial Report')).toBeInTheDocument();
      });
    });
  });
});
