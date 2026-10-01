@echo off
cd /d "%~dp0"
set "PORT=8765"
where py >nul 2>nul
if not errorlevel 1 (
	start "" /min py -m http.server %PORT% --bind 127.0.0.1
) else (
	where python >nul 2>nul
	if errorlevel 1 (
		echo Python is required to launch NovaPlayer over localhost.
		pause
		exit /b 1
	)
	start "" /min python -m http.server %PORT% --bind 127.0.0.1
)
timeout /t 1 /nobreak >nul
start "" chrome --app="http://127.0.0.1:%PORT%/index.html" --start-fullscreen
exit