#!/usr/bin/env bash
set -euo pipefail

echo "→ Running full data analysis (analyzeFredData.ts)..."
cd "$(dirname "$0")/../backend"
npm ci
npx tsx src/analyzeFredData.ts

echo "✅ Analysis complete; plots & reports generated."
