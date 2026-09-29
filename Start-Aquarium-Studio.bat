@echo off
title Aquarium Studio
color 0b
echo ========================================================
echo                Starting Aquarium Studio...
echo ========================================================
echo.

:: 1. Verify Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is required to run Aquarium Studio.
    echo Please install Node.js from https://nodejs.org/ and try again.
    echo.
    pause
    exit /b
)

:: 2. Ensure we are in the project folder
cd /d "%~dp0"

:: 3. Ensure .env exists with default configuration
if not exist ".env" (
    echo [INFO] Creating default configuration file...
    echo DATABASE_URL="file:./dev.db">.env
    echo GEMINI_API_KEY="">>.env
)

:: 4. Check for dependencies
if not exist "node_modules" (
    echo [INFO] First-time setup detected. Installing packages...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install dependencies.
        pause
        exit /b
    )
)

:: 5. Ensure Prisma database is initialized and seeded on first run
if not exist "prisma\dev.db" (
    echo [INFO] Initializing clean database...
    call npx prisma db push --skip-generate
    echo [INFO] Populating sample tanks and livestock...
    call npx prisma db seed
) else (
    echo [INFO] Checking local database...
    call npx prisma db push --skip-generate >nul 2>nul
)

:: 6. Open default browser automatically after 3 seconds
start "" cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:3000"

:: 7. Start the application
echo [READY] Server launching! Opening your browser at http://localhost:3000
echo Leave this window open while using Aquarium Studio.
echo [SHUTDOWN] To shut down: press Ctrl+C or simply close this window.
echo.
call npm run dev

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Server exited with code %errorlevel%.
    pause
)
