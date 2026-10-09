#!/usr/bin/env bash
set -euo pipefail

base=/home/ahportfolio/apps/portfolio
set -a
# This file is provisioned on the VPS, outside Git and the web root.
source "$base/shared/production.env"
set +a

cd "$base/current"
exec node node_modules/next/dist/bin/next start -H 127.0.0.1 -p 3200
