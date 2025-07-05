#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status.

# --- Configuration ---
FILENAME="db-backup-$(date +%Y-%m-%d_%H-%M-%S).sql.gz"
BACKUP_DIR="/tmp"
FULL_PATH="$BACKUP_DIR/$FILENAME"
S3_PATH="s3://$AWS_S3_BUCKET/database-backups/$FILENAME"

# --- Validate Environment Variables ---
if [ -z "$SUPABASE_DB_URL" ] || [ -z "$AWS_S3_BUCKET" ] || [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ] || [ -z "$AWS_REGION" ]; then
    echo "Error: One or more required environment variables are not set."
    echo "Please configure SUPABASE_DB_URL, AWS_S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_REGION."
    exit 1
fi

echo "Starting database backup..."

# --- Dump the database ---
# Using --clean will add DROP statements, making restores easier.
# Using --if-exists will prevent errors if objects don't exist during restore.
# We are excluding schema-only details for extensions and internal supabase schemas.
pg_dump \
    --clean \
    --if-exists \
    --quote-all-identifiers \
    --exclude-schema='extensions' \
    --exclude-schema='graphql' \
    --exclude-schema='graphql_public' \
    --exclude-schema='pgaudit' \
    --exclude-schema='pgrst' \
    --exclude-schema='realtime' \
    --exclude-schema='storage' \
    --exclude-schema='supabase_functions' \
    --exclude-schema='supabase_migrations' \
    "$SUPABASE_DB_URL" | gzip > "$FULL_PATH"

echo "Database dump created and compressed at $FULL_PATH"

# --- Install AWS CLI ---
# The runner image should have it, but this is a safeguard.
if ! command -v aws &> /dev/null
then
    echo "AWS CLI not found, installing..."
    pip install awscli
fi

# --- Upload to S3 ---
echo "Uploading backup to S3 at $S3_PATH..."

aws s3 cp "$FULL_PATH" "$S3_PATH" --region "$AWS_REGION"

echo "Backup successfully uploaded to S3."

# --- Cleanup ---
rm "$FULL_PATH"
echo "Local backup file cleaned up."

echo "Backup process completed." 