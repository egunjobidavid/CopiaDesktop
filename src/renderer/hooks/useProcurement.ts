import { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import toast from 'react-hot-toast';

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  vendorId: string;
  vendorName?: string;
  status: string;
  total: number;
  notes?: string;
  createdAt: string;
  items?: POItem[];
}

export interface POItem {
  id: string;
  productId: string;
  productName?: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  receivedQuantity: number;
}

export interface Vendor {
  id: string;
  vendorCode: string;
  name: string;
  email?: string;
  phone?: string;
}

export function useProcurement() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchOrders = useCallback(async (search?: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (search) params.set('search', search);
      const { data } = await api.get(`/procurement/purchase-orders?${params.toString()}`);
      setOrders(data?.data ?? (Array.isArray(data) ? data : []));
    } catch {
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchOrder = useCallback(async (id: string) => {
    const { data } = await api.get(`/procurement/purchase-orders/${id}`);
    return data;
  }, []);

  const createOrder = useCallback(async (order: any) => {
    const { data } = await api.post('/procurement/purchase-orders', order);
    toast.success('Purchase order created');
    return data;
  }, []);

  const updateStatus = useCallback(async (id: string, status: string) => {
    const { data } = await api.patch(`/procurement/purchase-orders/${id}/status`, { status });
    toast.success(`Order status updated to ${status}`);
    return data;
  }, []);

  const deleteOrder = useCallback(async (id: string) => {
    await api.delete(`/procurement/purchase-orders/${id}`);
    toast.success('Purchase order deleted');
  }, []);

  const createGRN = useCallback(async (purchaseOrderId: string, items: any[]) => {
    const { data } = await api.post('/procurement/goods-receipts', { purchaseOrderId, items });
    toast.success('Goods receipt recorded');
    return data;
  }, []);

  const searchVendors = useCallback(async (q: string) => {
    if (!q.trim()) return [];
    const { data } = await api.get(`/vendors?search=${encodeURIComponent(q)}&limit=10`);
    return data?.data ?? (Array.isArray(data) ? data : []);
  }, []);

  const searchProducts = useCallback(async (q: string) => {
    if (!q.trim()) return [];
    const { data } = await api.get(`/inventory/products?search=${encodeURIComponent(q)}&limit=10`);
    return data?.data ?? (Array.isArray(data) ? data : []);
  }, []);

  return { orders, isLoading, fetchOrders, fetchOrder, createOrder, updateStatus, deleteOrder, createGRN, searchVendors, searchProducts };
}
