import Dexie, { Table } from 'dexie';

export interface CachedProduct {
  id: string;
  sku: string;
  name: string;
  description?: string;
  unitPrice: number;
  productType: string;
  uom: string;
  isActive: boolean;
  stockQuantity: number;
  stockValue: number;
  syncedAt: number;
}

export interface CachedCustomer {
  id: string;
  customerCode: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  balance: number;
  syncedAt: number;
}

export interface CachedInventory {
  productId: string;
  productName: string;
  productSku: string;
  warehouseId: string;
  warehouseName: string;
  quantity: number;
  uom: string;
  syncedAt: number;
}

export class CopiaOSCache extends Dexie {
  products!: Table<CachedProduct, string>;
  customers!: Table<CachedCustomer, string>;
  inventory!: Table<CachedInventory, string>;

  constructor() {
    super('copiaos-cache');

    this.version(1).stores({
      products: 'id, sku, name, productType, syncedAt',
      customers: 'id, customerCode, name, email, syncedAt',
      inventory: '[productId+warehouseId], productId, warehouseId, syncedAt',
    });

    this.version(2).stores({
      products: 'id, sku, name, productType, syncedAt',
      customers: 'id, customerCode, name, email, syncedAt',
      inventory: '[productId+warehouseId], productId, warehouseId, syncedAt',
    });
  }
}

export const cache = new CopiaOSCache();
