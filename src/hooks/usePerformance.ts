import { useEffect, useRef } from 'react';
import { usePerformanceMeasure } from '@/lib/performance';

/**
 * Хук для отслеживания производительности компонента
 */
export const usePerformance = (componentName: string) => {
  const { startMeasure, endMeasure } = usePerformanceMeasure(componentName);
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current += 1;
    startMeasure();
    
    return () => {
      endMeasure();
    };
  });

  return {
    renderCount: renderCount.current,
  };
};

