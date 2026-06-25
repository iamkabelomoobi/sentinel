#!/usr/bin/env bash

set -euo pipefail

APP_NAME="sentinel"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

DOMAIN_API="api.sentinel.bbbsoftware.co.za"
DOMAIN_WEB="app.sentinel.bbbsoftware.co.za"
LETSENCRYPT_EMAIL="giftmoobi@gmail.com"

NGINX_AVAILABLE="/etc/nginx/sites-available"
NGINX_ENABLED="/etc/nginx/sites-enabled"

API_NGINX_SOURCE="$ROOT_DIR/infra/nginx/api.conf"
WEB_NGINX_SOURCE="$ROOT_DIR/infra/nginx/web.conf"

API_NGINX_TARGET="$NGINX_AVAILABLE/sentinel-api"
WEB_NGINX_TARGET="$NGINX_AVAILABLE/sentinel-web"

COMPOSE_FILE="$ROOT_DIR/infra/docker/docker-compose.prod.yml"
LAST_DEPLOYED_FILE="$ROOT_DIR/.last-deployed"

echo "🚀 Deploying $APP_NAME..."

cd "$ROOT_DIR"

CURRENT_COMMIT="$(git rev-parse HEAD)"

if [ -f "$LAST_DEPLOYED_FILE" ]; then
  LAST_DEPLOYED="$(cat "$LAST_DEPLOYED_FILE")"
else
  LAST_DEPLOYED="HEAD~1"
fi

echo "🔎 Checking changes from $LAST_DEPLOYED to $CURRENT_COMMIT..."

CHANGED_FILES="$(git diff --name-only "$LAST_DEPLOYED" "$CURRENT_COMMIT" || true)"

if [ -z "$CHANGED_FILES" ]; then
  echo "✅ No changes detected. Nothing to deploy."
  exit 0
fi

echo "$CHANGED_FILES"

deploy_nginx=false
deploy_api=false
deploy_web=false

if echo "$CHANGED_FILES" | grep -qE '^infra/nginx/'; then
  deploy_nginx=true
fi

if echo "$CHANGED_FILES" | grep -qE '^(apps/api|packages|infra/docker|package.json|yarn.lock|pnpm-lock.yaml|package-lock.json)/?'; then
  deploy_api=true
fi

if echo "$CHANGED_FILES" | grep -qE '^(apps/web|packages|infra/docker|package.json|yarn.lock|pnpm-lock.yaml|package-lock.json)/?'; then
  deploy_web=true
fi

if [ "$deploy_nginx" = true ]; then
  echo "📦 Installing Nginx configs..."

  sudo cp "$API_NGINX_SOURCE" "$API_NGINX_TARGET"
  sudo cp "$WEB_NGINX_SOURCE" "$WEB_NGINX_TARGET"

  echo "🔗 Enabling Nginx sites..."

  sudo ln -sf "$API_NGINX_TARGET" "$NGINX_ENABLED/sentinel-api"
  sudo ln -sf "$WEB_NGINX_TARGET" "$NGINX_ENABLED/sentinel-web"

  echo "🔒 Checking SSL certificates..."

  if [ ! -f "/etc/letsencrypt/live/$DOMAIN_API/fullchain.pem" ]; then
    echo "📜 SSL certificate not found. Requesting Let's Encrypt certificate..."

    sudo certbot --nginx \
      --non-interactive \
      --agree-tos \
      --email "$LETSENCRYPT_EMAIL" \
      -d "$DOMAIN_API" \
      -d "$DOMAIN_WEB"
  else
    echo "✅ SSL certificate already exists"
  fi

  echo "🔄 Checking certificate renewal..."
  sudo certbot renew --quiet || true

  echo "🧪 Testing Nginx configuration..."
  sudo nginx -t

  echo "🔄 Reloading Nginx..."
  sudo systemctl reload nginx
else
  echo "✅ No Nginx changes detected"
fi

if [ "$deploy_api" = true ]; then
  echo "🐳 Rebuilding and restarting API..."
  docker compose -f "$COMPOSE_FILE" up -d --build api
else
  echo "✅ No API changes detected"
fi

if [ "$deploy_web" = true ]; then
  echo "🐳 Rebuilding and restarting Web..."
  docker compose -f "$COMPOSE_FILE" up -d --build web
else
  echo "✅ No Web changes detected"
fi

if [ "$deploy_api" = false ] && [ "$deploy_web" = false ]; then
  echo "✅ No Docker app changes detected"
fi

echo "🧹 Cleaning unused Docker images..."
docker image prune -f

git rev-parse HEAD > "$LAST_DEPLOYED_FILE"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Deployment complete"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 Web: https://$DOMAIN_WEB"
echo "🚀 API: https://$DOMAIN_API"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"