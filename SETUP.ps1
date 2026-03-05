#!/bin/bash
# =====================================================
# ARS System - Setup & Verification Script
# Runs on Windows PowerShell
# =====================================================

Write-Host ""
Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     ARS Real-Time Research System Setup         ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# 1. Check Python
Write-Host "1️⃣  Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "   ✅ $pythonVersion found" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Python not found in PATH" -ForegroundColor Red
    exit 1
}

# 2. Verify .env files
Write-Host ""
Write-Host "2️⃣  Checking .env configuration..." -ForegroundColor Yellow

$envFiles = @(
    "c:\Users\Dell\Desktop\ARS\ars-backend\.env",
    "c:\Users\Dell\Desktop\ARS\ars-agents\.env"
)

foreach ($envFile in $envFiles) {
    if (Test-Path $envFile) {
        $content = Get-Content $envFile
        if ($content -match "OPENAI_API_KEY") {
            Write-Host "   ✅ $envFile configured" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  $envFile missing OPENAI_API_KEY" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ⚠️  $envFile not found" -ForegroundColor Yellow
    }
}

# 3. Install dependencies
Write-Host ""
Write-Host "3️⃣  Installing Python dependencies..." -ForegroundColor Yellow

$packages = @(
    "fastapi",
    "uvicorn",
    "python-dotenv",
    "openai>=1.0.0",
    "pydantic",
    "langgraph",
    "langchain-core",
    "langchain-openai",
    "requests"
)

foreach ($package in $packages) {
    Write-Host "   Installing $package..." -ForegroundColor Gray
    pip install -q $package
}

Write-Host "   ✅ Dependencies installed" -ForegroundColor Green

# 4. Test imports
Write-Host ""
Write-Host "4️⃣  Verifying Python packages..." -ForegroundColor Yellow

$testScript = @"
try:
    import fastapi
    import uvicorn
    from fastapi import FastAPI
    from openai import OpenAI
    from langgraph.graph import StateGraph
    print("✅ All packages importable")
except ImportError as e:
    print(f"❌ Import error: {e}")
"@

python -c $testScript

# 5. Frontend check
Write-Host ""
Write-Host "5️⃣  Checking frontend setup..." -ForegroundColor Yellow

if (Test-Path "c:\Users\Dell\Desktop\ARS\ars-frontend\package.json") {
    Write-Host "   ✅ React project found" -ForegroundColor Green
    Write-Host "   📝 Install npm packages: npm install" -ForegroundColor Gray
} else {
    Write-Host "   ❌ Frontend not found" -ForegroundColor Red
}

# 6. Show next steps
Write-Host ""
Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║          ✅ Setup Complete!                    ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Ensure .env files have OPENAI_API_KEY" -ForegroundColor White
Write-Host "   2. Verify OpenAI account has billing enabled" -ForegroundColor White
Write-Host "   3. Run: .\START_ALL.ps1" -ForegroundColor White
Write-Host "   4. Open: http://localhost:5173" -ForegroundColor White
Write-Host ""

Write-Host "🚀 Services will start:" -ForegroundColor Cyan
Write-Host "   • Backend (ars-backend)    → http://localhost:5050" -ForegroundColor Magenta
Write-Host "   • Agents (ars-agents)      → http://localhost:8000" -ForegroundColor Magenta
Write-Host "   • Frontend (ars-frontend)  → http://localhost:5173" -ForegroundColor Magenta
Write-Host ""

Write-Host "🔍 Test the system:" -ForegroundColor Cyan
Write-Host "   • Click 'Search Research' in navbar" -ForegroundColor White
Write-Host "   • Type any topic" -ForegroundColor White
Write-Host "   • Click 'Research'" -ForegroundColor White
Write-Host "   • Watch real agents work in real-time! 🎉" -ForegroundColor White
Write-Host ""
