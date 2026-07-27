import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState } from '../components/EmptyState';
import { Package } from 'lucide-react';

describe('EmptyState', () => {
  const onClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders title', () => {
    render(<EmptyState icon={Package} title="No items found" />);
    expect(screen.getByText('No items found')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<EmptyState icon={Package} title="Empty" description="Add some items to get started" />);
    expect(screen.getByText('Add some items to get started')).toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    const { container } = render(<EmptyState icon={Package} title="Empty" />);
    expect(container.querySelector('p')).toBeNull();
  });

  it('renders action button when provided', () => {
    render(<EmptyState icon={Package} title="Empty" action={{ label: 'Add Item', onClick }} />);
    expect(screen.getByText('Add Item')).toBeInTheDocument();
  });

  it('calls onClick when action button is clicked', () => {
    render(<EmptyState icon={Package} title="Empty" action={{ label: 'Add Item', onClick }} />);
    fireEvent.click(screen.getByText('Add Item'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not render action button when not provided', () => {
    render(<EmptyState icon={Package} title="Empty" />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('renders icon container', () => {
    const { container } = render(<EmptyState icon={Package} title="Empty" />);
    const iconContainer = container.querySelector('.w-16.h-16');
    expect(iconContainer).toBeInTheDocument();
  });

  it('renders with long title', () => {
    const longTitle = 'A very long title that should still render properly in the component';
    render(<EmptyState icon={Package} title={longTitle} />);
    expect(screen.getByText(longTitle)).toBeInTheDocument();
  });

  it('renders with long description', () => {
    const longDesc = 'This is a very long description that tests whether the component handles lengthy text content well without breaking layout';
    render(<EmptyState icon={Package} title="Title" description={longDesc} />);
    expect(screen.getByText(longDesc)).toBeInTheDocument();
  });
});
