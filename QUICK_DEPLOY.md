# ⚡ Быстрый деплой - ВЫПОЛНИТЕ СЕЙЧАС

## Ваши данные
- **Vercel Token**: `ifSZtWOrnBKyoJH6qa9YXJyz` ✅
- **Project ID**: `prj_genQ6ker04s6cosntyWcxqYXfxSM` ✅

## Способ 1: Через PowerShell скрипт (Самый простой)

Откройте PowerShell в папке проекта и выполните:

```powershell
powershell -ExecutionPolicy Bypass -File deploy-direct.ps1
```

Или:

```powershell
powershell -ExecutionPolicy Bypass -File deploy.ps1
```

## Способ 2: Через Vercel CLI (Вручную)

```powershell
# Установите токен
$env:VERCEL_TOKEN="ifSZtWOrnBKyoJH6qa9YXJyz"

# Подключите проект
npx vercel@latest link --token $env:VERCEL_TOKEN --project prj_genQ6ker04s6cosntyWcxqYXfxSM --yes

# Задеплойте
npx vercel@latest --token $env:VERCEL_TOKEN --prod --yes
```

## Способ 3: Через Vercel Dashboard (100% работает)

1. Откройте: https://vercel.com/dashboard
2. Найдите проект с ID: `prj_genQ6ker04s6cosntyWcxqYXfxSM`
3. Нажмите **"Redeploy"** в правом верхнем углу
4. Готово! ✅

## Что будет после деплоя

✅ Новый логотип из CDN  
✅ Название: "Трекер намазов"  
✅ Подзаголовок: "Prayer-Debt"  
✅ Все последние изменения

## Проверка

После деплоя откройте URL вашего проекта и проверьте:
- Логотип загружается
- Название обновлено
- Все работает

---

**Рекомендую использовать Способ 3 (Vercel Dashboard) - это самый надежный способ!**

