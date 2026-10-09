#!/usr/bin/env bash
set -euo pipefail

base=/home/ahportfolio/apps/portfolio
export PATH="/home/ahportfolio/.nvm/versions/node/v22.23.3/bin:$PATH"
set -a
source "$base/shared/production.env"
set +a

if [[ -z "${CRON_SECRET:-}" ]]; then
  exit 1
fi

node -e 'fetch("http://127.0.0.1:3200/api/cron/supabase-keepalive", { headers: { authorization: `Bearer ${process.env.CRON_SECRET}` }, signal: AbortSignal.timeout(15000) }).then((response) => { if (!response.ok) process.exitCode = 1; }).catch(() => { process.exitCode = 1; })'
