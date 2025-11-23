import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportUserData, importUserData, hasDataToExport } from "@/lib/data-export";

export const DataBackupDialog = () => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    try {
      if (!hasDataToExport()) {
        toast({
          title: "Нет данных",
          description: "Нет данных для экспорта",
          variant: "destructive",
        });
        return;
      }

      await exportUserData();
      toast({
        title: "Успешно",
        description: "Данные успешно экспортированы",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось экспортировать данные",
        variant: "destructive",
      });
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    // Проверяем тип файла
    if (!file.name.endsWith('.json')) {
      toast({
        title: "Ошибка",
        description: "Файл должен быть в формате JSON",
        variant: "destructive",
      });
      return;
    }

    setImporting(true);
    try {
      const result = await importUserData(file);
      
      if (result.success) {
        toast({
          title: "Успешно",
          description: "Данные успешно импортированы",
        });
        setOpen(false);
        // Обновляем страницу для применения изменений
        window.location.reload();
      } else {
        toast({
          title: "Ошибка",
          description: result.error || "Не удалось импортировать данные",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось импортировать данные",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
      // Очищаем input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Резервная копия
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Резервное копирование данных</DialogTitle>
          <DialogDescription>
            Экспортируйте ваши данные для резервного копирования или импортируйте ранее сохраненные данные
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Экспорт */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Экспорт данных</h3>
            <p className="text-sm text-muted-foreground">
              Скачайте файл с вашими данными для резервного копирования
            </p>
            <Button 
              onClick={handleExport} 
              className="w-full"
              disabled={!hasDataToExport()}
            >
              <Download className="w-4 h-4 mr-2" />
              Экспортировать данные
            </Button>
          </div>

          <div className="border-t pt-4" />

          {/* Импорт */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Импорт данных</h3>
            <p className="text-sm text-muted-foreground">
              Загрузите ранее сохраненный файл для восстановления данных
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
              id="import-file-input"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full"
              disabled={importing}
            >
              <Upload className="w-4 h-4 mr-2" />
              {importing ? "Импорт..." : "Импортировать данные"}
            </Button>
          </div>

          {/* Предупреждение */}
          <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div className="text-sm text-yellow-800 dark:text-yellow-200">
                <p className="font-semibold mb-1">Внимание!</p>
                <p>Импорт данных заменит текущие данные. Убедитесь, что у вас есть резервная копия.</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

