# 🗄️ Настройка Supabase для Prayer Debt Tracker

## ✅ Что уже готово

1. **Таблицы созданы:**
   - `prayer_debts` - основная таблица с данными пользователей
   - `progress_history` - история прогресса
   - `calculation_jobs` - асинхронные расчеты
   - `audit_log` - логи действий

2. **Edge Function задеплоена:**
   - `prayer-debt-api` - обрабатывает все API эндпоинты
   - URL: `https://fvxkywczuqincnjilgzd.supabase.co/functions/v1/prayer-debt-api`

3. **RLS политики настроены:**
   - Политики для `prayer_debts` уже существуют
   - Требуют authenticated пользователя

## 🔧 Настройка переменных окружения

### Локально (.env файл)

Создайте файл `.env` в корне проекта:

```env
# Supabase
VITE_SUPABASE_URL=https://fvxkywczuqincnjilgzd.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2eGt5d2N6dXFpbmNuamlsZ3pkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNDgwNTYsImV4cCI6MjA3NzkyNDA1Nn0.jBvLDl0T2u-slvf4Uu4oZj7yRWMQCKmiln0mXRU0q54

# e-Replika API
VITE_API_BASE_URL=https://bot.e-replika.ru/api
VITE_E_REPLIKA_API_KEY=your_api_key_here
VITE_API_TOKEN=your_token_here

# Internal API (опционально, для fallback)
VITE_INTERNAL_API_URL=/api
```

### Vercel (Environment Variables)

1. Зайдите в Vercel Dashboard
2. Выберите проект
3. Settings → Environment Variables
4. Добавьте переменные:
   - `VITE_SUPABASE_URL` = `https://fvxkywczuqincnjilgzd.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - `VITE_API_BASE_URL` = `https://bot.e-replika.ru/api`
   - `VITE_E_REPLIKA_API_KEY` = ваш ключ (если нужен)
   - `VITE_API_TOKEN` = ваш токен (если нужен)

## 📡 API Эндпоинты

Все эндпоинты доступны через Supabase Edge Function:

```
POST   /functions/v1/prayer-debt-api/calculate
GET    /functions/v1/prayer-debt-api/snapshot
PATCH  /functions/v1/prayer-debt-api/progress
GET    /functions/v1/prayer-debt-api/report.pdf
POST   /functions/v1/prayer-debt-api/calculations
GET    /functions/v1/prayer-debt-api/calculations/:jobId
```

## 🔐 Авторизация

Edge Function использует:
- `Authorization: Bearer {SUPABASE_ANON_KEY}` заголовок
- `apikey: {SUPABASE_ANON_KEY}` заголовок
- `user_id` из тела запроса или Telegram WebApp

## 🧪 Тестирование

### Проверка Edge Function

```bash
curl -X POST https://fvxkywczuqincnjilgzd.supabase.co/functions/v1/prayer-debt-api/calculate \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user",
    "personal_data": {...},
    "travel_data": {...}
  }'
```

### Проверка в браузере

Откройте консоль браузера (F12) и проверьте запросы к Supabase.

## 📝 Примечания

- Edge Function автоматически обрабатывает CORS
- Если Supabase недоступен, приложение использует localStorage (fallback)
- RLS политики требуют authenticated пользователя, но Edge Function использует service_role

## 🚀 Следующие шаги

1. ✅ Edge Function задеплоена
2. ✅ API клиент обновлен
3. ⚠️ Настроить переменные окружения
4. ⚠️ Проверить e-Replika API
5. ⚠️ Деплой на Vercel

