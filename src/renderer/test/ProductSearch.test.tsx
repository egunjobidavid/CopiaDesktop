import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProductSearch } from '../pages/pos/ProductSearch';

const { mockUseProductSearch } = vi.hoisted(() => ({
  mockUseProductSearch: vi.fn(() => ({
    results: [
      { id: 'p1', sku: 'SKU-001', name: 'Product A', unitPrice: '1000', productType: 'finished_good', uom: 'pcs', stockQuantity: 50 },
      { id: 'p2', sku: 'SKU-002', name: 'Product B', unitPrice: '500', productType: 'raw_material', uom: 'kg', stockQuantity: 100 },
    ],
    isLoading: false,
  })),
}));
vi.mock('../hooks/useProductSearch', () => ({
  useProductSearch: mockUseProductSearch,
}));

vi.mock('../hooks/useBarcode', () => ({
  useBarcode: vi.fn(() => ({ barcodeDetected: null })),
}));

vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn() } }));

describe('ProductSearch', () => {
  const onSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders search input', () => {
    render(<ProductSearch onSelect={onSelect} />);
    expect(screen.getByPlaceholderText('Search products by name or SKU...')).toBeInTheDocument();
  });

  it('renders barcode input', () => {
    render(<ProductSearch onSelect={onSelect} />);
    expect(screen.getByPlaceholderText('Scan barcode...')).toBeInTheDocument();
  });

  it('renders category filters', () => {
    render(<ProductSearch onSelect={onSelect} />);
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Raw Material')).toBeInTheDocument();
    expect(screen.getByText('Finished Good')).toBeInTheDocument();
    expect(screen.getByText('Service')).toBeInTheDocument();
  });

  it('renders product results', () => {
    render(<ProductSearch onSelect={onSelect} />);
    expect(screen.getByText('Product A')).toBeInTheDocument();
    expect(screen.getByText('Product B')).toBeInTheDocument();
    expect(screen.getByText('SKU-001')).toBeInTheDocument();
    expect(screen.getByText('SKU-002')).toBeInTheDocument();
  });

  it('shows stock info', () => {
    render(<ProductSearch onSelect={onSelect} />);
    expect(screen.getByText(/Stock: 50 pcs/)).toBeInTheDocument();
    expect(screen.getByText(/Stock: 100 kg/)).toBeInTheDocument();
  });

  it('calls onSelect when product clicked', () => {
    render(<ProductSearch onSelect={onSelect} />);
    fireEvent.click(screen.getByText('Product A'));
    expect(onSelect).toHaveBeenCalled();
  });

  it('filters by category', () => {
    render(<ProductSearch onSelect={onSelect} />);
    fireEvent.click(screen.getByText('Raw Material'));
    expect(screen.getByText('Product B')).toBeInTheDocument();
    expect(screen.queryByText('Product A')).not.toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockUseProductSearch.mockReturnValue({ results: [], isLoading: true });
    const { container } = render(<ProductSearch onSelect={onSelect} />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('shows empty state when no search query', () => {
    mockUseProductSearch.mockReturnValue({ results: [], isLoading: false });
    render(<ProductSearch onSelect={onSelect} />);
    expect(screen.getByText('Type to search products')).toBeInTheDocument();
  });

  it('shows no results when query has no match', () => {
    mockUseProductSearch.mockReturnValue({ results: [], isLoading: false });
    const { rerender } = render(<ProductSearch onSelect={onSelect} />);
    const input = screen.getByPlaceholderText('Search products by name or SKU...');
    fireEvent.change(input, { target: { value: 'nonexistent' } });
    rerender(<ProductSearch onSelect={onSelect} />);
    expect(screen.getByText('No products found')).toBeInTheDocument();
  });
});
