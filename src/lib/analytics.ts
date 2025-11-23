/**
 * Базовая аналитика и мониторинг для приложения
 * Поддерживает Google Analytics 4 и отправку событий
 */

interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

interface AnalyticsUser {
  id?: string;
  properties?: Record<string, any>;
}

class Analytics {
  private isEnabled: boolean = false;
  private gtag: ((...args: any[]) => void) | null = null;

  constructor() {
    // Проверяем наличие Google Analytics
    if (typeof window !== "undefined") {
      this.gtag = (window as any).gtag || null;
      this.isEnabled = !!this.gtag;
    }
  }

  /**
   * Инициализация аналитики
   */
  init(measurementId?: string) {
    if (typeof window === "undefined" || !measurementId) {
      console.warn("Analytics: measurementId not provided or running on server");
      return;
    }

    // Если gtag уже загружен, считаем аналитику включенной
    if ((window as any).gtag) {
      this.gtag = (window as any).gtag;
      this.isEnabled = true;
      return;
    }

    // Загрузка Google Analytics скрипта
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    // Инициализация gtag
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).gtag = function(...args: any[]) {
      (window as any).dataLayer.push(args);
    };
    (window as any).gtag("js", new Date());
    (window as any).gtag("config", measurementId, {
      page_path: window.location.pathname,
    });

    this.gtag = (window as any).gtag;
    this.isEnabled = true;
  }

  /**
   * Отправка события
   */
  trackEvent(event: AnalyticsEvent) {
    if (!this.isEnabled || !this.gtag) {
      if (process.env.NODE_ENV === "development") {
        console.log("[Analytics] Event:", event);
      }
      return;
    }

    try {
      this.gtag("event", event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
      });
    } catch (error) {
      console.error("Analytics: Failed to track event", error);
    }
  }

  /**
   * Отправка события страницы
   */
  trackPageView(path: string, title?: string) {
    if (!this.isEnabled || !this.gtag) {
      if (process.env.NODE_ENV === "development") {
        console.log("[Analytics] Page view:", path);
      }
      return;
    }

    try {
      this.gtag("config", (window as any).GA_MEASUREMENT_ID || "", {
        page_path: path,
        page_title: title || document.title,
      });
    } catch (error) {
      console.error("Analytics: Failed to track page view", error);
    }
  }

  /**
   * Установка пользователя
   */
  setUser(user: AnalyticsUser) {
    if (!this.isEnabled || !this.gtag) {
      return;
    }

    try {
      this.gtag("set", "user_properties", {
        user_id: user.id,
        ...user.properties,
      });
    } catch (error) {
      console.error("Analytics: Failed to set user", error);
    }
  }

  /**
   * Отправка исключения
   */
  trackException(description: string, fatal: boolean = false) {
    if (!this.isEnabled || !this.gtag) {
      if (process.env.NODE_ENV === "development") {
        console.error("[Analytics] Exception:", description);
      }
      return;
    }

    try {
      this.gtag("event", "exception", {
        description,
        fatal,
      });
    } catch (error) {
      console.error("Analytics: Failed to track exception", error);
    }
  }

  /**
   * Отправка времени выполнения
   */
  trackTiming(name: string, value: number, category?: string) {
    if (!this.isEnabled || !this.gtag) {
      return;
    }

    try {
      this.gtag("event", "timing_complete", {
        name,
        value,
        event_category: category || "performance",
      });
    } catch (error) {
      console.error("Analytics: Failed to track timing", error);
    }
  }
}

// Экспорт singleton экземпляра
export const analytics = new Analytics();

// Инициализация при загрузке (если указан ID в env)
if (typeof window !== "undefined") {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (measurementId) {
    analytics.init(measurementId);
  }
}

