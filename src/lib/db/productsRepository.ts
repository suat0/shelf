import { getDatabase } from 'src/lib/db/database';
import type { Product } from 'src/lib/api/types';

type ProductRow = {
  id: number;
  title: string;
  brand: string;
  category: string;
  price: number;
  thumbnail: string;
  payload: string;
  cached_at: number;
};

export async function cacheProducts(products: Product[]): Promise<void> {
  const db = await getDatabase();
  const now = Date.now();

  for (const product of products) {
    await db.runAsync(
      `INSERT OR REPLACE INTO products (id, title, brand, category, price, thumbnail, payload, cached_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        product.id,
        product.title,
        product.brand ?? null,
        product.category,
        product.price,
        product.thumbnail,
        JSON.stringify(product),
        now,
      ],
    );
  }
}

export async function getCachedProducts(): Promise<Product[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ProductRow>('SELECT * FROM products ORDER BY id LIMIT 20');
  return rows.map((row) => JSON.parse(row.payload) as Product);
}