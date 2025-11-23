import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Cloud, CloudOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useSupabaseSync } from '@/hooks/useSupabaseSync';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

/**
 * Кнопка для управления облачной синхронизацией
 */
export const CloudSyncButton = () => {
  const { isAvailable, isSyncing, lastSyncTime, syncError, manualSync } = useSupabaseSync();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSync = async () => {
    setIsLoading(true);
    const result = await manualSync();
    setIsLoading(false);

    if (result.success) {
      toast({
        title: 'Синхронизация успешна',
        description: 'Данные успешно сохранены в облаке',
      });
    } else {
      toast({
        title: 'Ошибка синхронизации',
        description: result.error || 'Не удалось синхронизировать данные',
        variant: 'destructive',
      });
    }
  };

  if (!isAvailable) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className="gap-2"
        aria-label="Облачная синхронизация недоступна"
      >
        <CloudOff className="w-4 h-4" />
        <span className="hidden sm:inline">Синхронизация недоступна</span>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleSync}
        disabled={isSyncing || isLoading}
        className="gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        aria-label={isSyncing ? 'Синхронизация...' : 'Синхронизировать с облаком'}
        aria-busy={isSyncing || isLoading}
      >
        {isSyncing || isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="hidden sm:inline">Синхронизация...</span>
          </>
        ) : syncError ? (
          <>
            <AlertCircle className="w-4 h-4 text-destructive" />
            <span className="hidden sm:inline">Ошибка</span>
          </>
        ) : lastSyncTime ? (
          <>
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="hidden sm:inline">
              Синхронизировано {lastSyncTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </>
        ) : (
          <>
            <Cloud className="w-4 h-4" />
            <span className="hidden sm:inline">Синхронизировать</span>
          </>
        )}
      </Button>
    </div>
  );
};

