# Деплой для tracker24 проекта

$VERCEL_TOKEN = "ifSZtWOrnBKyoJH6qa9YXJyz"
$GITHUB_REPO = "ahmed11551/prayer-debt-tracker24"

Write-Host "🚀 Запуск деплоя для tracker24..." -ForegroundColor Green

# Получаем последний коммит
$gitCommit = git rev-parse HEAD
Write-Host "📦 Коммит: $gitCommit" -ForegroundColor Cyan

# Создание деплоя через API
$headers = @{
    "Authorization" = "Bearer $VERCEL_TOKEN"
    "Content-Type" = "application/json"
}

$body = @{
    name = "prayer-debt-tracker24"
    gitSource = @{
        type = "github"
        repo = $GITHUB_REPO
        ref = "main"
        sha = $gitCommit
    }
    target = "production"
    forceNew = $true
} | ConvertTo-Json -Depth 10

try {
    Write-Host "`n📡 Отправка запроса на деплой..." -ForegroundColor Yellow
    
    $response = Invoke-RestMethod -Uri "https://api.vercel.com/v13/deployments" -Method Post -Headers $headers -Body $body
    
    Write-Host "`n✅ Деплой запущен!" -ForegroundColor Green
    Write-Host "URL: $($response.url)" -ForegroundColor Cyan
    Write-Host "ID: $($response.id)" -ForegroundColor Cyan
    Write-Host "Статус: $($response.readyState)" -ForegroundColor Cyan
    
    Write-Host "`n🌐 Откройте в браузере: https://vercel.com/dashboard" -ForegroundColor Yellow
    
} catch {
    Write-Host "`n❌ Ошибка: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Ответ сервера: $responseBody" -ForegroundColor Red
    }
    Write-Host "`n💡 Попробуйте запустить деплой через Vercel Dashboard" -ForegroundColor Yellow
    Write-Host "   https://vercel.com/dashboard" -ForegroundColor Cyan
}

