/**
 * Управление уведомлениями для PWA
 * Поддерживает браузерные уведомления и push-уведомления
 */

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: NotificationAction[];
  data?: any;
}

class NotificationManager {
  private permission: NotificationPermission = "default";
  private isSupported: boolean = false;

  constructor() {
    if (typeof window !== "undefined" && "Notification" in window) {
      this.isSupported = true;
      this.permission = Notification.permission;
    }
  }

  /**
   * Проверка поддержки уведомлений
   */
  isNotificationSupported(): boolean {
    return this.isSupported;
  }

  /**
   * Запрос разрешения на уведомления
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      throw new Error("Notifications are not supported in this browser");
    }

    if (this.permission === "granted") {
      return "granted";
    }

    if (this.permission === "denied") {
      return "denied";
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission;
    } catch (error) {
      console.error("Failed to request notification permission:", error);
      return "denied";
    }
  }

  /**
   * Проверка разрешения
   */
  hasPermission(): boolean {
    return this.permission === "granted";
  }

  /**
   * Показать уведомление
   */
  async showNotification(options: NotificationOptions): Promise<Notification | null> {
    if (!this.isSupported) {
      console.warn("Notifications are not supported");
      return null;
    }

    if (this.permission !== "granted") {
      const permission = await this.requestPermission();
      if (permission !== "granted") {
        console.warn("Notification permission denied");
        return null;
      }
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || "/logo.svg",
        badge: options.badge || "/logo.svg",
        tag: options.tag,
        requireInteraction: options.requireInteraction || false,
        actions: options.actions,
        data: options.data,
      });

      // Автоматическое закрытие через 5 секунд
      setTimeout(() => {
        notification.close();
      }, 5000);

      return notification;
    } catch (error) {
      console.error("Failed to show notification:", error);
      return null;
    }
  }

  /**
   * Уведомление о времени намаза
   */
  async notifyPrayerTime(prayerName: string, time: string) {
    return this.showNotification({
      title: `Время намаза: ${prayerName}`,
      body: `Наступило время для ${prayerName} (${time})`,
      tag: `prayer-${prayerName}`,
      requireInteraction: false,
      data: {
        type: "prayer_time",
        prayer: prayerName,
        time,
      },
    });
  }

  /**
   * Уведомление о напоминании
   */
  async notifyReminder(message: string) {
    return this.showNotification({
      title: "Напоминание",
      body: message,
      tag: "reminder",
      requireInteraction: false,
      data: {
        type: "reminder",
      },
    });
  }

  /**
   * Уведомление о достижении цели
   */
  async notifyGoalAchievement(goalName: string) {
    return this.showNotification({
      title: "🎉 Цель достигнута!",
      body: `Поздравляем! Вы достигли цели: ${goalName}`,
      tag: "goal-achievement",
      requireInteraction: true,
      data: {
        type: "goal_achievement",
        goal: goalName,
      },
    });
  }

  /**
   * Уведомление о прогрессе
   */
  async notifyProgress(message: string, progress: number) {
    return this.showNotification({
      title: "Прогресс",
      body: `${message} (${progress}%)`,
      tag: "progress",
      requireInteraction: false,
      data: {
        type: "progress",
        progress,
      },
    });
  }
}

// Экспорт singleton экземпляра
export const notificationManager = new NotificationManager();

