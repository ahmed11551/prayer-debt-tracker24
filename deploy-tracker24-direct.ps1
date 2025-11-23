# Direct deployment to tracker24 project

$VERCEL_TOKEN = "ifSZtWOrnBKyoJH6qa9YXJyz"
$PROJECT_ID = "prj_sKKVO8oOdR06b9O7CR8xxvS35QPv"
$GITHUB_REPO = "ahmed11551/prayer-debt-tracker24"

Write-Host "=== Connecting to Vercel Project ===" -ForegroundColor Green
Write-Host "Project ID: $PROJECT_ID" -ForegroundColor Cyan
Write-Host "GitHub Repo: $GITHUB_REPO" -ForegroundColor Cyan

# Get current commit
$gitCommit = git rev-parse HEAD
Write-Host "Commit: $gitCommit" -ForegroundColor Cyan
Write-Host ""

# Prepare headers
$headers = @{
    "Authorization" = "Bearer $VERCEL_TOKEN"
    "Content-Type" = "application/json"
}

# Prepare deployment body
$body = @{
    name = "prayer-debt-tracker24"
    project = $PROJECT_ID
    gitSource = @{
        type = "github"
        repo = $GITHUB_REPO
        ref = "main"
        sha = $gitCommit
    }
    target = "production"
    forceNew = $true
} | ConvertTo-Json -Depth 10

Write-Host "Starting deployment..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "https://api.vercel.com/v13/deployments" -Method Post -Headers $headers -Body $body
    
    Write-Host ""
    Write-Host "SUCCESS: Deployment started!" -ForegroundColor Green
    Write-Host "URL: https://$($response.url)" -ForegroundColor Cyan
    Write-Host "Deployment ID: $($response.id)" -ForegroundColor Cyan
    Write-Host "Status: $($response.readyState)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Dashboard: https://vercel.com/dashboard" -ForegroundColor Yellow
    
} catch {
    Write-Host ""
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Details: $responseBody" -ForegroundColor Red
    }
}

