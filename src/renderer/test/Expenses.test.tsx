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

import { Expenses } from '../pages/expenses/Expenses';

function renderExpenses() {
  return render(<BrowserRouter><Expenses /></BrowserRouter>);
}

describe('Expenses', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders page title', async () => {
    mockClientGet.mockResolvedValue({ data: [] });
    renderExpenses();
    await waitFor(() => {
      expect(screen.getByText('Expenses')).toBeInTheDocument();
    });
  });

  it('shows add expense button', async () => {
    mockClientGet.mockResolvedValue({ data: [] });
    renderExpenses();
    await waitFor(() => {
      expect(screen.getByText('Add Expense')).toBeInTheDocument();
    });
  });

  it('renders expense data', async () => {
    mockClientGet.mockResolvedValue({
      data: [
        { id: 'e1', description: 'Office Supplies', amount: 25000, category: 'operational', date: '2025-01-01', paymentMethod: 'cash' },
        { id: 'e2', description: 'Utilities', amount: 50000, category: 'utility', date: '2025-01-02', paymentMethod: 'transfer' },
      ],
    });
    renderExpenses();
    await waitFor(() => {
      expect(screen.getByText('Office Supplies')).toBeInTheDocument();
      expect(screen.getByText('Utilities')).toBeInTheDocument();
    });
  });

  it('shows empty state', async () => {
    mockClientGet.mockResolvedValue({ data: [] });
    renderExpenses();
    await waitFor(() => {
      expect(screen.getByText('No expenses found')).toBeInTheDocument();
    });
  });

  it('handles errors gracefully', async () => {
    mockClientGet.mockRejectedValue(new Error('Network error'));
    renderExpenses();
    await waitFor(() => {
      expect(screen.getByText('Expenses')).toBeInTheDocument();
    });
  });
});
