import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../store/auth.store', () => ({
  useAuthStore: vi.fn((selector?: any) => {
    const state = {
      user: { id: 'u1', email: 'test@test.com', fullName: 'Test User', role: 'Sales Rep' },
      isAuthenticated: true,
      tenantId: 't1',
    };
    return selector ? selector(state) : state;
  }),
}));

const { mockClientGet } = vi.hoisted(() => ({ mockClientGet: vi.fn().mockResolvedValue({ data: null }) }));
vi.mock('../api/client', () => ({
  default: {
    get: mockClientGet,
    post: vi.fn(),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
}));

vi.mock('../hooks/useCart', () => ({
  useCart: vi.fn(() => ({
    items: [],
    addItem: vi.fn(),
    updateQuantity: vi.fn(),
    removeItem: vi.fn(),
    clearCart: vi.fn(),
    total: 0,
    itemCount: 0,
  })),
}));

vi.mock('../pages/pos/ProductSearch', () => ({
  ProductSearch: ({ onSelect }: any) => (
    <div data-testid="product-search">
      <button onClick={() => onSelect({ id: 'p1', sku: 'SKU-1', name: 'Test Product', unitPrice: '1000' })}>Add Product</button>
    </div>
  ),
}));

vi.mock('../pages/pos/Cart', () => ({
  Cart: () => <div data-testid="cart">Cart</div>,
}));

vi.mock('../pages/pos/CustomerSelect', () => ({
  CustomerSelect: ({ onSelect }: any) => (
    <div data-testid="customer-select">
      <button onClick={() => onSelect({ id: 'c1', name: 'John' })}>Select Customer</button>
    </div>
  ),
}));

vi.mock('../pages/pos/CheckoutModal', () => ({
  CheckoutModal: ({ onClose }: any) => <div data-testid="checkout-modal"><button onClick={onClose}>Close</button></div>,
}));

vi.mock('../components/ZReportModal', () => ({
  ZReportModal: ({ onClose }: any) => <div data-testid="zreport-modal"><button onClick={onClose}>Close</button></div>,
}));

import { Pos } from '../pages/pos/Pos';

function renderPos() {
  return render(<BrowserRouter><Pos /></BrowserRouter>);
}

describe('Pos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows open drawer screen when no session', async () => {
    mockClientGet.mockResolvedValue({ data: null });
    renderPos();
    await waitFor(() => {
      expect(screen.getByText('Open Cash Drawer')).toBeInTheDocument();
    });
  });

  it('shows POS interface when session exists', async () => {
    mockClientGet.mockResolvedValue({
      data: { id: 's1', openedAt: new Date().toISOString(), openingBalance: 5000, totalSales: 10000, transactionCount: 5 },
    });
    renderPos();
    await waitFor(() => {
      expect(screen.getByText('Point of Sale')).toBeInTheDocument();
    });
  });

  it('shows session time and total', async () => {
    mockClientGet.mockResolvedValue({
      data: { id: 's1', openedAt: new Date().toISOString(), openingBalance: 5000, totalSales: 10000, transactionCount: 5 },
    });
    renderPos();
    await waitFor(() => {
      expect(screen.getByText(/today/)).toBeInTheDocument();
    });
  });

  it('shows End of Day button', async () => {
    mockClientGet.mockResolvedValue({
      data: { id: 's1', openedAt: new Date().toISOString(), openingBalance: 5000, totalSales: 10000, transactionCount: 5 },
    });
    renderPos();
    await waitFor(() => {
      expect(screen.getByText('End of Day')).toBeInTheDocument();
    });
  });

  it('shows View Sales History link', async () => {
    mockClientGet.mockResolvedValue({
      data: { id: 's1', openedAt: new Date().toISOString(), openingBalance: 5000, totalSales: 10000, transactionCount: 5 },
    });
    renderPos();
    await waitFor(() => {
      expect(screen.getByText('View Sales History')).toBeInTheDocument();
    });
  });

  it('shows opening balance modal when open drawer clicked', async () => {
    mockClientGet.mockResolvedValue({ data: null });
    renderPos();
    await waitFor(() => {
      fireEvent.click(screen.getByText('Open Drawer'));
    });
    expect(screen.getByText('Opening Balance (₦)')).toBeInTheDocument();
  });

  it('shows barcode input in POS mode', async () => {
    mockClientGet.mockResolvedValue({
      data: { id: 's1', openedAt: new Date().toISOString(), openingBalance: 5000, totalSales: 0, transactionCount: 0 },
    });
    renderPos();
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Scan barcode or enter SKU...')).toBeInTheDocument();
    });
  });

  it('shows product search component', async () => {
    mockClientGet.mockResolvedValue({
      data: { id: 's1', openedAt: new Date().toISOString(), openingBalance: 5000, totalSales: 0, transactionCount: 0 },
    });
    renderPos();
    await waitFor(() => {
      expect(screen.getByTestId('product-search')).toBeInTheDocument();
    });
  });

  it('shows cart component', async () => {
    mockClientGet.mockResolvedValue({
      data: { id: 's1', openedAt: new Date().toISOString(), openingBalance: 5000, totalSales: 0, transactionCount: 0 },
    });
    renderPos();
    await waitFor(() => {
      expect(screen.getByTestId('cart')).toBeInTheDocument();
    });
  });

  it('shows customer select component', async () => {
    mockClientGet.mockResolvedValue({
      data: { id: 's1', openedAt: new Date().toISOString(), openingBalance: 5000, totalSales: 0, transactionCount: 0 },
    });
    renderPos();
    await waitFor(() => {
      expect(screen.getByTestId('customer-select')).toBeInTheDocument();
    });
  });

  it('opens Z-report modal', async () => {
    mockClientGet.mockResolvedValue({
      data: { id: 's1', openedAt: new Date().toISOString(), openingBalance: 5000, totalSales: 10000, transactionCount: 5 },
    });
    renderPos();
    await waitFor(() => {
      fireEvent.click(screen.getByText('End of Day'));
    });
    expect(screen.getByTestId('zreport-modal')).toBeInTheDocument();
  });
});
