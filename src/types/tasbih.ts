// Типы для модуля "Умный Тасбих и Трекер Зикров" (Версия 2.0)

export type DhikrCategory = 
  | "general" 
  | "surah" 
  | "ayah" 
  | "dua" 
  | "azkar" 
  | "names99" 
  | "salawat" 
  | "kalimat";

export type DhikrGoalType = 
  | "recite" // произнести
  | "learn"; // выучить

export type PrayerSegment = 
  | "fajr" 
  | "dhuhr" 
  | "asr" 
  | "maghrib" 
  | "isha" 
  | "none";

export type DhikrEventType = 
  | "tap" 
  | "bulk" 
  | "repeat" 
  | "learn_mark" 
  | "goal_completed" 
  | "auto_reset";

// Каталог контента
export interface DhikrItem {
  id: string;
  category: DhikrCategory;
  slug: string;
  title_ru?: string;
  title_ar?: string;
  meta_json?: {
    surah_number?: number;
    ayah_count?: number;
    text?: string;
    [key: string]: any;
  };
  // Для отображения
  arabic_text?: string;
  transcription?: string;
  translation?: string;
  audio_url?: string;
}

// Цель пользователя
export interface DhikrGoal {
  id: string;
  user_id?: string;
  category: DhikrCategory;
  item_id?: string | null; // Ссылка на items
  goal_type: DhikrGoalType;
  target_count: number;
  progress: number; // default 0
  status: "active" | "completed" | "archived";
  prayer_segment?: PrayerSegment; // Для ежедневных азкаров
  created_at: Date;
  completed_at?: Date | null;
}

// Сессия счета
export interface DhikrSession {
  id: string;
  user_id?: string;
  goal_id?: string | null;
  prayer_segment?: PrayerSegment;
  started_at: Date;
  ended_at?: Date | null;
}

// Журнал событий
export interface DhikrLogEntry {
  id: string;
  user_id?: string;
  session_id: string;
  goal_id?: string | null;
  category: DhikrCategory;
  item_id?: string | null;
  event_type: DhikrEventType;
  delta: number; // Изменение (например, +1 или +10)
  value_after: number; // Значение после изменения
  prayer_segment?: PrayerSegment;
  at_ts: Date; // UTC
  tz?: string; // Зона пользователя на момент события
  offline_id?: string; // UUID для дедупликации
}

// Ежедневные азкары (кеш на день)
export interface DailyAzkar {
  user_id?: string;
  date_local: string; // Дата в tz пользователя (YYYY-MM-DD)
  fajr: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
  total: number;
  is_complete: boolean;
}

// Состояние для инициализации интерфейса
export interface BootstrapState {
  user?: {
    id: string;
    telegram_user_id?: string;
    locale?: string;
    madhab?: string;
    tz?: string;
  };
  active_goal?: DhikrGoal | null;
  daily_azkar?: DailyAzkar;
  recent_items?: DhikrItem[];
}



