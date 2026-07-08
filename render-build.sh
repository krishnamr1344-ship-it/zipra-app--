#!/usr/bin/env bash
set -e

echo "--- Installing backend dependencies ---"
cd backend
pip install -r requirements.txt

echo "--- Running migrations ---"
alembic upgrade head 2>/dev/null || echo "Migration skipped or already applied"

echo "--- Build complete ---"
