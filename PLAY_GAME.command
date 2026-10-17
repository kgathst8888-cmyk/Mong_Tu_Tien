#!/bin/bash
cd "$(dirname "$0")"
if command -v python3 >/dev/null 2>&1; then
  python3 -m http.server 8765 >/tmp/mong_tu_tien_server.log 2>&1 &
  PID=$!
  sleep 1
  open "http://127.0.0.1:8765/index.html"
  echo "Game dang chay tai http://127.0.0.1:8765/index.html"
  echo "Nhan Enter de dung server."
  read
  kill "$PID" 2>/dev/null
else
  open "index.html"
fi
