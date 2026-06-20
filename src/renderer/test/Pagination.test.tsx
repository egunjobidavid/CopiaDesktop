import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from '../components/Pagination';

describe('Pagination', () => {
  const onPageChange = vi.fn();

  beforeEach(() => {
    onPageChange.mockClear();
  });

  it('renders nothing when totalPages is 1', () => {
    const { container } = render(
      <Pagination page={1} totalPages={1} total={5} onPageChange={onPageChange} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('shows total results count', () => {
    render(
      <Pagination page={1} totalPages={3} total={45} onPageChange={onPageChange} />,
    );
    expect(screen.getByText('45 results')).toBeInTheDocument();
  });

  it('shows singular for 1 result', () => {
    render(
      <Pagination page={1} totalPages={1} total={1} onPageChange={onPageChange} />,
    );
    // totalPages=1 returns null, so test with 2 pages
    const { container } = render(
      <Pagination page={1} totalPages={2} total={1} onPageChange={onPageChange} />,
    );
    expect(screen.getByText('1 result')).toBeInTheDocument();
  });

  it('calls onPageChange when clicking a page', () => {
    render(
      <Pagination page={1} totalPages={5} total={50} onPageChange={onPageChange} />,
    );
    fireEvent.click(screen.getByText('3'));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('disables previous button on first page', () => {
    render(
      <Pagination page={1} totalPages={5} total={50} onPageChange={onPageChange} />,
    );
    const prevButton = screen.getAllByRole('button')[0];
    expect(prevButton).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(
      <Pagination page={5} totalPages={5} total={50} onPageChange={onPageChange} />,
    );
    const buttons = screen.getAllByRole('button');
    const nextButton = buttons[buttons.length - 1];
    expect(nextButton).toBeDisabled();
  });

  it('shows ellipsis for large page counts', () => {
    render(
      <Pagination page={5} totalPages={20} total={200} onPageChange={onPageChange} />,
    );
    const ellipses = screen.getAllByText('...');
    expect(ellipses.length).toBeGreaterThanOrEqual(1);
  });
});
