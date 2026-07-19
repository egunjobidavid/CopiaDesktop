import { useState, useEffect, useRef, useCallback } from 'react';
import { deduplicatedFetch, invalidate } from '../api/requestCache';

export { getCacheKey } from '../api/requestCache';
export { invalidate };

interface UseDedupedQueryOptions {
  ttlMs?: number;
  enabled?: boolean;
}

interface UseDedupedQueryResult<T> {
  data: T | null;
  isLoading: boolean;
  error: unknown;
  refetch: () => void;
}

export function useDedupedQuery<T>(
  key: string,
  fetcher: (signal: AbortSignal) => Promise<T>,
  options: UseDedupedQueryOptions = {},
): UseDedupedQueryResult<T> {
  const { ttlMs = 5000, enabled = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const mountedRef = useRef(true);

  const fetch = useCallback(async () => {
    if (!enabled || !key) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await deduplicatedFetch(key, fetcher, ttlMs);
      if (mountedRef.current) {
        setData(result);
      }
    } catch (err) {
      if (mountedRef.current && !(err instanceof DOMException && err.name === 'AbortError')) {
        setError(err);
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [key, fetcher, ttlMs, enabled]);

  useEffect(() => {
    mountedRef.current = true;
    fetch();
    return () => { mountedRef.current = false; };
  }, [fetch]);

  const refetch = useCallback(() => {
    invalidate(key);
    fetch();
  }, [key, fetch]);

  return { data, isLoading, error, refetch };
}
