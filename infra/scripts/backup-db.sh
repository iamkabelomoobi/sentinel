#!/usr/bin/env bash

set -euo pipefail

APP_NAME="sentinel"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/$APP_NAME}"
DATE="$(date +%Y%m%d_%H%M%S)"

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-sentinel}"
DB_USER="${DB_USER:-moobi_kabelo}"

mkdir -p "$BACKUP_DIR"

BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${DATE}.dump"

echo "🗄️ Backing up database: $DB_NAME"
echo "📦 Output: $BACKUP_FILE"

pg_dump \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -F c \
  -b \
  -v \
  -f "$BACKUP_FILE" \
  "$DB_NAME"

gzip "$BACKUP_FILE"

echo "✅ Backup complete: ${BACKUP_FILE}.gz"