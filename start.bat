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

REM Start the Node.js backend in a new console window so it stays running
start "Portfolio Backend" cmd /k "node server.js"

REM Give the server a moment to boot, then open the site in the default browser
timeout /t 4 /nobreak >nul
start "" "http://localhost:5000"

endlocal
