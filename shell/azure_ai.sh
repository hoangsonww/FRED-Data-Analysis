#!/usr/bin/env bash
set -euo pipefail

echo "→ Running Azure OpenAI script (azureAI.ts)..."
cd "$(dirname "$0")/../backend"
npm ci
npx tsx src/scripts/azureAI.ts

echo "✅ Azure OpenAI script finished."
