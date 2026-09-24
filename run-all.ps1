# KhojMitra (खोज-मित्र) - Quick Start Script
$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " 🚀 Starting KhojMitra Production Stack" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Update PATH
$env:Path = "C:\Program Files\nodejs;C:\tools\apache-maven-3.9.6\bin;" + $env:Path

# 2. Check MongoDB
$mongo = Get-Service -Name "*mongo*" -ErrorAction SilentlyContinue
if ($mongo -and $mongo.Status -eq 'Running') {
    Write-Host "✅ MongoDB service is running." -ForegroundColor Green
} else {
    Write-Host "⚠️ MongoDB service not running. Starting service..." -ForegroundColor Yellow
    Start-Service MongoDB -ErrorAction SilentlyContinue
}

# 3. Launch Backend in new window
Write-Host "Starting Spring Boot Backend on http://localhost:8080..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; & '.\mvnw.cmd' spring-boot:run"

# 4. Launch Frontend in new window
Write-Host "Starting React Frontend on http://localhost:5173..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; & 'C:\Program Files\nodejs\npm.cmd' run dev"

Write-Host "Stack started! Open http://localhost:5173 in your browser." -ForegroundColor Green
