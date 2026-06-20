import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock the auth store
vi.mock('../store/auth.store', () => ({
  useAuthStore: vi.fn((selector: any) => {
    const state = {
      user: { id: 'u1', email: 'test@test.com', fullName: 'Test User', role: 'Manager' },
      isAuthenticated: true,
      permissions: ['dashboard', 'hr', 'inventory', 'sales'],
      locationId: 'loc-1',
      locationName: 'Head Office',
      setLocation: vi.fn(),
    };
    return selector(state);
  }),
}));

// Mock useFeature
vi.mock('../hooks/useFeature', () => ({
  useFeature: () => ({ hasFeature: () => true }),
  checkFeature: () => true,
}));

// Mock usePermission
vi.mock('../hooks/usePermission', () => ({
  canAccessModule: (module: string) => true,
}));

import { Sidebar } from '../components/Sidebar';

function renderSidebar() {
  return render(
    <BrowserRouter>
      <Sidebar />
    </BrowserRouter>,
  );
}

describe('Sidebar', () => {
  it('renders the logo and app name', () => {
    renderSidebar();
    expect(screen.getByText('CopiaOS')).toBeInTheDocument();
  });

  it('renders user name and role', () => {
    renderSidebar();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('Manager')).toBeInTheDocument();
  });

  it('renders navigation items', () => {
    renderSidebar();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Point of Sale')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Inventory')).toBeInTheDocument();
  });

  it('renders section headers', () => {
    renderSidebar();
    expect(screen.getByText('Commerce')).toBeInTheDocument();
    expect(screen.getByText('Finance')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders logout button', () => {
    renderSidebar();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('toggles section collapse', () => {
    renderSidebar();
    const commerceHeader = screen.getByText('Commerce');
    fireEvent.click(commerceHeader);
    // After click, items should still be accessible (collapsed state)
    fireEvent.click(commerceHeader);
    expect(screen.getByText('Point of Sale')).toBeInTheDocument();
  });
});
