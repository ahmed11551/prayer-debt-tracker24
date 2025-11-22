// Офлайн-очередь событий с использованием IndexedDB
// Хранит события для последующей синхронизации с сервером

import type { DhikrLogEntry, DhikrSession } from "@/types/tasbih";

const DB_NAME = "dhikr_offline_db";
const DB_VERSION = 1;
const STORE_EVENTS = "events";
const STORE_SESSIONS = "sessions";

interface OfflineEvent {
  id: string;
  event: DhikrLogEntry;
  created_at: Date;
  synced: boolean;
  retry_count: number;
}

interface OfflineSession {
  id: string;
  session: DhikrSession;
  created_at: Date;
  synced: boolean;
  retry_count: number;
}

let dbInstance: IDBDatabase | null = null;

// Инициализация IndexedDB
export async function initOfflineDB(): Promise<IDBDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error("Failed to open IndexedDB"));
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Создаем хранилище для событий
      if (!db.objectStoreNames.contains(STORE_EVENTS)) {
        const eventsStore = db.createObjectStore(STORE_EVENTS, { keyPath: "id" });
        eventsStore.createIndex("synced", "synced", { unique: false });
        eventsStore.createIndex("created_at", "created_at", { unique: false });
      }

      // Создаем хранилище для сессий
      if (!db.objectStoreNames.contains(STORE_SESSIONS)) {
        const sessionsStore = db.createObjectStore(STORE_SESSIONS, { keyPath: "id" });
        sessionsStore.createIndex("synced", "synced", { unique: false });
        sessionsStore.createIndex("created_at", "created_at", { unique: false });
      }
    };
  });
}

