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

import { Production } from '../pages/production/Production';
import { ProductionCosting } from '../pages/production/ProductionCosting';

function renderInRouter(Component: () => JSX.Element) {
  return render(<BrowserRouter><Component /></BrowserRouter>);
}

describe('Production Pages', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('Production', () => {
    it('renders page title', async () => {
      mockClientGet.mockResolvedValue({ data: [] });
      renderInRouter(Production);
      await waitFor(() => {
        expect(screen.getByText('Production')).toBeInTheDocument();
      });
    });

    it('shows new work order button', async () => {
      mockClientGet.mockResolvedValue({ data: [] });
      renderInRouter(Production);
      await waitFor(() => {
        expect(screen.getByText('New Work Order')).toBeInTheDocument();
      });
    });

    it('renders work orders', async () => {
      mockClientGet.mockResolvedValue({
        data: [
          { id: 'wo1', orderNumber: 'WO-001', productName: 'Product A', quantity: 100, status: 'in_progress', dueDate: '2025-06-01' },
          { id: 'wo2', orderNumber: 'WO-002', productName: 'Product B', quantity: 50, status: 'planned', dueDate: '2025-07-01' },
        ],
      });
      renderInRouter(Production);
      await waitFor(() => {
        expect(screen.getByText('WO-001')).toBeInTheDocument();
        expect(screen.getByText('WO-002')).toBeInTheDocument();
      });
    });

    it('shows empty state', async () => {
      mockClientGet.mockResolvedValue({ data: [] });
      renderInRouter(Production);
      await waitFor(() => {
        expect(screen.getByText('No work orders yet')).toBeInTheDocument();
      });
    });
  });

  describe('ProductionCosting', () => {
    it('renders page title', async () => {
      mockClientGet.mockResolvedValue({ data: [] });
      renderInRouter(ProductionCosting);
      await waitFor(() => {
        expect(screen.getByText('Production Costing')).toBeInTheDocument();
      });
    });
  });
});
