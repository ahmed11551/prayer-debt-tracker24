import { useState, useEffect, useCallback } from "react";
import { localStorageAPI, prayerDebtAPI } from "@/lib/api";
import type { UserPrayerDebt } from "@/types/prayer-debt";

/**
 * Хук для загрузки данных пользователя из API или localStorage
 * Устраняет дублирование кода в различных компонентах
 */
export function useUserData() {
  const [userData, setUserData] = useState<UserPrayerDebt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Попытка загрузить из API
      try {
        await prayerDebtAPI.getSnapshot();
        // Если API доступен, загружаем из localStorage (который синхронизируется с API)
        const savedData = localStorageAPI.getUserData();
        if (savedData) {
          setUserData(savedData);
        }
      } catch {
        // Если API недоступен, загружаем из localStorage
        const savedData = localStorageAPI.getUserData();
        if (savedData) {
          setUserData(savedData);
        }
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to load user data");
      setError(error);
      console.error("Failed to load user data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshData = useCallback(() => {
    const savedData = localStorageAPI.getUserData();
    if (savedData) {
      setUserData(savedData);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    userData,
    loading,
    error,
    refreshData,
    reloadData: loadData,
  };
}

