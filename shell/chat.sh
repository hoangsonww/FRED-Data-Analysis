#!/usr/bin/env bash
set -euo pipefail

echo "→ Starting chatbot session (chatWithAI.ts)..."
cd "$(dirname "$0")/../backend"
npm ci
npx tsx src/chatWithAI.ts

echo "✅ Chat session ended."
