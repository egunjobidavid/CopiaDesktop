import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useParams } from 'react-router-dom';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(() => ({})),
    useNavigate: () => vi.fn(),
  };
});

const { mockClientGet } = vi.hoisted(() => ({ mockClientGet: vi.fn() }));
vi.mock('../api/client', () => ({
  default: {
    get: mockClientGet,
    post: vi.fn(),
    put: vi.fn(),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
}));

import { POList } from '../pages/procurement/POList';
import { POForm } from '../pages/procurement/POForm';
import { PODetail } from '../pages/procurement/PODetail';
import { ApprovalQueue } from '../pages/procurement/ApprovalQueue';
import { GRNForm } from '../pages/procurement/GRNForm';
import { VendorBillPayment } from '../pages/procurement/VendorBillPayment';

function renderPOList() {
  return render(<MemoryRouter><POList /></MemoryRouter>);
}

function renderPOForm() {
  return render(<MemoryRouter><POForm /></MemoryRouter>);
}

function renderPODetail() {
  return render(<MemoryRouter><PODetail /></MemoryRouter>);
}

function renderApprovalQueue() {
  return render(<MemoryRouter><ApprovalQueue /></MemoryRouter>);
}

function renderGRNForm() {
  const testItems = [
    { productId: 'p1', productName: 'Item A', sku: 'SKU-001', orderedQuantity: 10, receivedQuantity: 0 },
  ];
  return render(<MemoryRouter><GRNForm purchaseOrderId="po1" items={testItems} onClose={vi.fn()} onCompleted={vi.fn()} /></MemoryRouter>);
}

function renderVendorBillPayment() {
  return render(<MemoryRouter><VendorBillPayment /></MemoryRouter>);
}

describe('Procurement Pages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useParams as ReturnType<typeof vi.fn>).mockReturnValue({});
  });

  describe('POList', () => {
    it('renders page title', async () => {
      mockClientGet.mockResolvedValue({ data: [] });
      renderPOList();
      await waitFor(() => {
        expect(screen.getByText('Purchase Orders')).toBeInTheDocument();
      });
    });

    it('shows new PO button', async () => {
      mockClientGet.mockResolvedValue({ data: [] });
      renderPOList();
      await waitFor(() => {
        expect(screen.getByText('New PO')).toBeInTheDocument();
      });
    });

    it('renders PO data', async () => {
      mockClientGet.mockResolvedValue({
        data: [
          { id: 'po1', orderNumber: 'PO-001', vendorName: 'Vendor A', status: 'pending', total: 50000, createdAt: '2025-01-01' },
          { id: 'po2', orderNumber: 'PO-002', vendorName: 'Vendor B', status: 'received', total: 30000, createdAt: '2025-01-02' },
        ],
      });
      renderPOList();
      await waitFor(() => {
        expect(screen.getByText('PO-001')).toBeInTheDocument();
        expect(screen.getByText('PO-002')).toBeInTheDocument();
      });
    });

    it('shows empty state', async () => {
      mockClientGet.mockResolvedValue({ data: [] });
      renderPOList();
      await waitFor(() => {
        expect(screen.getByText('No purchase orders found')).toBeInTheDocument();
      });
    });
  });

  describe('POForm', () => {
    it('renders form title for new PO', async () => {
      mockClientGet.mockResolvedValue({ data: [] });
      renderPOForm();
      await waitFor(() => {
        expect(screen.getByText('New Purchase Order')).toBeInTheDocument();
      });
    });

    it('shows vendor select', async () => {
      mockClientGet.mockResolvedValue({ data: [] });
      renderPOForm();
      await waitFor(() => {
        expect(screen.getByText('Vendor')).toBeInTheDocument();
      });
    });
  });

  describe('PODetail', () => {
    it('renders loading state', () => {
      mockClientGet.mockReturnValue(new Promise(() => {}));
      const { container } = renderPODetail();
      expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('renders PO details when data loaded', async () => {
      (useParams as ReturnType<typeof vi.fn>).mockReturnValue({ id: 'po1' });
      mockClientGet.mockResolvedValue({
        data: { id: 'po1', orderNumber: 'PO-001', vendorName: 'Vendor A', status: 'pending', total: 50000, items: [] },
      });
      renderPODetail();
      await waitFor(() => {
        expect(screen.getByText('PO-001')).toBeInTheDocument();
      });
    });
  });

  describe('ApprovalQueue', () => {
    it('renders page title', async () => {
      mockClientGet.mockResolvedValue({ data: [] });
      renderApprovalQueue();
      await waitFor(() => {
        expect(screen.getByText('Approval Queue')).toBeInTheDocument();
      });
    });

    it('shows empty state', async () => {
      mockClientGet.mockResolvedValue({ data: [] });
      renderApprovalQueue();
      await waitFor(() => {
        expect(screen.getByText('No pending approvals')).toBeInTheDocument();
      });
    });
  });

  describe('GRNForm', () => {
    it('renders form title', async () => {
      mockClientGet.mockResolvedValue({ data: [] });
      renderGRNForm();
      await waitFor(() => {
        expect(screen.getByText('Goods Receipt')).toBeInTheDocument();
      });
    });
  });

  describe('VendorBillPayment', () => {
    it('renders page title', async () => {
      mockClientGet.mockResolvedValue({ data: [] });
      renderVendorBillPayment();
      await waitFor(() => {
        expect(screen.getByText('Vendor Bill Payments')).toBeInTheDocument();
      });
    });
  });
});
