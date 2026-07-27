import '@testing-library/jest-dom';

// Mock zustand stores
vi.mock('../store/auth.store', () => ({
  useAuthStore: vi.fn(() => ({
    user: { id: 'test-user', email: 'test@test.com', role: 'MD' },
    isAuthenticated: true,
    tenantId: 'test-tenant',
    logout: vi.fn(),
  })),
  __esModule: true,
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useParams: () => ({}),
  };
});

// Mock scrollTo
window.scrollTo = vi.fn();

// Polyfill ResizeObserver (used by recharts)
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserverMock as any;
