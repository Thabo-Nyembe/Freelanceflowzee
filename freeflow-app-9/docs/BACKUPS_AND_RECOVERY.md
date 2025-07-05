# Backup and Disaster Recovery Plan

This document outlines the backup system for the FreeFlow application and provides a step-by-step guide for disaster recovery.

## 1. Backup Strategy

Our backup strategy is two-fold, covering both the application database and the video storage.

### 1.1. Database Backups

- **Method**: Automated daily logical backups using `pg_dump`.
- **Workflow**: A GitHub Actions workflow, located at `.github/workflows/backup.yml`, runs on a schedule.
- **Script**: The workflow executes the `scripts/backup.sh` script.
- **Storage**: Compressed SQL backups are stored in a private AWS S3 bucket under the `database-backups/` path.
- **Frequency**: Backups are performed daily at 3:00 AM UTC.
- **Retention**: It is recommended to configure an S3 lifecycle policy on the bucket to automatically delete backups older than a specified period (e.g., 90 days) to manage storage costs.

### 1.2. Video File Storage Backups (Supabase Storage)

- **Method**: Cross-region replication of the Supabase Storage S3 bucket.
- **Responsibility**: This configuration must be done manually within your cloud provider's console (AWS, etc.). Supabase does not currently offer automated backup exports for Storage.
- **Recommendation**:
  1. Create a new, private S3 bucket in a different region to serve as the backup destination.
  2. In the S3 console for the primary Supabase Storage bucket, set up a replication rule to copy all objects to your backup bucket.
  3. Ensure the replication rule includes versioning to protect against accidental deletions.

## 2. Initial Setup and Configuration

For the automated database backup to function, you **must** configure the following secrets in your GitHub repository (`Settings > Secrets and variables > Actions`):

- `SUPABASE_DB_URL`: The full connection string for your Supabase database. Found in `Project Settings > Database`.
- `AWS_S3_BUCKET`: The name of the S3 bucket where backups will be stored.
- `AWS_ACCESS_KEY_ID`: An AWS access key with write permissions to the specified S3 bucket.
- `AWS_SECRET_ACCESS_KEY`: The corresponding secret key.
- `AWS_REGION`: The AWS region where your S3 bucket is located (e.g., `us-east-1`).

**It is critical that you create a dedicated IAM user in AWS with minimal, programmatic-only permissions (e.g., `PutObject`) for the backup bucket to enhance security.**

## 3. Disaster Recovery Procedures

### 3.1. Database Restore

In the event of database corruption or data loss, follow these steps:

1.  **Pause the Application**: Put the application into maintenance mode to prevent new data from being written.
2.  **Download the Backup**: Access your S3 bucket and download the latest successful backup file (e.g., `db-backup-YYYY-MM-DD_HH-MM-SS.sql.gz`).
3.  **Decompress the Backup**:
    ```bash
    gunzip db-backup-YYYY-MM-DD_HH-M-SS.sql.gz
    ```
4.  **Restore the Database**: Use `psql` to restore the database. You will need your Supabase database URL.
    > **Warning**: This is a destructive operation and will overwrite your existing database.
    ```bash
    psql "$SUPABASE_DB_URL" < db-backup-YYYY-MM-DD_HH-MM-SS.sql
    ```
5.  **Verify Data**: Log in to your application and the Supabase dashboard to verify that the data has been restored correctly.
6.  **Resume Application**: Disable maintenance mode.

### 3.2. Video File Restore (from S3 Replication)

If video files are deleted from Supabase Storage, they can be restored from your replicated S3 bucket.

1.  **Identify Missing Files**: Determine which video files need to be restored.
2.  **Copy Files Back**: Use the AWS CLI to copy the files from your backup bucket back to the Supabase Storage bucket.
    ```bash
    aws s3 sync s3://<your-backup-bucket>/<path> s3://<supabase-storage-bucket>/<path>
    ```
3.  **Verify Access**: Check in the application that the restored videos are now playable.

### 3.3. Mux Asset Recovery

If a video asset is accidentally deleted from Mux, but the original file still exists in Supabase Storage, you can re-process it. This would require a new application feature:
1.  A UI action (e.g., "Re-process video") would trigger an API call.
2.  The backend would re-initiate the Mux upload and processing workflow using the original video file from Supabase Storage.
3.  The `mux_asset_id` and `mux_playback_id` for the video record in the database would be updated upon completion. 