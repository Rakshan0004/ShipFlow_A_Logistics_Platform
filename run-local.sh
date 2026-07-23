#!/usr/bin/env bash
set -e

echo "Starting Zippy Logistics Platform Locally..."

echo "Starting PostgreSQL via Docker..."
docker compose up postgres -d

echo "Building Gradle project..."
./gradlew build -x test

echo "Starting Zippy Backend on port 8080..."
./gradlew :zippy-backend:bootRun &

echo "Starting Mock Courier Service on port 8081..."
./gradlew :mock-courier-service:bootRun &

echo "Starting Frontend on port 3000..."
cd zippy-frontend
npm install
npm run dev
