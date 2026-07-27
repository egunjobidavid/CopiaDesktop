import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Breadcrumbs } from '../components/Breadcrumbs';

function renderBreadcrumbs(pathname: string) {
  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <Breadcrumbs />
    </MemoryRouter>,
  );
}

describe('Breadcrumbs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null for root path', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Breadcrumbs />
      </MemoryRouter>,
    );
    expect(container.firstChild).toBeNull();
  });

  it('returns null for single segment path', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Breadcrumbs />
      </MemoryRouter>,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders breadcrumbs for nested path', () => {
    renderBreadcrumbs('/products/new');
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('renders home icon button', () => {
    renderBreadcrumbs('/products/new');
    expect(screen.getAllByRole('button')[0]).toBeInTheDocument();
  });

  it('renders known route labels', () => {
    renderBreadcrumbs('/settings/locations');
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Locations')).toBeInTheDocument();
  });

  it('capitalizes unknown route segments', () => {
    renderBreadcrumbs('/some/customroute');
    expect(screen.getByText('Some')).toBeInTheDocument();
    expect(screen.getByText('Customroute')).toBeInTheDocument();
  });

  it('shows last segment as non-clickable text', () => {
    renderBreadcrumbs('/products/new');
    const newLabel = screen.getByText('New');
    expect(newLabel.tagName).toBe('SPAN');
  });

  it('shows intermediate segments as clickable buttons', () => {
    renderBreadcrumbs('/accounting/chart-of-accounts');
    const accountingBtn = screen.getByText('Accounting');
    expect(accountingBtn.tagName).toBe('BUTTON');
  });

  it('renders chevron separators', () => {
    renderBreadcrumbs('/products/new');
    const chevrons = document.querySelectorAll('nav svg');
    expect(chevrons.length).toBeGreaterThan(0);
  });

  it('handles many path segments', () => {
    renderBreadcrumbs('/a/b/c/d/e');
    const segments = ['A', 'B', 'C', 'D', 'E'];
    segments.forEach(s => expect(screen.getByText(s)).toBeInTheDocument());
  });
});
