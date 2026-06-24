import { useState, useEffect, useCallback } from 'react';
import { useOffline } from './useOffline';
import { searchCachedProducts, getCachedProduct } from '../db/products.table';
import { searchCachedCustomers, getCachedCustomer } from '../db/customers.table';
import { getCachedStockBalance } from '../db/inventory.table';
import api from '../api/client';

export function useCache() {
  const { isOffline } = useOffline();
  const [isCacheReady, setIsCacheReady] = useState(false);

  useEffect(() => {
    // Check if cache has data
    import('../db/schema').then(({ cache }) => {
      cache.open().then(() => setIsCacheReady(true));
    });
  }, []);

  const searchProducts = useCallback(
    async (query: string) => {
      if (isOffline || !navigator.onLine) {
        return searchCachedProducts(query);
      }
      try {
        const { data } = await api.get(`/inventory/products?search=${encodeURIComponent(query)}&limit=50`);
        return data?.data ?? (Array.isArray(data) ? data : []);
      } catch {
        return searchCachedProducts(query);
      }
    },
    [isOffline],
  );

  const searchCustomers = useCallback(
    async (query: string) => {
      if (isOffline || !navigator.onLine) {
        return searchCachedCustomers(query);
      }
      try {
        const { data } = await api.get(`/customers?search=${encodeURIComponent(query)}&limit=20`);
        return data?.data ?? (Array.isArray(data) ? data : []);
      } catch {
        return searchCachedCustomers(query);
      }
    },
    [isOffline],
  );

  const getStockBalance = useCallback(async (productId: string) => {
    if (isOffline || !navigator.onLine) {
      return getCachedStockBalance(productId);
    }
    try {
      const { data } = await api.get(`/inventory/balances?productId=${productId}`);
      const balances = Array.isArray(data) ? data : [];
      return balances.reduce((sum: number, b: any) => sum + Number(b.quantity || 0), 0);
    } catch {
      return getCachedStockBalance(productId);
    }
  }, [isOffline]);

  return { isCacheReady, isOffline, searchProducts, searchCustomers, getStockBalance };
}
