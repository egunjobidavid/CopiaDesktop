import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCart } from '../hooks/useCart';

const sampleProduct = {
  productId: 'p1',
  sku: 'SKU-001',
  name: 'Product A',
  quantity: 1,
  unitPrice: 1000,
  lineTotal: 1000,
};

describe('useCart', () => {
  it('initializes with empty cart', () => {
    const { result } = renderHook(() => useCart());
    expect(result.current.items).toEqual([]);
    expect(result.current.total).toBe(0);
    expect(result.current.itemCount).toBe(0);
  });

  it('adds item to cart', () => {
    const { result } = renderHook(() => useCart());
    act(() => result.current.addItem(sampleProduct));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].name).toBe('Product A');
    expect(result.current.total).toBe(1000);
    expect(result.current.itemCount).toBe(1);
  });

  it('increments quantity when adding same product', () => {
    const { result } = renderHook(() => useCart());
    act(() => result.current.addItem(sampleProduct));
    act(() => result.current.addItem(sampleProduct));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
    expect(result.current.items[0].lineTotal).toBe(2000);
    expect(result.current.total).toBe(2000);
    expect(result.current.itemCount).toBe(1);
  });

  it('adds multiple different products', () => {
    const { result } = renderHook(() => useCart());
    act(() => result.current.addItem(sampleProduct));
    act(() => result.current.addItem({ ...sampleProduct, productId: 'p2', name: 'Product B', unitPrice: 500, lineTotal: 500 }));
    expect(result.current.items).toHaveLength(2);
    expect(result.current.total).toBe(1500);
    expect(result.current.itemCount).toBe(2);
  });

  it('updates quantity with positive delta', () => {
    const { result } = renderHook(() => useCart());
    act(() => result.current.addItem(sampleProduct));
    act(() => result.current.updateQuantity('p1', 1));
    expect(result.current.items[0].quantity).toBe(2);
    expect(result.current.items[0].lineTotal).toBe(2000);
  });

  it('updates quantity with negative delta', () => {
    const { result } = renderHook(() => useCart());
    act(() => result.current.addItem({ ...sampleProduct, quantity: 3, lineTotal: 3000 }));
    act(() => result.current.updateQuantity('p1', -1));
    expect(result.current.items[0].quantity).toBe(2);
    expect(result.current.items[0].lineTotal).toBe(2000);
  });

  it('does not decrease quantity below 1', () => {
    const { result } = renderHook(() => useCart());
    act(() => result.current.addItem(sampleProduct));
    act(() => result.current.updateQuantity('p1', -5));
    expect(result.current.items[0].quantity).toBe(1);
  });

  it('removes item from cart', () => {
    const { result } = renderHook(() => useCart());
    act(() => result.current.addItem(sampleProduct));
    act(() => result.current.addItem({ ...sampleProduct, productId: 'p2', name: 'Product B' }));
    act(() => result.current.removeItem('p1'));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].productId).toBe('p2');
  });

  it('clears cart', () => {
    const { result } = renderHook(() => useCart());
    act(() => result.current.addItem(sampleProduct));
    act(() => result.current.addItem({ ...sampleProduct, productId: 'p2', name: 'Product B' }));
    act(() => result.current.clearCart());
    expect(result.current.items).toEqual([]);
    expect(result.current.total).toBe(0);
    expect(result.current.itemCount).toBe(0);
  });

  it('recalculates total correctly', () => {
    const { result } = renderHook(() => useCart());
    act(() => result.current.addItem(sampleProduct));
    act(() => result.current.addItem({ ...sampleProduct, productId: 'p2', name: 'Product B', unitPrice: 2000, lineTotal: 2000 }));
    expect(result.current.total).toBe(3000);
    act(() => result.current.removeItem('p1'));
    expect(result.current.total).toBe(2000);
  });

  it('handles rapid addItem calls correctly', () => {
    const { result } = renderHook(() => useCart());
    act(() => {
      result.current.addItem(sampleProduct);
      result.current.addItem(sampleProduct);
      result.current.addItem(sampleProduct);
    });
    expect(result.current.items[0].quantity).toBe(3);
    expect(result.current.items[0].lineTotal).toBe(3000);
  });
});
