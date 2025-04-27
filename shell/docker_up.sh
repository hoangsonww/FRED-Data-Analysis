#!/usr/bin/env bash
set -euo pipefail

echo "→ Starting services in detached mode…"
cd "$(dirname "$0")/.."
docker-compose up -d

echo "✅ All services are up."
