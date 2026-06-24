import { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import toast from 'react-hot-toast';

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  unitPrice: string;
  costPrice?: string;
  productType: string;
  uom: string;
  barcode?: string;
  reorderPoint?: number;
  categoryId?: string;
  isActive: boolean;
  stockQuantity?: number;
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProducts = useCallback(async (search?: string) => {
    setIsLoading(true);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}&limit=100` : '?limit=100';
      const { data } = await api.get(`/inventory/products${params}`);
      setProducts(data?.data ?? (Array.isArray(data) ? data : []));
    } catch {
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createProduct = useCallback(async (product: Partial<Product>) => {
    const { data } = await api.post('/inventory/products', product);
    toast.success('Product created');
    await fetchProducts();
    return data;
  }, [fetchProducts]);

  const updateProduct = useCallback(async (id: string, product: Partial<Product>) => {
    const { data } = await api.patch(`/inventory/products/${id}`, product);
    toast.success('Product updated');
    await fetchProducts();
    return data;
  }, [fetchProducts]);

  const deleteProduct = useCallback(async (id: string) => {
    await api.delete(`/inventory/products/${id}`);
    toast.success('Product deleted');
    await fetchProducts();
  }, [fetchProducts]);

  return { products, isLoading, fetchProducts, createProduct, updateProduct, deleteProduct };
}
