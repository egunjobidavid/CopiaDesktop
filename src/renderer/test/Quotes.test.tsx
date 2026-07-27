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

import { Quotes } from '../pages/sales/Quotes';

function renderQuotes() {
  return render(<BrowserRouter><Quotes /></BrowserRouter>);
}

describe('Quotes', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders page title', async () => {
    mockClientGet.mockResolvedValue({ data: [] });
    renderQuotes();
    await waitFor(() => {
      expect(screen.getByText('Quotes')).toBeInTheDocument();
    });
  });

  it('shows new quote button', async () => {
    mockClientGet.mockResolvedValue({ data: [] });
    renderQuotes();
    await waitFor(() => {
      expect(screen.getByText('New Quote')).toBeInTheDocument();
    });
  });

  it('renders quote data', async () => {
    mockClientGet.mockResolvedValue({
      data: {
        data: [
          { id: 'q1', quoteNumber: 'QT-001', customerName: 'John Doe', status: 'approved', total: 25000, createdAt: '2025-01-01' },
          { id: 'q2', quoteNumber: 'QT-002', customerName: 'Jane Smith', status: 'draft', total: 12000, createdAt: '2025-01-02' },
        ],
      },
    });
    renderQuotes();
    await waitFor(() => {
      expect(screen.getByText('QT-001')).toBeInTheDocument();
      expect(screen.getByText('QT-002')).toBeInTheDocument();
    });
  });

  it('shows empty state', async () => {
    mockClientGet.mockResolvedValue({ data: [] });
    renderQuotes();
    await waitFor(() => {
      expect(screen.getByText('No quotes found')).toBeInTheDocument();
    });
  });

  it('handles errors gracefully', async () => {
    mockClientGet.mockRejectedValue(new Error('Network error'));
    renderQuotes();
    await waitFor(() => {
      expect(screen.getByText('Quotes')).toBeInTheDocument();
    });
  });
});
