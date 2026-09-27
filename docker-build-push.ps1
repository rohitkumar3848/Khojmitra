# KhojMitra Docker Build & Push Script for rohitkumar3848
$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   KhojMitra Docker Hub Build & Push      " -ForegroundColor Yellow
Write-Host "   Account: rohitkumar3848                " -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan

$backendImage = "rohitkumar3848/khojmitra-backend:latest"
$frontendImage = "rohitkumar3848/khojmitra-frontend:latest"

Write-Host "`n[1/3] Building Backend Image: $backendImage..." -ForegroundColor Yellow
docker build -t $backendImage ./backend

Write-Host "`n[2/3] Building Frontend Image: $frontendImage..." -ForegroundColor Yellow
docker build -t $frontendImage ./frontend

Write-Host "`n[3/3] Images built successfully!" -ForegroundColor Green
docker images | Select-String "rohitkumar3848"

Write-Host "`nTo push images to Docker Hub:" -ForegroundColor Cyan
Write-Host "1. Ensure you are logged in: docker login" -ForegroundColor White
Write-Host "2. Run push command:" -ForegroundColor White
Write-Host "   docker push $backendImage" -ForegroundColor Yellow
Write-Host "   docker push $frontendImage" -ForegroundColor Yellow
