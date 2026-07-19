import { useState, useEffect, useRef, useCallback } from 'react';
import { cache } from '../db/schema';

interface SWROptions<T> {
  fetcher: () => Promise<T>;
  cacheKey: string;
  /** Read from IndexedDB cache immediately (serves stale) */
  readCache: () => Promise<T | null>;
  /** Write fetched data to IndexedDB cache */
  writeCache: (data: T) => Promise<void>;
  /** Revalidation interval in ms (0 = disabled) */
  revalidateInterval?: number;
  /** Stale time in ms — data older than this is considered stale */
  staleTime?: number;
  /** Whether to revalidate on mount (default: true) */
  revalidateOnMount?: boolean;
  /** Whether to revalidate on window focus */
  revalidateOnFocus?: boolean;
}

interface SWRResult<T> {
  data: T | null;
  isStale: boolean;
  isValidating: boolean;
  error: unknown;
  mutate: () => void;
}

export function useSWR<T>({
  fetcher,
  cacheKey,
  readCache,
  writeCache,
  revalidateInterval = 0,
  staleTime = 30_000,
  revalidateOnMount = true,
  revalidateOnFocus = true,
}: SWROptions<T>): SWRResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isStale, setIsStale] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const mountedRef = useRef(true);
  const lastFetchedRef = useRef<number>(0);

  const revalidate = useCallback(async (skipStaleCheck = false) => {
    if (!skipStaleCheck && !isStale) return;
    setIsValidating(true);
    setError(null);
    try {
      const result = await fetcher();
      if (mountedRef.current) {
        setData(result);
        setIsStale(false);
        lastFetchedRef.current = Date.now();
        writeCache(result).catch(() => {});
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err);
      }
    } finally {
      if (mountedRef.current) {
        setIsValidating(false);
      }
    }
  }, [fetcher, isStale, writeCache]);

  // Serve stale from IndexedDB on mount
  useEffect(() => {
    mountedRef.current = true;
    let cancelled = false;

    (async () => {
      try {
        const cached = await readCache();
        if (!cancelled && mountedRef.current && cached !== null) {
          setData(cached);
          setIsStale(true);
        }
      } catch {
        // Cache read failed — will rely on network
      }

      if (!cancelled && revalidateOnMount) {
        revalidate(true);
      }
    })();

    return () => {
      mountedRef.current = false;
    };
  }, [cacheKey]);

  // Auto-revalidate when stale
  useEffect(() => {
    if (!isStale || isValidating) return;
    const timer = setTimeout(() => revalidate(true), 0);
    return () => clearTimeout(timer);
  }, [isStale, isValidating, revalidate]);

  // Interval revalidation
  useEffect(() => {
    if (revalidateInterval <= 0) return;
    const interval = setInterval(() => {
      setIsStale(true);
    }, revalidateInterval);
    return () => clearInterval(interval);
  }, [revalidateInterval]);

  // Revalidate on window focus
  useEffect(() => {
    if (!revalidateOnFocus) return;
    const handler = () => {
      const timeSinceFetch = Date.now() - lastFetchedRef.current;
      if (timeSinceFetch > staleTime) {
        setIsStale(true);
      }
    };
    window.addEventListener('visibilitychange', handler);
    return () => window.removeEventListener('visibilitychange', handler);
  }, [revalidateOnFocus, staleTime]);

  const mutate = useCallback(() => {
    setIsStale(true);
  }, []);

  return { data, isStale, isValidating, error, mutate };
}

// Pre-built SWR configurations for common entities
export function useSWRProducts() {
  return useSWR({
    cacheKey: 'products',
    fetcher: async () => {
      const api = (await import('../api/client')).default;
      const { data } = await api.get('/inventory/products?limit=1000');
      return Array.isArray(data) ? data : data?.data ?? [];
    },
    readCache: () => cache.products.toArray(),
    writeCache: async (products: any[]) => {
      const items = products.map((p: any) => ({
        id: p.id,
        sku: p.sku,
        name: p.name,
        description: p.description || '',
        unitPrice: Number(p.unitPrice || 0),
        productType: p.productType || 'finished_good',
        uom: p.uom || 'pcs',
        isActive: p.isActive ?? true,
        stockQuantity: Number(p.stockQuantity || 0),
        stockValue: Number(p.stockQuantity || 0) * Number(p.unitPrice || 0),
        syncedAt: Date.now(),
      }));
      await cache.products.bulkPut(items);
    },
    staleTime: 10_000,
  });
}

export function useSWRCustomers() {
  return useSWR({
    cacheKey: 'customers',
    fetcher: async () => {
      const api = (await import('../api/client')).default;
      const { data } = await api.get('/customers?limit=1000');
      return Array.isArray(data) ? data : data?.data ?? [];
    },
    readCache: () => cache.customers.toArray(),
    writeCache: async (customers: any[]) => {
      const items = customers.map((c: any) => ({
        id: c.id,
        customerCode: c.customerCode || '',
        name: c.name,
        email: c.email || '',
        phone: c.phone || '',
        address: c.address || '',
        balance: Number(c.balance || 0),
        syncedAt: Date.now(),
      }));
      await cache.customers.bulkPut(items);
    },
    staleTime: 15_000,
  });
}
