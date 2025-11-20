# 🔐 Настройка Secrets для GitHub Actions

Для автоматического деплоя через GitHub Actions нужно добавить секреты в репозиторий.

## Шаги настройки

### 1. Получите Vercel Org ID

1. Зайдите на [vercel.com](https://vercel.com)
2. Откройте [Settings → General](https://vercel.com/account/general)
3. Найдите **Team ID** или **Org ID**
4. Скопируйте ID

### 2. Добавьте Secrets в GitHub

1. Откройте репозиторий: https://github.com/ahmed11551/prayer-debt-tracker
2. Перейдите в **Settings → Secrets and variables → Actions**
3. Нажмите **New repository secret**
4. Добавьте два секрета:

   **Secret 1:**
   - Name: `VERCEL_TOKEN`
   - Value: `ifSZtWOrnBKyoJH6qa9YXJyz`

   **Secret 2:**
   - Name: `VERCEL_ORG_ID`
   - Value: `ваш_org_id_здесь` (получите из Vercel Settings)

### 3. Проверьте деплой

После добавления секретов:
1. Перейдите в **Actions** в GitHub
2. Должен появиться workflow "Deploy to Vercel"
3. Запустите его вручную или сделайте push в main

## Альтернатива: Ручной деплой

Если не хотите настраивать GitHub Actions, используйте:

### Через Vercel Dashboard
1. Откройте проект в Vercel
2. Нажмите **Redeploy**

### Через Vercel CLI
```powershell
$env:VERCEL_TOKEN="ifSZtWOrnBKyoJH6qa9YXJyz"
npx vercel@latest --token $env:VERCEL_TOKEN --prod
```

