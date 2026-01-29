#!/bin/bash

# ============================================================================
# KAZI Database Backup Cron Script
#
# Setup: Add to crontab with: crontab -e
# Daily at 2 AM: 0 2 * * * /path/to/scripts/backup-cron.sh
# ============================================================================

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_FILE="$PROJECT_DIR/logs/backup.log"
RETENTION_DAYS=30

# Create logs directory if it doesn't exist
mkdir -p "$PROJECT_DIR/logs"

# Log function
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "=========================================="
log "Starting KAZI Database Backup"
log "=========================================="

# Load environment variables
if [ -f "$PROJECT_DIR/.env.production" ]; then
  source "$PROJECT_DIR/.env.production"
elif [ -f "$PROJECT_DIR/.env.local" ]; then
  source "$PROJECT_DIR/.env.local"
else
  log "ERROR: No environment file found"
  exit 1
fi

# Verify required variables
if [ -z "$SUPABASE_DB_URL" ] || [ -z "$AWS_S3_BUCKET" ]; then
  log "ERROR: Missing required environment variables (SUPABASE_DB_URL, AWS_S3_BUCKET)"
  exit 1
fi

# Run backup
log "Running backup script..."
if "$SCRIPT_DIR/backup.sh"; then
  log "Backup completed successfully"
else
  log "ERROR: Backup failed"

  # Send alert (configure webhook URL in .env)
  if [ -n "$ALERT_WEBHOOK_URL" ]; then
    curl -s -X POST "$ALERT_WEBHOOK_URL" \
      -H "Content-Type: application/json" \
      -d "{\"text\": \"KAZI Backup Failed at $(date)\"}" || true
  fi

  exit 1
fi

# Clean up old backups from S3 (keep last 30 days)
log "Cleaning up old backups (keeping last $RETENTION_DAYS days)..."
CUTOFF_DATE=$(date -d "$RETENTION_DAYS days ago" +%Y-%m-%d 2>/dev/null || date -v-${RETENTION_DAYS}d +%Y-%m-%d)

aws s3 ls "s3://$AWS_S3_BUCKET/kazi-backups/" 2>/dev/null | while read -r line; do
  FILE_DATE=$(echo "$line" | awk '{print $1}')
  FILE_NAME=$(echo "$line" | awk '{print $4}')

  if [[ "$FILE_DATE" < "$CUTOFF_DATE" ]]; then
    log "Deleting old backup: $FILE_NAME"
    aws s3 rm "s3://$AWS_S3_BUCKET/kazi-backups/$FILE_NAME" || true
  fi
done

log "Backup cron job completed"
log "=========================================="

# Rotate log file if too large (> 10MB)
if [ -f "$LOG_FILE" ]; then
  LOG_SIZE=$(stat -f%z "$LOG_FILE" 2>/dev/null || stat -c%s "$LOG_FILE" 2>/dev/null)
  if [ "$LOG_SIZE" -gt 10485760 ]; then
    mv "$LOG_FILE" "$LOG_FILE.old"
    log "Log file rotated"
  fi
fi
