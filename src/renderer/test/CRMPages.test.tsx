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

import { CRM } from '../pages/crm/CRM';
import { PipelineReports } from '../pages/crm/PipelineReports';
import { EmailTemplates } from '../pages/crm/EmailTemplates';

function renderInRouter(Component: () => JSX.Element) {
  return render(<BrowserRouter><Component /></BrowserRouter>);
}

describe('CRM Pages', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('CRM', () => {
    it('renders page title', async () => {
      mockClientGet.mockResolvedValue({ data: [] });
      renderInRouter(CRM);
      await waitFor(() => {
        expect(screen.getByText('CRM Pipeline')).toBeInTheDocument();
      });
    });

    it('shows new deal button', async () => {
      mockClientGet.mockResolvedValue({ data: [] });
      renderInRouter(CRM);
      await waitFor(() => {
        expect(screen.getByText('New Deal')).toBeInTheDocument();
      });
    });

    it('renders deal stages', async () => {
      mockClientGet.mockResolvedValue({
        data: [
          {
            stage: { id: 's1', name: 'Negotiation', sequence: 3, probability: 70, color: '#6366f1', is_won: false, is_lost: false },
            deals: [
              { id: 'd1', title: 'Deal A', value: '50000', status: 'open', deal_number: 'D001', customer_id: 'c1', currency: 'NGN', probability: 70, expected_close_date: '', actual_close_date: '', assignee_id: '', source: '', type: '', notes: '', created_at: '', customer_name: 'John' },
            ],
            totalValue: 50000, dealCount: 1,
          },
          {
            stage: { id: 's2', name: 'Proposal', sequence: 2, probability: 50, color: '#f59e0b', is_won: false, is_lost: false },
            deals: [
              { id: 'd2', title: 'Deal B', value: '30000', status: 'open', deal_number: 'D002', customer_id: 'c2', currency: 'NGN', probability: 50, expected_close_date: '', actual_close_date: '', assignee_id: '', source: '', type: '', notes: '', created_at: '', customer_name: 'Jane' },
            ],
            totalValue: 30000, dealCount: 1,
          },
        ],
      });
      renderInRouter(CRM);
      await waitFor(() => {
        expect(screen.getByText('Deal A')).toBeInTheDocument();
        expect(screen.getByText('Deal B')).toBeInTheDocument();
      });
    });

    it('shows empty state', async () => {
      mockClientGet.mockResolvedValue({
        data: [
          {
            stage: { id: 's1', name: 'Negotiation', sequence: 3, probability: 70, color: '#6366f1', is_won: false, is_lost: false },
            deals: [],
            totalValue: 0, dealCount: 0,
          },
        ],
      });
      renderInRouter(CRM);
      await waitFor(() => {
        expect(screen.getByText('No deals in this stage')).toBeInTheDocument();
      });
    });
  });

  describe('PipelineReports', () => {
    it('renders page title', async () => {
      mockClientGet.mockResolvedValue({
        data: { totalDeals: 0, pipelineValue: 0, winRate: 0, avgDealValue: 0, expectedRevenue: 0, dealsByStage: [], dealsBySource: [], closingThisMonth: 0 },
      });
      renderInRouter(PipelineReports);
      await waitFor(() => {
        expect(screen.getByText('Pipeline Reports')).toBeInTheDocument();
      });
    });
  });

  describe('EmailTemplates', () => {
    it('renders page title', async () => {
      mockClientGet.mockResolvedValue({ data: [] });
      renderInRouter(EmailTemplates);
      await waitFor(() => {
        expect(screen.getByText('Email Templates')).toBeInTheDocument();
      });
    });

    it('shows new template button', async () => {
      mockClientGet.mockResolvedValue({ data: [] });
      renderInRouter(EmailTemplates);
      await waitFor(() => {
        expect(screen.getByText('New Template')).toBeInTheDocument();
      });
    });
  });
});
