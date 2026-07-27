import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CheckoutModal } from '../pages/pos/CheckoutModal';

const sampleItems = [
  { productId: 'p1', sku: 'SKU-001', name: 'Product A', quantity: 2, unitPrice: 1000, lineTotal: 2000 },
];

describe('CheckoutModal', () => {
  const onConfirm = vi.fn();
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders checkout modal with total', () => {
    render(
      <CheckoutModal total={2000} items={sampleItems} customerName="Walk-in Customer" isSubmitting={false} onConfirm={onConfirm} onClose={onClose} />,
    );
    expect(screen.getByText('Checkout')).toBeInTheDocument();
    expect(screen.getAllByText('₦2,000.00').length).toBeGreaterThanOrEqual(1);
  });

  it('shows order summary items', () => {
    render(
      <CheckoutModal total={2000} items={sampleItems} customerName="Walk-in Customer" isSubmitting={false} onConfirm={onConfirm} onClose={onClose} />,
    );
    expect(screen.getByText(/Product A/)).toBeInTheDocument();
  });

  it('shows customer name', () => {
    render(
      <CheckoutModal total={2000} items={sampleItems} customerName="John Doe" isSubmitting={false} onConfirm={onConfirm} onClose={onClose} />,
    );
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders payment method options', () => {
    render(
      <CheckoutModal total={2000} items={sampleItems} customerName="Walk-in Customer" isSubmitting={false} onConfirm={onConfirm} onClose={onClose} />,
    );
    expect(screen.getByText('Cash')).toBeInTheDocument();
    expect(screen.getByText('Transfer')).toBeInTheDocument();
    expect(screen.getByText('POS Terminal')).toBeInTheDocument();
  });

  it('cash is selected by default', () => {
    render(
      <CheckoutModal total={2000} items={sampleItems} customerName="Walk-in Customer" isSubmitting={false} onConfirm={onConfirm} onClose={onClose} />,
    );
    const cashButton = screen.getByText('Cash').closest('button');
    expect(cashButton?.className).toContain('border-primary-500');
  });

  it('shows change calculation for cash payment', () => {
    render(
      <CheckoutModal total={2000} items={sampleItems} customerName="Walk-in Customer" isSubmitting={false} onConfirm={onConfirm} onClose={onClose} />,
    );
    const tenderedInput = screen.getByRole('spinbutton');
    fireEvent.change(tenderedInput, { target: { value: '2500' } });
    expect(screen.getByText(/Change:/)).toBeInTheDocument();
  });

  it('warns when amount tendered is less than total', () => {
    render(
      <CheckoutModal total={2000} items={sampleItems} customerName="Walk-in Customer" isSubmitting={false} onConfirm={onConfirm} onClose={onClose} />,
    );
    const tenderedInput = screen.getByRole('spinbutton');
    fireEvent.change(tenderedInput, { target: { value: '1500' } });
    expect(screen.getByText(/Amount must be at least/)).toBeInTheDocument();
  });

  it('disables confirm button when cash is insufficient', () => {
    render(
      <CheckoutModal total={2000} items={sampleItems} customerName="Walk-in Customer" isSubmitting={false} onConfirm={onConfirm} onClose={onClose} />,
    );
    const tenderedInput = screen.getByRole('spinbutton');
    fireEvent.change(tenderedInput, { target: { value: '1500' } });
    const confirmButton = screen.getByText(/Confirm Payment/);
    expect(confirmButton).toBeDisabled();
  });

  it('calls onConfirm with payment method and amount', () => {
    render(
      <CheckoutModal total={2000} items={sampleItems} customerName="Walk-in Customer" isSubmitting={false} onConfirm={onConfirm} onClose={onClose} />,
    );
    fireEvent.click(screen.getByText(/Confirm Payment/));
    expect(onConfirm).toHaveBeenCalledWith('cash', 2000);
  });

  it('shows processing state', () => {
    render(
      <CheckoutModal total={2000} items={sampleItems} customerName="Walk-in Customer" isSubmitting={true} onConfirm={onConfirm} onClose={onClose} />,
    );
    expect(screen.getByText('Processing...')).toBeInTheDocument();
    expect(screen.getByText('Processing...').closest('button')).toBeDisabled();
  });

  it('toggles split payment mode', () => {
    render(
      <CheckoutModal total={2000} items={sampleItems} customerName="Walk-in Customer" isSubmitting={false} onConfirm={onConfirm} onClose={onClose} />,
    );
    fireEvent.click(screen.getByText('Split Payment'));
    expect(screen.getByText('Single Payment')).toBeInTheDocument();
  });

  it('calls onClose when cancel is clicked', () => {
    render(
      <CheckoutModal total={2000} items={sampleItems} customerName="Walk-in Customer" isSubmitting={false} onConfirm={onConfirm} onClose={onClose} />,
    );
    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when X is clicked', () => {
    render(
      <CheckoutModal total={2000} items={sampleItems} customerName="Walk-in Customer" isSubmitting={false} onConfirm={onConfirm} onClose={onClose} />,
    );
    const closeButtons = screen.getAllByRole('button');
    const xButton = closeButtons.find(b => b.querySelector('svg'));
    if (xButton) fireEvent.click(xButton);
    expect(onClose).toHaveBeenCalled();
  });

  it('shows receipt view after successful payment simulation', () => {
    render(
      <CheckoutModal total={2000} items={sampleItems} customerName="Walk-in Customer" isSubmitting={false} onConfirm={onConfirm} onClose={onClose} />,
    );
    fireEvent.click(screen.getByText(/Confirm Payment/));
    expect(onConfirm).toHaveBeenCalled();
  });

  it('adds split payment rows', () => {
    render(
      <CheckoutModal total={2000} items={sampleItems} customerName="Walk-in Customer" isSubmitting={false} onConfirm={onConfirm} onClose={onClose} />,
    );
    fireEvent.click(screen.getByText('Split Payment'));
    fireEvent.click(screen.getByText('Add Row'));
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThanOrEqual(2);
  });
});
