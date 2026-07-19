import { useState, useEffect, useRef, useCallback } from 'react';

interface SmartPollOptions<T> {
  /** Function that fetches data */
  fetcher: () => Promise<T>;
  /** Polling interval in ms (default: 30000) */
  interval?: number;
  /** Whether polling is enabled (default: true) */
  enabled?: boolean;
  /** Whether to pause when tab is hidden (default: true) */
  pauseWhenHidden?: boolean;
  /** Whether to pause when window loses focus (default: true) */
  pauseWhenBlurred?: boolean;
  /** Max consecutive errors before backing off (default: 3) */
  maxErrorsBeforeBackoff?: number;
  /** Backoff multiplier (default: 2) */
  backoffMultiplier?: number;
  /** Max backoff interval in ms (default: 300000 = 5min) */
  maxBackoffInterval?: number;
  /** Callback when poll succeeds */
  onSuccess?: (data: T) => void;
  /** Callback when poll fails */
  onError?: (error: unknown) => void;
}

interface SmartPollResult<T> {
  data: T | null;
  isPolling: boolean;
  isPaused: boolean;
  lastPollAt: number | null;
  errorCount: number;
  /** Force an immediate poll */
  poll: () => void;
  /** Pause polling */
  pause: () => void;
  /** Resume polling */
  resume: () => void;
}

export function useSmartPoll<T>({
  fetcher,
  interval = 30_000,
  enabled = true,
  pauseWhenHidden = true,
  pauseWhenBlurred = true,
  maxErrorsBeforeBackoff = 3,
  backoffMultiplier = 2,
  maxBackoffInterval = 300_000,
  onSuccess,
  onError,
}: SmartPollOptions<T>): SmartPollResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [lastPollAt, setLastPollAt] = useState<number | null>(null);
  const [errorCount, setErrorCount] = useState(0);

  const mountedRef = useRef(true);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const currentIntervalRef = useRef(interval);
  const pauseCountRef = useRef(0);

  // Poll function
  const doPoll = useCallback(async () => {
    if (!enabled || isPaused) return;
    setIsPolling(true);
    try {
      const result = await fetcher();
      if (mountedRef.current) {
        setData(result);
        setErrorCount(0);
        currentIntervalRef.current = interval; // Reset backoff
        setLastPollAt(Date.now());
        onSuccess?.(result);
      }
    } catch (err) {
      if (mountedRef.current) {
        setErrorCount((prev) => {
          const next = prev + 1;
          if (next >= maxErrorsBeforeBackoff) {
            // Apply backoff
            currentIntervalRef.current = Math.min(
              currentIntervalRef.current * backoffMultiplier,
              maxBackoffInterval,
            );
          }
          return next;
        });
        onError?.(err);
      }
    } finally {
      if (mountedRef.current) {
        setIsPolling(false);
      }
    }
  }, [fetcher, enabled, isPaused, interval, maxErrorsBeforeBackoff, backoffMultiplier, maxBackoffInterval, onSuccess, onError]);

  // Start/stop interval
  useEffect(() => {
    mountedRef.current = true;

    if (!enabled || isPaused) {
      clearInterval(intervalRef.current);
      return () => {
        clearInterval(intervalRef.current);
      };
    }

    // Initial poll
    doPoll();

    // Set interval
    intervalRef.current = setInterval(() => {
      doPoll();
    }, currentIntervalRef.current);

    return () => {
      mountedRef.current = false;
      clearInterval(intervalRef.current);
    };
  }, [enabled, isPaused, doPoll, interval]);

  // Update interval when backoff changes
  useEffect(() => {
    if (!enabled || isPaused) return;
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      doPoll();
    }, currentIntervalRef.current);
    return () => clearInterval(intervalRef.current);
  }, [errorCount]);

  // Pause when hidden
  useEffect(() => {
    if (!pauseWhenHidden) return;

    const handleVisibility = () => {
      if (document.hidden) {
        pauseCountRef.current++;
        setIsPaused(true);
      } else {
        pauseCountRef.current = Math.max(0, pauseCountRef.current - 1);
        if (pauseCountRef.current === 0) {
          setIsPaused(false);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [pauseWhenHidden]);

  // Pause when window loses focus
  useEffect(() => {
    if (!pauseWhenBlurred) return;

    const handleBlur = () => {
      pauseCountRef.current++;
      setIsPaused(true);
    };

    const handleFocus = () => {
      pauseCountRef.current = Math.max(0, pauseCountRef.current - 1);
      if (pauseCountRef.current === 0) {
        setIsPaused(false);
      }
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [pauseWhenBlurred]);

  const poll = useCallback(() => {
    doPoll();
  }, [doPoll]);

  const pause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    pauseCountRef.current = 0;
    setIsPaused(false);
  }, []);

  return {
    data,
    isPolling,
    isPaused,
    lastPollAt,
    errorCount,
    poll,
    pause,
    resume,
  };
}

// Pre-built polling hooks for common entities

export function usePollDashboard(intervalMs = 30_000) {
  return useSmartPoll({
    interval: intervalMs,
    fetcher: async () => {
      const api = (await import('../api/client')).default;
      const { data } = await api.get('/analytics/dashboard');
      return data;
    },
  });
}

export function usePollNotifications(intervalMs = 60_000) {
  return useSmartPoll({
    interval: intervalMs,
    fetcher: async () => {
      const api = (await import('../api/client')).default;
      const { data } = await api.get('/notifications?limit=20');
      return Array.isArray(data) ? data : data?.data ?? data?.rows ?? [];
    },
  });
}

export function usePollApprovals(intervalMs = 45_000) {
  return useSmartPoll({
    interval: intervalMs,
    fetcher: async () => {
      const api = (await import('../api/client')).default;
      const { data } = await api.get('/approvals/queue');
      return Array.isArray(data) ? data : data?.data ?? [];
    },
  });
}
