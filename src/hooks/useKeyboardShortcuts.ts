import { useEffect } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description?: string;
}

/**
 * Хук для обработки горячих клавиш
 * Улучшает UX для опытных пользователей
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Игнорируем, если пользователь вводит текст
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      shortcuts.forEach((shortcut) => {
        const matches =
          event.key.toLowerCase() === shortcut.key.toLowerCase() &&
          (shortcut.ctrlKey === undefined || event.ctrlKey === shortcut.ctrlKey) &&
          (shortcut.shiftKey === undefined || event.shiftKey === shortcut.shiftKey) &&
          (shortcut.altKey === undefined || event.altKey === shortcut.altKey);

        if (matches) {
          event.preventDefault();
          shortcut.action();
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);
}

/**
 * Предустановленные горячие клавиши
 */
export const defaultShortcuts = {
  undo: { key: 'z', ctrlKey: true, description: 'Отменить' },
  redo: { key: 'y', ctrlKey: true, description: 'Повторить' },
  save: { key: 's', ctrlKey: true, description: 'Сохранить' },
  search: { key: 'f', ctrlKey: true, description: 'Поиск' },
};

