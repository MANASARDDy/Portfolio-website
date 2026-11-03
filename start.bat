@echo off
REM ============================================================
REM  One-click launcher for the Personal Portfolio backend
REM  Usage: double-click this file (or run from cmd).
REM ============================================================
setlocal

cd /d "%~dp0backend"

echo.
echo Starting Personal Portfolio backend server...
echo (Keep this window open while using the site.)
echo.

REM --- Make sure Node.js is available --------------------------------------
where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js was not found on PATH.
    echo         Install Node.js from https://nodejs.org/ and re-run this file.
    pause
    exit /b 1
)

REM --- Warn if port 5000 is already in use ----------------------------------
powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort 5000 -State Listen -ErrorAction SilentlyContinue) { exit 1 } else { exit 0 }" >nul 2>&1
if errorlevel 1 (
    echo [WARN] Port 5000 is already in use. Reusing the existing backend.
    echo        If the site still fails to connect, stop the other process first.
    echo.
) else (
    REM Start the Node.js backend in a new console window so it stays running
    start "Portfolio Backend" cmd /k "node server.js"
)

REM Give the server a moment to boot, then verify health before opening browser
set /a tries=0
:healthcheck
set /a tries+=1
powershell -NoProfile -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:5000/api/health' -UseBasicParsing -TimeoutSec 2; if ($r.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>&1
if errorlevel 1 (
    if %tries% lss 10 (
        timeout /t 1 /nobreak >nul
        goto healthcheck
    ) else (
        echo [ERROR] Backend did not become healthy on http://localhost:5000.
        echo         Check the "Portfolio Backend" window for details.
        pause
        exit /b 1
    )
)

echo Backend is healthy. Opening the site in your default browser...
start "" "http://localhost:5000"

endlocal
