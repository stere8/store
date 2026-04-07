@echo off
REM Batch file to run the .NET backend and active Next.js apps

REM Determine the directory where this script is located (without trailing backslash)
set "scriptdir=%~dp0"
if "%scriptdir:~-1%"=="\" set "scriptdir=%scriptdir:~0,-1%"

REM Start the .NET backend (EStore.Api) in a new command prompt window
start "EStore.Api" cmd /k "cd /d \"%scriptdir%\EstorePoC\EStore.Api\" && Title API Terminal  && dotnet run"

REM Start the admin-only Next.js app in a new command prompt window
start "frontadmin" cmd /k "cd /d \"%scriptdir%\frontadmin\" && Title Admin Terminal  && npm install && npm run dev"

REM Start the Front-Store Next.js app in a new command prompt window
start "front-store" cmd /k "cd /d \"%scriptdir%\front-store\" && Title Front Store Terminal  && npm install && npm run dev"

REM Start the Front-Store Next.js app in a new command prompt window
start "front-store" cmd /k "cd /d \"%scriptdir%\frontvendor\" && Title Vendor Terminal && npm install && npm run dev"
