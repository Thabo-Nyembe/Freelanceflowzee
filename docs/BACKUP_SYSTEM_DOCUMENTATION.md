# KAZI Platform Backup & Restore System

**Version**: 1.0
**Created**: November 19, 2025
**Status**: ✅ Active

---

## Overview

Comprehensive automated backup system with version control, daily backups, and fallback capabilities for the KAZI platform.

### Features

- ✅ **Daily Automated Backups** - Runs at 2:00 AM every day
- ✅ **Weekly Backups** - Every Sunday
- ✅ **Monthly Backups** - First day of each month
- ✅ **Git Version Control** - Full git history backup
- ✅ **Restore Points** - Critical snapshots with metadata
- ✅ **Retention Policy** - Automatic cleanup of old backups
- ✅ **Interactive Restore** - User-friendly restore utility
- ✅ **Fallback System** - Multiple restore options
- ✅ **Comprehensive Reporting** - Detailed backup reports

---

## Quick Start

### 1. Initial Setup

```bash
# Setup daily automated backups
./backup-agent.sh --setup

# Create first backup
./backup-agent.sh --backup
```

### 2. Verify Backup

```bash
# View backup report
./backup-agent.sh --report

# List all backups
./backup-agent.sh --list
```

### 3. Test Restore

```bash
# Interactive restore utility
./restore-utility.sh

# Or quick restore from latest backup
./backup-agent.sh --restore ~/kazi-backups/local/daily/<latest-backup>.tar.gz
```

---

## System Architecture

### Backup Structure

```
~/kazi-backups/
├── local/
│   ├── daily/          # Daily backups (7-day retention)
│   ├── weekly/         # Weekly backups (28-day retention)
│   └── monthly/        # Monthly backups (365-day retention)
├── git-backups/        # Git repository backups
│   └── freeflow-app-9-backups.git/
├── restore-points/     # Critical snapshots (keep 10)
│   └── YYYY-MM-DD_HH-MM-SS/
│       ├── full-backup.tar.gz
│       ├── git-log.txt
│       ├── git-status.txt
│       ├── git-diff.txt
│       ├── package.json
│       └── RESTORE_INSTRUCTIONS.md
├── logs/               # Backup logs
│   └── backup-YYYY-MM-DD_HH-MM-SS.log
└── BACKUP_REPORT.md    # Current backup status
```

### What Gets Backed Up

✅ **Included**:
- All source code (app/, components/, lib/, etc.)
- Configuration files (.env.example, package.json, etc.)
- Documentation (docs/, README.md, etc.)
- Git history (.git/)
- Custom scripts

❌ **Excluded**:
- node_modules/
- .next/
- build/
- dist/
- .vercel/
- *.log files
- kazi-backups/ (prevents recursive backup)

---

## Backup Agent Commands

### Setup & Configuration

```bash
# Setup daily automated backups (2:00 AM)
./backup-agent.sh --setup
```

### Manual Backup

```bash
# Create backup now
./backup-agent.sh --backup

# Same as automated backup
./backup-agent.sh --auto
```

### Listing Backups

```bash
# List all available backups
./backup-agent.sh --list
```

### Restore

```bash
# Restore from specific backup file
./backup-agent.sh --restore <path-to-backup-file>

# Example:
./backup-agent.sh --restore ~/kazi-backups/local/daily/freeflow-app-9_daily_2025-11-19_14-30-00.tar.gz
```

### Reporting

```bash
# Generate and view backup report
./backup-agent.sh --report
```

### Help

```bash
# Show usage information
./backup-agent.sh --help
```

---

## Restore Utility

### Interactive Mode

```bash
# Launch interactive restore utility
./restore-utility.sh
```

### Menu Options

1. **List all backups** - View all available backups
2. **Search backups by date** - Find backups from specific date
3. **Restore from daily backup** - Choose from daily backups
4. **Restore from weekly backup** - Choose from weekly backups
5. **Restore from monthly backup** - Choose from monthly backups
6. **Restore from git tag** - Restore from specific git backup
7. **Restore from restore point** - Use critical snapshots
8. **Quick restore** - Restore from latest backup immediately
9. **View backup report** - See backup statistics

---

## Retention Policy

### Daily Backups
- **Frequency**: Every day at 2:00 AM
- **Retention**: 7 days
- **Auto-cleanup**: Yes

### Weekly Backups
- **Frequency**: Every Sunday at 2:00 AM
- **Retention**: 28 days (4 weeks)
- **Auto-cleanup**: Yes

### Monthly Backups
- **Frequency**: 1st of each month at 2:00 AM
- **Retention**: 365 days (1 year)
- **Auto-cleanup**: Yes

### Git Backups
- **Frequency**: Every backup run
- **Retention**: Unlimited (tags preserved)
- **Auto-cleanup**: No

### Restore Points
- **Frequency**: Monthly (with monthly backup)
- **Retention**: Last 10 restore points
- **Auto-cleanup**: Yes

---

## Restore Procedures

### Quick Restore (Latest Backup)

