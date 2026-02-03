Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Classroom Management System" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Checking Python..." -ForegroundColor Yellow
$pythonVersion = python --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Python is not installed or not in PATH" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host $pythonVersion -ForegroundColor Green
Write-Host ""

Write-Host "Activating virtual environment..." -ForegroundColor Yellow
if (Test-Path "venv\Scripts\Activate.ps1") {
    & "venv\Scripts\Activate.ps1"
    Write-Host "Virtual environment activated" -ForegroundColor Green
} else {
    Write-Host "WARNING: Virtual environment not found, using system Python" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "Installing/Checking dependencies..." -ForegroundColor Yellow
pip install -q -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "Dependencies OK" -ForegroundColor Green
Write-Host ""

Write-Host "Checking MongoDB connection..." -ForegroundColor Yellow
python -c "from pymongo import MongoClient; import os; client = MongoClient(os.getenv('MONGO_URI', 'mongodb://localhost:27017/'), serverSelectionTimeoutMS=3000); client.server_info(); print('MongoDB: Connected')" 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "WARNING: MongoDB connection failed. Make sure MongoDB is running." -ForegroundColor Yellow
    Write-Host "You can continue, but the app may not work properly." -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Continue anyway? (Y/N)"
    if ($continue -ne "Y" -and $continue -ne "y") {
        exit 1
    }
} else {
    Write-Host "MongoDB: Connected" -ForegroundColor Green
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Flask Application..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Server will be available at: http://localhost:5000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

python app.py

Read-Host "Press Enter to exit"

