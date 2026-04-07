@echo off
setlocal enabledelayedexpansion
set "skip_pause=0"
if /I "%~1"=="--no-pause" set "skip_pause=1"

echo.
echo ================================================
echo  STOP-ALL.BAT - Precision Shutdown
echo  (targets this project stack only)
echo ================================================
echo.

echo [1/3] Stopping .NET API (ports 5000, 5053, 7181)...
call :kill_ports "5000 5053 7181" "API"

echo.
echo [2/3] Stopping Next.js apps (ports 3000, 3001, 3003)...
call :kill_ports "3000 3001 3003" "frontend"

echo.
echo [3/3] Closing leftover terminal shells (by exact title)...
for %%t in ("API Terminal" "Admin Terminal" "Front Store Terminal" "Vendor Terminal" "Clerk Sync Terminal") do (
    taskkill /FI "WINDOWTITLE eq %%~t" /IM cmd.exe /T /F >nul 2>&1
    taskkill /FI "WINDOWTITLE eq %%~t" /IM powershell.exe /T /F >nul 2>&1
    taskkill /FI "WINDOWTITLE eq %%~t" /IM pwsh.exe /T /F >nul 2>&1
    taskkill /FI "WINDOWTITLE eq %%~t" /IM ngrok.exe /T /F >nul 2>&1
)

echo.
echo Done.
echo   - Targeted only the known dev ports for this workspace
echo   - Avoided blanket killing all node.exe or dotnet.exe processes
echo   - Closed titled shells where possible after port shutdown
echo.
if not "%skip_pause%"=="1" pause
goto :eof

:kill_ports
set "ports=%~1"
set "label=%~2"

for %%p in (%ports%) do (
    set "found="
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr /R /C:":%%p .*LISTENING"') do (
        set "pid=%%a"
        set "found=1"
        echo   Killing !label! PID !pid! (port %%p)
        taskkill /PID !pid! /F /T >nul 2>&1
    )
    if not defined found (
        echo   (No process found on port %%p)
    )
)

exit /b 0
