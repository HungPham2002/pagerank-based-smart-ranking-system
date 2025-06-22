@echo off
echo ========================================
echo    PageRank Calculator Web App
echo ========================================
echo.

echo Starting Backend Server...
echo.

REM Activate virtual environment
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
    echo Virtual environment activated.
) else (
    echo Creating virtual environment...
    python -m venv venv
    call venv\Scripts\activate.bat
    echo Installing Python dependencies...
    pip install -r requirements.txt
)

echo.
echo Starting Flask backend server...
echo Backend will run at: http://localhost:5000
echo.
start "Backend Server" cmd /k "venv\Scripts\activate.bat && python app.py"

echo.
echo Waiting 3 seconds for backend to start...
timeout /t 3 /nobreak > nul

echo.
echo Starting Frontend Server...
echo.

REM Check if node_modules exists
if not exist "frontend\node_modules" (
    echo Installing Node.js dependencies...
    cd frontend
    npm install
    cd ..
)

echo.
echo Starting React frontend server...
echo Frontend will run at: http://localhost:3000
echo.
start "Frontend Server" cmd /k "cd frontend && npm start"

echo.
echo ========================================
echo    Both servers are starting...
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Please wait for both servers to fully start.
echo Then open your browser and go to: http://localhost:3000
echo.
echo Press any key to exit this window...
pause > nul 