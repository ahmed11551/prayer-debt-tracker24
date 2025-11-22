// Диалог для выбора конкретного аята из суры

import { useState, useEffect } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { QURAN_SURAHS } from "@/data/quran-surahs";
import { eReplikaAPI } from "@/lib/api";
import type { SelectableItem } from "@/types/goals";

interface AyahSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (ayah: SelectableItem) => void;
}

export const AyahSelectorDialog = ({
  open,
  onOpenChange,
  onSelect,
}: AyahSelectorDialogProps) => {
  const [selectedSurah, setSelectedSurah] = useState<number>(1);
  const [selectedAyah, setSelectedAyah] = useState<number>(1);
  const [ayahs, setAyahs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [ayahData, setAyahData] = useState<any | null>(null);

  const surah = QURAN_SURAHS.find(s => s.number === selectedSurah);

  // Загрузка аятов из суры
  useEffect(() => {
    if (open && selectedSurah) {
      loadAyahs();
    }
  }, [open, selectedSurah]);

  const loadAyahs = async () => {
    setLoading(true);
    try {
      const data = await eReplikaAPI.getAyahs(selectedSurah);
      if (data && data.length > 0) {
        setAyahs(data);
        // Устанавливаем первый аят по умолчанию
        if (data[0]) {
          setSelectedAyah(data[0].number);
          setAyahData(data[0]);
        }
      } else {
        // Если API не вернул данные, создаем список на основе количества аятов
        const surah = QURAN_SURAHS.find(s => s.number === selectedSurah);
        if (surah) {
          const generatedAyahs = Array.from({ length: surah.ayahsCount }, (_, i) => ({
            number: i + 1,
            surah: selectedSurah,
          }));
          setAyahs(generatedAyahs);
          setSelectedAyah(1);
        }
      }
    } catch (error) {
      console.error("Error loading ayahs:", error);
      // Fallback на статический список
      const surah = QURAN_SURAHS.find(s => s.number === selectedSurah);
      if (surah) {
        const generatedAyahs = Array.from({ length: surah.ayahsCount }, (_, i) => ({
          number: i + 1,
          surah: selectedSurah,
        }));
        setAyahs(generatedAyahs);
        setSelectedAyah(1);
      }
    } finally {
      setLoading(false);
    }
  };

  // Загрузка конкретного аята
  useEffect(() => {
    if (selectedSurah && selectedAyah && open) {
      loadAyah();
    }
  }, [selectedSurah, selectedAyah, open]);

  const loadAyah = async () => {
    try {
      const data = await eReplikaAPI.getAyah(selectedSurah, selectedAyah);
      if (data) {
        setAyahData(data);
      }
    } catch (error) {
      console.error("Error loading ayah:", error);
    }
  };

  const handleSelect = () => {
    if (ayahData && surah) {
      const ayahItem: SelectableItem = {
        id: `ayah-${selectedSurah}-${selectedAyah}`,
        title: `${surah.name}, аят ${selectedAyah}`,
        text: ayahData.arabic || "",
        transcription: ayahData.transcription,
        translation: ayahData.translation || "",
        category: "quran",
        type: "ayah",
        surah_number: selectedSurah,
        ayah_number: selectedAyah,
      };
      onSelect(ayahItem);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Выбрать аят из Корана</DialogTitle>
          <DialogDescription>
            Выберите суру и конкретный аят для повторения
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Выбор суры */}
          <div className="space-y-2">
            <Label>Сура</Label>
            <Select
              value={selectedSurah.toString()}
              onValueChange={(value) => {
                setSelectedSurah(parseInt(value));
                setSelectedAyah(1);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <ScrollArea className="h-60">
                  {QURAN_SURAHS.map((s) => (
                    <SelectItem key={s.number} value={s.number.toString()}>
                      {s.number}. {s.name} ({s.ayahsCount} аятов)
                    </SelectItem>
                  ))}
                </ScrollArea>
              </SelectContent>
            </Select>
          </div>

          {/* Выбор аята */}
          <div className="space-y-2">
            <Label>Аят</Label>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <Select
                value={selectedAyah.toString()}
                onValueChange={(value) => setSelectedAyah(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="h-60">
                    {ayahs.map((ayah) => (
                      <SelectItem
                        key={ayah.number}
                        value={ayah.number.toString()}
                      >
                        Аят {ayah.number}
                      </SelectItem>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Предпросмотр аята */}
          {ayahData && (
            <div className="space-y-3 p-4 border rounded-lg bg-secondary/30">
              <div className="text-center">
                <p className="text-2xl font-arabic leading-relaxed" dir="rtl">
                  {ayahData.arabic || "Загрузка..."}
                </p>
              </div>
              {ayahData.transcription && (
                <p className="text-center text-sm italic text-muted-foreground">
                  {ayahData.transcription}
                </p>
              )}
              {ayahData.translation && (
                <p className="text-center text-sm text-muted-foreground">
                  {ayahData.translation}
                </p>
              )}
            </div>
          )}

          {/* Кнопки */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button onClick={handleSelect} disabled={!ayahData}>
              Выбрать
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};



