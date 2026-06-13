@echo off
cd /d "%~dp0"
start "HR-Sim-API" cmd /k "cd backend && if not exist .venv python -m venv .venv && call .venv\Scripts\activate.bat && pip install -r requirements.txt -q && python main.py"
timeout /t 3 /nobreak >nul
start "HR-Sim-Web" cmd /k "cd frontend && if not exist node_modules call npm install && npm run dev"
echo.
echo 后端: http://127.0.0.1:5070
echo 前端: http://127.0.0.1:5173
echo 请在浏览器打开 http://127.0.0.1:5173
pause
