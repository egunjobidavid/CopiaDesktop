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

import { VendorList } from '../pages/vendors/VendorList';

function renderVendorList() {
  return render(<BrowserRouter><VendorList /></BrowserRouter>);
}

describe('VendorList', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders page title', async () => {
    mockClientGet.mockResolvedValue({ data: [] });
    renderVendorList();
    await waitFor(() => {
      expect(screen.getByText('Vendors')).toBeInTheDocument();
    });
  });

  it('shows add vendor button', async () => {
    mockClientGet.mockResolvedValue({ data: [] });
    renderVendorList();
    await waitFor(() => {
      expect(screen.getByText('Add Vendor')).toBeInTheDocument();
    });
  });

  it('renders vendor data', async () => {
    mockClientGet.mockResolvedValue({
      data: [
        { id: 'v1', name: 'Vendor A', email: 'vendor@test.com', phone: '080-111-2222', paymentTerms: 'NET30' },
        { id: 'v2', name: 'Vendor B', email: 'vendor2@test.com', phone: '080-333-4444', paymentTerms: 'NET15' },
      ],
    });
    renderVendorList();
    await waitFor(() => {
      expect(screen.getByText('Vendor A')).toBeInTheDocument();
      expect(screen.getByText('Vendor B')).toBeInTheDocument();
    });
  });

  it('shows empty state', async () => {
    mockClientGet.mockResolvedValue({ data: [] });
    renderVendorList();
    await waitFor(() => {
      expect(screen.getByText('No vendors found')).toBeInTheDocument();
    });
  });

  it('handles errors gracefully', async () => {
    mockClientGet.mockRejectedValue(new Error('Network error'));
    renderVendorList();
    await waitFor(() => {
      expect(screen.getByText('Vendors')).toBeInTheDocument();
    });
  });
});
