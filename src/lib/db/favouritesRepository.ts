import { getDatabase } from 'src/lib/db/database';
import type { Product } from 'src/lib/api/types';

type FavouriteRow = {
  product_id: number;
  payload: string;
  favourited_at: number;
};

export async function addFavourite(product: Product): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT OR REPLACE INTO favourites (product_id, payload, favourited_at) VALUES (?, ?, ?)',
    [product.id, JSON.stringify(product), Date.now()],
  );
}

export async function removeFavourite(productId: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM favourites WHERE product_id = ?', [productId]);
}

export async function getFavourites(): Promise<Product[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<FavouriteRow>(
    'SELECT * FROM favourites ORDER BY favourited_at DESC',
  );
  return rows.map((row) => JSON.parse(row.payload) as Product);
}

export async function isFavourite(productId: number): Promise<boolean> {
  const db = await getDatabase();
  const row = await db.getFirstAsync('SELECT 1 FROM favourites WHERE product_id = ?', [productId]);
  return row !== null;
}