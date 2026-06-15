import { cache, CachedCustomer } from './schema';
import api from '../api/client';

export async function syncCustomers(): Promise<void> {
  try {
    const { data } = await api.get('/customers?limit=1000');
    const customers: CachedCustomer[] = (Array.isArray(data) ? data : []).map((c: any) => ({
      id: c.id,
      customerCode: c.customerCode || c.code || '',
      name: c.name,
      email: c.email || '',
      phone: c.phone || '',
      address: c.address || '',
      balance: Number(c.balance || 0),
      syncedAt: Date.now(),
    }));

    await cache.customers.bulkPut(customers);
  } catch {
    // Silently fail
  }
}

export async function searchCachedCustomers(query: string): Promise<CachedCustomer[]> {
  if (!query.trim()) {
    return cache.customers.orderBy('name').limit(20).toArray();
  }

  const lower = query.toLowerCase();
  return cache.customers
    .filter((c) => c.name.toLowerCase().includes(lower) || (c.phone || '').includes(lower) || c.customerCode.toLowerCase().includes(lower))
    .limit(20)
    .toArray();
}

export async function getCachedCustomer(id: string): Promise<CachedCustomer | undefined> {
  return cache.customers.get(id);
}

export async function getCachedCustomersCount(): Promise<number> {
  return cache.customers.count();
}
