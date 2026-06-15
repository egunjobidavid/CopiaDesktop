import { cache, CachedProduct } from './schema';
import api from '../api/client';

export async function syncProducts(): Promise<void> {
  try {
    const { data } = await api.get('/inventory/products?limit=1000');
    const products: CachedProduct[] = (Array.isArray(data) ? data : []).map((p: any) => ({
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

    await cache.products.bulkPut(products);
  } catch {
    // Silently fail — cached data will be used
  }
}

export async function searchCachedProducts(query: string): Promise<CachedProduct[]> {
  if (!query.trim()) {
    return cache.products.orderBy('name').limit(50).toArray();
  }

  const lower = query.toLowerCase();
  const byName = await cache.products
    .filter((p) => p.name.toLowerCase().includes(lower) || p.sku.toLowerCase().includes(lower))
    .limit(50)
    .toArray();

  return byName;
}

export async function getCachedProduct(id: string): Promise<CachedProduct | undefined> {
  return cache.products.get(id);
}

export async function getCachedProductsCount(): Promise<number> {
  return cache.products.count();
}
