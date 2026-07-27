import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockGetState, mockUseAuthStore } = vi.hoisted(() => {
  const _mockGetState = vi.fn();
  const _mockUseAuthStore = vi.fn((selector?: any) => {
    const state = { user: { id: 'u1', role: 'MD' }, permissions: [] };
    return selector ? selector(state) : state;
  });
  Object.assign(_mockUseAuthStore, {
    getState: _mockGetState,
    subscribe: vi.fn(),
    setState: vi.fn(),
    getInitialState: vi.fn(),
  });
  return { mockGetState: _mockGetState, mockUseAuthStore: _mockUseAuthStore };
});

vi.mock('../store/auth.store', () => ({
  useAuthStore: mockUseAuthStore,
}));

import { canAccessModule, usePermission } from '../hooks/usePermission';

describe('usePermission', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('canAccessModule', () => {
    it('returns false when no user', () => {
      mockGetState.mockReturnValue({ user: null, permissions: [] });
      expect(canAccessModule('dashboard')).toBe(false);
    });

    it('returns true for Staff-accessible module with Staff role', () => {
      mockGetState.mockReturnValue({ user: { id: 'u1', role: 'Staff' }, permissions: [] });
      expect(canAccessModule('dashboard')).toBe(true);
    });

    it('returns false for Accountant module with Staff role', () => {
      mockGetState.mockReturnValue({ user: { id: 'u1', role: 'Staff' }, permissions: [] });
      expect(canAccessModule('accounting')).toBe(false);
    });

    it('returns true for Accountant role accessing accounting', () => {
      mockGetState.mockReturnValue({ user: { id: 'u1', role: 'Accountant' }, permissions: [] });
      expect(canAccessModule('accounting')).toBe(true);
    });

    it('returns true for MD accessing any module', () => {
      mockGetState.mockReturnValue({ user: { id: 'u1', role: 'MD' }, permissions: [] });
      expect(canAccessModule('accounting')).toBe(true);
      expect(canAccessModule('fixed_assets')).toBe(true);
      expect(canAccessModule('hr')).toBe(true);
    });

    it('uses permissions array when configured', () => {
      mockGetState.mockReturnValue({ user: { id: 'u1', role: 'Staff' }, permissions: ['dashboard', 'hr'] });
      expect(canAccessModule('dashboard')).toBe(true);
      expect(canAccessModule('hr')).toBe(true);
      expect(canAccessModule('accounting')).toBe(false);
    });

    it('handles unknown module with Staff default', () => {
      mockGetState.mockReturnValue({ user: { id: 'u1', role: 'Staff' }, permissions: [] });
      expect(canAccessModule('unknown_module')).toBe(true);
    });

    it('handles viewer role correctly', () => {
      mockGetState.mockReturnValue({ user: { id: 'u1', role: 'viewer' }, permissions: [] });
      expect(canAccessModule('dashboard')).toBe(false);
      expect(canAccessModule('support')).toBe(false);
    });
  });

  describe('usePermission hook', () => {
    it('returns permission checking function', () => {
      const { result } = renderHook(() => usePermission());
      expect(result.current.permissions).toEqual([]);
      expect(typeof result.current.canAccess).toBe('function');
    });
  });
});

function renderHook(callback: () => any) {
  const result = { current: callback() };
  return { result };
}
