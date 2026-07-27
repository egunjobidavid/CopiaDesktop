import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Skeleton } from '../components/Skeleton';
import { NotificationBell } from '../components/NotificationBell';
import { TrialBanner } from '../components/TrialBanner';
import { SearchModal } from '../components/SearchModal';
import { StockTransferModal } from '../components/StockTransferModal';
import { ZReportModal } from '../components/ZReportModal';
import { LineItemEditor } from '../components/LineItemEditor';
import { CsvImport } from '../components/CsvImport';
import { EmailSendModal } from '../components/EmailSendModal';
import { ForceUpdateDialog } from '../components/ForceUpdateDialog';
import { MaintenanceScreen } from '../components/MaintenanceScreen';

const { mockApiGet } = vi.hoisted(() => ({ mockApiGet: vi.fn(() => Promise.resolve({ data: [] })) }));

vi.mock('../store/auth.store', () => ({
  useAuthStore: vi.fn((selector?: any) => {
    const state = {
      user: { id: 'u1', email: 'test@test.com', fullName: 'Test User', role: 'MD' },
      isAuthenticated: true,
      tenantId: 't1',
      plan: 'free',
      setPlan: vi.fn(),
    };
    return selector ? selector(state) : state;
  }),
}));

vi.mock('../api/client', () => ({
  default: {
    get: mockApiGet,
    post: vi.fn(() => Promise.resolve({ data: {} })),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
}));

vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn() } }));

describe('UI Components', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('PageHeader', () => {
    it('renders title and subtitle', () => {
      render(<PageHeader title="Test Title" subtitle="Test Subtitle" />);
      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
    });

    it('renders actions when provided', () => {
      render(<PageHeader title="Title"><button>Action</button></PageHeader>);
      expect(screen.getByText('Action')).toBeInTheDocument();
    });

    it('renders without subtitle', () => {
      render(<PageHeader title="Title" />);
      expect(screen.getByText('Title')).toBeInTheDocument();
    });
  });

  describe('Skeleton', () => {
    it('renders with default props', () => {
      const { container } = render(<Skeleton />);
      const skeletonEl = container.firstChild as HTMLElement;
      expect(skeletonEl.className).toContain('skeleton');
    });

    it('renders with custom className', () => {
      const { container } = render(<Skeleton className="custom-class" />);
      const skeletonEl = container.firstChild as HTMLElement;
      expect(skeletonEl.className).toContain('custom-class');
    });
  });

  describe('NotificationBell', () => {
    it('renders bell icon', () => {
      render(<BrowserRouter><NotificationBell /></BrowserRouter>);
      const bell = document.querySelector('svg');
      expect(bell).toBeInTheDocument();
    });

    it('shows no notification count by default', () => {
      render(<BrowserRouter><NotificationBell /></BrowserRouter>);
      expect(screen.queryByText(/[0-9]/)).not.toBeInTheDocument();
    });
  });

  describe('TrialBanner', () => {
    it('renders for free plan', async () => {
      mockApiGet.mockResolvedValue({
        data: {
          production: { status: 'active', isTrial: true, daysLeft: 10 },
        },
      });
      render(<BrowserRouter><TrialBanner /></BrowserRouter>);
      expect(await screen.findByText(/trial/i)).toBeInTheDocument();
    });
  });

  describe('SearchModal', () => {
    it('renders search input when open', () => {
      render(<SearchModal open={true} onClose={vi.fn()} />);
      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    });

    it('calls onClose when backdrop clicked', () => {
      const onClose = vi.fn();
      render(<SearchModal open={true} onClose={onClose} />);
      const backdrops = document.querySelectorAll('.fixed.inset-0');
      const backdrop = backdrops[0];
      if (backdrop) fireEvent.click(backdrop);
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('StockTransferModal', () => {
    it('renders form', async () => {
      render(<StockTransferModal onClose={vi.fn()} />);
      expect(await screen.findByText('Stock Transfer')).toBeInTheDocument();
    });
  });

  describe('ZReportModal', () => {
    it('renders modal', () => {
      render(<ZReportModal onClose={vi.fn()} />);
      expect(screen.getByText(/end of day/i)).toBeInTheDocument();
    });
  });

  describe('LineItemEditor', () => {
    it('renders with items', () => {
      render(<LineItemEditor items={[]} onChange={vi.fn()} />);
      expect(screen.getByText('Line Items')).toBeInTheDocument();
    });
  });

  describe('CsvImport', () => {
    it('renders upload area', () => {
      render(<CsvImport title="Products" templateHeaders={['name', 'price']} requiredFields={['name']} onImport={vi.fn() as any} onClose={vi.fn()} />);
      expect(screen.getByText(/upload.*csv/i)).toBeInTheDocument();
    });
  });

  describe('EmailSendModal', () => {
    it('renders form', () => {
      render(<EmailSendModal documentType="invoice" documentNumber="INV-001" documentId="d1" onClose={vi.fn()} />);
      expect(screen.getByRole('button', { name: /send email/i })).toBeInTheDocument();
    });
  });

  describe('ForceUpdateDialog', () => {
    it('renders update prompt', () => {
      render(<ForceUpdateDialog currentVersion="1.0" latestVersion="2.0" changelog="Bug fixes" downloadUrl="https://example.com" />);
      expect(screen.getByText('Update Required')).toBeInTheDocument();
    });
  });

  describe('MaintenanceScreen', () => {
    it('renders maintenance message', () => {
      render(<MaintenanceScreen />);
      expect(screen.getByText(/maintenance/i)).toBeInTheDocument();
    });
  });
});
