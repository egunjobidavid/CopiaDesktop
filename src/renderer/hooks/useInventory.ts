import { useState, useCallback } from 'react';
import api from '../api/client';

interface StockBalance {
  productId: string;
  productName: string;
  productSku: string;
  warehouseId: string;
  warehouseName: string;
  quantity: number;
  uom: string;
}

interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  warehouseId: string;
  warehouseName: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  referenceType: string;
  referenceId: string;
  createdAt: string;
}

export function useInventory() {
  const [balances, setBalances] = useState<StockBalance[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBalances = useCallback(async (productId?: string) => {
    setIsLoading(true);
    try {
      const params = productId ? `?productId=${productId}` : '';
      const { data } = await api.get(`/inventory/stock${params}`);
      setBalances(Array.isArray(data) ? data : []);
    } catch {
      setBalances([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMovements = useCallback(async (productId?: string) => {
    setIsLoading(true);
    try {
      const params = productId ? `?productId=${productId}` : '?limit=100';
      const { data } = await api.get(`/inventory/movements${params}`);
      setMovements(Array.isArray(data) ? data : []);
    } catch {
      setMovements([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const adjustStock = useCallback(async (productId: string, quantity: number, reason: string) => {
    const { data } = await api.post('/inventory/adjust', { productId, quantity, reason });
    return data;
  }, []);

  return { balances, movements, isLoading, fetchBalances, fetchMovements, adjustStock };
}
