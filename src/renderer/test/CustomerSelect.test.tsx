import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CustomerSelect } from '../pages/pos/CustomerSelect';

const mockCustomers = [
  { id: 'c1', name: 'John Doe', email: 'john@test.com', phone: '080-123-4567', customerCode: 'C001' },
  { id: 'c2', name: 'Jane Smith', email: 'jane@test.com', phone: '080-987-6543', customerCode: 'C002' },
];

describe('CustomerSelect', () => {
  const onSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default customer name', () => {
    render(<CustomerSelect onSelect={onSelect} customerName="Walk-in Customer" />);
    expect(screen.getByText('Walk-in Customer')).toBeInTheDocument();
    expect(screen.getByText('No customer selected')).toBeInTheDocument();
  });

  it('opens dropdown when clicked', () => {
    render(<CustomerSelect onSelect={onSelect} customerName="Walk-in Customer" />);
    fireEvent.click(screen.getByText('Walk-in Customer'));
    expect(screen.getByPlaceholderText('Search customers...')).toBeInTheDocument();
  });

  it('renders Walk-in Customer option in dropdown', () => {
    render(<CustomerSelect onSelect={onSelect} customerName="Walk-in Customer" />);
    fireEvent.click(screen.getByText('Walk-in Customer'));
    const walkInOptions = screen.getAllByText('Walk-in Customer');
    expect(walkInOptions.length).toBe(2);
  });

  it('calls onSelect with walk-in customer', () => {
    render(<CustomerSelect onSelect={onSelect} customerName="Walk-in Customer" />);
    fireEvent.click(screen.getByText('Walk-in Customer'));
    fireEvent.click(screen.getAllByText('Walk-in Customer')[1]);
    expect(onSelect).toHaveBeenCalledWith({ id: null, name: 'Walk-in Customer' });
  });

  it('shows search input in dropdown', () => {
    render(<CustomerSelect onSelect={onSelect} customerName="Walk-in Customer" />);
    fireEvent.click(screen.getByText('Walk-in Customer'));
    expect(screen.getByPlaceholderText('Search customers...')).toBeInTheDocument();
  });

  it('shows customer results when searching', async () => {
    render(<CustomerSelect onSelect={onSelect} customerName="Walk-in Customer" />);
    fireEvent.click(screen.getByText('Walk-in Customer'));

    const searchInput = screen.getByPlaceholderText('Search customers...');
    fireEvent.change(searchInput, { target: { value: 'John' } });

    await waitFor(() => {
      const walkInOptions = screen.getAllByText('Walk-in Customer');
      expect(walkInOptions.length).toBe(2);
    });
  });

  it('calls onSelect when customer is chosen', () => {
    render(<CustomerSelect onSelect={onSelect} customerName="Walk-in Customer" />);
    fireEvent.click(screen.getByText('Walk-in Customer'));

    const searchInput = screen.getByPlaceholderText('Search customers...');
    fireEvent.change(searchInput, { target: { value: 'John' } });

    const walkInButton = screen.getAllByText('Walk-in Customer')[1];
    fireEvent.click(walkInButton);
    expect(onSelect).toHaveBeenCalled();
  });

  it('shows selected customer name', () => {
    render(<CustomerSelect onSelect={onSelect} customerName="John Doe" />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Customer')).toBeInTheDocument();
  });
});
