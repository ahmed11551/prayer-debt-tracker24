import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, CheckCircle2 } from 'lucide-react';
import { useUserData } from '@/hooks/useUserData';
import { calculateProgressStats } from '@/lib/prayer-utils';
import { useToast } from '@/hooks/use-toast';
import { analytics } from '@/lib/analytics';

/**
 * Кнопка для шаринга прогресса
 */
export const ShareProgressButton = () => {
  const { userData } = useUserData();
  const { toast } = useToast();
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    if (!userData) {
      toast({
        title: 'Нет данных',
        description: 'Для шаринга необходим прогресс',
        variant: 'destructive',
      });
      return;
    }

    setIsSharing(true);

    try {
      const stats = calculateProgressStats(userData);
      const progressText = `📿 Мой духовный прогресс:\n\n✅ Выполнено: ${stats.totalCompleted} намазов\n📊 Прогресс: ${stats.overallProgress.toFixed(1)}%\n🎯 Осталось: ${stats.remaining} намазов\n\n#PrayerTracker #Ислам`;

      // Проверка поддержки Web Share API
      if (navigator.share) {
        await navigator.share({
          title: 'Мой духовный прогресс',
          text: progressText,
          url: window.location.origin,
        });

        analytics.trackEvent({
          action: 'share_progress',
          category: 'social',
          method: 'native_share',
        });

        toast({
          title: 'Успешно поделились',
          description: 'Прогресс отправлен',
        });
      } else {
        // Fallback: копирование в буфер обмена
        await navigator.clipboard.writeText(progressText);
        
        analytics.trackEvent({
          action: 'share_progress',
          category: 'social',
          method: 'clipboard',
        });

        toast({
          title: 'Скопировано в буфер обмена',
          description: 'Текст готов для вставки',
        });
      }
    } catch (error: any) {
      // Пользователь отменил шаринг - это нормально
      if (error.name !== 'AbortError') {
        console.error('Ошибка шаринга:', error);
        toast({
          title: 'Ошибка',
          description: 'Не удалось поделиться прогрессом',
          variant: 'destructive',
        });
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      disabled={isSharing || !userData}
      className="gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      aria-label="Поделиться прогрессом"
    >
      <Share2 className="w-4 h-4" />
      <span className="hidden sm:inline">Поделиться</span>
    </Button>
  );
};

