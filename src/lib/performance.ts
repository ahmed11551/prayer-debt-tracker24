/**
 * Утилиты для мониторинга производительности
 * Отслеживание Core Web Vitals и кастомных метрик
 */

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];

  /**
   * Инициализация мониторинга производительности
   */
  init() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      console.warn('Performance monitoring not supported');
      return;
    }

    // Отслеживание Core Web Vitals
    this.observeWebVitals();
    
    // Отслеживание кастомных метрик
    this.observeCustomMetrics();
    
    // Отслеживание времени загрузки ресурсов
    this.observeResourceTiming();
  }

  /**
   * Отслеживание Core Web Vitals (LCP, FID, CLS, INP)
   */
  private observeWebVitals() {
    // Largest Contentful Paint (LCP)
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        this.recordMetric('LCP', lastEntry.renderTime || lastEntry.loadTime, 'ms');
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);
    } catch (e) {
      console.warn('LCP observer not supported');
    }

    // First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.recordMetric('FID', entry.processingStart - entry.startTime, 'ms');
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);
    } catch (e) {
      console.warn('FID observer not supported');
    }

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    try {
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            this.recordMetric('CLS', clsValue, 'score');
          }
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);
    } catch (e) {
      console.warn('CLS observer not supported');
    }

    // Interaction to Next Paint (INP)
    try {
      const inpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (entry.duration) {
            this.recordMetric('INP', entry.duration, 'ms');
          }
        });
      });
      inpObserver.observe({ entryTypes: ['event'] });
      this.observers.push(inpObserver);
    } catch (e) {
      console.warn('INP observer not supported');
    }
  }

  /**
   * Отслеживание кастомных метрик
   */
  private observeCustomMetrics() {
    // Время до интерактивности
    window.addEventListener('load', () => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (perfData) {
        const tti = perfData.domInteractive - perfData.fetchStart;
        this.recordMetric('TTI', tti, 'ms');
      }
    });

    // Время первого рендера
    if ('PerformancePaintTiming' in window) {
      try {
        const paintObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.name === 'first-paint') {
              this.recordMetric('FP', entry.startTime, 'ms');
            } else if (entry.name === 'first-contentful-paint') {
              this.recordMetric('FCP', entry.startTime, 'ms');
            }
          });
        });
        paintObserver.observe({ entryTypes: ['paint'] });
        this.observers.push(paintObserver);
      } catch (e) {
        console.warn('Paint observer not supported');
      }
    }
  }

  /**
   * Отслеживание времени загрузки ресурсов
   */
  private observeResourceTiming() {
    try {
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.duration > 1000) { // Логируем только медленные ресурсы
            console.warn(`Slow resource: ${entry.name} took ${entry.duration.toFixed(2)}ms`);
          }
        });
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.push(resourceObserver);
    } catch (e) {
      console.warn('Resource observer not supported');
    }
  }

  /**
   * Запись метрики
   */
  private recordMetric(name: string, value: number, unit: string) {
    const metric: PerformanceMetric = {
      name,
      value: Math.round(value * 100) / 100,
      unit,
      timestamp: Date.now(),
    };

    this.metrics.push(metric);

    // Отправка в аналитику (если настроена)
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', 'web_vital', {
        event_category: 'Web Vitals',
        event_label: name,
        value: Math.round(value),
        non_interaction: true,
      });
    }

    // Логирование для отладки
    if (import.meta.env.DEV) {
      console.log(`[Performance] ${name}: ${value}${unit}`);
    }
  }

  /**
   * Получение всех метрик
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Получение метрики по имени
   */
  getMetric(name: string): PerformanceMetric | undefined {
    return this.metrics.find(m => m.name === name);
  }

  /**
   * Очистка наблюдателей
   */
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Хук для измерения производительности компонента
 */
export function usePerformanceMeasure(componentName: string) {
  if (typeof window === 'undefined') {
    return { startMeasure: () => {}, endMeasure: () => {} };
  }

  const startMeasure = () => {
    performance.mark(`${componentName}-start`);
  };

  const endMeasure = () => {
    performance.mark(`${componentName}-end`);
    try {
      performance.measure(
        `${componentName}-duration`,
        `${componentName}-start`,
        `${componentName}-end`
      );
      const measure = performance.getEntriesByName(`${componentName}-duration`)[0];
      if (measure) {
        console.log(`[Performance] ${componentName} rendered in ${measure.duration.toFixed(2)}ms`);
      }
    } catch (e) {
      // Ignore if marks don't exist
    }
  };

  return { startMeasure, endMeasure };
}

