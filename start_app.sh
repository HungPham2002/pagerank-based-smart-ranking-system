#!/bin/bash

echo "========================================"
echo "   PageRank Calculator Web App"
echo "========================================"
echo

echo "Starting Backend Server..."
echo

# Activate virtual environment
if [ -d "venv" ]; then
    source venv/bin/activate
    echo "Virtual environment activated."
else
    echo "Creating virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    echo "Installing Python dependencies..."
    pip install -r requirements.txt
fi

echo
echo "Starting Flask backend server..."
echo "Backend will run at: http://localhost:5000"
echo

# Start backend in background
source venv/bin/activate && python app.py &
BACKEND_PID=$!

echo
echo "Waiting 3 seconds for backend to start..."
sleep 3

echo
echo "Starting Frontend Server..."
echo

# Check if node_modules exists
if [ ! -d "frontend/node_modules" ]; then
    echo "Installing Node.js dependencies..."
    cd frontend
    npm install
    cd ..
fi

echo
echo "Starting React frontend server..."
echo "Frontend will run at: http://localhost:3000"
echo

# Start frontend in background
cd frontend && npm start &
FRONTEND_PID=$!

echo
echo "========================================"
echo "   Both servers are starting..."
echo "========================================"
echo
echo "Backend:  http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo
echo "Please wait for both servers to fully start."
echo "Then open your browser and go to: http://localhost:3000"
echo
echo "Press Ctrl+C to stop both servers"
echo

# Wait for user to stop
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait 