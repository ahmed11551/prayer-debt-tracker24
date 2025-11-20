# 🔐 Настройка переменных окружения

## Токен бота

Ваш токен бота: `8047116835:AAHc0kEQWYvd32abs4fnV7A-CCGmjD--0jE`

**⚠️ ВАЖНО:** Никогда не публикуйте токен в публичных репозиториях!

## Настройка для локальной разработки

Создайте файл `.env` в корне проекта:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://fvxkywczuqincnjilgzd.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2eGt5d2N6dXFpbmNuamlsZ3pkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNDgwNTYsImV4cCI6MjA3NzkyNDA1Nn0.jBvLDl0T2u-slvf4Uu4oZj7yRWMQCKmiln0mXRU0q54

# e-Replika API Configuration
VITE_API_BASE_URL=https://bot.e-replika.ru/api
VITE_E_REPLIKA_API_KEY=your_api_key_here
VITE_API_TOKEN=your_token_here

# Internal API (опционально, для fallback)
VITE_INTERNAL_API_URL=/api

# Telegram Bot Token (для бэкенда, если нужен)
TELEGRAM_BOT_TOKEN=8047116835:AAHc0kEQWYvd32abs4fnV7A-CCGmjD--0jE
```

## Настройка для Vercel

1. Зайдите в Vercel Dashboard
2. Выберите ваш проект
3. Settings → Environment Variables
4. Добавьте переменные:
   - `VITE_SUPABASE_URL` = `https://fvxkywczuqincnjilgzd.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (см. SUPABASE_SETUP.md)
   - `VITE_API_BASE_URL` = `https://bot.e-replika.ru/api`
   - `VITE_E_REPLIKA_API_KEY` = ваш ключ e-Replika API (если нужен)
   - `VITE_API_TOKEN` = ваш токен e-Replika API (если нужен)
   - `VITE_INTERNAL_API_URL` = `/api` (опционально)
   - `TELEGRAM_BOT_TOKEN` = `8047116835:AAHc0kEQWYvd32abs4fnV7A-CCGmjD--0jE` (для бэкенда, если нужен)

## Использование токена

Токен бота используется для:
- Взаимодействия с Telegram Bot API (если создаете бэкенд)
- Валидации запросов от Telegram
- Отправки уведомлений пользователям

В текущей версии приложения токен не используется напрямую в frontend, так как это Telegram Mini App, который работает через Telegram WebApp API.

