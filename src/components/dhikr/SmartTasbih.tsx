// Умный тасбих с интеграцией целей и выбором из категорий

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Target,
  RotateCcw,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Settings,
  CheckCircle2,
  ChevronLeft,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Goal, SelectableItem } from "@/types/goals";
import { getSelectableItems } from "@/lib/goals-selectable-items";
import { useDhikrData } from "@/hooks/useDhikrData";
import { getCategoryLabel, getCategoryIcon } from "@/lib/goals-utils";
import { eReplikaAPI, dhikrAPI } from "@/lib/api";
import { AyahSelectorDialog } from "./AyahSelectorDialog";
import { DailyAzkarProgress } from "./DailyAzkarProgress";
import type { PrayerSegment, DhikrGoalType, DailyAzkar, DhikrGoal, DhikrLogEntry, DhikrSession } from "@/types/tasbih";
import { Undo2 } from "lucide-react";
import { queueEvent, queueSession, isOnline } from "@/lib/offline-sync";
import { initOfflineDB } from "@/lib/offline-queue";

const GOALS_STORAGE_KEY = "smart_goals_v2";
const DAILY_AZKAR_STORAGE_KEY = "daily_azkar_v1";

interface SmartTasbihProps {
  onGoalUpdate?: (goal: Goal) => void;
}

type TasbihMode = "goals" | "categories";
type TranscriptionMode = "latin" | "cyrillic";

interface TasbihItem {
  id: string;
  title: string;
  text: string;
  transcription: string;
  russianTranscription?: string;
  translation: string;
  count: number;
  category: string;
  type: "dua" | "adhkar" | "salawat" | "kalima" | "ayah" | "surah" | "asmaul_husna";
  audioUrl?: string | null;
  linkedGoalId?: string;
}

