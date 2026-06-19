import '@testing-library/jest-dom';

// Mock zustand stores
jest.mock('../store/auth.store', () => ({
  useAuthStore: jest.fn(() => ({
    user: { id: 'test-user', email: 'test@test.com', role: 'MD' },
    isAuthenticated: true,
    tenantId: 'test-tenant',
    logout: jest.fn(),
  })),
  __esModule: true,
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => jest.fn(),
    useParams: () => ({}),
  };
});

// Mock scrollTo
window.scrollTo = jest.fn();
