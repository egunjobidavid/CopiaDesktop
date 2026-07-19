import { useCallback } from 'react';
import { useDedupedQuery, getCacheKey } from './useDedupedQuery';
import api from '../api/client';

export interface Product {
  id: string;
  name: string;
  sku: string;
  unitPrice: string;
  costPrice: string;
  productType: string;
  uom: string;
  stockQuantity: number;
  description?: string;
  category?: string;
  isActive: boolean;
}

export interface ProductQuery {
  search?: string;
  limit?: number;
  page?: number;
  productType?: string;
}

export function useProducts(query?: ProductQuery) {
  const cacheKey = getCacheKey('/inventory/products', query);

  const fetcher = useCallback(
    (signal: AbortSignal) =>
      api
        .get('/inventory/products', {
          params: query,
          signal,
        })
        .then(({ data }) => {
          if (Array.isArray(data)) return data;
          if (data?.data && Array.isArray(data.data)) return data.data;
          return [];
        }),
    [query?.search, query?.limit, query?.page, query?.productType],
  );

  return useDedupedQuery<Product[]>(cacheKey, fetcher, { ttlMs: 10000 });
}

export function useProduct(id: string | null) {
  const cacheKey = id ? `/inventory/products/${id}` : '';

  const fetcher = useCallback(
    (signal: AbortSignal) =>
      api
        .get(`/inventory/products/${id}`, { signal })
        .then(({ data }) => data as Product),
    [id],
  );

  return useDedupedQuery<Product>(cacheKey, fetcher, { ttlMs: 15000, enabled: !!id });
}
