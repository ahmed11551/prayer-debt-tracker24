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
import { Plus, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddPrayerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddPrayerDialog = ({ open, onOpenChange }: AddPrayerDialogProps) => {
  const { toast } = useToast();
  const [counts, setCounts] = useState({
    fajr: 0,
    dhuhr: 0,
    asr: 0,
    maghrib: 0,
    isha: 0,
    witr: 0,
  });

  const prayers = [
    { key: "fajr", label: "Фаджр", emoji: "🌅" },
    { key: "dhuhr", label: "Зухр", emoji: "☀️" },
    { key: "asr", label: "Аср", emoji: "🌤️" },
    { key: "maghrib", label: "Магриб", emoji: "🌇" },
    { key: "isha", label: "Иша", emoji: "🌙" },
    { key: "witr", label: "Витр", emoji: "✨" },
  ];

  const increment = (key: string) => {
    setCounts((prev) => ({ ...prev, [key]: prev[key] + 1 }));
  };

  const decrement = (key: string) => {
    setCounts((prev) => ({ ...prev, [key]: Math.max(0, prev[key] - 1) }));
  };

  const handleSave = () => {
    const total = Object.values(counts).reduce((sum, val) => sum + val, 0);
    if (total === 0) {
      toast({
        title: "Не выбрано намазов",
        description: "Выберите хотя бы один намаз для добавления",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Прогресс сохранён",
      description: `Добавлено ${total} намазов к вашему прогрессу`,
    });
    
    setCounts({
      fajr: 0,
      dhuhr: 0,
      asr: 0,
      maghrib: 0,
      isha: 0,
      witr: 0,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Добавить восполненные намазы</DialogTitle>
          <DialogDescription>
            Отметьте количество восполненных намазов за сегодня
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {prayers.map(({ key, label, emoji }) => (
            <div key={key} className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-base">
                <span>{emoji}</span>
                <span>{label}</span>
              </Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => decrement(key)}
                  className="h-8 w-8"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={counts[key]}
                  onChange={(e) =>
                    setCounts((prev) => ({
                      ...prev,
                      [key]: Math.max(0, parseInt(e.target.value) || 0),
                    }))
                  }
                  className="w-16 text-center"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => increment(key)}
                  className="h-8 w-8"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Отмена
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-gradient-primary hover:opacity-90"
          >
            Сохранить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
