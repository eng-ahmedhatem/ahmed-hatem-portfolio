#!/usr/bin/env bash
set -euo pipefail

base=/home/ahportfolio/apps/portfolio
repository=https://github.com/eng-ahmedhatem/ahmed-hatem-portfolio.git
env_file="$base/shared/production.env"
app_name=ahmed-hatem-portfolio

export PATH="/home/ahportfolio/.nvm/versions/node/v22.23.3/bin:$PATH"
mkdir -p "$base/releases" "$base/shared"
exec 9>"$base/deploy.lock"
flock -n 9 || exit 0

if [[ ! -r "$env_file" ]]; then
  echo "Deployment skipped: production.env is missing" >&2
  exit 1
fi

set -a
source "$env_file"
set +a

if [[ "${APP_ORIGIN:-}" != "https://eng-ahmedhatem.com" || "${NEXT_PUBLIC_SITE_URL:-}" != "https://eng-ahmedhatem.com" ]]; then
  echo "Deployment skipped: canonical origin is not configured" >&2
  exit 1
fi

if [[ "${CONTENT_REPOSITORY:-}" == api ]]; then
  session_secret=${SESSION_SECRET:-}
  analytics_salt=${ANALYTICS_SALT:-}
  cron_secret=${CRON_SECRET:-}
  admin_password=${ADMIN_PASSWORD:-}
  if [[ -z "${SUPABASE_URL:-}" || -z "${SUPABASE_PUBLISHABLE_KEY:-${SUPABASE_ANON_KEY:-}}" || -z "${SUPABASE_SECRET_KEY:-${SUPABASE_SERVICE_ROLE_KEY:-}}" \
    || ${#session_secret} -lt 32 || ${#analytics_salt} -lt 16 || ${#cron_secret} -lt 16 \
    || -z "${ADMIN_EMAIL:-}" || ${#admin_password} -lt 12 ]]; then
    echo "Deployment skipped: production security environment is incomplete" >&2
    exit 1
  fi
fi

latest_sha=$(git ls-remote "$repository" refs/heads/master | cut -f1)
if [[ ! "$latest_sha" =~ ^[a-f0-9]{40}$ ]]; then
  echo "Deployment skipped: GitHub master could not be resolved" >&2
  exit 1
fi

current_sha=$(cat "$base/current/.git-commit" 2>/dev/null || true)
if [[ "$current_sha" == "$latest_sha" ]]; then
  echo "Already deployed: ${latest_sha:0:12}"
  exit 0
fi

release="$base/releases/${latest_sha}-$(date -u +%Y%m%d%H%M%S)"
git clone --quiet --depth 1 --branch master "$repository" "$release"
actual_sha=$(git -C "$release" rev-parse HEAD)
if [[ "$actual_sha" != "$latest_sha" ]]; then
  echo "GitHub advanced during checkout; the next poll will retry" >&2
  exit 1
fi

printf '%s\n' "$actual_sha" > "$release/.git-commit"
cd "$release"
npm ci --include=dev --no-audit --no-fund
npm run lint
npm run typecheck
npm test
npm run build

previous=$(readlink "$base/current" 2>/dev/null || true)
ln -s "$release" "$base/.next-current"
mv -Tf "$base/.next-current" "$base/current"

restart_app() {
  if pm2 describe "$app_name" >/dev/null 2>&1; then
    pm2 delete "$app_name" >/dev/null
  fi
  pm2 start "$base/current/ops/vps-start.sh" --name "$app_name" --interpreter bash >/dev/null
  pm2 save >/dev/null
}

restart_app
healthy=0
for attempt in {1..20}; do
  if curl --silent --show-error --fail --max-time 8 --output /dev/null http://127.0.0.1:3200/ar \
    && curl --silent --show-error --fail --max-time 8 --output /dev/null http://127.0.0.1:3200/en \
    && curl --silent --show-error --fail --max-time 8 --output /dev/null http://127.0.0.1:3200/robots.txt; then
    healthy=1
    break
  fi
  sleep 3
done

if [[ "$healthy" != 1 ]]; then
  echo "New release failed smoke checks; restoring previous release" >&2
  if [[ -n "$previous" && -d "$previous" ]]; then
    ln -s "$previous" "$base/.next-current"
    mv -Tf "$base/.next-current" "$base/current"
    restart_app
  fi
  exit 1
fi

install -m 700 "$release/ops/vps-deploy.sh" "$base/deploy.sh"
echo "Deployed ${actual_sha:0:12}"
