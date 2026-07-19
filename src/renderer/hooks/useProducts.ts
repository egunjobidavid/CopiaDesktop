import { useState, useCallback } from 'react';
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
  categoryId?: string;
  barcode?: string;
  reorderPoint?: number;
  isActive: boolean;
}

export interface ProductQuery {
  search?: string;
  limit?: number;
  page?: number;
  productType?: string;
}

// New SWR-based hook (recommended for new code)
export function useProductsSWR(query?: ProductQuery) {
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

// Backward-compatible hook (for existing pages: ProductList, ProductDetail, ProductForm)
export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProducts = useCallback(async (query?: string) => {
    setIsLoading(true);
    try {
      const params = query ? `?search=${encodeURIComponent(query)}&limit=200` : '?limit=200';
      const { data } = await api.get(`/inventory/products${params}`);
      const list = Array.isArray(data) ? data : data?.data ?? [];
      setProducts(list);
      return list;
    } catch {
      setProducts([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createProduct = useCallback(async (body: Partial<Product>) => {
    const { data } = await api.post('/inventory/products', body);
    return data;
  }, []);

  const updateProduct = useCallback(async (id: string, body: Partial<Product>) => {
    const { data } = await api.patch(`/inventory/products/${id}`, body);
    return data;
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    await api.delete(`/inventory/products/${id}`);
  }, []);

  return { products, isLoading, fetchProducts, createProduct, updateProduct, deleteProduct };
}
