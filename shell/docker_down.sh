#!/usr/bin/env bash
set -euo pipefail

echo "→ Stopping and removing containers, networks, volumes…"
cd "$(dirname "$0")/.."
docker-compose down --volumes

echo "✅ Tear down complete."
