// API сервис для интеграции с e-Replika API и внутренними эндпоинтами
// Документация: https://bot.e-replika.ru/docs#/

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://bot.e-replika.ru/api";
const INTERNAL_API_URL = import.meta.env.VITE_INTERNAL_API_URL || "/api";

// Получение токена авторизации из Telegram или env
function getAuthToken(): string | null {
  // В Telegram Mini App можно использовать initData для авторизации
  if (typeof window !== "undefined" && window.Telegram?.WebApp) {
    return window.Telegram.WebApp.initData;
  }
  return import.meta.env.VITE_API_TOKEN || null;
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
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      
      const token = getAuthToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/terms`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch terms: ${response.statusText}`);
      }

      return await response.json();
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
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      
      const token = getAuthToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/calendar/convert-to-hijri`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          date: gregorianDate.toISOString().split("T")[0],
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to convert date: ${response.statusText}`);
      }

      const data = await response.json();
      return { year: data.year, month: data.month, day: data.day };
    } catch (error) {
      console.error("Error converting to Hijri:", error);
      // Fallback на упрощенную конвертацию
      throw error;
    }
  },

  // Конвертация даты из хиджры в григорианский календарь
  async convertFromHijri(hijriDate: { year: number; month: number; day: number }): Promise<Date> {
    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      
      const token = getAuthToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/calendar/convert-from-hijri`, {
        method: "POST",
        headers,
        body: JSON.stringify(hijriDate),
      });

      if (!response.ok) {
        throw new Error(`Failed to convert date: ${response.statusText}`);
      }

      const data = await response.json();
      return new Date(data.date);
    } catch (error) {
      console.error("Error converting from Hijri:", error);
      throw error;
    }
  },

  // Генерация PDF отчета через e-Replika API
  // Эндпоинт согласно документации: /reports/pdf
  async generatePDFReport(userId: string): Promise<Blob> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    
    const token = getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/reports/pdf`, {
      method: "POST",
      headers,
      body: JSON.stringify({ user_id: userId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate PDF: ${response.statusText}`);
    }

    return await response.blob();
  },
};

// Внутренние API эндпоинты
export const prayerDebtAPI = {
  // Рассчитать долг намазов
  async calculateDebt(request: CalculationRequest): Promise<UserPrayerDebt> {
    const response = await fetch(`${INTERNAL_API_URL}/prayer-debt/calculate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || `Failed to calculate debt: ${response.statusText}`);
    }

    return await response.json();
  },

  // Получить последний расчет и текущий прогресс
  async getSnapshot(): Promise<DebtSnapshot> {
    const response = await fetch(`${INTERNAL_API_URL}/prayer-debt/snapshot`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get snapshot: ${response.statusText}`);
    }

    return await response.json();
  },

  // Обновить прогресс восполнения
  async updateProgress(request: ProgressUpdateRequest): Promise<RepaymentProgress> {
    const response = await fetch(`${INTERNAL_API_URL}/prayer-debt/progress`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || `Failed to update progress: ${response.statusText}`);
    }

    return await response.json();
  },

  // Асинхронный расчет (через e-Replika)
  async calculateDebtAsync(request: CalculationRequest): Promise<{ job_id: string; status_url: string }> {
    const response = await fetch(`${INTERNAL_API_URL}/prayer-debt/calculations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to start calculation: ${response.statusText}`);
    }

    return await response.json();
  },

  // Проверить статус асинхронного расчета
  async getCalculationStatus(jobId: string): Promise<{
    status: "pending" | "done" | "error";
    result?: DebtSnapshot;
    error?: string;
  }> {
    const response = await fetch(`${INTERNAL_API_URL}/prayer-debt/calculations/${jobId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get calculation status: ${response.statusText}`);
    }

    return await response.json();
  },

  // Скачать PDF отчет
  async downloadPDFReport(): Promise<Blob> {
    const response = await fetch(`${INTERNAL_API_URL}/prayer-debt/report.pdf`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Failed to download PDF: ${response.statusText}`);
    }

    return await response.blob();
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

