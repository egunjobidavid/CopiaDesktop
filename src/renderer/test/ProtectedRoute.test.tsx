import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, Outlet } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';

const renderProtectedRoute = (minRole?: string, feature?: string, initialEntries = ['/']) => {
  const mockStore = {
    user: { id: 'u1', email: 'test@test.com', role: 'MD' },
    isAuthenticated: true,
    tenantId: 't1',
    logout: jest.fn(),
  };

  jest.spyOn(require('../store/auth.store'), 'useAuthStore').mockImplementation((sel?: any) =>
    sel ? sel(mockStore) : mockStore,
  );

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
    jest.restoreAllMocks();
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
