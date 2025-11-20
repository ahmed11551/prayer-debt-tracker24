# 🚀 Деплой через Vercel API

## API ключ проекта

Ваш Project ID: `prj_genQ6ker04s6cosntyWcxqYXfxSM`

## Способ 1: Через Vercel CLI

### Установка Vercel CLI

```bash
npm install -g vercel
```

### Подключение проекта

```bash
# Установите токен (нужен Vercel Token, не Project ID)
export VERCEL_TOKEN=your_vercel_token_here

# Или в Windows PowerShell:
$env:VERCEL_TOKEN="your_vercel_token_here"

# Подключите проект
vercel link --project prj_genQ6ker04s6cosntyWcxqYXfxSM

# Деплой
vercel --prod
```

## Способ 2: Через Vercel Dashboard

1. Зайдите на [vercel.com](https://vercel.com)
2. Откройте проект с ID: `prj_genQ6ker04s6cosntyWcxqYXfxSM`
3. Перейдите в **Deployments**
4. Нажмите **Redeploy**

## Способ 3: Через Vercel API (REST)

### Получить Vercel Token

1. Зайдите в [Vercel Settings → Tokens](https://vercel.com/account/tokens)
2. Создайте новый токен
3. Скопируйте токен

### Деплой через API

```bash
# Получить информацию о проекте
curl -X GET "https://api.vercel.com/v9/projects/prj_genQ6ker04s6cosntyWcxqYXfxSM" \
  -H "Authorization: Bearer YOUR_VERCEL_TOKEN"

# Создать деплой
curl -X POST "https://api.vercel.com/v13/deployments" \
  -H "Authorization: Bearer YOUR_VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "prayer-debt-tracker",
    "project": "prj_genQ6ker04s6cosntyWcxqYXfxSM",
    "gitSource": {
      "type": "github",
      "repo": "ahmed11551/prayer-debt-tracker",
      "ref": "main"
    }
  }'
```

## Важно

⚠️ `prj_genQ6ker04s6cosntyWcxqYXfxSM` - это **Project ID**, а не API Token.

Для использования Vercel CLI нужен **Vercel Token** из настроек аккаунта.

## Получение Vercel Token

1. Зайдите на [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Нажмите **Create Token**
3. Дайте имя токену (например: "Prayer Debt Tracker")
4. Скопируйте токен (он показывается только один раз!)

## Быстрый деплой

После получения токена:

```bash
# Windows PowerShell
$env:VERCEL_TOKEN="your_vercel_token_here"
vercel link --project prj_genQ6ker04s6cosntyWcxqYXfxSM
vercel --prod
```

