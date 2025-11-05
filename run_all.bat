@echo off
REM Batch file to run the .NET backend and both Next.js apps

REM Determine the directory where this script is located (without trailing backslash)
set "scriptdir=%~dp0"
if "%scriptdir:~-1%"=="\" set "scriptdir=%scriptdir:~0,-1%"

REM Start the .NET backend (EStore.Api) in a new command prompt window
start "EStore.Api" cmd /k "cd /d \"%scriptdir%\EstorePoC\EStore.Api\" && dotnet run"

REM Start the API Admin Next.js app in a new command prompt window
start "api-admin" cmd /k "cd /d \"%scriptdir%\api-admin\" && npm install && npm run dev"

REM Start the Front-Store Next.js app in a new command prompt window
start "front-store" cmd /k "cd /d \"%scriptdir%\front-store\" && npm install && npm run dev"
