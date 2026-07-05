#!/usr/bin/env bash
set -e

echo "--- Building frontend ---"
cd ZipraApp
npm ci
npm run web:build

echo "--- Installing backend dependencies ---"
cd ../backend
pip install -r requirements.txt

echo "--- Running migrations ---"
alembic upgrade c53b9a3f7d21 2>/dev/null || echo "Migration skipped or already applied"

echo "--- Build complete ---"
