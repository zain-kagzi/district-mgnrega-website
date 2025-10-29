@echo off
REM Windows Task Scheduler Script for MGNREGA Data Fetch

REM Set paths
set PROJECT_PATH=C:\Users\Asus\Desktop\mgnrega-dashboard
set LOG_PATH=%PROJECT_PATH%\logs
set NODE_PATH=C:\Program Files\nodejs\node.exe

REM Create logs directory if it doesn't exist
if not exist "%LOG_PATH%" mkdir "%LOG_PATH%"

REM Set log file with timestamp
set LOG_FILE=%LOG_PATH%\fetch-%date:~-4,4%%date:~-10,2%%date:~-7,2%-%time:~0,2%%time:~3,2%%time:~6,2%.log

REM Change to project directory
cd /d "%PROJECT_PATH%"

REM Run the job and log output
echo Starting MGNREGA Data Fetch Job at %date% %time% > "%LOG_FILE%"
"%NODE_PATH%" src\jobs\fetch-mgnrega-data.js >> "%LOG_FILE%" 2>&1

REM Log completion
echo Job completed at %date% %time% >> "%LOG_FILE%"

REM Keep only last 30 log files
forfiles /P "%LOG_PATH%" /M *.log /D -30 /C "cmd /c del @path" 2>nul

exit