// Service Worker для офлайн-работы и кэширования
const CACHE_NAME = 'prayer-tracker-v4';
const RUNTIME_CACHE = 'prayer-tracker-runtime-v4';
const OFFLINE_PAGE = '/offline.html';
const CACHE_VERSION = 'v4';

// Файлы для кэширования при установке (критически важные ресурсы)
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.svg',
  '/offline.html',
];

// Стратегия кэширования: Network First с fallback на Cache
const CACHE_STRATEGIES = {
  // Статические ресурсы - Cache First
  static: ['/logo.svg', '/manifest.json'],
  // API запросы - Network Only
  api: ['/api/', 'bot.e-replika.ru', 'supabase.co'],
  // Страницы - Network First
  pages: ['/', '/dhikr', '/goals', '/reports'],
};

// Установка Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Pre-caching files');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
          })
          .map((cacheName) => {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
    .then(() => self.clients.claim())
  );
});

// Стратегия кэширования: Network First, затем Cache
self.addEventListener('fetch', (event) => {
  // Пропускаем не-GET запросы
  if (event.request.method !== 'GET') {
    return;
  }

  // Пропускаем запросы к API (они должны идти напрямую)
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('bot.e-replika.ru') ||
      event.request.url.includes('supabase.co')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Клонируем ответ для кэширования
        const responseToCache = response.clone();
        
        // Кэшируем успешные ответы
        if (response.status === 200) {
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        
        return response;
      })
      .catch(async () => {
        // Если сеть недоступна, пытаемся получить из кэша
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Если это навигационный запрос, возвращаем офлайн-страницу или index.html
        if (event.request.mode === 'navigate') {
          const offlinePage = await caches.match(OFFLINE_PAGE);
          if (offlinePage) {
            return offlinePage;
          }
          return caches.match('/index.html');
        }
        
        // Иначе возвращаем пустой ответ
        return new Response('Offline', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({
            'Content-Type': 'text/plain',
          }),
        });
      })
  );
});

// Обработка сообщений от клиента
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(RUNTIME_CACHE).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }
});

// Обработка push-уведомлений
self.addEventListener('push', (event) => {
  let notificationData = {
    title: 'Трекер намазов',
    body: 'Не забудьте выполнить намаз!',
    icon: '/logo.svg',
    badge: '/logo.svg',
    tag: 'prayer-reminder',
    requireInteraction: false,
    data: {},
  };

  // Если данные пришли с сервера, используем их
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };
    } catch (e) {
      notificationData.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      data: notificationData.data,
      actions: [
        {
          action: 'open',
          title: 'Открыть приложение',
        },
        {
          action: 'dismiss',
          title: 'Закрыть',
        },
      ],
    })
  );
});

// Обработка кликов по уведомлениям
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // Открытие приложения
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Если приложение уже открыто, фокусируемся на нем
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      // Иначе открываем новое окно
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

