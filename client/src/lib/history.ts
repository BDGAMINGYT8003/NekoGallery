import { openDB, IDBPDatabase } from 'idb';
import { GalleryImage } from '@/pages/Gallery';

const DB_NAME = 'image-gallery-history';
const STORE_NAME = 'viewed-images';

const getMaxHistoryItems = () => {
  const storedValue = localStorage.getItem('maxHistoryItems');
  return storedValue ? parseInt(storedValue, 10) : 50;
};

interface HistoryItem extends GalleryImage {
  timestamp: number;
}

let dbPromise: Promise<IDBPDatabase<unknown>> | null = null;

const getDb = () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'url' });
          store.createIndex('timestamp', 'timestamp');
        }
      },
    });
  }
  return dbPromise;
};

export const addHistoryItem = async (item: GalleryImage) => {
  const db = await getDb();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);

  const historyItem: HistoryItem = { ...item, timestamp: Date.now() };
  await store.put(historyItem);

  const count = await store.count();
  const maxItems = getMaxHistoryItems();
  if (count > maxItems) {
    let cursor = await store.index('timestamp').openCursor();
    if (cursor) {
      await store.delete(cursor.primaryKey);
    }
  }

  await tx.done;
};

export const getHistoryItems = async (): Promise<HistoryItem[]> => {
  const db = await getDb();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const items = await store.index('timestamp').getAll();
  return items.reverse();
};

export const clearHistory = async () => {
  const db = await getDb();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  await store.clear();
  await tx.done;
};
