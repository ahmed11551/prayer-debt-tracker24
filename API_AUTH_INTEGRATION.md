# Интеграция с e-Replika API

## Авторизация

Все запросы к API `bot.e-replika.ru` используют авторизацию через Bearer токен в заголовке `Authorization`.

### Токен авторизации

По умолчанию используется тестовый токен: `test_token_123`

### Настройка токена

Токен можно настроить через переменную окружения:

```env
VITE_API_TOKEN=test_token_123
```

Если переменная не указана, используется `test_token_123` по умолчанию.

### Дополнительный API ключ (опционально)

Можно также указать дополнительный API ключ через переменную окружения:

```env
VITE_E_REPLIKA_API_KEY=your_api_key_here
```

Этот ключ будет добавлен в заголовок `X-API-Key`.

## Реализация

Авторизация реализована в `src/lib/api.ts`:

```typescript
function getAuthToken(): string {
  return import.meta.env.VITE_API_TOKEN || "test_token_123";
}

function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  
  const token = getAuthToken();
  headers["Authorization"] = `Bearer ${token}`;
  
  const apiKey = import.meta.env.VITE_E_REPLIKA_API_KEY;
  if (apiKey) {
    headers["X-API-Key"] = apiKey;
  }
  
  return headers;
}
```

## Использование

Все методы `eReplikaAPI` автоматически используют правильные заголовки авторизации:

- `getTerms()` - получение терминов
- `convertToHijri()` - конвертация в хиджру
- `convertFromHijri()` - конвертация из хиджры
- `getDuaAudio()` - получение аудио для дуа
- `getDuas()` - список дуа
- `getAdhkar()` - список азкаров
- `getSalawat()` - список салаватов
- `getKalimas()` - список калим
- `getSurahs()` - список сур Корана
- `getAyahs()` - получение аятов
- `getAyah()` - получение конкретного аята
- `getAsmaulHusna()` - 99 имен Аллаха
- `generatePDFReport()` - генерация PDF отчета

## Документация API

Полная документация доступна по адресу: https://bot.e-replika.ru/docs#/

## Проверка авторизации

Все запросы к API автоматически включают заголовок:
```
Authorization: Bearer test_token_123
```

Если API возвращает ошибку 401 (Unauthorized) или 403 (Forbidden), проверьте:
1. Правильность токена в переменной окружения
2. Доступность API по адресу `https://bot.e-replika.ru/api`
3. Соответствие токена требованиям API

