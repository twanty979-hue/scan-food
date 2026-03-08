// lib/db.ts
import Dexie, { Table } from 'dexie';

export class PosDatabase extends Dexie {
  categories!: Table<any>;
  products!: Table<any>;
  discounts!: Table<any>;
  discount_products!: Table<any>;
  orders!: Table<any>;
  order_items!: Table<any>;
  pai_orders!: Table<any>;
  sync_queue!: Table<any>;
  stock_drafts!: Table<any>; 

  constructor() {
    super('FoodScanOfflineDB');
    
    // คงเวอร์ชันเก่าไว้เพื่อความปลอดภัยในการ Migration
    this.version(2).stores({
      categories: 'id, brand_id',
      products: 'id, category_id, brand_id, barcode, sku',
      discounts: 'id, brand_id',
      discount_products: '[discount_id+product_id]',
      orders: 'id, status, brand_id, table_label, created_at',
      order_items: 'id, order_id, product_id',
      pai_orders: 'id, order_id, brand_id',
      sync_queue: '++id, type, status' 
    });

    this.version(4).stores({
      categories: 'id, brand_id',
      products: 'id, category_id, brand_id, barcode, sku',
      discounts: 'id, brand_id',
      discount_products: '[discount_id+product_id]',
      orders: 'id, status, brand_id, table_label, created_at',
      order_items: 'id, order_id, product_id',
      pai_orders: 'id, order_id, brand_id',
      sync_queue: '++id, type, status',
      stock_drafts: 'id, barcode, name' 
    });

    // 🌟 จุดที่แก้ไข: Version 5 เพิ่ม Index ให้กับ 'name' ในตาราง products
    this.version(5).stores({
      categories: 'id, brand_id',
      // ✨ เพิ่ม 'name' เข้าไปเพื่อให้ Dexie ยอมให้ใช้คำสั่งค้นหา (.where('name')) ได้
      products: 'id, category_id, brand_id, barcode, sku, name', 
      discounts: 'id, brand_id',
      discount_products: '[discount_id+product_id]',
      orders: 'id, status, brand_id, table_label, created_at',
      order_items: 'id, order_id, product_id',
      pai_orders: 'id, order_id, brand_id',
      sync_queue: '++id, type, status',
      stock_drafts: 'id, barcode, name' 
    });
  }
}

export const db = new PosDatabase();