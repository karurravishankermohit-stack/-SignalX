@echo off
cd /d %~dp0\backend
echo ========================================================
echo  SIGNALX — Automated RF Signal Intelligence Platform
echo  Starting FastAPI DSP Backend on http://localhost:8000
echo ========================================================
python -m uvicorn app.main:app --reload --port 8000 --log-level info
pause
