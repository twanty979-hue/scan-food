// lib/db.ts
import Dexie, { Table } from 'dexie';

export class PosDatabase extends Dexie {
  // --- Master Data ---
  categories!: Table<any>;
  products!: Table<any>;
  discounts!: Table<any>;
  discount_products!: Table<any>;

  // --- Sales Data ---
  orders!: Table<any>;
  order_items!: Table<any>;
  pai_orders!: Table<any>;
  
  // 🔥🔥🔥 พระเอกของเรา ต้องมีบรรทัดนี้นะครับ! ไม่งั้นพัง!
  sync_queue!: Table<any>; 

  constructor() {
    super('FoodScanOfflineDB');
    this.version(1).stores({
      categories: 'id, brand_id',
      products: 'id, category_id, brand_id',
      discounts: 'id, brand_id',
      discount_products: '[discount_id+product_id]',
      
      orders: 'id, status, brand_id, table_label, created_at',
      order_items: 'id, order_id, product_id',
      pai_orders: 'id, order_id, brand_id',
      
      // 🔥🔥🔥 และต้องมีบรรทัดนี้ด้วย เพื่อให้ Dexie รู้จักตารางคิว
      sync_queue: '++id, type, status' 
    });
  }
}

export const db = new PosDatabase();