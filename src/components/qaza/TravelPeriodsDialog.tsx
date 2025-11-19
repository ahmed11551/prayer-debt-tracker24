// Компонент для добавления периодов путешествий

import { useState } from "react";
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
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { TravelPeriod } from "@/types/prayer-debt";

interface TravelPeriodsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  periods: TravelPeriod[];
  onSave: (periods: TravelPeriod[]) => void;
}

export const TravelPeriodsDialog = ({
  open,
  onOpenChange,
  periods,
  onSave,
}: TravelPeriodsDialogProps) => {
  const { toast } = useToast();
  const [localPeriods, setLocalPeriods] = useState<TravelPeriod[]>(periods);

  const addPeriod = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    setLocalPeriods([
      ...localPeriods,
      {
        start_date: today,
        end_date: tomorrow,
        days_count: 1,
      },
    ]);
  };

  const removePeriod = (index: number) => {
    setLocalPeriods(localPeriods.filter((_, i) => i !== index));
  };

  const updatePeriod = (index: number, field: keyof TravelPeriod, value: Date | number) => {
    const updated = [...localPeriods];
    updated[index] = { ...updated[index], [field]: value };

    // Автоматический расчет дней, если изменились даты
    if (field === "start_date" || field === "end_date") {
      const start = new Date(updated[index].start_date);
      const end = new Date(updated[index].end_date);
      if (end >= start) {
        updated[index].days_count = Math.ceil(
          (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
        );
      }
    }

    setLocalPeriods(updated);
  };

  const handleSave = () => {
    // Валидация периодов
    for (const period of localPeriods) {
      if (period.start_date >= period.end_date) {
        toast({
          title: "Ошибка",
          description: "Дата начала должна быть раньше даты окончания",
          variant: "destructive",
        });
        return;
      }
    }

    // Проверка пересечений
    for (let i = 0; i < localPeriods.length; i++) {
      for (let j = i + 1; j < localPeriods.length; j++) {
        const period1 = localPeriods[i];
        const period2 = localPeriods[j];
        if (
          period1.start_date <= period2.end_date &&
          period1.end_date >= period2.start_date
        ) {
          toast({
            title: "Ошибка",
            description: "Периоды путешествий не должны пересекаться",
            variant: "destructive",
          });
          return;
        }
      }
    }

    onSave(localPeriods);
    onOpenChange(false);
  };

  const totalDays = localPeriods.reduce((sum, p) => sum + p.days_count, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Периоды путешествий (сафар)</DialogTitle>
          <DialogDescription>
            Добавьте периоды путешествий для точного расчета сафар-намазов
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {localPeriods.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Нет добавленных периодов. Нажмите "Добавить период" для начала.
            </div>
          ) : (
            localPeriods.map((period, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border border-border bg-secondary/50 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Период {index + 1}</Label>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removePeriod(index)}
                    className="h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor={`start-${index}`} className="text-xs">
                      Дата начала
                    </Label>
                    <Input
                      id={`start-${index}`}
                      type="date"
                      value={new Date(period.start_date).toISOString().split("T")[0]}
                      onChange={(e) =>
                        updatePeriod(index, "start_date", new Date(e.target.value))
                      }
                      className="bg-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`end-${index}`} className="text-xs">
                      Дата окончания
                    </Label>
                    <Input
                      id={`end-${index}`}
                      type="date"
                      value={new Date(period.end_date).toISOString().split("T")[0]}
                      onChange={(e) =>
                        updatePeriod(index, "end_date", new Date(e.target.value))
                      }
                      className="bg-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`days-${index}`} className="text-xs">
                      Дней
                    </Label>
                    <Input
                      id={`days-${index}`}
                      type="number"
                      value={period.days_count}
                      onChange={(e) =>
                        updatePeriod(index, "days_count", parseInt(e.target.value) || 0)
                      }
                      min={1}
                      className="bg-background"
                    />
                  </div>
                </div>
              </div>
            ))
          )}

          <Button
            onClick={addPeriod}
            variant="outline"
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Добавить период
          </Button>

          {totalDays > 0 && (
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <div className="text-sm font-semibold text-primary">
                Всего дней в путешествиях: {totalDays}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Отмена
          </Button>
          <Button onClick={handleSave} className="flex-1 bg-gradient-primary">
            Сохранить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

