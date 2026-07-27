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

import { CustomerList } from '../pages/customers/CustomerList';

function renderCustomerList() {
  return render(<BrowserRouter><CustomerList /></BrowserRouter>);
}

describe('CustomerList', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders page title', async () => {
    mockClientGet.mockResolvedValue({ data: [] });
    renderCustomerList();
    await waitFor(() => {
      expect(screen.getByText('Customers')).toBeInTheDocument();
    });
  });

  it('shows add customer button', async () => {
    mockClientGet.mockResolvedValue({ data: [] });
    renderCustomerList();
    await waitFor(() => {
      expect(screen.getByText('Add Customer')).toBeInTheDocument();
    });
  });

  it('renders customer data', async () => {
    mockClientGet.mockResolvedValue({
      data: [
        { id: 'c1', name: 'John Doe', email: 'john@test.com', phone: '080-123-4567', customerCode: 'C001', creditLimit: 500000 },
        { id: 'c2', name: 'Jane Smith', email: 'jane@test.com', phone: '080-987-6543', customerCode: 'C002', creditLimit: 300000 },
      ],
    });
    renderCustomerList();
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('shows empty state', async () => {
    mockClientGet.mockResolvedValue({ data: [] });
    renderCustomerList();
    await waitFor(() => {
      expect(screen.getByText('No customers found')).toBeInTheDocument();
    });
  });

  it('handles errors gracefully', async () => {
    mockClientGet.mockRejectedValue(new Error('Network error'));
    renderCustomerList();
    await waitFor(() => {
      expect(screen.getByText('Customers')).toBeInTheDocument();
    });
  });
});
