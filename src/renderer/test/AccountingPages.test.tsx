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

import { ChartOfAccounts } from '../pages/accounting/ChartOfAccounts';
import { GeneralLedger } from '../pages/accounting/GeneralLedger';
import { TrialBalance } from '../pages/accounting/TrialBalance';
import { BalanceSheet } from '../pages/accounting/BalanceSheet';
import { ProfitAndLoss } from '../pages/accounting/ProfitAndLoss';
import { BankReconciliation } from '../pages/accounting/BankReconciliation';
import { FiscalPeriods } from '../pages/accounting/FiscalPeriods';
import { TaxConfig } from '../pages/accounting/TaxConfig';

function renderInRouter(Component: () => JSX.Element) {
  return render(<BrowserRouter><Component /></BrowserRouter>);
}

describe('Accounting Pages', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('ChartOfAccounts', () => {
    it('renders page title', async () => {
      mockClientGet.mockResolvedValue({ data: [] });
      renderInRouter(ChartOfAccounts);
      await waitFor(() => {
        expect(screen.getByText('Chart of Accounts')).toBeInTheDocument();
      });
    });

    it('shows new account button', async () => {
      mockClientGet.mockResolvedValue({ data: [] });
      renderInRouter(ChartOfAccounts);
      await waitFor(() => {
        expect(screen.getByText('Add Account')).toBeInTheDocument();
      });
    });

    it('renders account data', async () => {
      mockClientGet.mockResolvedValue({
        data: [
          { id: 'a1', code: '1000', name: 'Cash', type: 'asset', balance: 500000 },
          { id: 'a2', code: '2000', name: 'Accounts Payable', type: 'liability', balance: 200000 },
        ],
      });
      renderInRouter(ChartOfAccounts);
      await waitFor(() => {
        expect(screen.getByText('Cash')).toBeInTheDocument();
        expect(screen.getByText('Accounts Payable')).toBeInTheDocument();
      });
    });

    it('shows empty state', async () => {
      mockClientGet.mockResolvedValue({ data: [] });
      renderInRouter(ChartOfAccounts);
      await waitFor(() => {
        expect(screen.getByText('No accounts found')).toBeInTheDocument();
      });
    });
  });

  describe('GeneralLedger', () => {
    it('renders page title', async () => {
      mockClientGet.mockResolvedValue({ data: [] });
      renderInRouter(GeneralLedger);
      await waitFor(() => {
        expect(screen.getByText('General Ledger')).toBeInTheDocument();
      });
    });
  });

  describe('TrialBalance', () => {
    it('renders page title', async () => {
      mockClientGet.mockResolvedValue({ data: [] });
      renderInRouter(TrialBalance);
      await waitFor(() => {
        expect(screen.getByText('Trial Balance')).toBeInTheDocument();
      });
    });

    it('shows generate button', async () => {
      mockClientGet.mockResolvedValue({ data: [] });
      renderInRouter(TrialBalance);
      await waitFor(() => {
        expect(screen.getByText('Export CSV')).toBeInTheDocument();
      });
    });
  });

  describe('BalanceSheet', () => {
    it('renders page title', async () => {
      mockClientGet.mockResolvedValue({ data: [] });
      renderInRouter(BalanceSheet);
      await waitFor(() => {
        expect(screen.getByText('Balance Sheet')).toBeInTheDocument();
      });
    });
  });

  describe('ProfitAndLoss', () => {
    it('renders page title', async () => {
      mockClientGet.mockResolvedValue({ data: [] });
      renderInRouter(ProfitAndLoss);
      await waitFor(() => {
        expect(screen.getByText('Profit & Loss Statement')).toBeInTheDocument();
      });
    });
  });

  describe('BankReconciliation', () => {
    it('renders page title', async () => {
      mockClientGet.mockResolvedValue({ data: [] });
      renderInRouter(BankReconciliation);
      await waitFor(() => {
        expect(screen.getByText('Bank Reconciliation')).toBeInTheDocument();
      });
    });
  });

  describe('FiscalPeriods', () => {
    it('renders page title', async () => {
      mockClientGet.mockResolvedValue({ data: [] });
      renderInRouter(FiscalPeriods);
      await waitFor(() => {
        expect(screen.getByText('Fiscal Periods')).toBeInTheDocument();
      });
    });
  });

  describe('TaxConfig', () => {
    it('renders page title', async () => {
      mockClientGet.mockResolvedValue({ data: [] });
      renderInRouter(TaxConfig);
      await waitFor(() => {
        expect(screen.getByText('Tax Configuration')).toBeInTheDocument();
      });
    });
  });
});
