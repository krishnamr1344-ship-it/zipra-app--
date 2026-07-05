#!/usr/bin/env bash
set -e

echo "--- Building frontend ---"
cd ZipraApp
npm ci
npm run web:build

echo "--- Installing backend dependencies ---"
cd ../backend
pip install -r requirements.txt

echo "--- Running database migrations ---"
alembic upgrade head

echo "--- Build complete ---"
