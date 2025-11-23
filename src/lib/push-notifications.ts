/**
 * Управление push-уведомлениями через Service Worker
 * Поддерживает Web Push API для уведомлений даже когда приложение закрыто
 */

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

class PushNotificationManager {
  private registration: ServiceWorkerRegistration | null = null;
  private subscription: PushSubscription | null = null;
  private vapidPublicKey: string | null = null;

  constructor() {
    // VAPID public key из переменных окружения
    this.vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || null;
  }

  /**
   * Инициализация Service Worker для push-уведомлений
   */
  async initialize(): Promise<boolean> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push-уведомления не поддерживаются в этом браузере');
      return false;
    }

    try {
      // Регистрация Service Worker
      this.registration = await navigator.serviceWorker.ready;
      
      // Проверка существующей подписки
      this.subscription = await this.registration.pushManager.getSubscription();
      
      return true;
    } catch (error) {
      console.error('Ошибка инициализации push-уведомлений:', error);
      return false;
    }
  }

  /**
   * Запрос разрешения на push-уведомления
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      await this.subscribe();
    }

    return permission;
  }

  /**
   * Подписка на push-уведомления
   */
  async subscribe(): Promise<PushSubscriptionData | null> {
    if (!this.registration || !this.vapidPublicKey) {
      console.warn('Service Worker или VAPID key не настроены');
      return null;
    }

    try {
      // Преобразование VAPID key в ArrayBuffer
      const key = this.urlBase64ToUint8Array(this.vapidPublicKey);

      // Подписка на push-уведомления
      this.subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: key,
      });

      // Преобразование подписки в формат для отправки на сервер
      const subscriptionData: PushSubscriptionData = {
        endpoint: this.subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(
            this.subscription.getKey('p256dh')?.arrayBuffer() || new ArrayBuffer(0)
          ),
          auth: this.arrayBufferToBase64(
            this.subscription.getKey('auth')?.arrayBuffer() || new ArrayBuffer(0)
          ),
        },
      };

      // Сохранение подписки в localStorage
      localStorage.setItem('push_subscription', JSON.stringify(subscriptionData));

      return subscriptionData;
    } catch (error) {
      console.error('Ошибка подписки на push-уведомления:', error);
      return null;
    }
  }

  /**
   * Отписка от push-уведомлений
   */
  async unsubscribe(): Promise<boolean> {
    if (!this.subscription) {
      return false;
    }

    try {
      await this.subscription.unsubscribe();
      this.subscription = null;
      localStorage.removeItem('push_subscription');
      return true;
    } catch (error) {
      console.error('Ошибка отписки от push-уведомлений:', error);
      return false;
    }
  }

  /**
   * Проверка подписки
   */
  async isSubscribed(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    this.subscription = await this.registration.pushManager.getSubscription();
    return this.subscription !== null;
  }

  /**
   * Получение данных подписки
   */
  getSubscriptionData(): PushSubscriptionData | null {
    const stored = localStorage.getItem('push_subscription');
    if (!stored) {
      return null;
    }

    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }

  /**
   * Утилиты для преобразования ключей
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
}

// Singleton instance
export const pushNotificationManager = new PushNotificationManager();