export const SmartTasbih = ({ onGoalUpdate }: SmartTasbihProps) => {
  const { toast } = useToast();
  
  // Режим выбора
  const [mode, setMode] = useState<TasbihMode>("goals");
  
  // Выбранный элемент
  const [selectedItem, setSelectedItem] = useState<TasbihItem | null>(null);
  
  // Счетчик
  const [currentCount, setCurrentCount] = useState(0);
  
  // Таймер сессии
  const [sessionTime, setSessionTime] = useState(0); // в секундах
  
  // Настройки отображения
  const [showArabic, setShowArabic] = useState(true);
  const [showTranscription, setShowTranscription] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
  const [transcriptionMode, setTranscriptionMode] = useState<TranscriptionMode>("latin");
  
  // Аудио
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  // Цели
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  
  // Категории для выбора
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Диалог выбора аята
  const [ayahDialogOpen, setAyahDialogOpen] = useState(false);
  
  // Ежедневные азкары
  const [dailyAzkar, setDailyAzkar] = useState<DailyAzkar | null>(null);
  
  // Режим цели (recite или learn)
  const [goalType, setGoalType] = useState<DhikrGoalType>("recite");
  
  // Undo функционал
  const [lastAction, setLastAction] = useState<{ count: number; timestamp: number } | null>(null);
  const [showUndo, setShowUndo] = useState(false);
  
  // Обратный отсчет для азкаров
  const [isCountdownMode, setIsCountdownMode] = useState(false);
  
  // Загрузка данных из API
  const { duas, adhkar, salawat, kalimas, asmaulHusna } = useDhikrData();
  
  // Текущая сессия
  const [currentSession, setCurrentSession] = useState<DhikrSession | null>(null);
  
  // Инициализация офлайн-режима
  useEffect(() => {
    initOfflineDB().catch((error) => {
      console.error("Failed to initialize offline DB:", error);
    });
  }, []);

  // Загрузка целей
  useEffect(() => {
    const saved = localStorage.getItem(GOALS_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved, (key, value) => {
          if (key === "start_date" || key === "end_date" || key === "created_at" || key === "updated_at") {
            return new Date(value);
          }
          return value;
        });
        if (Array.isArray(parsed)) {
          setGoals(parsed);
        }
      } catch (error) {
        console.error("Failed to parse goals:", error);
      }
    }
  }, []);

  // Активные цели, связанные с тасбихом
  const tasbihGoals = useMemo(() => {
    return goals.filter(g => 
      (g.status === "active" || g.status === "paused") &&
      (g.category === "zikr" || g.category === "quran" || g.category === "asmaul_husna") &&
      g.linked_item_id
    );
  }, [goals]);

  // Загрузка аудио при выборе элемента
  useEffect(() => {
    if (selectedItem && selectedItem.type === "dua") {
      setAudioUrl(null);
      eReplikaAPI.getDuaAudio(selectedItem.id)
        .then((url) => {
          setAudioUrl(url);
        })
        .catch((error) => {
          console.error("Error loading audio:", error);
        });
    }
  }, [selectedItem]);

  // Обработка клика по счетчику
  // Таймер сессии
  useEffect(() => {
    if (!selectedItem) {
      setSessionTime(0);
      return;
    }
    
    const interval = setInterval(() => {
      setSessionTime((prev) => prev + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [selectedItem]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}.${secs.toString().padStart(2, "0")}`;
  };
  
  // Обработка клика на сегмент намаза для ежедневных азкаров
  const handleAzkarSegmentClick = async (segment: PrayerSegment) => {
    // Создаем цель azkar с target_count=99
    const newGoal: DhikrGoal = {
      id: `azkar-${segment}-${Date.now()}`,
      category: "azkar",
      goal_type: "recite",
      target_count: 99,
      progress: 0,
      status: "active",
      prayer_segment: segment,
      created_at: new Date(),
    };
    
    // Сохраняем цель
    const updatedGoals = [...goals, newGoal];
    localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(updatedGoals));
    setGoals(updatedGoals);
    
    // Создаем сессию
    const session: Omit<DhikrSession, "id"> = {
      goal_id: newGoal.id,
      prayer_segment: segment,
      started_at: new Date(),
      ended_at: null,
    };
    
    // Пытаемся отправить на сервер или добавляем в очередь
    let sessionId: string;
    if (isOnline()) {
      try {
        const response = await dhikrAPI.startSession({
          goal_id: newGoal.id,
          category: "azkar",
          prayer_segment: segment,
        });
        sessionId = response.session_id || `session-${Date.now()}`;
        const newSession: DhikrSession = {
          ...session,
          id: sessionId,
        };
        setCurrentSession(newSession);
      } catch (error) {
        console.error("Failed to start session, queuing:", error);
        sessionId = await queueSession(session);
        const newSession: DhikrSession = {
          ...session,
          id: sessionId,
        };
        setCurrentSession(newSession);
      }
    } else {
      sessionId = await queueSession(session);
      const newSession: DhikrSession = {
        ...session,
        id: sessionId,
      };
      setCurrentSession(newSession);
    }
    
    // Устанавливаем режим обратного отсчета
    setIsCountdownMode(true);
    setCurrentCount(99);
    
    // Создаем элемент для отображения
    const azkarItem: TasbihItem = {
      id: `azkar-${segment}`,
      title: `Азкары ${segment}`,
      text: "",
      transcription: "",
      translation: "Ежедневные азкары после намаза",
      count: 99,
      category: "azkar",
      type: "adhkar",
      linkedGoalId: newGoal.id,
    };
    
    setSelectedItem(azkarItem);
    setSelectedGoal(newGoal as any);
    
    toast({
      title: "Азкары начаты",
      description: `Начата сессия азкаров для ${segment}. Осталось: 99`,
    });
  };

  // Undo последнего действия
  const handleUndo = () => {
    if (lastAction && showUndo) {
      setCurrentCount(currentCount - lastAction.count);
      setLastAction(null);
      setShowUndo(false);
      
      toast({
        title: "Отменено",
        description: "Последнее действие отменено",
      });
    }
  };

  // Управление Undo таймером
  useEffect(() => {
    if (lastAction) {
      setShowUndo(true);
      const timer = setTimeout(() => {
        setShowUndo(false);
        setLastAction(null);
      }, 5000); // 5 секунд
      
      return () => clearTimeout(timer);
    }
  }, [lastAction]);

  const handleCount = async (increment: number = 1) => {
    if (!selectedItem) return;
    
    // Блокировка от спама: не чаще 2 раз в секунду
    const now = Date.now();
    if (lastAction && now - lastAction.timestamp < 500) {
      return;
    }
    
    let newCount: number;
    
    // Обратный отсчет для азкаров
    if (isCountdownMode && selectedItem.category === "azkar") {
      newCount = Math.max(0, currentCount - increment);
    } else {
      newCount = currentCount + increment;
    }
    
    // Сохраняем для Undo
    setLastAction({ count: increment, timestamp: now });
    
    setCurrentCount(newCount);
    
    // Создаем событие для логирования
    if (currentSession) {
      const event: Omit<DhikrLogEntry, "id" | "offline_id"> = {
        session_id: currentSession.id,
        goal_id: selectedItem.linkedGoalId || null,
        category: selectedItem.category as any,
        item_id: selectedItem.id,
        event_type: increment > 1 ? "bulk" : "tap",
        delta: isCountdownMode ? -increment : increment,
        value_after: newCount,
        prayer_segment: (selectedGoal as any)?.prayer_segment,
        at_ts: new Date(),
        tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
      
      // Пытаемся отправить на сервер или добавляем в очередь
      if (isOnline()) {
        try {
          await dhikrAPI.tapCounter({
            session_id: currentSession.id,
            delta: event.delta,
            event_type: event.event_type,
            prayer_segment: event.prayer_segment,
          });
        } catch (error) {
          console.error("Failed to send tap, queuing:", error);
          await queueEvent(event);
        }
      } else {
        await queueEvent(event);
      }
    }
    
    // Обновляем streak для зикров при достижении цели
    if (selectedItem.count > 0 && newCount >= selectedItem.count) {
      try {
        const { updateStreak } = await import("@/lib/badges-utils");
        updateStreak("zikr", new Date());
      } catch (error) {
        console.warn("Failed to update streak:", error);
      }
    }
    
    // Обновляем все активные цели с соответствующим linked_counter_type
    const updatedGoals = goals.map(goal => {
      // Если цель связана через linkedGoalId (прямая связь)
      if (selectedItem.linkedGoalId && goal.id === selectedItem.linkedGoalId && goal.status === "active") {
        const updatedGoal: Goal = {
          ...goal,
          current_value: Math.min(goal.current_value + increment, goal.target_value),
          updated_at: new Date(),
        };
        
        // Проверяем, достигнута ли цель
        if (updatedGoal.current_value >= updatedGoal.target_value) {
          toast({
            title: "Цель достигнута!",
            description: `Поздравляем! Вы достигли цели "${updatedGoal.title}"`,
          });
        }
        
        // Уведомляем родительский компонент
        if (onGoalUpdate) {
          onGoalUpdate(updatedGoal);
        }
        
        return updatedGoal;
      }
      
      // Если цель связана через linked_counter_type (автоматическая связь)
      if (goal.linked_counter_type === selectedItem.type && 
          goal.linked_item_id === selectedItem.id && 
          goal.status === "active") {
        const updatedGoal: Goal = {
          ...goal,
          current_value: Math.min(goal.current_value + increment, goal.target_value),
          updated_at: new Date(),
        };
        
        // Проверяем, достигнута ли цель
        if (updatedGoal.current_value >= updatedGoal.target_value) {
          toast({
            title: "Цель достигнута!",
            description: `Поздравляем! Вы достигли цели "${updatedGoal.title}"`,
          });
        }
        
        // Уведомляем родительский компонент
        if (onGoalUpdate) {
          onGoalUpdate(updatedGoal);
        }
        
        return updatedGoal;
      }
      
      return goal;
    });
    
    // Сохраняем обновленные цели
    if (updatedGoals.some((g, i) => g !== goals[i])) {
      localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(updatedGoals));
      setGoals(updatedGoals);
    }
  };

  // Сброс счетчика
  const handleReset = () => {
    setCurrentCount(0);
    setSessionTime(0);
  };

  // Выбор цели
  const handleSelectGoal = (goal: Goal) => {
    // Загружаем элемент из цели
    const items = getSelectableItems(goal.category);
    const item = items.find(i => i.id === goal.linked_item_id);
    
    if (item) {
      setSelectedItem({
        id: item.id,
        title: goal.title,
        text: item.text || "",
        transcription: item.transcription || "",
        russianTranscription: item.russianTranscription,
        translation: item.translation || "",
        count: goal.target_value - goal.current_value, // Оставшееся количество
        category: getCategoryLabel(goal.category),
        type: item.type,
        linkedGoalId: goal.id,
      });
      setCurrentCount(0);
      setMode("goals");
    }
  };

  // Выбор из категорий
  const handleSelectFromCategory = (category: string) => {
    setSelectedCategory(category);
    setMode("categories");
  };

  // Выбор элемента из категории
  const handleSelectItem = async (item: SelectableItem) => {
    // Если это опция "Выбрать конкретный аят", открываем диалог
    if (item.id === "ayah-custom") {
      setAyahDialogOpen(true);
      return;
    }

    // Если это аят, загружаем его данные
    if (item.type === "ayah" && item.surah_number && item.ayah_number) {
      try {
        const ayahData = await eReplikaAPI.getAyah(item.surah_number, item.ayah_number);
        if (ayahData) {
          setSelectedItem({
            id: item.id,
            title: item.title,
            text: ayahData.arabic || item.text || "",
            transcription: ayahData.transcription || item.transcription || "",
            russianTranscription: item.russianTranscription,
            translation: ayahData.translation || item.translation || "",
            count: 1, // Для аятов обычно повторяют 1 раз
            category: getCategoryLabel(item.category),
            type: item.type,
          });
        } else {
          // Fallback на данные из item
          setSelectedItem({
            id: item.id,
            title: item.title,
            text: item.text || "",
            transcription: item.transcription || "",
            russianTranscription: item.russianTranscription,
            translation: item.translation || "",
            count: 1,
            category: getCategoryLabel(item.category),
            type: item.type,
          });
        }
      } catch (error) {
        console.error("Error loading ayah:", error);
        // Fallback на данные из item
        setSelectedItem({
          id: item.id,
          title: item.title,
          text: item.text || "",
          transcription: item.transcription || "",
          russianTranscription: item.russianTranscription,
          translation: item.translation || "",
          count: 1,
          category: getCategoryLabel(item.category),
          type: item.type,
        });
      }
    } else {
      // Для остальных типов
      setSelectedItem({
        id: item.id,
        title: item.title,
        text: item.text || "",
        transcription: item.transcription || "",
        russianTranscription: item.russianTranscription,
        translation: item.translation || "",
        count: 33, // По умолчанию
        category: getCategoryLabel(item.category),
        type: item.type,
      });
    }
    setCurrentCount(0);
    setSelectedCategory(null);
  };

  // Обработка выбора аята из диалога
  const handleAyahSelect = (ayah: SelectableItem) => {
    handleSelectItem(ayah);
  };

  // Если выбран элемент, показываем тасбих
  if (selectedItem) {
    const progress = selectedItem.count > 0 ? (currentCount / selectedItem.count) * 100 : 0;
    const isComplete = selectedItem.count > 0 && currentCount >= selectedItem.count;
    const displayTranscription = transcriptionMode === "latin" 
      ? selectedItem.transcription 
      : selectedItem.russianTranscription || selectedItem.transcription;

    return (
      <Fragment>
      <div className="space-y-4">
        {/* Кнопка назад */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelectedItem(null);
            setCurrentCount(0);
            setSelectedCategory(null);
          }}
          className="mb-2"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Назад к выбору
        </Button>

        {/* Карточка тасбиха */}
        <Card className="glass shadow-medium border-border/50 overflow-hidden">
          <div
            className={cn(
              "h-1 bg-gradient-to-r transition-all duration-500",
              isComplete ? "from-primary to-accent" : "from-muted to-transparent"
            )}
            style={{ width: `${Math.min(100, progress)}%` }}
          />
          
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <CardTitle>{selectedItem.title}</CardTitle>
                {/* Обратная связь о связанных целях */}
                {(() => {
                  const linkedGoals = goals.filter(g => 
                    (selectedItem.linkedGoalId && g.id === selectedItem.linkedGoalId) ||
                    (g.linked_counter_type === selectedItem.type && g.linked_item_id === selectedItem.id)
                  ).filter(g => g.status === "active");
                  
                  if (linkedGoals.length > 0) {
                    return (
                      <div className="mt-2 p-2 rounded-lg bg-primary/10 border border-primary/20">
                        <p className="text-xs text-primary font-semibold mb-1 flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          Это засчитается в ваши цели:
                        </p>
                        {linkedGoals.map(goal => (
                          <div key={goal.id} className="text-xs text-primary/80 flex items-center gap-1 mt-1">
                            <span>• "{goal.title}"</span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  // Показываем настройки
                  const settingsOpen = !showArabic || !showTranscription || !showTranslation;
                  // Просто переключаем видимость элементов через состояние
                }}
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Арабский текст */}
            {showArabic && selectedItem.text && (
              <div className="text-center py-4">
                <p 
                  className="text-4xl sm:text-5xl font-arabic text-foreground leading-relaxed" 
                  style={{ fontFamily: "'Amiri', 'Noto Sans Arabic', serif" }}
                  dir="rtl"
                >
                  {selectedItem.text}
                </p>
              </div>
            )}

            {/* Транскрипция */}
            {showTranscription && displayTranscription && (
              <div className="bg-gradient-to-br from-secondary/40 to-secondary/20 rounded-xl p-4 border border-border/40">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs text-muted-foreground">Транскрипция</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={transcriptionMode === "latin" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTranscriptionMode("latin")}
                      className="h-6 text-xs"
                    >
                      Лат.
                    </Button>
                    <Button
                      variant={transcriptionMode === "cyrillic" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTranscriptionMode("cyrillic")}
                      className="h-6 text-xs"
                    >
                      Кир.
                    </Button>
                  </div>
                </div>
                <p className="text-center text-base sm:text-lg text-foreground/95 italic leading-relaxed">
                  {displayTranscription}
                </p>
              </div>
            )}

            {/* Перевод */}
            {showTranslation && selectedItem.translation && (
              <div className="bg-gradient-to-br from-primary/8 to-primary/3 rounded-xl p-4 border border-primary/25">
                <p className="text-center text-base sm:text-lg text-foreground leading-relaxed">
                  {selectedItem.translation}
                </p>
              </div>
            )}

            {/* Аудио плеер (только для дуа) */}
            {selectedItem.type === "dua" && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    if (audioUrl) {
                      // TODO: Реализовать воспроизведение аудио
                      toast({
                        title: "Аудио",
                        description: "Воспроизведение будет реализовано",
                      });
                    } else {
                      toast({
                        title: "Аудио недоступно",
                        description: "Используется синтез речи браузера",
                      });
                    }
                  }}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
              </div>
            )}

            {/* Таймер сессии */}
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 border border-primary/30">
                <span className="text-xs text-muted-foreground">Время:</span>
                <span className="text-sm font-mono font-semibold text-accent">
                  {formatTime(sessionTime)}
                </span>
              </div>
            </div>

            {/* Счетчик - золотой дизайн */}
            <div className="text-center space-y-6">
              <div
                onClick={() => handleCount(1)}
                className={cn(
                  "relative inline-flex items-center justify-center w-40 h-40 sm:w-48 sm:h-48 rounded-full",
                  "border-4 transition-all duration-300 cursor-pointer",
                  "shadow-glow-gold",
                  isComplete
                    ? "border-accent bg-accent/20 scale-105"
                    : "border-accent/60 bg-accent/10 hover:border-accent hover:scale-105 hover:shadow-glow-gold"
                )}
              >
                {/* Внутреннее свечение */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent/30 to-transparent blur-xl" />
                
                <div className="relative text-center z-10">
                  <div className={cn(
                    "text-5xl sm:text-6xl font-bold transition-colors",
                    "gradient-text-gold drop-shadow-lg"
                  )}>
                    {currentCount}
                  </div>
                  {selectedItem.count > 0 && (
                    <div className="text-sm sm:text-base text-accent/70 mt-1">
                      / {selectedItem.count}
                    </div>
                  )}
                </div>
              </div>

              {/* Быстрые кнопки */}
              <div className="flex justify-center gap-2 flex-wrap">
                {isCountdownMode ? (
                  // Для обратного отсчета показываем кнопки уменьшения
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCount(10)}
                      className="px-4 py-2 rounded-full border-accent/50 bg-accent/10 hover:bg-accent/20 text-accent font-semibold"
                    >
                      -10
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCount(33)}
                      className="px-4 py-2 rounded-full border-accent/50 bg-accent/10 hover:bg-accent/20 text-accent font-semibold"
                    >
                      -33
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCount(50)}
                      className="px-4 py-2 rounded-full border-accent/50 bg-accent/10 hover:bg-accent/20 text-accent font-semibold"
                    >
                      -50
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCount(100)}
                      className="px-4 py-2 rounded-full border-accent/50 bg-accent/10 hover:bg-accent/20 text-accent font-semibold"
                    >
                      -100
                    </Button>
                  </>
                ) : (
                  // Для обычного режима показываем кнопки увеличения
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCount(10)}
                      className="px-4 py-2 rounded-full border-accent/50 bg-accent/10 hover:bg-accent/20 text-accent font-semibold"
                    >
                      +10
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCount(33)}
                      className="px-4 py-2 rounded-full border-accent/50 bg-accent/10 hover:bg-accent/20 text-accent font-semibold"
                    >
                      +33
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCount(50)}
                      className="px-4 py-2 rounded-full border-accent/50 bg-accent/10 hover:bg-accent/20 text-accent font-semibold"
                    >
                      +50
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCount(100)}
                      className="px-4 py-2 rounded-full border-accent/50 bg-accent/10 hover:bg-accent/20 text-accent font-semibold"
                    >
                      +100
                    </Button>
                  </>
                )}
              </div>
              
              {/* Кнопка Undo */}
              {showUndo && (
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUndo}
                    className="px-4 py-2 rounded-full border-yellow-500/50 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 font-semibold animate-pulse"
                  >
                    <Undo2 className="w-4 h-4 mr-2" />
                    Отменить
                  </Button>
                </div>
              )}

              {selectedItem.count > 0 && (
                <div className="px-4">
                  <Progress 
                    value={progress} 
                    className="h-3 bg-secondary/30"
                  />
                  <div className="text-xs text-muted-foreground mt-1 text-center">
                    {Math.round(progress)}% завершено
                  </div>
                </div>
              )}

              {/* Кнопки для режима learn */}
              {goalType === "learn" && selectedItem.linkedGoalId && (
                <div className="flex justify-center gap-3 mt-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      // Записываем событие repeat
                      toast({
                        title: "Повторено",
                        description: "Событие записано",
                      });
                    }}
                    className="px-6 py-3 rounded-full border-accent/50 bg-accent/10 hover:bg-accent/20 text-accent font-semibold"
                  >
                    Повторил
                  </Button>
                  <Button
                    variant="default"
                    size="lg"
                    onClick={() => {
                      // Меняем статус цели на completed
                      if (selectedItem.linkedGoalId) {
                        const goal = goals.find(g => g.id === selectedItem.linkedGoalId);
                        if (goal) {
                          const updatedGoal = {
                            ...goal,
                            status: "completed" as const,
                            updated_at: new Date(),
                          };
                          const updatedGoals = goals.map(g => g.id === updatedGoal.id ? updatedGoal : g);
                          localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(updatedGoals));
                          setGoals(updatedGoals);
                          
                          toast({
                            title: "Выучено!",
                            description: `Поздравляем! Вы выучили "${goal.title}"`,
                          });
                          
                          setSelectedItem(null);
                          setSelectedGoal(null);
                        }
                      }
                    }}
                    className="px-6 py-3 rounded-full bg-gradient-to-r from-accent to-accent-light text-primary font-semibold shadow-glow-gold"
                  >
                    Выучил
                  </Button>
                </div>
              )}

              {isComplete && (
                <div className="text-center">
                  <p className="text-sm gradient-text-gold font-semibold animate-pulse">
                    ✨ Завершено! Ма ша Аллах
                  </p>
                  {selectedItem.linkedGoalId && goalType === "recite" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        toast({
                          title: "Цель завершена?",
                          description: "Откройте цели, чтобы отметить выполнение",
                        });
                      }}
                      className="mt-2"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Отметить цель выполненной
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Кнопка сброса */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={handleReset}
                className="w-full sm:w-auto"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Сбросить счетчик
              </Button>
            </div>

            {/* Настройки отображения */}
            <Card className="bg-secondary/50">
              <CardHeader>
                <CardTitle className="text-sm">Настройки отображения</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="showArabic">Арабский текст</Label>
                  <Switch
                    id="showArabic"
                    checked={showArabic}
                    onCheckedChange={setShowArabic}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="showTranscription">Транскрипция</Label>
                  <Switch
                    id="showTranscription"
                    checked={showTranscription}
                    onCheckedChange={setShowTranscription}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="showTranslation">Перевод</Label>
                  <Switch
                    id="showTranslation"
                    checked={showTranslation}
                    onCheckedChange={setShowTranslation}
                  />
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
      <AyahSelectorDialog
        open={ayahDialogOpen}
        onOpenChange={setAyahDialogOpen}
        onSelect={handleAyahSelect}
      />
      </Fragment>
    );
  }

  // Экран выбора
  return (
    <div className="space-y-6">
      {/* Ежедневные азкары */}
      {!selectedItem && (
        <DailyAzkarProgress 
          dailyAzkar={dailyAzkar}
          onSegmentClick={handleAzkarSegmentClick}
        />
      )}

      {/* Выбор режима */}
      {!selectedItem && (
        <Card>
          <CardHeader>
            <CardTitle>Выберите источник</CardTitle>
          <CardDescription>
            Выберите из ваших целей или из категорий
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={mode === "goals" ? "default" : "outline"}
              onClick={() => setMode("goals")}
              className="h-auto py-6 flex flex-col gap-2"
            >
              <Target className="w-6 h-6" />
              <span>Из целей</span>
              {tasbihGoals.length > 0 && (
                <Badge variant="secondary">{tasbihGoals.length}</Badge>
              )}
            </Button>
            <Button
              variant={mode === "categories" ? "default" : "outline"}
              onClick={() => setMode("categories")}
              className="h-auto py-6 flex flex-col gap-2"
            >
              <span className="text-2xl">📿</span>
              <span>Из категорий</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      )}

      {/* Список целей */}
      {!selectedItem && mode === "goals" && (
        <div className="space-y-3">
          {tasbihGoals.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-muted-foreground">
                  Нет активных целей, связанных с тасбихом. Создайте цель в разделе "Цели".
                </div>
              </CardContent>
            </Card>
          ) : (
            tasbihGoals.map((goal) => {
              const progress = (goal.current_value / goal.target_value) * 100;
              return (
                <Card
                  key={goal.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleSelectGoal(goal)}
                >
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getCategoryIcon(goal.category)}</span>
                          <div>
                            <div className="font-semibold">{goal.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {goal.current_value} / {goal.target_value}
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline">
                          {getCategoryLabel(goal.category)}
                        </Badge>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Выбор категории */}
      {mode === "categories" && !selectedCategory && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { id: "dua", label: "Дуа", icon: "🤲" },
            { id: "adhkar", label: "Азкары", icon: "📿" },
            { id: "salawat", label: "Салаваты", icon: "❤️" },
            { id: "kalima", label: "Калимы", icon: "✨" },
            { id: "quran", label: "Коран", icon: "📖" },
            { id: "asmaul_husna", label: "99 имен", icon: "🌟" },
          ].map((cat) => (
            <Card
              key={cat.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleSelectFromCategory(cat.id)}
            >
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <div className="text-4xl">{cat.icon}</div>
                  <div className="font-semibold">{cat.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Список элементов категории */}
      {mode === "categories" && selectedCategory && (
        <div className="space-y-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className="mb-2"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Назад к категориям
          </Button>

          <CategoryItemsList
            category={selectedCategory}
            duas={duas}
            adhkar={adhkar}
            salawat={salawat}
            kalimas={kalimas}
            asmaulHusna={asmaulHusna}
            onSelectItem={handleSelectItem}
          />
        </div>
      )}

      <AyahSelectorDialog
        open={ayahDialogOpen}
        onOpenChange={setAyahDialogOpen}
        onSelect={handleAyahSelect}
      />
    </div>
  );
};

// Компонент для отображения списка элементов категории
interface CategoryItemsListProps {
  category: string | null;
  duas: any[];
  adhkar: any[];
  salawat: any[];
  kalimas: any[];
  asmaulHusna: any[];
  onSelectItem: (item: SelectableItem) => void | Promise<void>;
}

const CategoryItemsList = ({
  category,
  duas,
  adhkar,
  salawat,
  kalimas,
  asmaulHusna,
  onSelectItem,
}: CategoryItemsListProps) => {
  const [items, setItems] = useState<SelectableItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!category) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Загружаем статические данные
    const staticItems = getSelectableItems(category as any);
    let enrichedItems: SelectableItem[] = [...staticItems];

    // Обогащаем данными из API
    if (category === "zikr" || category === "dua") {
      const apiDuas = duas.map((dua: any) => ({
        id: dua.id || `dua-${Date.now()}-${Math.random()}`,
        title: dua.translation?.substring(0, 50) || "Дуа",
        text: dua.arabic || "",
        transcription: dua.transcription || "",
        russianTranscription: dua.russianTranscription,
        translation: dua.translation || "",
        category: "zikr" as const,
        type: "dua" as const,
      }));

      const apiAdhkar = adhkar.map((item: any) => ({
        id: item.id || `adhkar-${Date.now()}-${Math.random()}`,
        title: item.title || item.name || "",
        text: item.text || item.arabic || "",
        transcription: item.transcription || "",
        russianTranscription: item.russianTranscription,
        translation: item.translation || "",
        category: "zikr" as const,
        type: "adhkar" as const,
      }));

      const apiSalawat = salawat.map((item: any) => ({
        id: item.id || `salawat-${Date.now()}-${Math.random()}`,
        title: `Салават: ${item.translation?.substring(0, 30) || ""}...`,
        text: item.arabic || "",
        transcription: item.transcription || "",
        russianTranscription: item.russianTranscription,
        translation: item.translation || "",
        category: "zikr" as const,
        type: "salawat" as const,
      }));

      const apiKalimas = kalimas.map((item: any) => ({
        id: item.id || `kalima-${Date.now()}-${Math.random()}`,
        title: `Калима: ${item.translation?.substring(0, 30) || ""}...`,
        text: item.arabic || "",
        transcription: item.transcription || "",
        russianTranscription: item.russianTranscription,
        translation: item.translation || "",
        category: "zikr" as const,
        type: "kalima" as const,
      }));

      enrichedItems = [...enrichedItems, ...apiDuas, ...apiAdhkar, ...apiSalawat, ...apiKalimas];
    } else if (category === "asmaul_husna") {
      // Объединяем статические данные с данными из API
      const apiAsmaulHusna = asmaulHusna.map((item: any) => ({
        id: item.id || `asma-${item.number || Date.now()}`,
        title: `${item.number || ""}. ${item.transcription || ""} - ${item.translation || ""}`,
        text: item.arabic || "",
        transcription: item.transcription || "",
        translation: item.translation || "",
        category: "asmaul_husna" as const,
        type: "asmaul_husna" as const,
      }));

      // Объединяем, убирая дубликаты по ID
      const existingIds = new Set(enrichedItems.map(i => i.id));
      const newItems = apiAsmaulHusna.filter(item => !existingIds.has(item.id));
      enrichedItems = [...enrichedItems, ...newItems];
    }

    setItems(enrichedItems);
    setLoading(false);
  }, [category, duas, adhkar, salawat, kalimas, asmaulHusna]);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            Загрузка...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            Нет доступных элементов в этой категории
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <Card
          key={item.id}
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onSelectItem(item)}
        >
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="font-semibold">{item.title}</div>
              {item.text && (
                <div className="text-lg font-arabic text-right" dir="rtl">
                  {item.text}
                </div>
              )}
              {item.translation && (
                <div className="text-sm text-muted-foreground">
                  {item.translation}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

