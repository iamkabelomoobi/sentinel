#!/usr/bin/env bash

set -euo pipefail

APP_NAME="sentinel"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

NGINX_AVAILABLE="/etc/nginx/sites-available"
NGINX_ENABLED="/etc/nginx/sites-enabled"

API_NGINX_SOURCE="$ROOT_DIR/infra/nginx/api.conf"
WEB_NGINX_SOURCE="$ROOT_DIR/infra/nginx/web.conf"

API_NGINX_TARGET="$NGINX_AVAILABLE/sentinel-api"
WEB_NGINX_TARGET="$NGINX_AVAILABLE/sentinel-web"

COMPOSE_FILE="$ROOT_DIR/infra/docker/docker-compose.prod.yml"

echo "🚀 Deploying $APP_NAME..."

echo "📦 Installing Nginx configs..."
sudo cp "$API_NGINX_SOURCE" "$API_NGINX_TARGET"
sudo cp "$WEB_NGINX_SOURCE" "$WEB_NGINX_TARGET"

echo "🔗 Enabling Nginx sites..."
sudo ln -sfn "$API_NGINX_TARGET" "$NGINX_ENABLED/sentinel-api"
sudo ln -sfn "$WEB_NGINX_TARGET" "$NGINX_ENABLED/sentinel-web"

echo "🧪 Testing Nginx config..."
sudo nginx -t

echo "🔄 Reloading Nginx..."
sudo systemctl reload nginx

echo "🐳 Building and restarting Docker services..."
docker compose -f "$COMPOSE_FILE" up -d --build

echo "🧹 Cleaning unused Docker images..."
docker image prune -f

echo "✅ Deployment complete."