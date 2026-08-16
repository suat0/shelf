import { getDatabase } from 'src/lib/db/database';

export async function initSchema(): Promise<void> {
  const db = await getDatabase();

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      brand TEXT,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      thumbnail TEXT NOT NULL,
      payload TEXT NOT NULL,
      cached_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS favourites (
      product_id INTEGER PRIMARY KEY,
      payload TEXT NOT NULL,
      favourited_at INTEGER NOT NULL
    );
  `);
}