```bash
# Method 1: Using restore utility
./restore-utility.sh
# Select option 8

# Method 2: Using backup agent
cd ~/kazi-backups/local/daily
tar -xzf $(ls -t *.tar.gz | head -1) -C /tmp/
mv /tmp/freeflow-app-9 ~/Documents/freeflow-app-9-restored
cd ~/Documents/freeflow-app-9-restored
npm install
```

### Restore from Specific Date

```bash
# List backups
./backup-agent.sh --list

# Restore specific backup
./backup-agent.sh --restore ~/kazi-backups/local/daily/freeflow-app-9_daily_2025-11-15_02-00-00.tar.gz
```

### Restore from Git Backup

```bash
# Clone git backup repository
git clone ~/kazi-backups/git-backups/freeflow-app-9-backups.git ~/Documents/freeflow-app-9-restored

# Checkout specific backup
cd ~/Documents/freeflow-app-9-restored
git tag  # List all backup tags
git checkout backup-2025-11-15_02-00-00

# Install dependencies
npm install
```

### Restore from Restore Point

```bash
# Go to restore points directory
cd ~/kazi-backups/restore-points

# List available restore points
ls -lt

# Enter desired restore point
cd 2025-11-01_02-00-00

# Read restore instructions
cat RESTORE_INSTRUCTIONS.md

# Extract backup
tar -xzf full-backup.tar.gz -C /tmp/
mv /tmp/freeflow-app-9 ~/Documents/freeflow-app-9-restored
```

### Partial Restore (Specific Files)

```bash
# Extract specific directory
tar -xzf backup.tar.gz freeflow-app-9/app -C /tmp/

# Extract specific file
tar -xzf backup.tar.gz freeflow-app-9/package.json -C /tmp/
```

---

## Scheduled Backups

### macOS LaunchAgent

Backups are scheduled using macOS LaunchAgent:

**Location**: `~/Library/LaunchAgents/com.kazi.backup.plist`

**Schedule**: Daily at 2:00 AM

**Logs**:
- stdout: `~/kazi-backups/logs/backup-stdout.log`
- stderr: `~/kazi-backups/logs/backup-stderr.log`

### Manual Scheduler Control

```bash
# Check if scheduler is loaded
launchctl list | grep com.kazi.backup

# Unload scheduler
launchctl unload ~/Library/LaunchAgents/com.kazi.backup.plist

# Reload scheduler
launchctl load ~/Library/LaunchAgents/com.kazi.backup.plist

# Run backup immediately (bypass schedule)
./backup-agent.sh --backup
```

### Alternative: Cron Setup

If LaunchAgent doesn't work:

```bash
# Setup cron job
./setup-cron-backup.sh

# Or manually add to crontab
crontab -e

# Add this line:
# 0 2 * * * /Users/thabonyembe/Documents/freeflow-app-9/backup-agent.sh --auto
```

---

## Monitoring & Maintenance

### Check Backup Status

```bash
# View latest backup report
cat ~/kazi-backups/BACKUP_REPORT.md

# View recent backup logs
ls -lt ~/kazi-backups/logs/

# View latest log
tail -100 ~/kazi-backups/logs/$(ls -t ~/kazi-backups/logs/ | head -1)
```

### Check Disk Usage

```bash
# Total backup size
du -sh ~/kazi-backups

# Size by category
du -sh ~/kazi-backups/local/daily
du -sh ~/kazi-backups/local/weekly
du -sh ~/kazi-backups/local/monthly
du -sh ~/kazi-backups/git-backups
```

### Manual Cleanup

```bash
# Clean old daily backups (older than 7 days)
find ~/kazi-backups/local/daily -name "*.tar.gz" -mtime +7 -delete

# Clean old weekly backups (older than 28 days)
find ~/kazi-backups/local/weekly -name "*.tar.gz" -mtime +28 -delete

# Remove specific backup
rm ~/kazi-backups/local/daily/old-backup.tar.gz
rm ~/kazi-backups/local/daily/old-backup.tar.gz.meta
```

---

## Troubleshooting

### Backup Not Running

```bash
# Check LaunchAgent status
launchctl list | grep com.kazi.backup

# Check logs
tail ~/kazi-backups/logs/backup-stderr.log

# Run manually to see errors
./backup-agent.sh --backup
```

### Restore Fails

```bash
# Check backup integrity
tar -tzf backup-file.tar.gz | head

# Try extracting to different location
tar -xzf backup-file.tar.gz -C /tmp/test-restore/

# Check available disk space
df -h ~/Documents
```

### Git Backup Issues

```bash
# Check git backup repository
cd ~/kazi-backups/git-backups/freeflow-app-9-backups.git
git fsck

# Verify tags
git tag | tail -10

# Re-initialize if corrupt
rm -rf ~/kazi-backups/git-backups/freeflow-app-9-backups.git
./backup-agent.sh --backup
```

---

## Best Practices

### Before Major Changes

```bash
# Create manual backup before risky operations
./backup-agent.sh --backup

# Verify backup was created
./backup-agent.sh --list
```

### Regular Testing

