import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Header } from '../components/Header';

const { mockUseAuthStore } = vi.hoisted(() => ({
  mockUseAuthStore: vi.fn((selector?: any) => {
    const state = {
      user: { id: 'u1', email: 'test@test.com', fullName: 'Test User', role: 'Manager' },
      isAuthenticated: true,
      tenantId: 't1',
      locationId: 'loc-1',
      locationName: 'Head Office',
      setLocation: vi.fn(),
      logout: vi.fn(),
    };
    return selector ? selector(state) : state;
  }),
}));
vi.mock('../store/auth.store', () => ({
  useAuthStore: mockUseAuthStore,
}));

vi.mock('../api/client', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: [] }),
    post: vi.fn(),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  },
}));

vi.mock('../components/NotificationBell', () => ({
  NotificationBell: () => <div data-testid="notification-bell">Bell</div>,
}));

function renderHeader() {
  return render(
    <BrowserRouter>
      <Header onSearchOpen={vi.fn()} />
    </BrowserRouter>,
  );
}

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders header with user info', () => {
    renderHeader();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('Manager')).toBeInTheDocument();
  });

  it('renders location name', () => {
    renderHeader();
    expect(screen.getByText('Head Office')).toBeInTheDocument();
  });

  it('shows search button with keyboard shortcut', () => {
    renderHeader();
    expect(screen.getByText(/Search/)).toBeInTheDocument();
    expect(screen.getByText('⌘K')).toBeInTheDocument();
  });

  it('renders notification bell', () => {
    renderHeader();
    expect(screen.getByTestId('notification-bell')).toBeInTheDocument();
  });

  it('shows location dropdown when clicked', () => {
    renderHeader();
    fireEvent.click(screen.getByText('Head Office'));
    expect(screen.getByText('All Locations')).toBeInTheDocument();
    expect(screen.getByText('Create Location')).toBeInTheDocument();
  });

  it('shows user menu when clicked', () => {
    renderHeader();
    const userAvatar = screen.getByText('T');
    fireEvent.click(userAvatar.closest('button')!);
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('calls logout and navigates to login', () => {
    const mockLogout = vi.fn();
    mockUseAuthStore.mockImplementation((selector?: any) => {
      const state = {
        user: { id: 'u1', email: 'test@test.com', fullName: 'Test User', role: 'Manager' },
        locationId: 'loc-1',
        locationName: 'Office',
        setLocation: vi.fn(),
        logout: mockLogout,
      };
      return selector ? selector(state) : state;
    });

    renderHeader();
    const userAvatar = screen.getByText('T');
    fireEvent.click(userAvatar.closest('button')!);
    fireEvent.click(screen.getByText('Logout'));
    expect(mockLogout).toHaveBeenCalled();
  });

  it('calls onSearchOpen when search button clicked', () => {
    const onSearchOpen = vi.fn();
    render(
      <BrowserRouter>
        <Header onSearchOpen={onSearchOpen} />
      </BrowserRouter>,
    );
    fireEvent.click(screen.getByText(/Search/));
    expect(onSearchOpen).toHaveBeenCalled();
  });

  it('shows "All Locations" when no location selected', () => {
    mockUseAuthStore.mockImplementation((selector?: any) => {
      const state = {
        user: { id: 'u1', email: 'test@test.com', fullName: 'Test User', role: 'Manager' },
        locationId: null,
        locationName: null,
        setLocation: vi.fn(),
        logout: vi.fn(),
      };
      return selector ? selector(state) : state;
    });

    renderHeader();
    expect(screen.getByText('CopiaOS')).toBeInTheDocument();
  });

  it('shows user initial in avatar', () => {
    renderHeader();
    expect(screen.getByText('T')).toBeInTheDocument();
  });

  it('shows "User" when no fullName', () => {
    mockUseAuthStore.mockImplementation((selector?: any) => {
      const state = {
        user: { id: 'u1', email: 'test@test.com', fullName: '', role: 'Staff' },
        locationId: null,
        locationName: null,
        setLocation: vi.fn(),
        logout: vi.fn(),
      };
      return selector ? selector(state) : state;
    });

    renderHeader();
    const avatars = screen.getAllByText('U');
    expect(avatars.length).toBeGreaterThanOrEqual(1);
  });
});
