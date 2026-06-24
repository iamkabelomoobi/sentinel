#!/usr/bin/env bash

set -euo pipefail

APP_NAME="sentinel"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# Domains
DOMAIN_API="api.sentinel.bbbsoftware.co.za"
DOMAIN_WEB="app.sentinel.bbbsoftware.co.za"
LETSENCRYPT_EMAIL="giftmoobi@gmail.com"

# Nginx
NGINX_AVAILABLE="/etc/nginx/sites-available"
NGINX_ENABLED="/etc/nginx/sites-enabled"

API_NGINX_SOURCE="$ROOT_DIR/infra/nginx/api.conf"
WEB_NGINX_SOURCE="$ROOT_DIR/infra/nginx/web.conf"

API_NGINX_TARGET="$NGINX_AVAILABLE/sentinel-api"
WEB_NGINX_TARGET="$NGINX_AVAILABLE/sentinel-web"

# Docker
COMPOSE_FILE="$ROOT_DIR/infra/docker/docker-compose.prod.yml"

echo "🚀 Deploying $APP_NAME..."

echo "📦 Installing Nginx configs..."
sudo cp "$API_NGINX_SOURCE" "$API_NGINX_TARGET"
sudo cp "$WEB_NGINX_SOURCE" "$WEB_NGINX_TARGET"

echo "🔗 Enabling Nginx sites..."
sudo rm -f "$NGINX_ENABLED/sentinel-api"
sudo rm -f "$NGINX_ENABLED/sentinel-web"

sudo ln -s "$API_NGINX_TARGET" "$NGINX_ENABLED/sentinel-api"
sudo ln -s "$WEB_NGINX_TARGET" "$NGINX_ENABLED/sentinel-web"

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

echo "🐳 Building and starting Docker services..."
docker compose -f "$COMPOSE_FILE" up -d --build

echo "🧹 Cleaning unused Docker images..."
docker image prune -f

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Deployment complete"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 Web: https://$DOMAIN_WEB"
echo "🚀 API: https://$DOMAIN_API"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"