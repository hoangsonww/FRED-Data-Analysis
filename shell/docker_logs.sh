#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [ $# -ge 1 ]; then
  SERVICE="$1"
  shift
  echo "→ Tailing logs for service '$SERVICE'…"
  docker-compose logs -f "$SERVICE" "$@"
else
  echo "→ Tailing logs for all services…"
  docker-compose logs -f
fi
