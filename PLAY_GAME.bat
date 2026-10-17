@echo off
setlocal
cd /d "%~dp0"
where py >nul 2>&1
if %errorlevel%==0 goto PY
where python >nul 2>&1
if %errorlevel%==0 goto PYTHON
start "" "%~dp0index.html"
echo.
echo Da mo game truc tiep bang Chrome/Edge.
echo Neu game khong hien, cai Python 3 va chay lai file nay.
pause
exit /b
:PY
start "Mong Tu Tien Server" /min cmd /c "py -3 -m http.server 8765"
timeout /t 1 /nobreak >nul
start "" "http://127.0.0.1:8765/index.html"
exit /b
:PYTHON
start "Mong Tu Tien Server" /min cmd /c "python -m http.server 8765"
timeout /t 1 /nobreak >nul
start "" "http://127.0.0.1:8765/index.html"
exit /b
