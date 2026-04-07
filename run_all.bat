@echo off
setlocal enabledelayedexpansion

REM Batch file to run the .NET backend and active Next.js apps.

REM Determine the directory where this script is located (without trailing backslash).
set "scriptdir=%~dp0"
if "%scriptdir:~-1%"=="\" set "scriptdir=%scriptdir:~0,-1%"
set "wt_exe=%LOCALAPPDATA%\Microsoft\WindowsApps\wt.exe"
set "node_dev_env=set ""NEXT_PUBLIC_API_URL=http://localhost:5000"" && set ""NEXT_PUBLIC_ESTORE_API_URL=http://localhost:5000"" && set ""NEXT_PUBLIC_API=http://localhost:5000"" && "

:main
set "start_clerk_sync=0"
set "existing_session=0"

echo.
echo Checking for leftover service listeners...
call :detect_existing_services

if "%existing_session%"=="1" (
  echo.
  echo One or more service listeners from a previous dev session are still active.
  echo That usually means the earlier admin, vendor, storefront, or API session was not closed cleanly.
  echo.
  choice /C ASC /N /M "[A]bort and check manually, [S]top all and run again, or [C]ontinue: "
  if errorlevel 3 goto prompt_clerk_sync
  if errorlevel 2 (
    echo.
    call "%scriptdir%\stop-all.bat" --no-pause
    timeout /t 2 /nobreak >nul
    goto main
  )
  if errorlevel 1 (
    echo.
    echo Aborted so you can inspect the existing listeners manually.
    exit /b 0
  )
)

:prompt_clerk_sync
echo.
choice /C YN /N /M "Need Clerk local sync via ngrok for http://localhost:3000? [Y/N]: "
if errorlevel 2 set "start_clerk_sync=0"
if errorlevel 1 set "start_clerk_sync=1"

REM Start the API and frontend apps in separate command prompt windows.
call :start_dotnet "EStore.Api" "%scriptdir%\EstorePoC\EStore.Api" "API Terminal" "5000 5053 7181"
call :start_node "frontadmin" "%scriptdir%\frontadmin" "Admin Terminal" "3001"
call :start_node "front-store" "%scriptdir%\front-store" "Front Store Terminal" "3000"
call :start_node "frontvendor" "%scriptdir%\frontvendor" "Vendor Terminal" "3003"
if "%start_clerk_sync%"=="1" call :start_ngrok "Clerk Sync Terminal"
goto :eof

:detect_existing_services
call :report_listener "5000 5053 7181" "API"
call :report_listener "3001" "Admin frontend"
call :report_listener "3000" "Front Store frontend"
call :report_listener "3003" "Vendor frontend"
exit /b 0

:report_listener
set "ports=%~1"
set "service_name=%~2"

for %%p in (%ports%) do (
  netstat -ano | findstr /R /C:":%%p .*LISTENING" >nul
  if not errorlevel 1 (
    echo   - !service_name! listener already active on port %%p
    set "existing_session=1"
    exit /b 0
  )
)

exit /b 0

:start_dotnet
set "window_title=%~1"
set "workdir=%~2"
set "shell_title=%~3"
set "ports=%~4"

if not exist "%workdir%" (
  echo Skipping %window_title%: missing directory "%workdir%"
  exit /b 1
)

call :check_ports "%ports%"
if "%port_in_use%"=="1" (
  echo Skipping %window_title%: already running on port !active_port!.
  exit /b 0
)

call :start_terminal "%window_title%" "%workdir%" "%shell_title%" "dotnet run --no-launch-profile -- --urls http://localhost:5000"
exit /b 0

:start_node
set "window_title=%~1"
set "workdir=%~2"
set "shell_title=%~3"
set "ports=%~4"

if not exist "%workdir%" (
  echo Skipping %window_title%: missing directory "%workdir%"
  exit /b 1
)

call :check_ports "%ports%"
if "%port_in_use%"=="1" (
  echo Skipping %window_title%: already running on port !active_port!.
  exit /b 0
)

if exist "%workdir%\node_modules" (
  call :start_terminal "%window_title%" "%workdir%" "%shell_title%" "%node_dev_env%npm run dev"
) else (
  if exist "%workdir%\package-lock.json" (
    call :start_terminal "%window_title%" "%workdir%" "%shell_title%" "%node_dev_env%npm ci && npm run dev"
  ) else (
    call :start_terminal "%window_title%" "%workdir%" "%shell_title%" "%node_dev_env%npm install && npm run dev"
  )
)

exit /b 0

:check_ports
set "port_in_use=0"
set "active_port="

for %%p in (%~1) do (
  netstat -ano | findstr /R /C:":%%p .*LISTENING" >nul
  if not errorlevel 1 (
    set "port_in_use=1"
    set "active_port=%%p"
    goto :eof
  )
)

exit /b 0

:start_terminal
set "window_title=%~1"
set "workdir=%~2"
set "shell_title=%~3"
set "launch_command=%~4"

if exist "%wt_exe%" (
  "%wt_exe%" new-tab --title "%shell_title%" --suppressApplicationTitle -d "%workdir%" cmd /k "title %shell_title% && %launch_command%"
) else (
  start "%window_title%" /D "%workdir%" cmd /k "title %shell_title% && %launch_command%"
)

exit /b 0

:start_ngrok
set "shell_title=%~1"

where.exe ngrok >nul 2>nul
if errorlevel 1 (
  echo Skipping Clerk local sync: ngrok was not found on PATH.
  exit /b 1
)

tasklist /FI "IMAGENAME eq ngrok.exe" | find /I "ngrok.exe" >nul
if not errorlevel 1 (
  echo Skipping Clerk local sync: ngrok is already running.
  exit /b 0
)

if exist "%wt_exe%" (
  "%wt_exe%" new-tab --title "%shell_title%" --suppressApplicationTitle -d "%scriptdir%" cmd /k "title %shell_title% && ngrok http 3000"
) else (
  start "%shell_title%" /D "%scriptdir%" cmd /k "title %shell_title% && ngrok http 3000"
)

exit /b 0
