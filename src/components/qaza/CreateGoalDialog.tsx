// Диалог создания цели

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import type { Goal, GoalCategory, GoalType, GoalPeriod, GoalMetric } from "@/types/goals";
import {
  getCategoryLabel,
  getCategoryIcon,
  calculateEndDate,
  getPeriodLabel,
} from "@/lib/goals-utils";
import { format } from "date-fns";
import { getSelectableItems } from "@/lib/goals-selectable-items";
import type { SelectableItem } from "@/types/goals";
import { Search, Check, X, Calendar as CalendarIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface CreateGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (goal: Goal) => void;
  defaultCategory?: GoalCategory;
  editGoal?: Goal; // Цель для редактирования
}

export const CreateGoalDialog = ({
  open,
  onOpenChange,
  onSave,
  defaultCategory,
  editGoal,
}: CreateGoalDialogProps) => {
  const { toast } = useToast();
  
  // Состояние формы
  const [category, setCategory] = useState<GoalCategory>(defaultCategory || "prayer");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<GoalType>("fixed_term");
  const [period, setPeriod] = useState<GoalPeriod>("month");
  const [metric, setMetric] = useState<GoalMetric>("count");
  const [targetValue, setTargetValue] = useState(30);
  const [customDays, setCustomDays] = useState(30);
  const [customEndDate, setCustomEndDate] = useState("");
  const [isLearningGoal, setIsLearningGoal] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationTime, setNotificationTime] = useState("09:00");
  
  // Выбор конкретного элемента
  const [showItemSelector, setShowItemSelector] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SelectableItem | null>(null);
  const [itemSearchQuery, setItemSearchQuery] = useState("");
  
  // Для Корана - выбор суры/аята
  const [surahNumber, setSurahNumber] = useState<number | undefined>();
  const [ayahNumber, setAyahNumber] = useState<number | undefined>();
  
  // Для намазов - выбор типа
  const [prayerType, setPrayerType] = useState<"tahajjud" | "istighfar" | "sunnah" | "qaza" | undefined>();
  
  // Для знаний - выбор типа
  const [knowledgeType, setKnowledgeType] = useState<"book" | "alifba" | "tajweed" | undefined>();
  const [bookName, setBookName] = useState("");

  // Получаем доступные элементы для выбора
  const selectableItems = useMemo(() => {
    if (category === "quran" || category === "zikr" || category === "asmaul_husna") {
      return getSelectableItems(category);
    }
    return [];
  }, [category]);

  // Фильтрация элементов по поисковому запросу
  const filteredItems = useMemo(() => {
    if (!itemSearchQuery.trim()) return selectableItems;
    const query = itemSearchQuery.toLowerCase();
    return selectableItems.filter(item =>
      item.title.toLowerCase().includes(query) ||
      item.transcription?.toLowerCase().includes(query) ||
      item.russianTranscription?.toLowerCase().includes(query) ||
      item.translation?.toLowerCase().includes(query)
    );
  }, [selectableItems, itemSearchQuery]);

  // Загрузка данных для редактирования или сброс формы
  useEffect(() => {
    if (open) {
      if (editGoal) {
        // Режим редактирования
        setCategory(editGoal.category);
        setTitle(editGoal.title);
        setDescription(editGoal.description || "");
        setType(editGoal.type);
        setPeriod(editGoal.period);
        setMetric(editGoal.metric);
        setTargetValue(editGoal.target_value);
        setIsLearningGoal(editGoal.is_learning_goal || false);
        setNotificationsEnabled(editGoal.notifications_enabled || false);
        setNotificationTime(editGoal.notification_time || "09:00");
        setPrayerType(editGoal.prayer_type);
        setSurahNumber(editGoal.surah_number);
        setAyahNumber(editGoal.ayah_number);
        setKnowledgeType(editGoal.knowledge_type);
        setBookName(editGoal.book_name || "");
        
        // Загружаем выбранный элемент, если есть
        if (editGoal.linked_item_id) {
          const items = getSelectableItems(editGoal.category);
          const item = items.find(i => i.id === editGoal.linked_item_id);
          if (item) {
            setSelectedItem(item);
          }
        }
        
        // Для произвольной даты
        if (editGoal.period === "custom") {
          setCustomEndDate(format(new Date(editGoal.end_date), "yyyy-MM-dd"));
        }
      } else {
        // Режим создания
        setCategory(defaultCategory || "prayer");
        setTitle("");
        setDescription("");
        setType("fixed_term");
        setPeriod("month");
        setMetric("count");
        setTargetValue(30);
        setCustomDays(30);
        setCustomEndDate("");
        setIsLearningGoal(false);
        setNotificationsEnabled(false);
        setNotificationTime("09:00");
        setShowItemSelector(false);
        setSelectedItem(null);
        setItemSearchQuery("");
        setSurahNumber(undefined);
        setAyahNumber(undefined);
        setPrayerType(undefined);
        setKnowledgeType(undefined);
        setBookName("");
      }
    }
  }, [open, defaultCategory, editGoal]);

  const handleSave = () => {
    // Валидация
    if (!title.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите название цели",
        variant: "destructive",
      });
      return;
    }

    if (targetValue <= 0) {
      toast({
        title: "Ошибка",
        description: "Целевое значение должно быть больше 0",
        variant: "destructive",
      });
      return;
    }

    const startDate = editGoal?.start_date || new Date();
    let endDate: Date;
    
    if (type === "infinite") {
      // Для бессрочной привычки устанавливаем дату далеко в будущем (100 лет)
      endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 100);
    } else if (period === "specific_date" && customEndDate) {
      endDate = new Date(customEndDate);
      if (endDate <= startDate) {
        toast({
          title: "Ошибка",
          description: "Дата окончания должна быть позже даты начала",
          variant: "destructive",
        });
        return;
      }
    } else if (period === "custom") {
      endDate = calculateEndDate(startDate, period, customDays);
    } else {
      endDate = editGoal?.end_date || calculateEndDate(startDate, period, customDays);
    }

    const goal: Goal = {
      id: editGoal?.id || `goal_${Date.now()}`,
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      type,
      period,
      metric,
      target_value: targetValue,
      current_value: editGoal?.current_value || 0, // Сохраняем текущий прогресс при редактировании
      start_date: editGoal?.start_date || startDate,
      end_date: endDate,
      status: editGoal?.status || "active",
      is_learning_goal: isLearningGoal,
      notifications_enabled: notificationsEnabled,
      notification_time: notificationsEnabled ? notificationTime : undefined,
      created_at: editGoal?.created_at || new Date(),
      updated_at: new Date(),
      // Сохраняем выбранные элементы
      linked_item_id: selectedItem?.id,
      linked_counter_type: selectedItem?.type,
      prayer_type: prayerType,
      surah_number: surahNumber,
      ayah_number: ayahNumber,
      verse_text: selectedItem?.text,
      knowledge_type: knowledgeType,
      book_name: bookName || undefined,
      history: editGoal?.history, // Сохраняем историю
    };

    onSave(goal);
  };

  const categories: GoalCategory[] = ["prayer", "quran", "zikr", "sadaqa", "knowledge", "asmaul_husna"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editGoal ? "Редактировать цель" : "Создать цель"}</DialogTitle>
          <DialogDescription>
            {editGoal ? "Измените параметры цели" : "Создайте новую цель для отслеживания вашего духовного пути"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Категория */}
          <div className="space-y-2">
            <Label>Категория</Label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  type="button"
                  variant={category === cat ? "default" : "outline"}
                  onClick={() => setCategory(cat)}
                  className="flex flex-col items-center gap-2 h-auto py-3"
                >
                  <span className="text-2xl">{getCategoryIcon(cat)}</span>
                  <span className="text-xs">{getCategoryLabel(cat)}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Выбор конкретного элемента для категорий, где это нужно */}
          {(category === "prayer" || category === "quran" || category === "zikr" || category === "asmaul_husna" || category === "knowledge") && (
            <div className="space-y-2">
              <Label>Выберите конкретный элемент</Label>
              
              {/* Для намазов */}
              {category === "prayer" && (
                <Select value={prayerType || ""} onValueChange={(value) => setPrayerType(value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тип намаза" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tahajjud">Тахаджуд</SelectItem>
                    <SelectItem value="istighfar">Истигфар</SelectItem>
                    <SelectItem value="sunnah">Сунна намаз</SelectItem>
                    <SelectItem value="qaza">Каза (восполнение)</SelectItem>
                  </SelectContent>
                </Select>
              )}

              {/* Для Корана */}
              {category === "quran" && (
                <div className="space-y-3">
                  <Select 
                    value={surahNumber?.toString() || ""} 
                    onValueChange={(value) => setSurahNumber(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите суру" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 114 }, (_, i) => i + 1).map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          Сура {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {surahNumber && (
                    <div className="space-y-2">
                      <Label htmlFor="ayahNumber">Номер аята (необязательно)</Label>
                      <Input
                        id="ayahNumber"
                        type="number"
                        min={1}
                        value={ayahNumber || ""}
                        onChange={(e) => setAyahNumber(e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder="Оставьте пустым для всей суры"
                      />
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowItemSelector(true)}
                    className="w-full"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Или выбрать из списка аятов
                  </Button>
                </div>
              )}

              {/* Для зикров, дуа, салаватов, калим, 99 имен */}
              {(category === "zikr" || category === "asmaul_husna") && (
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowItemSelector(true)}
                    className="w-full"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    {selectedItem ? `Выбрано: ${selectedItem.title}` : "Выбрать из списка"}
                  </Button>
                  {selectedItem && (
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg border bg-secondary/50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-semibold">{selectedItem.title}</div>
                            {selectedItem.text && (
                              <div className="text-lg font-arabic text-right mt-2" dir="rtl">
                                {selectedItem.text}
                              </div>
                            )}
                            {selectedItem.translation && (
                              <div className="text-sm text-muted-foreground mt-1">
                                {selectedItem.translation}
                              </div>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedItem(null)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {/* Автоматическое предложение связать с тасбихом */}
                      <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                        <div className="flex items-start gap-2">
                          <div className="flex-1">
                            <div className="font-semibold text-sm mb-1">Связать с умным тасбихом?</div>
                            <p className="text-xs text-muted-foreground">
                              Прогресс будет автоматически обновляться при использовании тасбиха для этого зикра
                            </p>
                          </div>
                          <Switch
                            checked={true}
                            disabled
                            className="mt-1"
                          />
                        </div>
                        <p className="text-xs text-primary mt-2 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Автоматически связано
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Для знаний */}
              {category === "knowledge" && (
                <div className="space-y-3">
                  <Select 
                    value={knowledgeType || ""} 
                    onValueChange={(value) => setKnowledgeType(value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите тип знаний" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alifba">Алифба (Арабский алфавит)</SelectItem>
                      <SelectItem value="tajweed">Таджвид (Правила чтения Корана)</SelectItem>
                      <SelectItem value="book">Книга</SelectItem>
                    </SelectContent>
                  </Select>
                  {knowledgeType === "book" && (
                    <Input
                      placeholder="Название книги"
                      value={bookName}
                      onChange={(e) => setBookName(e.target.value)}
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {/* Название */}
          <div className="space-y-2">
            <Label htmlFor="title">Название цели *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                category === "prayer" ? "Например: Читать тахаджуд каждый день" :
                category === "quran" ? "Например: Прочитать суру Аль-Фатиха" :
                category === "zikr" ? "Например: Произносить тасбих 100 раз" :
                category === "asmaul_husna" ? "Например: Выучить 99 имен Аллаха" :
                "Например: Прочитать Коран за месяц"
              }
            />
          </div>

          {/* Описание */}
          <div className="space-y-2">
            <Label htmlFor="description">Описание (необязательно)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Дополнительная информация о цели"
            />
          </div>

          {/* Тип цели */}
          <div className="space-y-2">
            <Label>Тип цели</Label>
            <RadioGroup value={type} onValueChange={(value) => {
              setType(value as GoalType);
              // Сброс периода при смене типа
              if (value === "infinite") {
                setPeriod("custom");
              }
            }}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="one_time" id="one_time" />
                <Label htmlFor="one_time" className="cursor-pointer">Одноразовая</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="recurring" id="recurring" />
                <Label htmlFor="recurring" className="cursor-pointer">Повторяющаяся</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fixed_term" id="fixed_term" />
                <Label htmlFor="fixed_term" className="cursor-pointer">С фиксированным сроком</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="infinite" id="infinite" />
                <Label htmlFor="infinite" className="cursor-pointer">Бессрочная привычка</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Срок выполнения */}
          {(type === "fixed_term" || type === "recurring") && (
            <div className="space-y-2">
              <Label>Срок выполнения</Label>
              <Select value={period} onValueChange={(value) => setPeriod(value as GoalPeriod)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Неделя</SelectItem>
                  <SelectItem value="month">Месяц</SelectItem>
                  <SelectItem value="40_days">40 дней</SelectItem>
                  <SelectItem value="year">Год</SelectItem>
                  <SelectItem value="specific_date">К определенной дате</SelectItem>
                  <SelectItem value="custom">Произвольный период (дни)</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Выбор конкретной даты в календаре */}
              {period === "specific_date" && (
                <div className="space-y-2">
                  <Label>Дата окончания</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !customEndDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {customEndDate ? format(new Date(customEndDate), "PPP", { locale: require("date-fns/locale/ru") }) : "Выберите дату"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={customEndDate ? new Date(customEndDate) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            setCustomEndDate(format(date, "yyyy-MM-dd"));
                          }
                        }}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
              
              {/* Произвольный период в днях */}
              {period === "custom" && (
                <div className="space-y-2">
                  <Label htmlFor="customDays">Количество дней</Label>
                  <Input
                    id="customDays"
                    type="number"
                    min={1}
                    value={customDays}
                    onChange={(e) => setCustomDays(parseInt(e.target.value) || 30)}
                  />
                </div>
              )}
            </div>
          )}

          {/* Для бессрочной привычки */}
          {type === "infinite" && (
            <div className="p-3 rounded-lg bg-muted/50 border border-dashed">
              <p className="text-sm text-muted-foreground">
                Бессрочная привычка не имеет срока окончания. Вы можете отслеживать прогресс неограниченное время.
              </p>
            </div>
          )}

          {/* Метрика */}
          <div className="space-y-2">
            <Label>Метрика</Label>
            <RadioGroup value={metric} onValueChange={(value) => setMetric(value as GoalMetric)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="count" id="count" />
                <Label htmlFor="count" className="cursor-pointer">
                  Количество (раз, страниц, сур)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="regularity" id="regularity" />
                <Label htmlFor="regularity" className="cursor-pointer">
                  Регулярность (дни подряд)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Целевое значение */}
          <div className="space-y-2">
            <Label htmlFor="targetValue">
              Целевое значение ({metric === "count" ? "количество" : "дней"}) *
            </Label>
            <Input
              id="targetValue"
              type="number"
              min={1}
              value={targetValue}
              onChange={(e) => setTargetValue(parseInt(e.target.value) || 0)}
            />
          </div>

          {/* Выучивание */}
          {(category === "quran" || category === "zikr" || category === "asmaul_husna") && (
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Цель на выучивание</Label>
                <p className="text-sm text-muted-foreground">
                  Отметьте, если хотите выучить этот текст
                </p>
              </div>
              <Switch
                checked={isLearningGoal}
                onCheckedChange={setIsLearningGoal}
              />
            </div>
          )}

          {/* Уведомления */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Включить напоминания</Label>
              <p className="text-sm text-muted-foreground">
                Получать уведомления о прогрессе цели
              </p>
            </div>
            <Switch
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
            />
          </div>

          {notificationsEnabled && (
            <div className="space-y-2">
              <Label htmlFor="notificationTime">Время уведомления</Label>
              <Input
                id="notificationTime"
                type="time"
                value={notificationTime}
                onChange={(e) => setNotificationTime(e.target.value)}
              />
            </div>
          )}

          {/* Кнопки */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Отмена
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 bg-primary"
            >
              {editGoal ? "Сохранить изменения" : "Создать цель"}
            </Button>
          </div>
        </div>

        {/* Диалог выбора элементов */}
        {showItemSelector && (
          <Dialog open={showItemSelector} onOpenChange={setShowItemSelector}>
            <DialogContent className="max-w-2xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>Выберите элемент</DialogTitle>
                <DialogDescription>
                  Выберите {category === "zikr" ? "зикр, дуа, салават или калиму" : "имя Аллаха"} для цели
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Поиск */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск..."
                    value={itemSearchQuery}
                    onChange={(e) => setItemSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Список элементов */}
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {filteredItems.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Ничего не найдено
                      </div>
                    ) : (
                      filteredItems.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setSelectedItem(item);
                            setShowItemSelector(false);
                            setItemSearchQuery("");
                            // Автоматически заполняем название, если пустое
                            if (!title.trim()) {
                              setTitle(item.title);
                            }
                          }}
                          className={`p-4 rounded-lg border cursor-pointer transition-colors hover:bg-secondary ${
                            selectedItem?.id === item.id ? "border-primary bg-primary/10" : ""
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-semibold">{item.title}</div>
                              {item.text && (
                                <div className="text-lg font-arabic text-right mt-2" dir="rtl">
                                  {item.text}
                                </div>
                              )}
                              {item.translation && (
                                <div className="text-sm text-muted-foreground mt-1">
                                  {item.translation}
                                </div>
                              )}
                            </div>
                            {selectedItem?.id === item.id && (
                              <Check className="w-5 h-5 text-primary" />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
};

