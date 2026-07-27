import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

import { ProductList } from '../pages/products/ProductList';

function renderProductList() {
  return render(<BrowserRouter><ProductList /></BrowserRouter>);
}

describe('ProductList', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders page title', async () => {
    mockClientGet.mockResolvedValue({ data: [] });
    renderProductList();
    await waitFor(() => {
      expect(screen.getByText('Products')).toBeInTheDocument();
    });
  });

  it('shows add product button', async () => {
    mockClientGet.mockResolvedValue({ data: [] });
    renderProductList();
    await waitFor(() => {
      expect(screen.getByText('Add Product')).toBeInTheDocument();
    });
  });

  it('renders product table with data', async () => {
    mockClientGet.mockResolvedValue({
      data: [
        { id: 'p1', name: 'Product A', sku: 'SKU-A', unitPrice: 1000, stockQuantity: 50, productType: 'finished_good', uom: 'pcs' },
        { id: 'p2', name: 'Product B', sku: 'SKU-B', unitPrice: 500, stockQuantity: 100, productType: 'raw_material', uom: 'kg' },
      ],
    });
    renderProductList();
    await waitFor(() => {
      expect(screen.getByText('Product A')).toBeInTheDocument();
      expect(screen.getByText('Product B')).toBeInTheDocument();
    });
  });

  it('shows empty state when no products', async () => {
    mockClientGet.mockResolvedValue({ data: [] });
    renderProductList();
    await waitFor(() => {
      expect(screen.getByText('No products found')).toBeInTheDocument();
    });
  });

  it('handles API error gracefully', async () => {
    mockClientGet.mockRejectedValue(new Error('Network error'));
    renderProductList();
    await waitFor(() => {
      expect(screen.getByText('Products')).toBeInTheDocument();
    });
  });
});
