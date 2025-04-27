#!/usr/bin/env bash
set -euo pipefail

echo "→ Upserting data to Pinecone (upsertFredData.ts)..."
cd "$(dirname "$0")/../backend"
npm ci
npx tsx src/upsertFredData.ts

echo "✅ Upsert to Pinecone complete."