```bash
# Test restore monthly
./restore-utility.sh
# Select quick restore option

# Verify restored app works
cd ~/Documents/freeflow-app-9-restored-*
npm install
npm run dev
```

### Offsite Backups

```bash
# Copy git backups to external drive
cp -r ~/kazi-backups/git-backups /Volumes/ExternalDrive/kazi-backups/

# Sync to cloud storage (Dropbox, Google Drive, etc.)
cp -r ~/kazi-backups/local/monthly ~/Dropbox/kazi-backups/
```

---

## Recovery Scenarios

### Complete System Failure

1. **Restore from latest backup**:
   ```bash
   cd ~/kazi-backups/local/daily
   tar -xzf $(ls -t *.tar.gz | head -1) -C ~/Documents/
   ```

2. **Install dependencies**:
   ```bash
   cd ~/Documents/freeflow-app-9
   npm install
   ```

3. **Restore environment variables**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with actual secrets
   ```

4. **Verify and run**:
   ```bash
   npm run dev
   ```

### Accidental Deletion

1. **Find backup from before deletion**:
   ```bash
   ./backup-agent.sh --list
   # Note the timestamp before deletion
   ```

2. **Restore specific files**:
   ```bash
   tar -xzf backup.tar.gz freeflow-app-9/path/to/deleted/files -C /tmp/
   cp -r /tmp/freeflow-app-9/path/to/deleted/files ./path/to/
   ```

### Code Regression

1. **Use git backups**:
   ```bash
   git clone ~/kazi-backups/git-backups/freeflow-app-9-backups.git /tmp/check-backup
   cd /tmp/check-backup
   git tag  # Find backup before regression
   git checkout backup-2025-11-15_02-00-00
   # Review code
   ```

2. **Cherry-pick fixes**:
   ```bash
   # Copy specific fixes from backup to current code
   ```

---

## Security Considerations

### Backup Contents

- ❌ Backups do **NOT** include `.env.local` (secrets)
- ✅ Backups **DO** include `.env.example` (template)
- ⚠️ After restore, manually recreate `.env.local`

### Backup Permissions

```bash
# Ensure backups are only readable by you
chmod 700 ~/kazi-backups
chmod 600 ~/kazi-backups/local/*/*.tar.gz
```

### Secure Deletion

```bash
# Securely delete old backups
srm -r ~/kazi-backups/local/daily/old-backup.tar.gz  # macOS
# or
shred -u ~/kazi-backups/local/daily/old-backup.tar.gz  # Linux
```

---

## Performance Tips

### Faster Backups

```bash
# Use parallel compression (if installed)
brew install pigz
# Modify backup-agent.sh to use pigz instead of gzip
```

### Reduced Backup Size

- Ensure node_modules is excluded
- Clear .next build cache before backup
- Remove unnecessary log files

### Faster Restores

```bash
# Extract to SSD location
tar -xzf backup.tar.gz -C /tmp/  # Fast temp location

# Then move to final location
mv /tmp/freeflow-app-9 ~/Documents/
```

---

## Support & Maintenance

### Update Backup Agent

```bash
# Backup current version
cp backup-agent.sh backup-agent.sh.backup

# Download/update new version
# Edit backup-agent.sh

# Test new version
./backup-agent.sh --backup

# If successful, update scheduler
./backup-agent.sh --setup
```

### Backup Configuration

Edit `backup-agent.sh` to customize:

- Backup retention days
- Backup schedule (in LaunchAgent plist)
- Excluded directories
- Backup locations

---

## FAQ

**Q: How much disk space do backups use?**
A: Approximately 500MB-1GB per backup (excludes node_modules)

**Q: Can I backup to external drive?**
A: Yes, modify `BACKUP_ROOT` in backup-agent.sh

**Q: How do I restore environment variables?**
A: Copy .env.example to .env.local and add your actual secrets

**Q: What if backup fails?**
A: Check logs in ~/kazi-backups/logs/ for error details

**Q: Can I run backups more frequently?**
A: Yes, edit the LaunchAgent plist StartCalendarInterval

**Q: How do I backup to cloud storage?**
A: Use rsync or cp to sync ~/kazi-backups to Dropbox/Google Drive

**Q: What if I lose both local and git backups?**
A: Keep offsite backups on external drive or cloud storage

---

## Appendix

### File Locations

- Backup Agent: `./backup-agent.sh`
- Restore Utility: `./restore-utility.sh`
- Backups Directory: `~/kazi-backups/`
- LaunchAgent: `~/Library/LaunchAgents/com.kazi.backup.plist`
- Logs: `~/kazi-backups/logs/`

### Useful Commands

```bash
# Quick status check
./backup-agent.sh --report

# Emergency backup
./backup-agent.sh --backup && echo "Backup complete!"

# Latest backup info
ls -lh ~/kazi-backups/local/daily/*.tar.gz | head -1

# Backup count
ls ~/kazi-backups/local/daily/*.tar.gz | wc -l
```

---

*Documentation Version: 1.0*
*Last Updated: November 19, 2025*
*Status: ✅ Active and Tested*
