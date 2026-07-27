import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Layout } from '../components/Layout';

vi.mock('../store/auth.store', () => ({
  useAuthStore: vi.fn((selector?: any) => {
    const state = {
      user: { id: 'u1', email: 'test@test.com', fullName: 'Test User', role: 'Manager' },
      isAuthenticated: true,
      tenantId: 't1',
      locationId: 'loc-1',
      locationName: 'Office',
      setLocation: vi.fn(),
      logout: vi.fn(),
    };
    return selector ? selector(state) : state;
  }),
}));

vi.mock('../api/client', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: [] }),
    post: vi.fn(),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
}));

vi.mock('../components/Sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar">Sidebar</div>,
}));

vi.mock('../components/Header', () => ({
  Header: ({ onSearchOpen }: any) => (
    <div data-testid="header">
      Header
      <button onClick={onSearchOpen} data-testid="search-trigger">Search</button>
    </div>
  ),
}));

vi.mock('../components/SearchModal', () => ({
  SearchModal: ({ open, onClose }: any) =>
    open ? <div data-testid="search-modal">Search Modal<button onClick={onClose}>Close</button></div> : null,
}));

vi.mock('../components/TrialBanner', () => ({
  TrialBanner: () => <div data-testid="trial-banner">Trial</div>,
}));

const { mockUseOffline } = vi.hoisted(() => ({ mockUseOffline: vi.fn(() => ({ isOffline: false })) }));
vi.mock('../hooks/useOffline', () => ({
  useOffline: mockUseOffline,
}));

function renderLayout(initialEntries = ['/']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<div data-testid="page-content">Page Content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('Layout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders sidebar, header, and page content', () => {
    renderLayout();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('page-content')).toBeInTheDocument();
  });

  it('renders trial banner', () => {
    renderLayout();
    expect(screen.getByTestId('trial-banner')).toBeInTheDocument();
  });

  it('toggles search modal with Ctrl+K', () => {
    renderLayout();
    expect(screen.queryByTestId('search-modal')).not.toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    expect(screen.getByTestId('search-modal')).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    expect(screen.queryByTestId('search-modal')).not.toBeInTheDocument();
  });

  it('toggles search modal with Meta+K', () => {
    renderLayout();
    expect(screen.queryByTestId('search-modal')).not.toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    expect(screen.getByTestId('search-modal')).toBeInTheDocument();
  });

  it('shows offline banner when offline', () => {
    mockUseOffline.mockReturnValue({ isOffline: true });
    renderLayout();
    expect(screen.getByText(/You are offline/)).toBeInTheDocument();
  });

  it('shows loading fallback for lazy routes', () => {
    const LazyPage = React.lazy(() => new Promise<{ default: React.ComponentType }>(() => {}));
    render(
      <MemoryRouter initialEntries={['/lazy']}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/lazy" element={<LazyPage />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
    const loadingSpinner = document.querySelector('.animate-spin');
    expect(loadingSpinner).toBeTruthy();
  });

  it('opens search modal via header button', () => {
    renderLayout();
    expect(screen.queryByTestId('search-modal')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('search-trigger'));
    expect(screen.getByTestId('search-modal')).toBeInTheDocument();
  });
});
