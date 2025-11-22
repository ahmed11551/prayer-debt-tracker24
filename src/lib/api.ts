// API сервис для интеграции с e-Replika API и внутренними эндпоинтами
// Документация: https://bot.e-replika.ru/docs#/

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://bot.e-replika.ru/api";
const INTERNAL_API_URL = import.meta.env.VITE_INTERNAL_API_URL || "/api";

// Supabase конфигурация
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://fvxkywczuqincnjilgzd.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2eGt5d2N6dXFpbmNuamlsZ3pkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNDgwNTYsImV4cCI6MjA3NzkyNDA1Nn0.jBvLDl0T2u-slvf4Uu4oZj7yRWMQCKmiln0mXRU0q54";
const SUPABASE_FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`;

// Получение токена авторизации для e-Replika API
// Согласно документации: https://bot.e-replika.ru/docs#/
// Используется test_token_123 для тестирования или токен из env
// ВАЖНО: Все запросы к bot.e-replika.ru/api требуют авторизации через Bearer токен
function getAuthToken(): string {
  // Приоритет: env переменная > дефолтный тестовый токен
  // Для e-Replika API используется Bearer токен в заголовке Authorization
  // По умолчанию: test_token_123 (согласно документации API)
  return import.meta.env.VITE_API_TOKEN || "test_token_123";
}

// Получение заголовков для запросов к e-Replika API
// Согласно документации: https://bot.e-replika.ru/docs#/
// Авторизация через Bearer токен в заголовке Authorization
// Используется везде: eReplikaAPI и dhikrAPI (для внутренних эндпоинтов)
function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  
  // Всегда используем токен для авторизации
  // По умолчанию: test_token_123 (для тестирования согласно документации)
  // Формат: Authorization: Bearer test_token_123
  const token = getAuthToken();
  headers["Authorization"] = `Bearer ${token}`;
  
  // Дополнительный API ключ, если указан в env (опционально)
  const apiKey = import.meta.env.VITE_E_REPLIKA_API_KEY;
  if (apiKey) {
    headers["X-API-Key"] = apiKey;
  }
  
  return headers;
}

import type {
  CalculationRequest,
  DebtSnapshot,
  ProgressUpdateRequest,
  RepaymentProgress,
  Term,
  UserPrayerDebt,
} from "@/types/prayer-debt";

// e-Replika API интеграция
export const eReplikaAPI = {
  // Получить термины из словарика
  // Эндпоинт согласно документации e-Replika API
  async getTerms(): Promise<Term[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/terms`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        // Если 404 или другой ошибка, возвращаем дефолтные термины
        if (response.status === 404) {
          console.warn("Terms endpoint not found, using default terms");
          return getDefaultTerms();
        }
        throw new Error(`Failed to fetch terms: ${response.statusText}`);
      }

      const data = await response.json();
      // Проверяем формат ответа
      if (Array.isArray(data)) {
        return data;
      }
      // Если ответ в другом формате, пытаемся извлечь массив
      if (data.terms && Array.isArray(data.terms)) {
        return data.terms;
      }
      // Если формат неизвестен, возвращаем дефолтные термины
      console.warn("Unexpected response format, using default terms");
      return getDefaultTerms();
    } catch (error) {
      console.error("Error fetching terms:", error);
      // Возвращаем базовый набор терминов, если API недоступен
      return getDefaultTerms();
    }
  },

  // Конвертация даты в хиджру через e-Replika API
  // Эндпоинт согласно документации e-Replika API
  async convertToHijri(gregorianDate: Date): Promise<{ year: number; month: number; day: number }> {
    try {
      const response = await fetch(`${API_BASE_URL}/calendar/convert-to-hijri`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          date: gregorianDate.toISOString().split("T")[0],
        }),
      });

      if (!response.ok) {
        // Если API недоступен, пробрасываем ошибку для fallback
        throw new Error(`Failed to convert date: ${response.statusText}`);
      }

      const data = await response.json();
      // Поддерживаем разные форматы ответа
      if (data.year && data.month && data.day) {
        return { year: data.year, month: data.month, day: data.day };
      }
      if (data.hijri) {
        return { year: data.hijri.year, month: data.hijri.month, day: data.hijri.day };
      }
      throw new Error("Unexpected response format from convert-to-hijri");
    } catch (error) {
      console.error("Error converting to Hijri:", error);
      // Fallback на упрощенную конвертацию будет обработан в prayer-calculator
      throw error;
    }
  },

  // Конвертация даты из хиджры в григорианский календарь
  async convertFromHijri(hijriDate: { year: number; month: number; day: number }): Promise<Date> {
    try {
      const response = await fetch(`${API_BASE_URL}/calendar/convert-from-hijri`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(hijriDate),
      });

      if (!response.ok) {
        throw new Error(`Failed to convert date: ${response.statusText}`);
      }

      const data = await response.json();
      // Поддерживаем разные форматы ответа
      if (data.date) {
        return new Date(data.date);
      }
      if (data.gregorian) {
        return new Date(data.gregorian);
      }
      throw new Error("Unexpected response format from convert-from-hijri");
    } catch (error) {
      console.error("Error converting from Hijri:", error);
      throw error;
    }
  },

  // Получить аудио URL для дуа
  // Эндпоинт согласно документации e-Replika API
  async getDuaAudio(duaId: string): Promise<string | null> {
    try {
      // Локальные ID (например, "sleep-1", "kalima-1") могут не совпадать с ID в API
      // API может использовать числовые ID или другие форматы
      // Пробуем несколько вариантов ID
      const possibleIds = [
        duaId, // Оригинальный ID
        duaId.replace(/^[a-z]+-/, ""), // Убираем префикс (например, "sleep-1" -> "1")
        duaId.split("-").pop() || duaId, // Последняя часть после дефиса
      ].filter((id, index, arr) => arr.indexOf(id) === index); // Убираем дубликаты

      // Пробуем разные варианты эндпоинтов для каждого возможного ID
      const endpoints: string[] = [];
      for (const id of possibleIds) {
        endpoints.push(
          `${API_BASE_URL}/duas/${id}/audio`,
          `${API_BASE_URL}/audio/dua/${id}`,
          `${API_BASE_URL}/dua/${id}/audio`,
        );
      }

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            method: "GET",
            headers: getAuthHeaders(),
          });

          if (response.ok) {
            const contentType = response.headers.get("content-type");
            
            // Если это прямой аудио файл
            if (contentType && (contentType.includes("audio/") || contentType.includes("application/octet-stream"))) {
              // Возвращаем URL эндпоинта как прямой URL к аудио
              console.log(`Audio found at: ${endpoint}`);
              return endpoint;
            }

            // Если это JSON ответ
            const data = await response.json();
            if (data.audio_url || data.url) {
              console.log(`Audio URL from API: ${data.audio_url || data.url}`);
              return data.audio_url || data.url;
            }
            if (typeof data === "string" && data.startsWith("http")) {
              console.log(`Audio URL (string): ${data}`);
              return data;
            }
          } else if (response.status === 404) {
            // Пробуем следующий эндпоинт
            continue;
          } else if (response.status === 401 || response.status === 403) {
            console.warn(`Authentication error for dua ${duaId}: ${response.status}`);
            // Пробуем следующий эндпоинт
            continue;
          }
        } catch (err) {
          // Пробуем следующий эндпоинт
          console.debug(`Endpoint ${endpoint} failed:`, err);
          continue;
        }
      }

      // Если все эндпоинты не сработали
      console.warn(`Audio not found for dua ${duaId} - trying all endpoints failed. This is normal if the dua is not in the e-Replika API database. TTS will be used as fallback.`);
      return null;
    } catch (error) {
      console.error(`Error fetching audio for dua ${duaId}:`, error);
      return null;
    }
  },

  // Получить список всех дуа с аудио
  async getDuas(): Promise<Array<{ id: string; audioUrl: string | null }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/duas`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.warn("Duas endpoint not found");
          return [];
        }
        throw new Error(`Failed to fetch duas: ${response.statusText}`);
      }

      const data = await response.json();
      // Поддерживаем разные форматы ответа
      if (Array.isArray(data)) {
        return data.map((dua: any) => ({
          id: dua.id || dua.dua_id,
          audioUrl: dua.audio_url || dua.audioUrl || null,
        }));
      }
      if (data.duas && Array.isArray(data.duas)) {
        return data.duas.map((dua: any) => ({
          id: dua.id || dua.dua_id,
          audioUrl: dua.audio_url || dua.audioUrl || null,
        }));
      }
      return [];
    } catch (error) {
      console.error("Error fetching duas:", error);
      return [];
    }
  },

  // Получить список азкаров
  async getAdhkar(): Promise<Array<{ id: string; title: string; text: string; count: number }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/adhkar`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.warn("Adhkar endpoint not found");
          return [];
        }
        throw new Error(`Failed to fetch adhkar: ${response.statusText}`);
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        return data;
      }
      if (data.adhkar && Array.isArray(data.adhkar)) {
        return data.adhkar;
      }
      return [];
    } catch (error) {
      console.error("Error fetching adhkar:", error);
      return [];
    }
  },

  // Получить список салаватов
  async getSalawat(): Promise<Array<{ id: string; arabic: string; transcription: string }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/salawat`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.warn("Salawat endpoint not found");
          return [];
        }
        throw new Error(`Failed to fetch salawat: ${response.statusText}`);
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        return data;
      }
      if (data.salawat && Array.isArray(data.salawat)) {
        return data.salawat;
      }
      return [];
    } catch (error) {
      console.error("Error fetching salawat:", error);
      return [];
    }
  },

  // Получить список калим
  async getKalimas(): Promise<Array<{ id: string; arabic: string; transcription: string }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/kalimas`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.warn("Kalimas endpoint not found");
          return [];
        }
        throw new Error(`Failed to fetch kalimas: ${response.statusText}`);
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        return data;
      }
      if (data.kalimas && Array.isArray(data.kalimas)) {
        return data.kalimas;
      }
      return [];
    } catch (error) {
      console.error("Error fetching kalimas:", error);
      return [];
    }
  },

  // Получить список сур Корана
  async getSurahs(): Promise<Array<{ number: number; name: string; nameEn: string; ayahsCount?: number }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/quran/surahs`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.warn("Surahs endpoint not found");
          return [];
        }
        throw new Error(`Failed to fetch surahs: ${response.statusText}`);
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        return data;
      }
      if (data.surahs && Array.isArray(data.surahs)) {
        return data.surahs;
      }
      return [];
    } catch (error) {
      console.error("Error fetching surahs:", error);
      return [];
    }
  },

  // Получить аяты из суры
  async getAyahs(surahNumber: number, startAyah?: number, endAyah?: number): Promise<Array<{
    number: number;
    surah: number;
    arabic: string;
    transcription?: string;
    translation?: string;
    audioUrl?: string;
  }>> {
    try {
      let url = `${API_BASE_URL}/quran/surah/${surahNumber}/ayahs`;
      if (startAyah && endAyah) {
        url += `?start=${startAyah}&end=${endAyah}`;
      } else if (startAyah) {
        url += `?start=${startAyah}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`Ayahs endpoint not found for surah ${surahNumber}`);
          return [];
        }
        throw new Error(`Failed to fetch ayahs: ${response.statusText}`);
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        return data;
      }
      if (data.ayahs && Array.isArray(data.ayahs)) {
        return data.ayahs;
      }
      return [];
    } catch (error) {
      console.error(`Error fetching ayahs for surah ${surahNumber}:`, error);
      return [];
    }
  },

  // Получить конкретный аят
  async getAyah(surahNumber: number, ayahNumber: number): Promise<{
    number: number;
    surah: number;
    arabic: string;
    transcription?: string;
    translation?: string;
    audioUrl?: string;
  } | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/quran/surah/${surahNumber}/ayah/${ayahNumber}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`Ayah ${surahNumber}:${ayahNumber} not found`);
          return null;
        }
        throw new Error(`Failed to fetch ayah: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching ayah ${surahNumber}:${ayahNumber}:`, error);
      return null;
    }
  },

  // Получить 99 имен Аллаха
  async getAsmaulHusna(): Promise<Array<{ id: string; arabic: string; transcription: string; translation: string }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/asmaul-husna`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.warn("Asmaul Husna endpoint not found");
          return [];
        }
        throw new Error(`Failed to fetch asmaul husna: ${response.statusText}`);
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        return data;
      }
      if (data.asmaul_husna && Array.isArray(data.asmaul_husna)) {
        return data.asmaul_husna;
      }
      if (data.names && Array.isArray(data.names)) {
        return data.names;
      }
      return [];
    } catch (error) {
      console.error("Error fetching asmaul husna:", error);
      return [];
    }
  },

  // Генерация PDF отчета через e-Replika API
  // Эндпоинт согласно документации: /reports/pdf
  async generatePDFReport(userId: string, userData?: any): Promise<Blob> {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/pdf`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          user_id: userId,
          ...(userData && { data: userData })
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to generate PDF: ${response.statusText} - ${errorText}`);
      }

      // Проверяем, что ответ действительно PDF
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/pdf")) {
        return await response.blob();
      }
      
      // Если не PDF, возможно это JSON с ошибкой или URL
      const blob = await response.blob();
      const text = await blob.text();
      try {
        const json = JSON.parse(text);
        if (json.url) {
          // Если API вернул URL, загружаем PDF по этому URL
          const pdfResponse = await fetch(json.url);
          return await pdfResponse.blob();
        }
        throw new Error(json.message || "Unexpected response format");
      } catch {
        throw new Error("Response is not a PDF file");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw error;
    }
  },
};

// Получение user_id для авторизации
function getUserId(): string | null {
  // Пытаемся получить из Telegram
  if (typeof window !== "undefined" && window.Telegram?.WebApp) {
    const user = window.Telegram.WebApp.initDataUnsafe.user;
    if (user?.id) {
      return `tg_${user.id}`;
    }
  }
  return null;
}

// Внутренние API эндпоинты (через Supabase Edge Functions)
export const prayerDebtAPI = {
  // Рассчитать долг намазов
  async calculateDebt(request: CalculationRequest & { 
    debt_calculation?: any; 
    repayment_progress?: any;
    missed_prayers?: MissedPrayers;
    travel_prayers?: TravelPrayers;
  }): Promise<UserPrayerDebt> {
    const userId = getUserId();
    
    // Пробуем Supabase Edge Function
    try {
      const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/prayer-debt-api/calculate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
          "apikey": SUPABASE_ANON_KEY,
      },
        body: JSON.stringify({
          ...request,
          user_id: userId || request.user_id || `user_${Date.now()}`,
        }),
    });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn("Supabase API недоступен, используем localStorage:", error);
    }

    // Fallback на localStorage
    const userData = localStorageAPI.getUserData();
    if (userData) {
      localStorageAPI.saveUserData(userData);
      return userData;
    }

    throw new Error("Failed to calculate debt");
  },

  // Получить последний расчет и текущий прогресс
  async getSnapshot(): Promise<DebtSnapshot> {
    const userId = getUserId();
    
    if (!userId) {
      // Fallback на localStorage
      const userData = localStorageAPI.getUserData();
      if (userData) {
        return {
          user_id: userData.user_id,
          debt_calculation: userData.debt_calculation,
          repayment_progress: userData.repayment_progress,
          overall_progress_percent: 0,
          remaining_prayers: {} as any,
        };
      }
      throw new Error("user_id required");
    }

    // Пробуем Supabase Edge Function
    try {
      const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/prayer-debt-api/snapshot?user_id=${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
          "apikey": SUPABASE_ANON_KEY,
      },
    });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn("Supabase API недоступен, используем localStorage:", error);
    }

    // Fallback на localStorage
    const userData = localStorageAPI.getUserData();
    if (userData && userData.user_id === userId) {
      return {
        user_id: userData.user_id,
        debt_calculation: userData.debt_calculation,
        repayment_progress: userData.repayment_progress,
        overall_progress_percent: 0,
        remaining_prayers: {} as any,
      };
    }

    throw new Error("No data found");
  },

  // Обновить прогресс восполнения
  async updateProgress(request: ProgressUpdateRequest): Promise<RepaymentProgress> {
    const userId = getUserId();
    
    if (!userId) {
      throw new Error("user_id required");
    }

    // Пробуем Supabase Edge Function
    try {
      const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/prayer-debt-api/progress`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
          "apikey": SUPABASE_ANON_KEY,
      },
        body: JSON.stringify({
          ...request,
          user_id: userId,
        }),
    });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn("Supabase API недоступен, используем localStorage:", error);
    }

    // Fallback на localStorage
    const userData = localStorageAPI.getUserData();
    if (userData && userData.user_id === userId) {
      // Обновляем прогресс локально
      if (request.entries && userData.repayment_progress?.completed_prayers) {
        request.entries.forEach((entry) => {
          const prayerKey = entry.type as keyof typeof userData.repayment_progress.completed_prayers;
          if (userData.repayment_progress.completed_prayers[prayerKey] !== undefined) {
            (userData.repayment_progress.completed_prayers[prayerKey] as number) = 
              (userData.repayment_progress.completed_prayers[prayerKey] as number || 0) + entry.amount;
          }
        });
      }
      userData.repayment_progress.last_updated = new Date();
      localStorageAPI.saveUserData(userData);
      return userData.repayment_progress;
    }

    throw new Error("Failed to update progress");
  },

  // Асинхронный расчет (через e-Replika)
  async calculateDebtAsync(request: CalculationRequest): Promise<{ job_id: string; status_url: string }> {
    const userId = getUserId();
    
    // Пробуем Supabase Edge Function
    try {
      const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/prayer-debt-api/calculations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
          "apikey": SUPABASE_ANON_KEY,
      },
        body: JSON.stringify({
          ...request,
          user_id: userId || `user_${Date.now()}`,
        }),
    });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn("Supabase API недоступен:", error);
    }

    throw new Error("Failed to start calculation");
  },

  // Проверить статус асинхронного расчета
  async getCalculationStatus(jobId: string): Promise<{
    status: "pending" | "done" | "error";
    result?: DebtSnapshot;
    error?: string;
  }> {
    // Пробуем Supabase Edge Function
    try {
      const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/prayer-debt-api/calculations/${jobId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
          "apikey": SUPABASE_ANON_KEY,
      },
    });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn("Supabase API недоступен:", error);
    }

    throw new Error("Failed to get calculation status");
  },

  // Скачать PDF отчет
  async downloadPDFReport(): Promise<Blob> {
    const userId = getUserId();
    
    if (!userId) {
      throw new Error("user_id required");
    }

    // Пробуем Supabase Edge Function
    try {
      const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/prayer-debt-api/report.pdf?user_id=${userId}`, {
      method: "GET",
        headers: {
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
          "apikey": SUPABASE_ANON_KEY,
        },
    });

      if (response.ok) {
        return await response.blob();
      }
    } catch (error) {
      console.warn("Supabase API недоступен, пробуем e-Replika:", error);
    }

    // Fallback на e-Replika API
    try {
      const userData = localStorageAPI.getUserData();
      if (userData) {
        return await eReplikaAPI.generatePDFReport(userId, userData);
      }
    } catch (error) {
      console.error("PDF generation failed:", error);
    }

    throw new Error("Failed to download PDF");
  },
};

// Локальное хранилище для демо-режима (когда API недоступен)
export const localStorageAPI = {
  saveUserData(data: UserPrayerDebt): void {
    // Сериализация дат в строки для localStorage
    const serialized = JSON.stringify(data, (key, value) => {
      if (value instanceof Date) {
        return value.toISOString();
      }
      return value;
    });
    localStorage.setItem("userPrayerDebt", serialized);
  },

  getUserData(): UserPrayerDebt | null {
    const data = localStorage.getItem("userPrayerDebt");
    if (!data) return null;

    try {
      // Десериализация дат из строк
      return JSON.parse(data, (key, value) => {
        // Проверяем, является ли значение строкой даты в формате ISO
        if (
          typeof value === "string" &&
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/.test(value)
        ) {
          return new Date(value);
        }
        return value;
      });
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
      // Очищаем поврежденные данные
      localStorage.removeItem("userPrayerDebt");
      return null;
    }
  },

  clearUserData(): void {
    localStorage.removeItem("userPrayerDebt");
  },
};

// Дефолтные термины (если API недоступен)
function getDefaultTerms(): Term[] {
  return [
    {
      term: "Каза",
      definition: "Восполнение пропущенного обязательного намаза",
      transliteration: "Qada",
    },
    {
      term: "Булюг",
      definition: "Совершеннолетие, возраст, с которого человек обязан совершать намаз",
      transliteration: "Bulugh",
    },
    {
      term: "Хайд",
      definition: "Менструация у женщин, период, когда намаз не обязателен",
      transliteration: "Haid",
    },
    {
      term: "Нифас",
      definition: "Послеродовое кровотечение, период после родов, когда намаз не обязателен",
      transliteration: "Nifas",
    },
    {
      term: "Сафар",
      definition: "Путешествие, при котором разрешено сокращать четырёхракаатные намазы",
      transliteration: "Safar",
    },
    {
      term: "Мазхаб",
      definition: "Школа исламского права, методологическая система вынесения правовых решений",
      transliteration: "Madhab",
    },
    {
      term: "Витр",
      definition: "Нечётный намаз, совершаемый после ночного намаза (Иша)",
      transliteration: "Witr",
    },
    {
      term: "Ракаат",
      definition: "Цикл молитвы, состоящий из определённых действий и чтений",
      transliteration: "Rak'ah",
    },
  ];
}

// API для модуля "Умный Тасбих и Трекер Зикров"
export const dhikrAPI = {
  // Получение состояния для инициализации интерфейса
  async bootstrap(): Promise<any> {
    try {
      const response = await fetch(`${INTERNAL_API_URL}/v1/bootstrap`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to bootstrap:", error);
      // Возвращаем дефолтное состояние
      return {
        user: null,
        active_goal: null,
        daily_azkar: null,
        recent_items: [],
      };
    }
  },

  // Создание/обновление цели
  async createGoal(goal: {
    category: string;
    item_id?: string | null;
    goal_type: string;
    target_count: number;
    prayer_segment?: string;
  }): Promise<any> {
    try {
      const response = await fetch(`${INTERNAL_API_URL}/v1/goals`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(goal),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to create goal:", error);
      throw error;
    }
  },

  // Начало сессии
  async startSession(session: {
    goal_id?: string | null;
    category?: string;
    item_id?: string | null;
    prayer_segment?: string;
  }): Promise<any> {
    try {
      const response = await fetch(`${INTERNAL_API_URL}/v1/sessions/start`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(session),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to start session:", error);
      throw error;
    }
  },

  // Фиксация действия (tap)
  async tapCounter(data: {
    session_id: string;
    delta: number;
    event_type: string;
    offline_id?: string;
    prayer_segment?: string;
  }): Promise<any> {
    try {
      const response = await fetch(`${INTERNAL_API_URL}/v1/counter/tap`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to tap counter:", error);
      throw error;
    }
  },

  // Отметка о заучивании
  async markLearned(goal_id: string): Promise<any> {
    try {
      const response = await fetch(`${INTERNAL_API_URL}/v1/learn/mark`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ goal_id }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to mark learned:", error);
      throw error;
    }
  },

  // Ежедневный отчет
  async getDailyReport(): Promise<any> {
    try {
      const response = await fetch(`${INTERNAL_API_URL}/v1/reports/daily`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to get daily report:", error);
      return {
        date: new Date().toISOString().split("T")[0],
        goals_completed: [],
        azkar_progress: {},
        total_dhikr_count: 0,
      };
    }
  },
};

