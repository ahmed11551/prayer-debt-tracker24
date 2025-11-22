// Типы для системы бейджей и достижений

export type BadgeLevel = "bronze" | "silver" | "gold";

export type BadgeCategory = 
  | "prayer" 
  | "quran" 
  | "zikr" 
  | "sadaqa" 
  | "knowledge" 
  | "streak" 
  | "completion";

export interface Badge {
  id: string;
  name: string;
  description: string;
  category: BadgeCategory;
  level: BadgeLevel;
  icon: string; // Emoji или иконка
  requirement: {
    type: "count" | "streak" | "completion" | "custom";
    value: number;
    unit?: string; // "prayers", "days", "surahs", etc.
  };
  unlocked_at?: Date;
  progress: number; // 0-100
}

export interface Streak {
  id: string;
  category: BadgeCategory;
  current: number; // Текущая серия дней
  longest: number; // Самая длинная серия
  last_date: Date; // Последняя дата активности
  start_date?: Date; // Дата начала текущей серии
}

export interface Achievement {
  id: string;
  badge_id: string;
  unlocked_at: Date;
  progress_at_unlock: number;
}

// Предустановленные бейджи
export const PREDEFINED_BADGES: Omit<Badge, "unlocked_at" | "progress">[] = [
  // Намазы
  {
    id: "prayer-100",
    name: "Стойкий в намазе",
    description: "Выполнил 100 намазов",
    category: "prayer",
    level: "bronze",
    icon: "🕌",
    requirement: { type: "count", value: 100, unit: "prayers" },
  },
  {
    id: "prayer-500",
    name: "Преданный молящийся",
    description: "Выполнил 500 намазов",
    category: "prayer",
    level: "silver",
    icon: "🕌",
    requirement: { type: "count", value: 500, unit: "prayers" },
  },
  {
    id: "prayer-1000",
    name: "Сердце молитвы",
    description: "Выполнил 1000 намазов",
    category: "prayer",
    level: "gold",
    icon: "🕌",
    requirement: { type: "count", value: 1000, unit: "prayers" },
  },
  {
    id: "prayer-streak-7",
    name: "Неделя молитвы",
    description: "7 дней подряд выполнения намазов",
    category: "streak",
    level: "bronze",
    icon: "🔥",
    requirement: { type: "streak", value: 7, unit: "days" },
  },
  {
    id: "prayer-streak-30",
    name: "Месяц молитвы",
    description: "30 дней подряд выполнения намазов",
    category: "streak",
    level: "silver",
    icon: "🔥",
    requirement: { type: "streak", value: 30, unit: "days" },
  },
  {
    id: "prayer-streak-100",
    name: "Сто дней молитвы",
    description: "100 дней подряд выполнения намазов",
    category: "streak",
    level: "gold",
    icon: "🔥",
    requirement: { type: "streak", value: 100, unit: "days" },
  },
  
  // Коран
  {
    id: "quran-10",
    name: "Читатель Корана",
    description: "Прочитал 10 сур",
    category: "quran",
    level: "bronze",
    icon: "📖",
    requirement: { type: "count", value: 10, unit: "surahs" },
  },
  {
    id: "quran-30",
    name: "Сердце Корана",
    description: "Прочитал 30 сур",
    category: "quran",
    level: "silver",
    icon: "📖",
    requirement: { type: "count", value: 30, unit: "surahs" },
  },
  {
    id: "quran-114",
    name: "Хафиз Корана",
    description: "Прочитал весь Коран",
    category: "quran",
    level: "gold",
    icon: "📖",
    requirement: { type: "count", value: 114, unit: "surahs" },
  },
  
  // Зикры
  {
    id: "zikr-1000",
    name: "Поминающий",
    description: "Произнес 1000 зикров",
    category: "zikr",
    level: "bronze",
    icon: "📿",
    requirement: { type: "count", value: 1000, unit: "zikrs" },
  },
  {
    id: "zikr-5000",
    name: "Усердный в поминании",
    description: "Произнес 5000 зикров",
    category: "zikr",
    level: "silver",
    icon: "📿",
    requirement: { type: "count", value: 5000, unit: "zikrs" },
  },
  {
    id: "zikr-10000",
    name: "Сердце поминания",
    description: "Произнес 10000 зикров",
    category: "zikr",
    level: "gold",
    icon: "📿",
    requirement: { type: "count", value: 10000, unit: "zikrs" },
  },
  
  // Садака
  {
    id: "sadaqa-10",
    name: "Щедрый",
    description: "Совершил 10 актов садаки",
    category: "sadaqa",
    level: "bronze",
    icon: "🤲",
    requirement: { type: "count", value: 10, unit: "acts" },
  },
  {
    id: "sadaqa-50",
    name: "Рука щедрости",
    description: "Совершил 50 актов садаки",
    category: "sadaqa",
    level: "silver",
    icon: "🤲",
    requirement: { type: "count", value: 50, unit: "acts" },
  },
  {
    id: "sadaqa-100",
    name: "Сахиб аль-Вакф",
    description: "Совершил 100 актов садаки",
    category: "sadaqa",
    level: "gold",
    icon: "🤲",
    requirement: { type: "count", value: 100, unit: "acts" },
  },
  
  // Завершение целей
  {
    id: "goals-5",
    name: "Целеустремленный",
    description: "Завершил 5 целей",
    category: "completion",
    level: "bronze",
    icon: "🎯",
    requirement: { type: "completion", value: 5, unit: "goals" },
  },
  {
    id: "goals-20",
    name: "Достигающий",
    description: "Завершил 20 целей",
    category: "completion",
    level: "silver",
    icon: "🎯",
    requirement: { type: "completion", value: 20, unit: "goals" },
  },
  {
    id: "goals-50",
    name: "Сахих",
    description: "Завершил 50 целей",
    category: "completion",
    level: "gold",
    icon: "🎯",
    requirement: { type: "completion", value: 50, unit: "goals" },
  },
];

