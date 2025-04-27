#!/usr/bin/env bash
set -euo pipefail

echo "→ Querying Pinecone (queryRag.ts)..."
cd "$(dirname "$0")/../backend"
npm ci
npx tsx src/queryRag.ts

echo "✅ Query complete."
