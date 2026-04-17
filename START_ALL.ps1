# =====================================================
# ARS Complete Startup Script
# Starts all 3 services for real-time research
# =====================================================   uvicorn--v push at origin file for main 


Write-Host "🚀 Starting ARS System (All Services)" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Check if virtual env is activated
$venvCheck = Get-Command python -ErrorAction SilentlyContinue
if (-not $venvCheck) {
    Write-Host "⚠️  Activating Python virtual environment..." -ForegroundColor Yellow
    & "c:\Users\Dell\Desktop\ARS\ars-backend\.venv\Scripts\Activate.ps1"
}

# Start Backend (ars-backend) on port 5050
Write-Host "1️⃣  Starting Backend Service (port 5050)..." -ForegroundColor Green
Start-Process -FilePath powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\Dell\Desktop\ARS\ars-backend'; python -m uvicorn main:app --reload --host 0.0.0.0 --port 5050"
Start-Sleep -Seconds 2

# Start Agents Service (ars-agents) on port 8000
Write-Host "2️⃣  Starting Agents Service (port 8000)..." -ForegroundColor Green
Start-Process -FilePath powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\Dell\Desktop\ARS\ars-agents'; python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
Start-Sleep -Seconds 2

# Start Frontend dev server
Write-Host "3️⃣  Starting Frontend Service (port 5173/3000)..." -ForegroundColor Green
Start-Process -FilePath powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\Dell\Desktop\ARS\ars-frontend'; npm run dev"
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "✅ All Services Started!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""
Write-Host "📡 Service Ports:" -ForegroundColor Cyan
Write-Host "   • Backend (Chat/Docs):      http://localhost:5050" -ForegroundColor White
Write-Host "   • Agents (Research):        http://localhost:8000" -ForegroundColor White
Write-Host "   • Frontend:                 http://localhost:5173 or http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "🔍 Test the System:" -ForegroundColor Cyan
Write-Host "   1. Open http://localhost:5173 in browser" -ForegroundColor White
Write-Host "   2. Click 'Search Research' in navbar" -ForegroundColor White
Write-Host "   3. Type any topic (e.g., 'Quantum Computing')" -ForegroundColor White
Write-Host "   4. Click 'Research' - watch real agents work!" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Make sure OpenAI API key is set:" -ForegroundColor Yellow
Write-Host "   • Check .env file has OPENAI_API_KEY" -ForegroundColor White
Write-Host "   • Check account has active billing" -ForegroundColor White
Write-Host ""
Write-Host "🛑 To stop: Close each terminal window" -ForegroundColor Gray
Write-Host "=============================================" -ForegroundColor Gray
