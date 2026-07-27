import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

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

import { ProductForm } from '../pages/products/ProductForm';

function renderProductForm() {
  return render(<BrowserRouter><ProductForm product={null} onClose={vi.fn()} onSaved={vi.fn()} /></BrowserRouter>);
}

describe('ProductForm', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders form title for new product', async () => {
    mockClientGet.mockResolvedValue({ data: null });
    renderProductForm();
    await waitFor(() => {
      expect(screen.getByText('New Product')).toBeInTheDocument();
    });
  });

  it('renders form fields', async () => {
    mockClientGet.mockResolvedValue({ data: null });
    renderProductForm();
    await waitFor(() => {
      expect(screen.getByText('Product Name *')).toBeInTheDocument();
      expect(screen.getByText('SKU *')).toBeInTheDocument();
      expect(screen.getByText('Selling Price (₦) *')).toBeInTheDocument();
    });
  });

  it('shows create button', async () => {
    mockClientGet.mockResolvedValue({ data: null });
    renderProductForm();
    await waitFor(() => {
      expect(screen.getByText('Create Product')).toBeInTheDocument();
    });
  });

  it('shows cancel button', async () => {
    mockClientGet.mockResolvedValue({ data: null });
    renderProductForm();
    await waitFor(() => {
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  it('handles API error gracefully', async () => {
    mockClientGet.mockRejectedValue(new Error('Network error'));
    renderProductForm();
    await waitFor(() => {
      expect(screen.getByText('New Product')).toBeInTheDocument();
    });
  });
});