// Генерация уникального ID для офлайн-событий
function generateOfflineId(): string {
  return `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Добавление события в очередь
export async function queueEvent(event: Omit<DhikrLogEntry, "id" | "offline_id">): Promise<string> {
  const db = await initOfflineDB();
  const offlineId = generateOfflineId();

  const offlineEvent: OfflineEvent = {
    id: offlineId,
    event: {
      ...event,
      id: offlineId,
      offline_id: offlineId,
    } as DhikrLogEntry,
    created_at: new Date(),
    synced: false,
    retry_count: 0,
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_EVENTS], "readwrite");
    const store = transaction.objectStore(STORE_EVENTS);
    const request = store.add(offlineEvent);

    request.onsuccess = () => {
      resolve(offlineId);
    };

    request.onerror = () => {
      reject(new Error("Failed to queue event"));
    };
  });
}

// Добавление сессии в очередь
export async function queueSession(session: Omit<DhikrSession, "id">): Promise<string> {
  const db = await initOfflineDB();
  const offlineId = generateOfflineId();

  const offlineSession: OfflineSession = {
    id: offlineId,
    session: {
      ...session,
      id: offlineId,
    } as DhikrSession,
    created_at: new Date(),
    synced: false,
    retry_count: 0,
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_SESSIONS], "readwrite");
    const store = transaction.objectStore(STORE_SESSIONS);
    const request = store.add(offlineSession);

    request.onsuccess = () => {
      resolve(offlineId);
    };

    request.onerror = () => {
      reject(new Error("Failed to queue session"));
    };
  });
}

// Получение всех несинхронизированных событий
export async function getUnsyncedEvents(): Promise<OfflineEvent[]> {
  const db = await initOfflineDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_EVENTS], "readonly");
    const store = transaction.objectStore(STORE_EVENTS);
    const index = store.index("synced");
    const request = index.getAll(false);

    request.onsuccess = () => {
      resolve(request.result || []);
    };

    request.onerror = () => {
      reject(new Error("Failed to get unsynced events"));
    };
  });
}

// Получение всех несинхронизированных сессий
export async function getUnsyncedSessions(): Promise<OfflineSession[]> {
  const db = await initOfflineDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_SESSIONS], "readonly");
    const store = transaction.objectStore(STORE_SESSIONS);
    const index = store.index("synced");
    const request = index.getAll(false);

    request.onsuccess = () => {
      resolve(request.result || []);
    };

    request.onerror = () => {
      reject(new Error("Failed to get unsynced sessions"));
    };
  });
}

// Отметка события как синхронизированного
export async function markEventSynced(id: string): Promise<void> {
  const db = await initOfflineDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_EVENTS], "readwrite");
    const store = transaction.objectStore(STORE_EVENTS);
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const offlineEvent = getRequest.result;
      if (offlineEvent) {
        offlineEvent.synced = true;
        const updateRequest = store.put(offlineEvent);
        updateRequest.onsuccess = () => resolve();
        updateRequest.onerror = () => reject(new Error("Failed to mark event as synced"));
      } else {
        resolve();
      }
    };

    getRequest.onerror = () => {
      reject(new Error("Failed to get event"));
    };
  });
}

// Отметка сессии как синхронизированной
export async function markSessionSynced(id: string): Promise<void> {
  const db = await initOfflineDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_SESSIONS], "readwrite");
    const store = transaction.objectStore(STORE_SESSIONS);
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const offlineSession = getRequest.result;
      if (offlineSession) {
        offlineSession.synced = true;
        const updateRequest = store.put(offlineSession);
        updateRequest.onsuccess = () => resolve();
        updateRequest.onerror = () => reject(new Error("Failed to mark session as synced"));
      } else {
        resolve();
      }
    };

    getRequest.onerror = () => {
      reject(new Error("Failed to get session"));
    };
  });
}

// Увеличение счетчика попыток
export async function incrementRetryCount(id: string, isEvent: boolean = true): Promise<void> {
  const db = await initOfflineDB();
  const storeName = isEvent ? STORE_EVENTS : STORE_SESSIONS;

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], "readwrite");
    const store = transaction.objectStore(storeName);
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const item = getRequest.result;
      if (item) {
        item.retry_count = (item.retry_count || 0) + 1;
        const updateRequest = store.put(item);
        updateRequest.onsuccess = () => resolve();
        updateRequest.onerror = () => reject(new Error("Failed to increment retry count"));
      } else {
        resolve();
      }
    };

    getRequest.onerror = () => {
      reject(new Error("Failed to get item"));
    };
  });
}

// Удаление старых синхронизированных записей (старше 30 дней)
export async function cleanupOldRecords(): Promise<void> {
  const db = await initOfflineDB();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const cleanupStore = async (storeName: string) => {
    return new Promise<void>((resolve, reject) => {
      const transaction = db!.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const index = store.index("synced");
      const request = index.getAll(true); // Получаем синхронизированные

      request.onsuccess = () => {
        const items = request.result || [];
        let deleted = 0;

        items.forEach((item: OfflineEvent | OfflineSession) => {
          if (item.synced && new Date(item.created_at) < thirtyDaysAgo) {
            const deleteRequest = store.delete(item.id);
            deleteRequest.onsuccess = () => {
              deleted++;
              if (deleted === items.length) {
                resolve();
              }
            };
            deleteRequest.onerror = () => {
              reject(new Error("Failed to delete old record"));
            };
          } else {
            deleted++;
            if (deleted === items.length) {
              resolve();
            }
          }
        });

        if (items.length === 0) {
          resolve();
        }
      };

      request.onerror = () => {
        reject(new Error("Failed to get synced items"));
      };
    });
  };

  await Promise.all([
    cleanupStore(STORE_EVENTS),
    cleanupStore(STORE_SESSIONS),
  ]);
}

// Получение статистики очереди
export async function getQueueStats(): Promise<{
  unsyncedEvents: number;
  unsyncedSessions: number;
  totalEvents: number;
  totalSessions: number;
}> {
  const db = await initOfflineDB();

  const getCount = (storeName: string, indexName: string, value: boolean): Promise<number> => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.count(value);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(new Error(`Failed to count ${storeName}`));
      };
    });
  };

  const [unsyncedEvents, unsyncedSessions, totalEvents, totalSessions] = await Promise.all([
    getCount(STORE_EVENTS, "synced", false),
    getCount(STORE_SESSIONS, "synced", false),
    getCount(STORE_EVENTS, "synced", true) + await getCount(STORE_EVENTS, "synced", false),
    getCount(STORE_SESSIONS, "synced", true) + await getCount(STORE_SESSIONS, "synced", false),
  ]);

  return {
    unsyncedEvents,
    unsyncedSessions,
    totalEvents,
    totalSessions,
  };
}



