#!/usr/bin/env bash
set -euo pipefail

echo "→ Running data fetch & vectorization (runAll.ts)..."
cd "$(dirname "$0")/../backend"
npm ci
npx tsx src/runAll.ts

echo "✅ Data ingestion & vectorization complete."
