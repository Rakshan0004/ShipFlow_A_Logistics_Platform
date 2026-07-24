@echo off
echo ========================================
echo   Validating Docker Setup
echo ========================================
echo.

echo [1/5] Checking Docker is running...
docker info >nul 2>&1
if errorlevel 1 (
    echo [FAIL] Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)
echo [OK] Docker is running

echo.
echo [2/5] Checking required files exist...
set "ERRORS=0"

if not exist "docker-compose.yml" (
    echo [FAIL] docker-compose.yml not found
    set "ERRORS=1"
) else (
    echo [OK] docker-compose.yml found
)

if not exist "zippy-backend\Dockerfile" (
    echo [FAIL] zippy-backend\Dockerfile not found
    set "ERRORS=1"
) else (
    echo [OK] zippy-backend\Dockerfile found
)

if not exist "mock-courier-service\Dockerfile" (
    echo [FAIL] mock-courier-service\Dockerfile not found
    set "ERRORS=1"
) else (
    echo [OK] mock-courier-service\Dockerfile found
)

if not exist "zippy-frontend\Dockerfile" (
    echo [FAIL] zippy-frontend\Dockerfile not found
    set "ERRORS=1"
) else (
    echo [OK] zippy-frontend\Dockerfile found
)

if not exist "zippy-frontend\nginx.conf" (
    echo [FAIL] zippy-frontend\nginx.conf not found
    set "ERRORS=1"
) else (
    echo [OK] zippy-frontend\nginx.conf found
)

if "%ERRORS%"=="1" (
    echo.
    echo [FAIL] Some required files are missing!
    pause
    exit /b 1
)

echo.
echo [3/5] Checking port availability...
netstat -ano | findstr ":3000 " >nul 2>&1
if not errorlevel 1 (
    echo [WARN] Port 3000 is in use - frontend may fail to start
) else (
    echo [OK] Port 3000 is available
)

netstat -ano | findstr ":8080 " >nul 2>&1
if not errorlevel 1 (
    echo [WARN] Port 8080 is in use - backend may fail to start
) else (
    echo [OK] Port 8080 is available
)

netstat -ano | findstr ":8081 " >nul 2>&1
if not errorlevel 1 (
    echo [WARN] Port 8081 is in use - mock courier may fail to start
) else (
    echo [OK] Port 8081 is available
)

netstat -ano | findstr ":5432 " >nul 2>&1
if not errorlevel 1 (
    echo [WARN] Port 5432 is in use - postgres may fail to start
) else (
    echo [OK] Port 5432 is available
)

echo.
echo [4/5] Checking Docker Compose version...
docker-compose version >nul 2>&1
if errorlevel 1 (
    echo [FAIL] Docker Compose not found!
    pause
    exit /b 1
)
echo [OK] Docker Compose is installed

echo.
echo [5/5] Validating docker-compose.yml syntax...
docker-compose config >nul 2>&1
if errorlevel 1 (
    echo [FAIL] docker-compose.yml has syntax errors!
    echo Run 'docker-compose config' to see details.
    pause
    exit /b 1
)
echo [OK] docker-compose.yml is valid

echo.
echo ========================================
echo   Validation Complete!
echo ========================================
echo.
echo All checks passed. You can now run:
echo   - docker-start.bat (or docker-compose up --build)
echo.
echo Services will be available at:
echo   Frontend:      http://localhost:3000
echo   Backend API:   http://localhost:8080/api
echo   Mock Courier:  http://localhost:8081
echo   Database:      localhost:5432
echo.
pause
