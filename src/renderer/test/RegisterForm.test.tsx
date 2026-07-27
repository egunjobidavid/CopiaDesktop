import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { RegisterForm } from '../pages/RegisterForm';

vi.mock('../store/auth.store', () => ({
  useAuthStore: vi.fn((selector?: any) => {
    const state = {
      user: null,
      isAuthenticated: false,
      tenantId: null,
      login: vi.fn(),
      isInitialized: true,
    };
    return selector ? selector(state) : state;
  }),
}));

vi.mock('../api/client', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
}));

vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn() } }));

function renderRegisterForm() {
  return render(
    <BrowserRouter>
      <RegisterForm onBack={vi.fn()} />
    </BrowserRouter>,
  );
}

describe('RegisterForm', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders registration form', () => {
    renderRegisterForm();
    expect(screen.getByText('Your Account')).toBeInTheDocument();
  });

  it('renders all required fields', () => {
    renderRegisterForm();
    expect(screen.getByPlaceholderText('Your full name *')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email address *')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password (min 6 chars) *')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Organization name *')).toBeInTheDocument();
  });

  it('shows Next button on step 1', () => {
    renderRegisterForm();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
  });

  it('shows back to sign in button', () => {
    renderRegisterForm();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('calls onBack when back button clicked', () => {
    const onBack = vi.fn();
    render(
      <BrowserRouter>
        <RegisterForm onBack={onBack} />
      </BrowserRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(onBack).toHaveBeenCalled();
  });

  it('shows validation errors on submit with invalid data', async () => {
    renderRegisterForm();
    fireEvent.change(screen.getByPlaceholderText('Your full name *'), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText('Email address *'), { target: { value: 'invalid' } });
    fireEvent.change(screen.getByPlaceholderText('Password (min 6 chars) *'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Organization name *'), { target: { value: 'Acme' } });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    await waitFor(() => {
      expect(screen.getByText('Enter a valid email')).toBeInTheDocument();
    });
  });
});
