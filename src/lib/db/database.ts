import * as SQLite from 'expo-sqlite';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

// Single shared connection, opened once and reused everywhere — opening a
// new connection per call would be wasteful and can cause locking issues.
export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('shelf.db');
  }
  return dbPromise;
}