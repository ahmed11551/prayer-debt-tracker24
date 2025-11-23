// Service Worker для офлайн-работы и кэширования
const CACHE_NAME = 'prayer-tracker-v2';
const RUNTIME_CACHE = 'prayer-tracker-runtime-v2';

// Файлы для кэширования при установке
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.svg',
  '/dhikr',
  '/goals',
  '/reports',
];

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
      .catch(() => {
        // Если сеть недоступна, пытаемся получить из кэша
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Если это навигационный запрос, возвращаем index.html
          if (event.request.mode === 'navigate') {
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

