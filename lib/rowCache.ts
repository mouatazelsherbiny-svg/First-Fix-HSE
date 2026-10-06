/**
 * Small per-browser cache (IndexedDB) for the big tables, so pages show the
 * last-loaded data straight away and refresh it quietly in the background.
 * Keyed per user so a different sign-in on the same browser never sees
 * someone else's copy. Best-effort: any failure just means "no cache".
 */

const DB_NAME = "ff-cache";
const STORE = "rows";

function openDb(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    try {
      if (typeof indexedDB === "undefined") return resolve(null);
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function readCache<T>(key: string): Promise<T[] | null> {
  const db = await openDb();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const req = db.transaction(STORE, "readonly").objectStore(STORE).get(key);
      req.onsuccess = () => resolve(Array.isArray(req.result) ? (req.result as T[]) : null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function writeCache<T>(key: string, rows: T[]): Promise<void> {
  const db = await openDb();
  if (!db) return;
  try {
    db.transaction(STORE, "readwrite").objectStore(STORE).put(rows, key);
  } catch {
    /* ignore */
  }
}
