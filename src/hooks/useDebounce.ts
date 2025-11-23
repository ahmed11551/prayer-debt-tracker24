import { useRef, useCallback } from 'react';

/**
 * Хук для защиты от двойного клика и множественных вызовов
 * @param callback - функция для выполнения
 * @param delay - задержка в миллисекундах (по умолчанию 500ms)
 * @returns обёрнутая функция с защитой от двойного клика
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isPendingRef = useRef(false);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      // Если уже выполняется, игнорируем новый вызов
      if (isPendingRef.current) {
        return;
      }

      // Очищаем предыдущий таймер
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Устанавливаем флаг выполнения
      isPendingRef.current = true;

      // Выполняем функцию
      const result = callback(...args);

      // Если функция возвращает Promise, ждём его завершения
      if (result instanceof Promise) {
        result
          .finally(() => {
            // Сбрасываем флаг после завершения
            timeoutRef.current = setTimeout(() => {
              isPendingRef.current = false;
            }, delay);
          });
      } else {
        // Для синхронных функций просто устанавливаем таймер
        timeoutRef.current = setTimeout(() => {
          isPendingRef.current = false;
        }, delay);
      }
    },
    [callback, delay]
  );

  return debouncedCallback;
}

