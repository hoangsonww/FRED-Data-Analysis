#!/usr/bin/env bash
set -euo pipefail

echo "→ Building all Docker images…"
cd "$(dirname "$0")/.."
docker-compose build

echo "✅ Build complete."
