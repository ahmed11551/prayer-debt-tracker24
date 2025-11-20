# 🚀 Быстрый старт - Деплой

## ⚡ Быстрая инструкция (5 минут)

### 1. Добавьте переменные в Vercel (ОБЯЗАТЕЛЬНО!)

Зайдите в [Vercel Dashboard](https://vercel.com/dashboard) → Ваш проект → Settings → Environment Variables

Добавьте:
```
VITE_SUPABASE_URL = https://fvxkywczuqincnjilgzd.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2eGt5d2N6dXFpbmNuamlsZ3pkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNDgwNTYsImV4cCI6MjA3NzkyNDA1Nn0.jBvLDl0T2u-slvf4Uu4oZj7yRWMQCKmiln0mXRU0q54
```

### 2. Запустите деплой

```powershell
powershell -ExecutionPolicy Bypass -File deploy.ps1
```

### 3. Готово! 🎉

Откройте URL из Vercel и проверьте работу приложения.

---

## 📚 Подробная документация

- **DEPLOY_FINAL.md** - Полная инструкция по деплою
- **SUPABASE_SETUP.md** - Настройка Supabase
- **E_REPLIKA_API_TEST.md** - Тестирование e-Replika API
- **SETUP_COMPLETE.md** - Итоговый статус настройки

---

## ✅ Что готово

- ✅ Supabase бэкенд (Edge Function задеплоена)
- ✅ API клиент обновлен
- ✅ Все функции реализованы
- ✅ Fallback механизмы работают

---

**Время на деплой:** ~5-10 минут

