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

import { StockView } from '../pages/inventory/StockView';

function renderStockView() {
  return render(<BrowserRouter><StockView /></BrowserRouter>);
}

describe('StockView', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders page title', async () => {
    mockClientGet.mockResolvedValue({ data: [] });
    renderStockView();
    await waitFor(() => {
      expect(screen.getByText('Inventory Stock')).toBeInTheDocument();
    });
  });

  it('shows stock levels', async () => {
    mockClientGet.mockResolvedValue({
      data: [
        { id: 'p1', name: 'Product A', sku: 'SKU-A', stockQuantity: 50, unitPrice: 1000, uom: 'pcs', productType: 'finished_good' },
        { id: 'p2', name: 'Product B', sku: 'SKU-B', stockQuantity: 100, unitPrice: 500, uom: 'kg', productType: 'raw_material' },
      ],
    });
    renderStockView();
    await waitFor(() => {
      expect(screen.getByText('Product A')).toBeInTheDocument();
      expect(screen.getByText('Product B')).toBeInTheDocument();
    });
  });

  it('shows summary cards', async () => {
    mockClientGet.mockResolvedValue({ data: [] });
    renderStockView();
    await waitFor(() => {
      expect(screen.getByText('Total Items in Stock')).toBeInTheDocument();
      expect(screen.getByText('Unique Products')).toBeInTheDocument();
      expect(screen.getByText('Low Stock Items')).toBeInTheDocument();
    });
  });

  it('shows empty state', async () => {
    mockClientGet.mockResolvedValue({ data: [] });
    renderStockView();
    await waitFor(() => {
      expect(screen.getByText('No stock records found')).toBeInTheDocument();
    });
  });

  it('handles errors gracefully', async () => {
    mockClientGet.mockRejectedValue(new Error('Network error'));
    renderStockView();
    await waitFor(() => {
      expect(screen.getByText('Inventory Stock')).toBeInTheDocument();
    });
  });
});
