// Типы для системы целей и привычек

export type GoalCategory = 
  | "prayer" // Намаз
  | "quran" // Коран
  | "zikr" // Зикр/Дуа
  | "sadaqa" // Садака
  | "knowledge" // Знания
  | "asmaul_husna"; // 99 имен Аллаха

export type GoalType = 
  | "one_time" // Одноразовая
  | "recurring" // Повторяющаяся
  | "fixed_term" // С фиксированным сроком
  | "infinite"; // Бессрочная привычка

export type GoalPeriod = 
  | "week" // Неделя
  | "month" // Месяц
  | "40_days" // 40 дней
  | "year" // Год
  | "custom" // Произвольная дата
  | "specific_date"; // Конкретная дата в календаре

export type GoalMetric = 
  | "count" // Количество (раз, страниц, сур)
  | "regularity"; // Регулярность (дни подряд)

export type GoalStatus = 
  | "active" // Активная
  | "paused" // Приостановлена
  | "completed" // Завершена
  | "overdue"; // Просрочена

export type BadgeLevel = 
  | "copper" // Медь
  | "silver" // Серебро
  | "gold"; // Золото

export type BadgeType = 
  | "prayer_streak" // Серия намазов
  | "quran_complete" // Прочтение Корана
  | "sadaqa_regular" // Регулярная садака
  | "zikr_master" // Мастер зикра
  | "knowledge_seeker" // Искатель знаний
  | "asmaul_husna_master"; // Мастер 99 имен

export interface Goal {
  id: string;
  user_id?: string;
  title: string;
  description?: string;
  category: GoalCategory;
  type: GoalType;
  period: GoalPeriod;
  metric: GoalMetric;
  target_value: number;
  current_value: number;
  start_date: Date;
  end_date: Date;
  status: GoalStatus;
  
  // Для интеграции с тасбихом
  linked_counter_type?: string; // Тип счетчика (например, "tasbih", "salawat", "dua-1")
  linked_item_id?: string; // ID конкретного зикра/дуа/аята
  
  // Для намазов
  prayer_type?: "tahajjud" | "istighfar" | "sunnah" | "qaza"; // Тип намаза
  
  // Для Корана
  surah_number?: number; // Номер суры
  ayah_number?: number; // Номер аята
  verse_text?: string; // Текст аята
  
  // Для знаний
  knowledge_type?: "book" | "alifba" | "tajweed"; // Тип знаний
  book_name?: string; // Название книги
  
  // Для выучивания
  is_learning_goal?: boolean; // Цель на выучивание
  
  // Уведомления
  notifications_enabled?: boolean;
  notification_time?: string; // Время уведомления (HH:mm)
  
  // Расчеты
  daily_plan?: number; // Рекомендуемый ежедневный план
  days_remaining?: number; // Оставшиеся дни
  
  // История
  history?: GoalProgressEntry[]; // История прогресса
  
  created_at: Date;
  updated_at: Date;
}

export interface GoalProgressEntry {
  date: Date;
  value: number;
  notes?: string;
}

export interface Badge {
  id: string;
  user_id?: string;
  badge_type: BadgeType;
  level: BadgeLevel;
  achieved_at: Date;
  goal_id?: string; // Связь с целью, если есть
}

export interface Streak {
  id: string;
  user_id?: string;
  category: GoalCategory;
  current_streak: number; // Текущая серия дней
  longest_streak: number; // Самая длинная серия
  last_activity_date: Date;
}

export interface GroupGoal {
  id: string;
  name: string;
  goal_id: string; // ID основной цели
  created_by: string; // ID создателя
  participants: string[]; // ID участников
  total_progress: number; // Общий прогресс
  created_at: Date;
}

// Для выбора в целях
export interface SelectableItem {
  id: string;
  title: string;
  text?: string; // Арабский текст
  transcription?: string;
  russianTranscription?: string;
  translation?: string;
  category: GoalCategory;
  type: "dua" | "adhkar" | "salawat" | "kalima" | "ayah" | "surah" | "asmaul_husna";
  surah_number?: number; // Для аятов и сур
  ayah_number?: number; // Для аятов
}

