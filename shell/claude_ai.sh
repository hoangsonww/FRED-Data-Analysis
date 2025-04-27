#!/usr/bin/env bash
set -euo pipefail

echo "→ Running Claude AI script (claudeAI.ts)..."
cd "$(dirname "$0")/../backend"
npm ci
npx tsx src/scripts/claudeAI.ts

echo "✅ Claude AI script finished."
