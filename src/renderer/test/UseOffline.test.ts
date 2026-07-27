import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOffline } from '../hooks/useOffline';

describe('useOffline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true, writable: true });
  });

  it('returns online when navigator.onLine is true', () => {
    const { result } = renderHook(() => useOffline());
    expect(result.current.isOnline).toBe(true);
    expect(result.current.isOffline).toBe(false);
  });

  it('returns offline when navigator.onLine is false', () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true, writable: true });
    const { result } = renderHook(() => useOffline());
    expect(result.current.isOnline).toBe(false);
    expect(result.current.isOffline).toBe(true);
  });

  it('responds to online event', () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true, writable: true });
    const { result } = renderHook(() => useOffline());
    expect(result.current.isOffline).toBe(true);

    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true, writable: true });
    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(result.current.isOffline).toBe(false);
    expect(result.current.isOnline).toBe(true);
  });

  it('responds to offline event', () => {
    const { result } = renderHook(() => useOffline());
    expect(result.current.isOffline).toBe(false);

    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true, writable: true });
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(result.current.isOffline).toBe(true);
    expect(result.current.isOnline).toBe(false);
  });
});
