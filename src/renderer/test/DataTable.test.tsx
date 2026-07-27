import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createColumnHelper } from '@tanstack/react-table';
import { DataTable } from '../components/DataTable';

interface TestData {
  id: string;
  name: string;
  value: number;
}

const columnHelper = createColumnHelper<TestData>();

const columns = [
  columnHelper.accessor('name', { header: 'Name', cell: (info) => info.getValue() }),
  columnHelper.accessor('value', { header: 'Value', cell: (info) => info.getValue() }),
];

const sampleData: TestData[] = [
  { id: '1', name: 'Alpha', value: 100 },
  { id: '2', name: 'Beta', value: 200 },
  { id: '3', name: 'Gamma', value: 300 },
];

describe('DataTable', () => {
  const onRowClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders table with data', () => {
    render(<DataTable data={sampleData} columns={columns} />);
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.getByText('Gamma')).toBeInTheDocument();
  });

  it('renders column headers', () => {
    render(<DataTable data={sampleData} columns={columns} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();
  });

  it('shows empty state when no data', () => {
    render(<DataTable data={[]} columns={columns} emptyMessage="No data found" />);
    expect(screen.getByText('No data found')).toBeInTheDocument();
  });

  it('shows custom empty message', () => {
    render(<DataTable data={[]} columns={columns} emptyMessage="Custom empty message" />);
    expect(screen.getByText('Custom empty message')).toBeInTheDocument();
  });

  it('renders search input when searchPlaceholder is provided', () => {
    render(<DataTable data={sampleData} columns={columns} searchPlaceholder="Search..." />);
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('calls onRowClick when a row is clicked', () => {
    render(<DataTable data={sampleData} columns={columns} onRowClick={onRowClick} />);
    fireEvent.click(screen.getByText('Alpha'));
    expect(onRowClick).toHaveBeenCalledWith(sampleData[0]);
  });

  it('shows result count', () => {
    render(<DataTable data={sampleData} columns={columns} searchPlaceholder="Search..." />);
    expect(screen.getByText(/result/)).toBeInTheDocument();
  });

  it('renders pagination for many rows', () => {
    const manyItems = Array.from({ length: 25 }, (_, i) => ({
      id: String(i),
      name: `Item ${i}`,
      value: i,
    }));
    render(<DataTable data={manyItems} columns={columns} pageSize={10} />);
    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.getByText('Previous')).toBeInTheDocument();
  });

  it('shows page info when paginated', () => {
    const manyItems = Array.from({ length: 25 }, (_, i) => ({
      id: String(i),
      name: `Item ${i}`,
      value: i,
    }));
    render(<DataTable data={manyItems} columns={columns} pageSize={10} />);
    expect(screen.getByText(/Page 1 of 3/)).toBeInTheDocument();
  });

  it('navigates pages', () => {
    const manyItems = Array.from({ length: 25 }, (_, i) => ({
      id: String(i),
      name: `Item ${i}`,
      value: i,
    }));
    render(<DataTable data={manyItems} columns={columns} pageSize={10} />);
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText(/Page 2 of 3/)).toBeInTheDocument();
  });

  it('disables previous on first page', () => {
    const manyItems = Array.from({ length: 25 }, (_, i) => ({
      id: String(i),
      name: `Item ${i}`,
      value: i,
    }));
    render(<DataTable data={manyItems} columns={columns} pageSize={10} />);
    expect(screen.getByText('Previous')).toBeDisabled();
  });

  it('filters data via search', async () => {
    render(<DataTable data={sampleData} columns={columns} searchPlaceholder="Search..." />);
    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'Alpha' } });
    await waitFor(() => {
      expect(screen.getByText('Alpha')).toBeInTheDocument();
    });
  });
});
