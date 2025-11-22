// Синхронизация офлайн-очереди с сервером

import {
  queueEvent,
  queueSession,
  getUnsyncedEvents,
  getUnsyncedSessions,
  markEventSynced,
  markSessionSynced,
  incrementRetryCount,
  cleanupOldRecords,
  getQueueStats,
} from "./offline-queue";
import type { DhikrLogEntry, DhikrSession } from "@/types/tasbih";
import { dhikrAPI } from "./api";

const MAX_RETRY_COUNT = 5;
const SYNC_INTERVAL = 30000; // 30 секунд
const CLEANUP_INTERVAL = 86400000; // 24 часа

let syncIntervalId: number | null = null;
let cleanupIntervalId: number | null = null;
let isSyncing = false;

// Проверка онлайн-статуса
export function isOnline(): boolean {
  return navigator.onLine;
}

// Обработчик изменения онлайн-статуса
export function setupOnlineListener(onStatusChange?: (online: boolean) => void) {
  const handleOnline = () => {
    console.log("Connection restored, starting sync...");
    if (onStatusChange) {
      onStatusChange(true);
    }
    syncQueue();
  };

  const handleOffline = () => {
    console.log("Connection lost, switching to offline mode");
    if (onStatusChange) {
      onStatusChange(false);
    }
  };

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
}

// API функции для отправки данных на сервер
async function sendEventToServer(event: DhikrLogEntry): Promise<boolean> {
  try {
    await dhikrAPI.tapCounter({
      session_id: event.session_id,
      delta: event.delta,
      event_type: event.event_type,
      offline_id: event.offline_id,
      prayer_segment: event.prayer_segment,
    });
    return true;
  } catch (error) {
    console.error("Failed to send event to server:", error);
    return false;
  }
}

async function sendSessionToServer(session: DhikrSession): Promise<{ session_id: string } | null> {
  try {
    const response = await dhikrAPI.startSession({
      goal_id: session.goal_id || undefined,
      category: session.prayer_segment ? "azkar" : undefined,
      prayer_segment: session.prayer_segment,
    });
    return { session_id: response.session_id || session.id };
  } catch (error) {
    console.error("Failed to send session to server:", error);
    return null;
  }
}

// Синхронизация одного события
async function syncEvent(offlineEvent: any): Promise<boolean> {
  try {
    const success = await sendEventToServer(offlineEvent.event);
    
    if (success) {
      await markEventSynced(offlineEvent.id);
      return true;
    } else {
      await incrementRetryCount(offlineEvent.id, true);
      return false;
    }
  } catch (error) {
    console.error("Error syncing event:", error);
    await incrementRetryCount(offlineEvent.id, true);
    return false;
  }
}

// Синхронизация одной сессии
async function syncSession(offlineSession: any): Promise<boolean> {
  try {
    const result = await sendSessionToServer(offlineSession.session);
    
    if (result) {
      await markSessionSynced(offlineSession.id);
      // TODO: Обновить ID сессии в IndexedDB, если сервер вернул новый
      return true;
    } else {
      await incrementRetryCount(offlineSession.id, false);
      return false;
    }
  } catch (error) {
    console.error("Error syncing session:", error);
    await incrementRetryCount(offlineSession.id, false);
    return false;
  }
}

// Синхронизация всей очереди
export async function syncQueue(): Promise<{
  syncedEvents: number;
  syncedSessions: number;
  failedEvents: number;
  failedSessions: number;
}> {
  if (!isOnline() || isSyncing) {
    return {
      syncedEvents: 0,
      syncedSessions: 0,
      failedEvents: 0,
      failedSessions: 0,
    };
  }

  isSyncing = true;

  try {
    const [unsyncedEvents, unsyncedSessions] = await Promise.all([
      getUnsyncedEvents(),
      getUnsyncedSessions(),
    ]);

    // Фильтруем события с превышенным лимитом попыток
    const eventsToSync = unsyncedEvents.filter(
      (e) => (e.retry_count || 0) < MAX_RETRY_COUNT
    );
    const sessionsToSync = unsyncedSessions.filter(
      (s) => (s.retry_count || 0) < MAX_RETRY_COUNT
    );

    // Синхронизируем события
    let syncedEvents = 0;
    let failedEvents = 0;

    for (const event of eventsToSync) {
      const success = await syncEvent(event);
      if (success) {
        syncedEvents++;
      } else {
        failedEvents++;
      }
    }

    // Синхронизируем сессии
    let syncedSessions = 0;
    let failedSessions = 0;

    for (const session of sessionsToSync) {
      const success = await syncSession(session);
      if (success) {
        syncedSessions++;
      } else {
        failedSessions++;
      }
    }

    return {
      syncedEvents,
      syncedSessions,
      failedEvents,
      failedSessions,
    };
  } catch (error) {
    console.error("Error during sync:", error);
    return {
      syncedEvents: 0,
      syncedSessions: 0,
      failedEvents: 0,
      failedSessions: 0,
    };
  } finally {
    isSyncing = false;
  }
}

// Запуск автоматической синхронизации
export function startAutoSync(): void {
  if (syncIntervalId !== null) {
    return; // Уже запущена
  }

  // Синхронизация при запуске
  syncQueue();

  // Периодическая синхронизация
  syncIntervalId = window.setInterval(() => {
    if (isOnline()) {
      syncQueue();
    }
  }, SYNC_INTERVAL);

  // Периодическая очистка старых записей
  cleanupIntervalId = window.setInterval(() => {
    cleanupOldRecords();
  }, CLEANUP_INTERVAL);
}

// Остановка автоматической синхронизации
export function stopAutoSync(): void {
  if (syncIntervalId !== null) {
    clearInterval(syncIntervalId);
    syncIntervalId = null;
  }

  if (cleanupIntervalId !== null) {
    clearInterval(cleanupIntervalId);
    cleanupIntervalId = null;
  }
}

// Экспорт функций для использования в компонентах
export {
  queueEvent,
  queueSession,
  getQueueStats,
};

