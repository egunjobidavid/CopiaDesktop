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

import { Invoices } from '../pages/sales/Invoices';

function renderInvoices() {
  return render(<BrowserRouter><Invoices /></BrowserRouter>);
}

describe('Invoices', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders page title', async () => {
    mockClientGet.mockResolvedValue({ data: [] });
    renderInvoices();
    await waitFor(() => {
      expect(screen.getByText('Invoices')).toBeInTheDocument();
    });
  });

  it('shows new invoice button', async () => {
    mockClientGet.mockResolvedValue({ data: [] });
    renderInvoices();
    await waitFor(() => {
      expect(screen.getByText('New Invoice')).toBeInTheDocument();
    });
  });

  it('renders invoice data', async () => {
    mockClientGet.mockResolvedValue({
      data: [
        { id: 'i1', invoiceNumber: 'INV-001', customerName: 'John Doe', status: 'paid', total: 15000, createdAt: '2025-01-01' },
        { id: 'i2', invoiceNumber: 'INV-002', customerName: 'Jane Smith', status: 'pending', total: 8000, createdAt: '2025-01-02' },
      ],
    });
    renderInvoices();
    await waitFor(() => {
      expect(screen.getByText('INV-001')).toBeInTheDocument();
      expect(screen.getByText('INV-002')).toBeInTheDocument();
    });
  });

  it('shows empty state', async () => {
    mockClientGet.mockResolvedValue({ data: [] });
    renderInvoices();
    await waitFor(() => {
      expect(screen.getByText('No invoices found')).toBeInTheDocument();
    });
  });

  it('handles errors gracefully', async () => {
    mockClientGet.mockRejectedValue(new Error('Network error'));
    renderInvoices();
    await waitFor(() => {
      expect(screen.getByText('Invoices')).toBeInTheDocument();
    });
  });
});
