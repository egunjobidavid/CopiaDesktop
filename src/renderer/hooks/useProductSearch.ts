import { useState, useEffect, useRef } from 'react';

interface ProductResult {
  id: string;
  sku: string;
  name: string;
  unitPrice: string;
  productType: string;
  uom: string;
  stockQuantity: number;
}

export function useProductSearch(query: string) {
  const [results, setResults] = useState<ProductResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController>();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const api = (await import('../api/client')).default;
        const { data } = await api.get(
          `/inventory/products?search=${encodeURIComponent(query)}&limit=50`,
          { signal: controller.signal },
        );
        if (!controller.signal.aborted) {
          setResults(Array.isArray(data) ? data : []);
        }
      } catch (err: any) {
        if (err?.name !== 'CanceledError' && !controller.signal.aborted) {
          setResults([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return { results, isLoading };
}
