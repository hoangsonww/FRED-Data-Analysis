#!/usr/bin/env bash
set -euo pipefail

echo "→ Restarting all services…"
cd "$(dirname "$0")/.."
docker-compose restart

echo "✅ Restart complete."
