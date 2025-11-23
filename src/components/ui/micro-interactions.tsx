import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MicroInteractionProps {
  children: ReactNode;
  type?: 'bounce' | 'scale' | 'fade' | 'slide';
  trigger?: 'hover' | 'click' | 'focus';
  className?: string;
}

/**
 * Компонент для микроанимаций
 * Улучшает воспринимаемую отзывчивость интерфейса
 */
export const MicroInteraction = ({
  children,
  type = 'scale',
  trigger = 'hover',
  className,
}: MicroInteractionProps) => {
  const interactionClasses = {
    bounce: trigger === 'hover' ? 'hover:animate-bounce' : 'active:animate-bounce',
    scale: trigger === 'hover' ? 'hover:scale-105' : 'active:scale-95',
    fade: trigger === 'hover' ? 'hover:opacity-80' : 'active:opacity-70',
    slide: trigger === 'hover' ? 'hover:translate-x-1' : 'active:translate-x-0',
  };

  return (
    <div
      className={cn(
        'transition-all duration-200 ease-out',
        interactionClasses[type],
        className
      )}
    >
      {children}
    </div>
  );
};

/**
 * Компонент для тактильной обратной связи
 */
export const HapticFeedback = ({ children, onInteraction }: { children: ReactNode; onInteraction?: () => void }) => {
  const handleInteraction = () => {
    // Вибрация для мобильных устройств
    if ('vibrate' in navigator) {
      navigator.vibrate(10); // Короткая вибрация 10ms
    }
    onInteraction?.();
  };

  return (
    <div onClick={handleInteraction} onTouchStart={handleInteraction}>
      {children}
    </div>
  );
};

