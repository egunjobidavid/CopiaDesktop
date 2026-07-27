import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';

const { mockUseAuthStore } = vi.hoisted(() => ({
  mockUseAuthStore: vi.fn((selector?: any) => {
    const state = {
      user: { id: 'u1', email: 'test@test.com', role: 'MD' },
      isAuthenticated: true,
      isInitialized: true,
      tenantId: 't1',
      permissions: [],
      logout: vi.fn(),
    };
    return selector ? selector(state) : state;
  }),
}));

vi.mock('../store/auth.store', () => ({
  useAuthStore: mockUseAuthStore,
}));

const renderProtectedRoute = (minRole?: string, feature?: string, initialEntries = ['/']) => {
  mockUseAuthStore.mockImplementation((selector?: any) => {
    const state = {
      user: { id: 'u1', email: 'test@test.com', role: 'MD' },
      isAuthenticated: true,
      isInitialized: true,
      tenantId: 't1',
      permissions: [],
      logout: vi.fn(),
    };
    return selector ? selector(state) : state;
  });

  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route element={<ProtectedRoute minRole={minRole} feature={feature} />}>
          <Route path="/" element={<div data-testid="protected-content">Protected</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
};

describe('ProtectedRoute', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders children when no minRole specified', () => {
    renderProtectedRoute();
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('renders children when user meets minRole', () => {
    renderProtectedRoute('Staff');
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('renders children when user role exceeds minRole', () => {
    renderProtectedRoute('Director');
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });
});