@echo off
REM Batch file to run the .NET backend and active Next.js apps

REM Determine the directory where this script is located (without trailing backslash)
set "scriptdir=%~dp0"
if "%scriptdir:~-1%"=="\" set "scriptdir=%scriptdir:~0,-1%"

REM Start the .NET backend (EStore.Api) in a new command prompt window
start "EStore.Api" cmd /k "cd /d ""%scriptdir%\EstorePoC\EStore.Api"" && set ""ASPNETCORE_URLS=http://localhost:5000"" && dotnet run --no-launch-profile"

REM Start the admin-only Next.js app in a new command prompt window
start "frontadmin" cmd /k "cd /d ""%scriptdir%\frontadmin"" && set ""NEXT_PUBLIC_API_URL=http://localhost:5000"" && set ""NEXT_PUBLIC_ESTORE_API_URL=http://localhost:5000"" && set ""NEXT_PUBLIC_API=http://localhost:5000"" && npm install && npm run dev"

REM Start the Front-Store Next.js app in a new command prompt window
start "front-store" cmd /k "cd /d ""%scriptdir%\front-store"" && set ""NEXT_PUBLIC_API_URL=http://localhost:5000"" && set ""NEXT_PUBLIC_ESTORE_API_URL=http://localhost:5000"" && set ""NEXT_PUBLIC_API=http://localhost:5000"" && npm install && npm run dev"
