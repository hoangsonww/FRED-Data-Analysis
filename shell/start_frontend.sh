#!/usr/bin/env bash
set -euo pipefail

echo "→ Starting frontend..."
cd "$(dirname "$0")/../frontend"
npm ci
npm start

# hits: http://localhost:3000
