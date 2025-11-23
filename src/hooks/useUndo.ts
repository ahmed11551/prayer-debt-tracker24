import { useState, useCallback, useRef } from 'react';

/**
 * Хук для реализации функциональности Undo
 * Сохраняет историю действий для возможности отмены
 */
export function useUndo<T>(initialValue: T) {
  const [current, setCurrent] = useState<T>(initialValue);
  const [history, setHistory] = useState<T[]>([initialValue]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const maxHistorySize = useRef(50); // Максимальный размер истории

  const setValue = useCallback((newValue: T) => {
    setCurrent(newValue);
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newValue);
      
      // Ограничиваем размер истории
      if (newHistory.length > maxHistorySize.current) {
        newHistory.shift();
        return newHistory;
      }
      
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, maxHistorySize.current - 1));
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCurrent(history[newIndex]);
      return true;
    }
    return false;
  }, [historyIndex, history]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCurrent(history[newIndex]);
      return true;
    }
    return false;
  }, [historyIndex, history]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return {
    value: current,
    setValue,
    undo,
    redo,
    canUndo,
    canRedo,
    clearHistory: () => {
      setHistory([current]);
      setHistoryIndex(0);
    },
  };
}

