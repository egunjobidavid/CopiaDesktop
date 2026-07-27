import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../store/auth.store', () => ({
  useAuthStore: vi.fn((selector?: any) => {
    const state = { user: { id: 'u1', email: 'test@test.com', fullName: 'Test User', role: 'MD' } };
    return selector ? selector(state) : state;
  }),
}));

import { DownloadButton } from '../components/Invoice/DownloadButton';
import { PrintButton } from '../components/Invoice/PrintButton';

describe('Invoice Components', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('DownloadButton', () => {
    it('renders download button', () => {
      render(
        <BrowserRouter>
          <DownloadButton invoiceId="inv-1" />
        </BrowserRouter>,
      );
      expect(screen.getByText('Download PDF')).toBeInTheDocument();
    });

    it('renders with custom label', () => {
      render(
        <BrowserRouter>
          <DownloadButton invoiceId="inv-1" label="Download PDF" />
        </BrowserRouter>,
      );
      expect(screen.getByText('Download PDF')).toBeInTheDocument();
    });
  });

  describe('PrintButton', () => {
    it('renders print button', () => {
      render(
        <BrowserRouter>
          <PrintButton invoiceId="inv-1" />
        </BrowserRouter>,
      );
      expect(screen.getByText('Print Invoice')).toBeInTheDocument();
    });

    it('renders with custom label', () => {
      render(
        <BrowserRouter>
          <PrintButton invoiceId="inv-1" label="Print Invoice" />
        </BrowserRouter>,
      );
      expect(screen.getByText('Print Invoice')).toBeInTheDocument();
    });
  });
});
