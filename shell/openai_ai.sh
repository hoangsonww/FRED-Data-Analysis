#!/usr/bin/env bash
set -euo pipefail

echo "→ Running OpenAI script (openAI.ts)..."
cd "$(dirname "$0")/../backend"
npm ci
npx tsx src/scripts/openAI.ts

echo "✅ OpenAI script finished."
