import { Button } from '@/components/ui/button';
import { Undo2, Redo2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UndoButtonProps {
  onUndo: () => void;
  onRedo?: () => void;
  canUndo: boolean;
  canRedo?: boolean;
  className?: string;
}

/**
 * Кнопка для отмены действий (Undo/Redo)
 * Улучшает UX, позволяя пользователю отменить случайные действия
 */
export const UndoButton = ({
  onUndo,
  onRedo,
  canUndo,
  canRedo = false,
  className,
}: UndoButtonProps) => {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={onUndo}
        disabled={!canUndo}
        className="h-8 w-8 p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        aria-label="Отменить последнее действие"
        title="Отменить (Ctrl+Z)"
      >
        <Undo2 className="w-4 h-4" />
      </Button>
      {onRedo && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRedo}
          disabled={!canRedo}
          className="h-8 w-8 p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label="Повторить действие"
          title="Повторить (Ctrl+Y)"
        >
          <Redo2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};

