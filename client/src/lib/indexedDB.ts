import { openDB, DBSchema } from 'idb';
import type { GalleryImage } from '@/pages/Gallery';

const DB_NAME = 'NekoGalleryDB';
const DB_VERSION = 1;
const STORE_NAME = 'history';
const MAX_HISTORY_ITEMS = 50;

interface HistoryDB extends DBSchema {
  [STORE_NAME]: {
    key: string;
    value: GalleryImage & { timestamp: number };
    indexes: { 'timestamp': number };
  };
}

const dbPromise = openDB<HistoryDB>(DB_NAME, DB_VERSION, {
  upgrade(db) {
    const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
    store.createIndex('timestamp', 'timestamp');
  },
});

export async function addToHistory(image: GalleryImage) {
  const db = await dbPromise;
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);

  await store.put({ ...image, timestamp: Date.now() });

  const count = await store.count();
  if (count > MAX_HISTORY_ITEMS) {
    let cursor = await store.index('timestamp').openCursor();
    if (cursor) {
      await store.delete(cursor.primaryKey);
    }
  }

  await tx.done;
}

export async function getHistory(): Promise<(GalleryImage & { timestamp: number })[]> {
  const db = await dbPromise;
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const allItems = await store.getAll();
  return allItems.sort((a, b) => b.timestamp - a.timestamp);
}

export async function clearHistory() {
    const db = await dbPromise;
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    await store.clear();
    await tx.done;
}
