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

import { StockMovement } from '../pages/inventory/StockMovement';

function renderStockMovement() {
  return render(<BrowserRouter><StockMovement /></BrowserRouter>);
}

describe('StockMovement', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders page title', async () => {
    mockClientGet.mockResolvedValue({ data: [] });
    renderStockMovement();
    await waitFor(() => {
      expect(screen.getByText('Stock Movements')).toBeInTheDocument();
    });
  });

  it('renders movement data', async () => {
    mockClientGet.mockResolvedValue({
      data: [
        { id: 'm1', productName: 'Product A', type: 'in', quantity: 50, reference: 'PO-001', date: '2025-01-01' },
        { id: 'm2', productName: 'Product B', type: 'out', quantity: 20, reference: 'SO-001', date: '2025-01-02' },
      ],
    });
    renderStockMovement();
    await waitFor(() => {
      expect(screen.getByText('Product A')).toBeInTheDocument();
      expect(screen.getByText('Product B')).toBeInTheDocument();
    });
  });

  it('shows empty state', async () => {
    mockClientGet.mockResolvedValue({ data: [] });
    renderStockMovement();
    await waitFor(() => {
      expect(screen.getByText('No movements recorded')).toBeInTheDocument();
    });
  });

  it('handles errors gracefully', async () => {
    mockClientGet.mockRejectedValue(new Error('Network error'));
    renderStockMovement();
    await waitFor(() => {
      expect(screen.getByText('Stock Movements')).toBeInTheDocument();
    });
  });
});
