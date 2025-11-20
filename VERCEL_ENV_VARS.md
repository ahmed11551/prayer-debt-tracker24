# 🔐 Переменные окружения для Vercel

## ✅ Правильная настройка

### Шаг 1: Удалите неправильную переменную

Удалите переменную, где в Key указан JWT токен.

### Шаг 2: Добавьте правильные переменные

Нажмите **"Add Another"** и добавьте:

#### Переменная 1:
```
Key: VITE_SUPABASE_URL
Value: https://fvxkywczuqincnjilgzd.supabase.co
Environments: ☑ Production ☑ Preview ☑ Development
```

#### Переменная 2:
```
Key: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2eGt5d2N6dXFpbmNuamlsZ3pkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNDgwNTYsImV4cCI6MjA3NzkyNDA1Nn0.jBvLDl0T2u-slvf4Uu4oZj7yRWMQCKmiln0mXRU0q54
Environments: ☑ Production ☑ Preview ☑ Development
```

### Шаг 3: Опционально (для e-Replika API)

Если у вас есть ключи e-Replika API:

```
Key: VITE_API_BASE_URL
Value: https://bot.e-replika.ru/api
Environments: ☑ Production ☑ Preview ☑ Development
```

```
Key: VITE_E_REPLIKA_API_KEY
Value: ваш_ключ_здесь
Environments: ☑ Production ☑ Preview ☑ Development
```

```
Key: VITE_API_TOKEN
Value: ваш_токен_здесь
Environments: ☑ Production ☑ Preview ☑ Development
```

### Шаг 4: Сохраните

Нажмите кнопку **"Save"** в правом верхнем углу.

---

## ⚠️ Важно

- **Key** - это имя переменной (начинается с `VITE_`)
- **Value** - это значение переменной (URL или токен)
- Выберите все окружения (Production, Preview, Development)

---

## ✅ После сохранения

После сохранения переменных:
1. Запустите новый деплой (Redeploy)
2. Или сделайте новый коммит в GitHub
3. Проверьте работу приложения

