import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Login } from '../pages/Login';

const { mockUseSearchParams } = vi.hoisted(() => ({ mockUseSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()]) }));
vi.mock('react-router-dom', async (importOriginal) => {
  const mod = await importOriginal();
  return { ...mod, useSearchParams: mockUseSearchParams };
});

const { mockUseAuthStore } = vi.hoisted(() => ({
  mockUseAuthStore: vi.fn((selector?: any) => {
    const state = {
      user: null,
      isAuthenticated: false,
      tenantId: null,
      login: vi.fn(),
      logout: vi.fn(),
      isInitialized: true,
    };
    return selector ? selector(state) : state;
  }),
}));
vi.mock('../store/auth.store', () => ({
  useAuthStore: mockUseAuthStore,
}));

const { mockClientPost } = vi.hoisted(() => ({ mockClientPost: vi.fn() }));
vi.mock('../api/client', () => ({
  default: {
    post: mockClientPost,
    get: vi.fn(),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
}));

vi.mock('../assets/logo.svg', () => ({ default: 'logo.svg' }));

function renderLogin() {
  return render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>,
  );
}

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSearchParams.mockReturnValue([new URLSearchParams(), vi.fn()]);
  });

  it('renders login form by default', () => {
    renderLogin();
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    expect(screen.getAllByText('Sign In').length).toBeGreaterThan(0);
  });

  it('renders email and password fields', () => {
    renderLogin();
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('shows validation errors on empty submit', async () => {
    renderLogin();
    fireEvent.click(screen.getAllByText('Sign In')[1]);
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  it('shows email validation for invalid format', async () => {
    renderLogin();
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'invalid' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'pass123' } });
    fireEvent.submit(screen.getAllByText('Sign In')[1].closest('form')!);
    await waitFor(() => {
      expect(screen.getByText('Enter a valid email')).toBeInTheDocument();
    });
  });

  it('shows password length validation', async () => {
    renderLogin();
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: '12345' } });
    fireEvent.click(screen.getAllByText('Sign In')[1]);
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
    });
  });

  it('calls login with correct credentials', async () => {
    const mockLogin = vi.fn();
    mockUseAuthStore.mockImplementation((selector?: any) => {
      const state = { user: null, isAuthenticated: false, tenantId: null, login: mockLogin, isInitialized: true };
      return selector ? selector(state) : state;
    });
    renderLogin();
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getAllByText('Sign In')[1]);
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@test.com', 'password123');
    });
  });

  it('shows loading state during login', async () => {
    const mockLogin = vi.fn(() => new Promise(() => {}));
    mockUseAuthStore.mockImplementation((selector?: any) => {
      const state = { user: null, isAuthenticated: false, tenantId: null, login: mockLogin, isInitialized: true };
      return selector ? selector(state) : state;
    });
    renderLogin();
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getAllByText('Sign In')[1]);
    await waitFor(() => {
      expect(screen.getByText('Signing in...')).toBeInTheDocument();
    });
  });

  it('toggles password visibility', () => {
    renderLogin();
    const passwordInput = screen.getByLabelText('Password');
    expect(passwordInput).toHaveAttribute('type', 'password');
    fireEvent.click(screen.getByText('Show'));
    expect(passwordInput).toHaveAttribute('type', 'text');
    fireEvent.click(screen.getByText('Hide'));
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('switches to register mode', () => {
    renderLogin();
    fireEvent.click(screen.getByText('Register'));
    expect(screen.getByText('Register your organization')).toBeInTheDocument();
  });

  it('switches to forgot password mode', () => {
    renderLogin();
    fireEvent.click(screen.getByText('Forgot password?'));
    expect(screen.getByText('Reset your password')).toBeInTheDocument();
  });

  it('shows reset password form with token param', () => {
    mockUseSearchParams.mockReturnValue([new URLSearchParams('reset=token123'), vi.fn()]);
    renderLogin();
    expect(screen.getByText('Enter new password')).toBeInTheDocument();
  });

  it('handles forget password submit', async () => {
    mockClientPost.mockResolvedValue({});
    renderLogin();
    fireEvent.click(screen.getByText('Forgot password?'));
    fireEvent.change(screen.getByPlaceholderText('you@company.com'), { target: { value: 'test@test.com' } });
    fireEvent.click(screen.getByText('Generate Reset Token'));
    await waitFor(() => {
      expect(mockClientPost).toHaveBeenCalledWith('/auth/forgot-password', { email: 'test@test.com' }, { timeout: 10000 });
    });
  });

  it('clears errors when user types', async () => {
    renderLogin();
    fireEvent.click(screen.getAllByText('Sign In')[1]);
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'a' } });
    await waitFor(() => {
      expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
    });
  });

  it('renders terms of service text', () => {
    renderLogin();
    expect(screen.getByText(/By continuing/)).toBeInTheDocument();
  });
});
