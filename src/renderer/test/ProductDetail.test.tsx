import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

const { mockClientGet } = vi.hoisted(() => ({ mockClientGet: vi.fn() }));
vi.mock('../api/client', () => ({
  default: {
    get: mockClientGet,
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
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

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: 'p1' }),
  };
});

import { BrowserRouter } from 'react-router-dom';
import { ProductDetail } from '../pages/products/ProductDetail';

const productData = {
  id: 'p1', name: 'Test Product', sku: 'SKU-001', unitPrice: '1000',
  costPrice: '500', stockQuantity: 50, productType: 'finished_good',
  uom: 'pcs', isActive: true, description: 'A test product',
};

function renderProductDetail() {
  return render(<BrowserRouter><ProductDetail /></BrowserRouter>);
}

describe('ProductDetail', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows loading state', async () => {
    mockClientGet.mockResolvedValue({ data: [] });
    renderProductDetail();
    expect(document.querySelector('svg[class*="loader"]')).toBeInTheDocument();
  });

  it('renders product details', async () => {
    mockClientGet.mockResolvedValue({ data: [productData] });
    renderProductDetail();
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
      expect(screen.getByText('SKU-001')).toBeInTheDocument();
    });
  });

  it('shows edit button', async () => {
    mockClientGet.mockResolvedValue({ data: [productData] });
    renderProductDetail();
    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });
  });

  it('shows Stock Balances section', async () => {
    mockClientGet.mockResolvedValue({ data: [productData] });
    renderProductDetail();
    await waitFor(() => {
      expect(screen.getByText('Stock Balances')).toBeInTheDocument();
    });
  });

  it('shows Movement History section', async () => {
    mockClientGet.mockResolvedValue({ data: [productData] });
    renderProductDetail();
    await waitFor(() => {
      expect(screen.getByText('Movement History')).toBeInTheDocument();
    });
  });
});
