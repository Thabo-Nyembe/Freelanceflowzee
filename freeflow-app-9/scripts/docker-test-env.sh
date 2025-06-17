#!/bin/bash
# Run Playwright tests inside a Docker container with all dependencies preinstalled.

set -e

IMAGE="mcr.microsoft.com/playwright:v1.40.0-jammy"
WORKDIR="/usr/src/app"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required but not installed." >&2
  exit 1
fi

# Allow optional test command, default to npm test
CMD="${1:-npm test}"

# Run Playwright in Docker
docker run --rm -it \
  -v "$(pwd)":${WORKDIR} \
  -w ${WORKDIR} \
  -e CI=1 \
  ${IMAGE} bash -c "npm ci && npx playwright install --with-deps && $CMD"
