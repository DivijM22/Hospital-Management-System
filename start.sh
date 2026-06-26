#!/bin/bash

# Load NVM (Node Version Manager) if present
export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
    . "$NVM_DIR/nvm.sh"
fi

# Function to kill child processes on exit
cleanup() {
    echo "Stopping servers..."
    kill $SERVER_PID $CLIENT_PID 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

echo "🚀 Starting Hospital Management System backend..."
cd /home/divijm/Dev/Hospital-Management-System/server
npm run dev &
SERVER_PID=$!

echo "🚀 Starting Hospital Management System frontend..."
cd /home/divijm/Dev/Hospital-Management-System/client
npm run dev &
CLIENT_PID=$!

echo "✅ Both servers are running!"
echo "   - Backend PID: $SERVER_PID"
echo "   - Frontend PID: $CLIENT_PID"
echo "   - Press Ctrl+C to stop both."

# Wait for background processes
wait $SERVER_PID $CLIENT_PID
