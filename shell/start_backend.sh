#!/usr/bin/env bash
set -euo pipefail

echo "→ Starting backend in dev mode..."
cd "$(dirname "$0")/../backend"
npm ci
npm run dev

# hits: http://localhost:4000
