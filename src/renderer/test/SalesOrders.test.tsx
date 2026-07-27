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

import { SalesOrders } from '../pages/sales/SalesOrders';

function renderSalesOrders() {
  return render(<BrowserRouter><SalesOrders /></BrowserRouter>);
}

describe('SalesOrders', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders page title', async () => {
    mockClientGet.mockResolvedValue({ data: [] });
    renderSalesOrders();
    await waitFor(() => {
      expect(screen.getByText('Sales Orders')).toBeInTheDocument();
    });
  });

  it('shows new order button', async () => {
    mockClientGet.mockResolvedValue({ data: [] });
    renderSalesOrders();
    await waitFor(() => {
      expect(screen.getByText('New Order')).toBeInTheDocument();
    });
  });

  it('renders order data', async () => {
    mockClientGet.mockResolvedValue({
      data: [
        { id: 'o1', orderNumber: 'SO-001', customerName: 'John Doe', status: 'pending', total: 5000, createdAt: '2025-01-01' },
        { id: 'o2', orderNumber: 'SO-002', customerName: 'Jane Smith', status: 'completed', total: 3000, createdAt: '2025-01-02' },
      ],
    });
    renderSalesOrders();
    await waitFor(() => {
      expect(screen.getByText('SO-001')).toBeInTheDocument();
      expect(screen.getByText('SO-002')).toBeInTheDocument();
    });
  });

  it('shows empty state', async () => {
    mockClientGet.mockResolvedValue({ data: [] });
    renderSalesOrders();
    await waitFor(() => {
      expect(screen.getByText('No sales orders found')).toBeInTheDocument();
    });
  });

  it('handles errors gracefully', async () => {
    mockClientGet.mockRejectedValue(new Error('Network error'));
    renderSalesOrders();
    await waitFor(() => {
      expect(screen.getByText('Sales Orders')).toBeInTheDocument();
    });
  });
});
