import { syncProducts } from '../db/products.table';
import { syncCustomers } from '../db/customers.table';
import { syncInventoryBalances } from '../db/inventory.table';

let syncTimer: ReturnType<typeof setInterval> | null = null;
let isSyncing = false;

async function runSync(): Promise<{ products: number; customers: number; inventory: number }> {
  const results = { products: 0, customers: 0, inventory: 0 };

  const start = performance.now();

  try {
    await syncProducts();
    results.products = 1;
  } catch { /* ignore */ }

  try {
    await syncCustomers();
    results.customers = 1;
  } catch { /* ignore */ }

  try {
    await syncInventoryBalances();
    results.inventory = 1;
  } catch { /* ignore */ }

  const elapsed = Math.round(performance.now() - start);

  console.log(`[Sync] Completed in ${elapsed}ms`, results);
  return results;
}

export function startSync(intervalMs = 300000): void {
  if (syncTimer) return;

  // Run immediately
  if (!isSyncing) {
    isSyncing = true;
    runSync().finally(() => { isSyncing = false; });
  }

  syncTimer = setInterval(() => {
    if (!isSyncing && navigator.onLine) {
      isSyncing = true;
      runSync().finally(() => { isSyncing = false; });
    }
  }, intervalMs);

  window.addEventListener('online', () => {
    if (!isSyncing) {
      isSyncing = true;
      runSync().finally(() => { isSyncing = false; });
    }
  });
}

export function stopSync(): void {
  if (syncTimer) {
    clearInterval(syncTimer);
    syncTimer = null;
  }
}

export async function triggerSync(): Promise<void> {
  if (isSyncing || !navigator.onLine) return;
  isSyncing = true;
  try {
    await runSync();
  } finally {
    isSyncing = false;
  }
}
