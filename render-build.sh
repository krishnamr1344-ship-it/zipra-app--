#!/usr/bin/env bash
set -e

echo "--- Building frontend ---"
cd ZipraApp
npm ci
npm run web:build

echo "--- Installing backend dependencies ---"
cd ../backend
pip install -r requirements.txt

echo "--- Build complete ---"
