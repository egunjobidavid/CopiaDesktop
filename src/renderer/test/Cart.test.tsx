import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Cart } from '../pages/pos/Cart';

const sampleItems = [
  { productId: 'p1', sku: 'SKU-001', name: 'Product A', quantity: 2, unitPrice: 1000, lineTotal: 2000 },
  { productId: 'p2', sku: 'SKU-002', name: 'Product B', quantity: 1, unitPrice: 500, lineTotal: 500 },
];

describe('Cart', () => {
  const onUpdateQuantity = vi.fn();
  const onRemoveItem = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty cart message', () => {
    render(<Cart items={[]} onUpdateQuantity={onUpdateQuantity} onRemoveItem={onRemoveItem} />);
    expect(screen.getByText('Cart is empty')).toBeInTheDocument();
    expect(screen.getByText('Search and select products to start')).toBeInTheDocument();
  });

  it('renders cart items', () => {
    render(<Cart items={sampleItems} onUpdateQuantity={onUpdateQuantity} onRemoveItem={onRemoveItem} />);
    expect(screen.getByText('Product A')).toBeInTheDocument();
    expect(screen.getByText('Product B')).toBeInTheDocument();
    expect(screen.getByText('SKU-001')).toBeInTheDocument();
    expect(screen.getByText('SKU-002')).toBeInTheDocument();
  });

  it('shows item quantities', () => {
    render(<Cart items={sampleItems} onUpdateQuantity={onUpdateQuantity} onRemoveItem={onRemoveItem} />);
    const quantities = screen.getAllByText(/^[0-9]+$/);
    expect(quantities).toHaveLength(2);
  });

  it('shows line totals', () => {
    render(<Cart items={sampleItems} onUpdateQuantity={onUpdateQuantity} onRemoveItem={onRemoveItem} />);
    expect(screen.getByText('₦2,000')).toBeInTheDocument();
    expect(screen.getByText('₦500')).toBeInTheDocument();
  });

  it('shows unit prices', () => {
    render(<Cart items={sampleItems} onUpdateQuantity={onUpdateQuantity} onRemoveItem={onRemoveItem} />);
    const priceLabels = screen.getAllByText(/ea/);
    expect(priceLabels.length).toBeGreaterThan(0);
  });

  it('calls onUpdateQuantity with +1', () => {
    render(<Cart items={sampleItems} onUpdateQuantity={onUpdateQuantity} onRemoveItem={onRemoveItem} />);
    const plusButtons = screen.getAllByRole('button');
    fireEvent.click(plusButtons[2]);
    expect(onUpdateQuantity).toHaveBeenCalledWith('p1', 1);
  });

  it('calls onUpdateQuantity with -1', () => {
    render(<Cart items={sampleItems} onUpdateQuantity={onUpdateQuantity} onRemoveItem={onRemoveItem} />);
    const minusButtons = screen.getAllByRole('button');
    fireEvent.click(minusButtons[1]);
    expect(onUpdateQuantity).toHaveBeenCalledWith('p1', -1);
  });

  it('disables minus button when quantity is 1', () => {
    const singleItem = [{ ...sampleItems[1], quantity: 1 }];
    render(<Cart items={singleItem} onUpdateQuantity={onUpdateQuantity} onRemoveItem={onRemoveItem} />);
    const buttons = screen.getAllByRole('button');
    const minusButton = buttons[1];
    expect(minusButton).toBeDisabled();
  });

  it('calls onRemoveItem when trash icon clicked', () => {
    render(<Cart items={sampleItems} onUpdateQuantity={onUpdateQuantity} onRemoveItem={onRemoveItem} />);
    const allButtons = screen.getAllByRole('button');
    const removeButton = allButtons.find(b => b.querySelector('svg'));
    if (removeButton) fireEvent.click(removeButton);
    expect(onRemoveItem).toHaveBeenCalledWith('p1');
  });
});
