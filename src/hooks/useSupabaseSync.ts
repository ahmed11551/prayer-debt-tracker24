import { useState, useEffect, useCallback } from 'react';
import { syncUserDataToCloud, getUserDataFromCloud, isSupabaseAvailable, initSupabase } from '@/lib/supabase';
import { useUserData } from './useUserData';
import { analytics } from '@/lib/analytics';

/**
 * Хук для синхронизации данных с Supabase
 */
export const useSupabaseSync = () => {
  const { userData, refreshData } = useUserData();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);

  // Проверка доступности Supabase при монтировании
  useEffect(() => {
    const checkAvailability = async () => {
      const available = isSupabaseAvailable();
      setIsAvailable(available);
      
      if (available) {
        await initSupabase();
      }
    };
    
    checkAvailability();
  }, []);

  // Автоматическая синхронизация при изменении данных
  useEffect(() => {
    if (!isAvailable || !userData) {
      return;
    }

    const userId = userData.user_id || `user_${Date.now()}`;
    const syncData = async () => {
      setIsSyncing(true);
      setSyncError(null);

      const result = await syncUserDataToCloud(userData, userId);
      
      if (result.success) {
        setLastSyncTime(new Date());
        analytics.trackEvent({
          action: 'cloud_sync_success',
          category: 'data',
        });
      } else {
        setSyncError(result.error || 'Ошибка синхронизации');
        analytics.trackEvent({
          action: 'cloud_sync_error',
          category: 'data',
          label: result.error,
        });
      }

      setIsSyncing(false);
    };

    // Debounce синхронизации (не чаще раза в 5 секунд)
    const timeoutId = setTimeout(syncData, 5000);
    return () => clearTimeout(timeoutId);
  }, [userData, isAvailable]);

  // Ручная синхронизация
  const manualSync = useCallback(async () => {
    if (!isAvailable || !userData) {
      return { success: false, error: 'Supabase недоступен или нет данных' };
    }

    setIsSyncing(true);
    setSyncError(null);

    const userId = userData.user_id || `user_${Date.now()}`;
    const result = await syncUserDataToCloud(userData, userId);

    if (result.success) {
      setLastSyncTime(new Date());
    } else {
      setSyncError(result.error || 'Ошибка синхронизации');
    }

    setIsSyncing(false);
    return result;
  }, [userData, isAvailable]);

  // Загрузка данных из облака
  const loadFromCloud = useCallback(async (userId: string) => {
    if (!isAvailable) {
      return { success: false, error: 'Supabase недоступен', data: null };
    }

    setIsSyncing(true);
    setSyncError(null);

    const result = await getUserDataFromCloud(userId);

    if (result.success && result.data) {
      // Обновление локальных данных
      localStorage.setItem('prayer_debt_data', JSON.stringify(result.data));
      refreshData();
      
      analytics.trackEvent({
        action: 'cloud_load_success',
        category: 'data',
      });
    } else {
      setSyncError(result.error || 'Ошибка загрузки данных');
    }

    setIsSyncing(false);
    return result;
  }, [isAvailable, refreshData]);

  return {
    isAvailable,
    isSyncing,
    lastSyncTime,
    syncError,
    manualSync,
    loadFromCloud,
  };
};

