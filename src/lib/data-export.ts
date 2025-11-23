/**
 * Утилиты для экспорта и импорта данных пользователя
 * Резервное копирование и восстановление данных
 */

import type { UserData } from "@/types/prayer-debt";
import { localStorageAPI } from "./api";

/**
 * Экспорт данных пользователя в JSON файл
 */
export async function exportUserData(): Promise<void> {
  try {
    const userData = localStorageAPI.getUserData();
    
    if (!userData) {
      throw new Error("Нет данных для экспорта");
    }

    // Добавляем метаданные экспорта
    const exportData = {
      version: "1.0.0",
      exportDate: new Date().toISOString(),
      data: userData,
    };

    // Создаем JSON строку
    const jsonString = JSON.stringify(exportData, null, 2);
    
    // Создаем Blob
    const blob = new Blob([jsonString], { type: "application/json" });
    
    // Создаем URL для скачивания
    const url = URL.createObjectURL(blob);
    
    // Создаем временную ссылку для скачивания
    const link = document.createElement("a");
    link.href = url;
    link.download = `prayer-debt-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    
    // Очистка
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Ошибка при экспорте данных:", error);
    throw error;
  }
}

/**
 * Импорт данных пользователя из JSON файла
 */
export async function importUserData(file: File): Promise<{ success: boolean; error?: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) {
          resolve({ success: false, error: "Файл пуст или поврежден" });
          return;
        }

        const parsed = JSON.parse(text);
        
        // Проверяем структуру данных
        if (!parsed.data) {
          resolve({ success: false, error: "Неверный формат файла" });
          return;
        }

        const userData = parsed.data as UserData;
        
        // Валидация основных полей
        if (!userData.user_id || !userData.debt_calculation) {
          resolve({ success: false, error: "Файл не содержит необходимых данных" });
          return;
        }

        // Восстанавливаем даты
        if (userData.debt_calculation.period) {
          userData.debt_calculation.period.start = new Date(userData.debt_calculation.period.start);
          userData.debt_calculation.period.end = new Date(userData.debt_calculation.period.end);
        }

        if (userData.repayment_progress?.last_updated) {
          userData.repayment_progress.last_updated = new Date(userData.repayment_progress.last_updated);
        }

        // Сохраняем данные
        localStorageAPI.saveUserData(userData);
        
        // Диспетчеризуем событие обновления
        window.dispatchEvent(new CustomEvent('userDataUpdated', { detail: userData }));
        
        resolve({ success: true });
      } catch (error) {
        console.error("Ошибка при импорте данных:", error);
        resolve({ 
          success: false, 
          error: error instanceof Error ? error.message : "Ошибка при чтении файла" 
        });
      }
    };

    reader.onerror = () => {
      resolve({ success: false, error: "Ошибка при чтении файла" });
    };

    reader.readAsText(file);
  });
}

/**
 * Проверка наличия данных для экспорта
 */
export function hasDataToExport(): boolean {
  const userData = localStorageAPI.getUserData();
  return userData !== null && userData !== undefined;
}

