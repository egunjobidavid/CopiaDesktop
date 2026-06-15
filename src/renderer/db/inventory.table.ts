import { cache, CachedInventory } from './schema';
import api from '../api/client';

export async function syncInventoryBalances(): Promise<void> {
  try {
    const { data } = await api.get('/inventory/balances');
    const balances: CachedInventory[] = (Array.isArray(data) ? data : []).map((b: any) => ({
      productId: b.productId,
      productName: b.productName || b.product?.name || '',
      productSku: b.productSku || b.product?.sku || '',
      warehouseId: b.warehouseId,
      warehouseName: b.warehouseName || b.warehouse?.name || '',
      quantity: Number(b.quantity || 0),
      uom: b.uom || 'pcs',
      syncedAt: Date.now(),
    }));

    await cache.inventory.bulkPut(balances);
  } catch {
    // Silently fail
  }
}

export async function getCachedStockBalance(productId: string): Promise<number> {
  const rows = await cache.inventory
    .where('productId')
    .equals(productId)
    .toArray();

  return rows.reduce((sum, r) => sum + r.quantity, 0);
}

export async function getCachedInventoryByWarehouse(warehouseId: string): Promise<CachedInventory[]> {
  return cache.inventory.where('warehouseId').equals(warehouseId).toArray();
}

export async function getCachedInventoryCount(): Promise<number> {
  return cache.inventory.count();
}
