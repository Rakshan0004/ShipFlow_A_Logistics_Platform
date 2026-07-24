@echo off
echo ========================================
echo   Zippy Logistics Platform - Docker
echo ========================================
echo.

echo Checking Docker is running...
docker info >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo.
echo Starting all services...
echo This may take 2-3 minutes on first run.
echo.

docker-compose up --build

pause
