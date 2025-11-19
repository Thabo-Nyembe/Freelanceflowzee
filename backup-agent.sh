#!/bin/bash

################################################################################
# KAZI Platform Backup Agent
# Automated daily backup system with version control and fallback capabilities
################################################################################

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_NAME="freeflow-app-9"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
DATE_ONLY=$(date +"%Y-%m-%d")

# Backup Directories
BACKUP_ROOT="${HOME}/kazi-backups"
LOCAL_BACKUP_DIR="${BACKUP_ROOT}/local"
GIT_BACKUP_DIR="${BACKUP_ROOT}/git-backups"
DAILY_BACKUP_DIR="${LOCAL_BACKUP_DIR}/daily"
WEEKLY_BACKUP_DIR="${LOCAL_BACKUP_DIR}/weekly"
MONTHLY_BACKUP_DIR="${LOCAL_BACKUP_DIR}/monthly"

# Retention Policy (days)
DAILY_RETENTION=7
WEEKLY_RETENTION=28
MONTHLY_RETENTION=365

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

################################################################################
# Logging Functions
################################################################################

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

################################################################################
# Setup Functions
################################################################################

setup_backup_directories() {
    log_info "Setting up backup directories..."

    mkdir -p "${DAILY_BACKUP_DIR}"
    mkdir -p "${WEEKLY_BACKUP_DIR}"
    mkdir -p "${MONTHLY_BACKUP_DIR}"
    mkdir -p "${GIT_BACKUP_DIR}"
    mkdir -p "${BACKUP_ROOT}/restore-points"
    mkdir -p "${BACKUP_ROOT}/logs"

    log_success "Backup directories created"
}

################################################################################
# Backup Functions
################################################################################

create_local_backup() {
    local backup_type=$1
    local backup_dir=$2
    local backup_name="${PROJECT_NAME}_${backup_type}_${TIMESTAMP}.tar.gz"
    local backup_path="${backup_dir}/${backup_name}"

    log_info "Creating ${backup_type} backup: ${backup_name}"

    # Create backup excluding unnecessary files
    tar -czf "${backup_path}" \
        --exclude='node_modules' \
        --exclude='.next' \
        --exclude='.git' \
        --exclude='*.log' \
        --exclude='kazi-backups' \
        --exclude='build' \
        --exclude='.vercel' \
        --exclude='dist' \
        -C "${SCRIPT_DIR}/.." \
        "${PROJECT_NAME}" \
        2>/dev/null || {
            log_error "Failed to create ${backup_type} backup"
            return 1
        }

    # Create metadata file
    cat > "${backup_path}.meta" <<EOF
{
  "backup_name": "${backup_name}",
  "backup_type": "${backup_type}",
  "timestamp": "${TIMESTAMP}",
  "date": "${DATE_ONLY}",
  "project": "${PROJECT_NAME}",
  "size": "$(du -h "${backup_path}" | cut -f1)",
  "git_commit": "$(cd "${SCRIPT_DIR}" && git rev-parse HEAD 2>/dev/null || echo 'N/A')",
  "git_branch": "$(cd "${SCRIPT_DIR}" && git branch --show-current 2>/dev/null || echo 'N/A')"
}
EOF

    log_success "${backup_type} backup created: ${backup_path}"
    echo "${backup_path}"
}

create_git_backup() {
    log_info "Creating git backup..."

    local git_backup_repo="${GIT_BACKUP_DIR}/${PROJECT_NAME}-backups.git"

    # Initialize git backup repo if it doesn't exist
    if [ ! -d "${git_backup_repo}" ]; then
        log_info "Initializing git backup repository..."
        mkdir -p "${git_backup_repo}"
        cd "${git_backup_repo}"
        git init --bare
        log_success "Git backup repository initialized"
    fi

    # Create a temporary working directory
    local temp_dir="${BACKUP_ROOT}/.temp-${TIMESTAMP}"
    mkdir -p "${temp_dir}"

    # Clone the backup repo
    cd "${temp_dir}"
    git clone "${git_backup_repo}" backup-repo 2>/dev/null || {
        log_warning "First backup - creating initial repository"
        mkdir -p backup-repo
        cd backup-repo
        git init
    }

    cd "${temp_dir}/backup-repo"

    # Copy current project state (excluding node_modules, .next, etc.)
    rsync -a --delete \
        --exclude='node_modules' \
        --exclude='.next' \
        --exclude='*.log' \
        --exclude='kazi-backups' \
        --exclude='build' \
        --exclude='.vercel' \
        --exclude='dist' \
        "${SCRIPT_DIR}/" \
        ./ \
        2>/dev/null

    # Create backup metadata
    cat > BACKUP_METADATA.json <<EOF
{
  "timestamp": "${TIMESTAMP}",
  "date": "${DATE_ONLY}",
  "backup_type": "git",
  "source_commit": "$(cd "${SCRIPT_DIR}" && git rev-parse HEAD 2>/dev/null || echo 'N/A')",
  "source_branch": "$(cd "${SCRIPT_DIR}" && git branch --show-current 2>/dev/null || echo 'N/A')"
}
EOF

    # Commit and push
    git add -A
    git commit -m "🔄 Automated backup: ${TIMESTAMP}" -m "Source commit: $(cd "${SCRIPT_DIR}" && git rev-parse HEAD 2>/dev/null || echo 'N/A')" 2>/dev/null || {
        log_warning "No changes to backup"
    }

    # Create tag for this backup
    git tag "backup-${TIMESTAMP}"

    # Push to backup repo
    git push origin main --tags 2>/dev/null || git push origin master --tags 2>/dev/null

    # Cleanup
    cd "${SCRIPT_DIR}"
    rm -rf "${temp_dir}"

    log_success "Git backup created with tag: backup-${TIMESTAMP}"
}

create_restore_point() {
    log_info "Creating restore point..."

    local restore_point_dir="${BACKUP_ROOT}/restore-points/${TIMESTAMP}"
    mkdir -p "${restore_point_dir}"

    # Create full backup
    tar -czf "${restore_point_dir}/full-backup.tar.gz" \
        --exclude='node_modules' \
        --exclude='.next' \
        --exclude='*.log' \
        --exclude='kazi-backups' \
        -C "${SCRIPT_DIR}/.." \
        "${PROJECT_NAME}"

    # Save git state
    cd "${SCRIPT_DIR}"
    git log --oneline -10 > "${restore_point_dir}/git-log.txt" 2>/dev/null || echo "No git history" > "${restore_point_dir}/git-log.txt"
    git status > "${restore_point_dir}/git-status.txt" 2>/dev/null || echo "No git status" > "${restore_point_dir}/git-status.txt"
    git diff HEAD > "${restore_point_dir}/git-diff.txt" 2>/dev/null || true

    # Save package.json versions
    cp package.json "${restore_point_dir}/package.json" 2>/dev/null || true
    cp package-lock.json "${restore_point_dir}/package-lock.json" 2>/dev/null || true

    # Create restore instructions
    cat > "${restore_point_dir}/RESTORE_INSTRUCTIONS.md" <<'INSTRUCTIONS'
# Restore Instructions

## Full Restore

```bash
# Extract backup
cd ~/kazi-backups/restore-points
tar -xzf full-backup.tar.gz -C /tmp/

# Move to desired location
mv /tmp/freeflow-app-9 ~/Documents/freeflow-app-9-restored

# Install dependencies
cd ~/Documents/freeflow-app-9-restored
npm install

# Restore environment
cp .env.example .env.local  # Then add your secrets
```

## Partial Restore

```bash
# Extract specific files
tar -xzf full-backup.tar.gz freeflow-app-9/app -C /tmp/
```

## Git State

See `git-log.txt` for commit history
See `git-status.txt` for repository state
See `git-diff.txt` for uncommitted changes

INSTRUCTIONS

    log_success "Restore point created: ${restore_point_dir}"
}

################################################################################
# Cleanup Functions
################################################################################

cleanup_old_backups() {
    log_info "Cleaning up old backups..."

    # Clean daily backups
    find "${DAILY_BACKUP_DIR}" -name "*.tar.gz" -mtime +${DAILY_RETENTION} -delete 2>/dev/null || true
    find "${DAILY_BACKUP_DIR}" -name "*.meta" -mtime +${DAILY_RETENTION} -delete 2>/dev/null || true

    # Clean weekly backups
    find "${WEEKLY_BACKUP_DIR}" -name "*.tar.gz" -mtime +${WEEKLY_RETENTION} -delete 2>/dev/null || true
    find "${WEEKLY_BACKUP_DIR}" -name "*.meta" -mtime +${WEEKLY_RETENTION} -delete 2>/dev/null || true

    # Clean monthly backups
    find "${MONTHLY_BACKUP_DIR}" -name "*.tar.gz" -mtime +${MONTHLY_RETENTION} -delete 2>/dev/null || true
    find "${MONTHLY_BACKUP_DIR}" -name "*.meta" -mtime +${MONTHLY_RETENTION} -delete 2>/dev/null || true

    # Keep only last 10 restore points
    ls -t "${BACKUP_ROOT}/restore-points" | tail -n +11 | xargs -I {} rm -rf "${BACKUP_ROOT}/restore-points/{}" 2>/dev/null || true

    log_success "Old backups cleaned up"
}

################################################################################
# Main Backup Function
################################################################################

run_backup() {
    local log_file="${BACKUP_ROOT}/logs/backup-${TIMESTAMP}.log"

    {
        echo "======================================"
        echo "KAZI Platform Backup - ${TIMESTAMP}"
        echo "======================================"
        echo ""

        setup_backup_directories

        # Daily backup
        create_local_backup "daily" "${DAILY_BACKUP_DIR}"

        # Weekly backup (on Sundays)
        if [ "$(date +%u)" -eq 7 ]; then
            log_info "Sunday - Creating weekly backup"
            create_local_backup "weekly" "${WEEKLY_BACKUP_DIR}"
        fi

        # Monthly backup (on 1st of month)
        if [ "$(date +%d)" -eq 1 ]; then
            log_info "First of month - Creating monthly backup"
            create_local_backup "monthly" "${MONTHLY_BACKUP_DIR}"
            create_restore_point
        fi

        # Git backup
        create_git_backup

        # Cleanup old backups
        cleanup_old_backups

        # Generate backup report
        generate_backup_report

        echo ""
        log_success "✅ All backups completed successfully!"
        echo ""

    } 2>&1 | tee "${log_file}"
}

################################################################################
# Reporting Functions
################################################################################

generate_backup_report() {
    log_info "Generating backup report..."

    local report_file="${BACKUP_ROOT}/BACKUP_REPORT.md"

    cat > "${report_file}" <<EOF
# KAZI Platform Backup Report

**Last Backup**: ${TIMESTAMP}
**Generated**: $(date)

---

## Backup Status

### Local Backups

**Daily Backups**:
- Location: \`${DAILY_BACKUP_DIR}\`
- Count: $(ls -1 "${DAILY_BACKUP_DIR}"/*.tar.gz 2>/dev/null | wc -l)
- Latest: $(ls -t "${DAILY_BACKUP_DIR}"/*.tar.gz 2>/dev/null | head -1 | xargs basename || echo "None")
- Retention: ${DAILY_RETENTION} days

**Weekly Backups**:
- Location: \`${WEEKLY_BACKUP_DIR}\`
- Count: $(ls -1 "${WEEKLY_BACKUP_DIR}"/*.tar.gz 2>/dev/null | wc -l)
- Latest: $(ls -t "${WEEKLY_BACKUP_DIR}"/*.tar.gz 2>/dev/null | head -1 | xargs basename || echo "None")
- Retention: ${WEEKLY_RETENTION} days

**Monthly Backups**:
- Location: \`${MONTHLY_BACKUP_DIR}\`
- Count: $(ls -1 "${MONTHLY_BACKUP_DIR}"/*.tar.gz 2>/dev/null | wc -l)
- Latest: $(ls -t "${MONTHLY_BACKUP_DIR}"/*.tar.gz 2>/dev/null | head -1 | xargs basename || echo "None")
- Retention: ${MONTHLY_RETENTION} days

### Git Backups

- Location: \`${GIT_BACKUP_DIR}\`
- Repository: \`${PROJECT_NAME}-backups.git\`
- Tags: $(cd "${GIT_BACKUP_DIR}/${PROJECT_NAME}-backups.git" && git tag | wc -l || echo "0")

### Restore Points

- Location: \`${BACKUP_ROOT}/restore-points\`
- Count: $(ls -1 "${BACKUP_ROOT}/restore-points" 2>/dev/null | wc -l)
- Latest: $(ls -t "${BACKUP_ROOT}/restore-points" 2>/dev/null | head -1 || echo "None")

---

## Disk Usage

\`\`\`
$(du -sh "${BACKUP_ROOT}" 2>/dev/null || echo "Unable to calculate")
\`\`\`

---

## Recent Backups

### Last 5 Daily Backups:
\`\`\`
$(ls -lht "${DAILY_BACKUP_DIR}"/*.tar.gz 2>/dev/null | head -5 || echo "No daily backups")
\`\`\`

### Last 3 Git Backup Tags:
\`\`\`
$(cd "${GIT_BACKUP_DIR}/${PROJECT_NAME}-backups.git" && git tag | tail -3 || echo "No git backups")
\`\`\`

---

## Quick Restore Commands

### Restore from latest daily backup:
\`\`\`bash
cd ~/kazi-backups/local/daily
tar -xzf \$(ls -t *.tar.gz | head -1) -C /tmp/
\`\`\`

### Restore from git backup (specific date):
\`\`\`bash
cd ~/kazi-backups/git-backups/${PROJECT_NAME}-backups.git
git clone . /tmp/restored-backup
cd /tmp/restored-backup
git checkout backup-YYYY-MM-DD_HH-MM-SS
\`\`\`

### Restore from restore point:
\`\`\`bash
cd ~/kazi-backups/restore-points
ls -lt  # Find desired restore point
cd <restore-point-directory>
cat RESTORE_INSTRUCTIONS.md
\`\`\`

---

*Generated by KAZI Backup Agent v1.0*
EOF

    log_success "Backup report generated: ${report_file}"
}

################################################################################
# Restore Functions
################################################################################

list_backups() {
    echo ""
    echo "========================================"
    echo "KAZI Platform - Available Backups"
    echo "========================================"
    echo ""

    echo "📁 DAILY BACKUPS (last 7 days):"
    ls -lht "${DAILY_BACKUP_DIR}"/*.tar.gz 2>/dev/null | head -7 || echo "  No daily backups found"
    echo ""

    echo "📁 WEEKLY BACKUPS:"
    ls -lht "${WEEKLY_BACKUP_DIR}"/*.tar.gz 2>/dev/null || echo "  No weekly backups found"
    echo ""

    echo "📁 MONTHLY BACKUPS:"
    ls -lht "${MONTHLY_BACKUP_DIR}"/*.tar.gz 2>/dev/null || echo "  No monthly backups found"
    echo ""

    echo "🏷️  GIT BACKUP TAGS:"
    cd "${GIT_BACKUP_DIR}/${PROJECT_NAME}-backups.git" 2>/dev/null && git tag | tail -10 || echo "  No git backups found"
    echo ""

    echo "💾 RESTORE POINTS:"
    ls -lt "${BACKUP_ROOT}/restore-points" 2>/dev/null | head -10 || echo "  No restore points found"
    echo ""
}

restore_from_backup() {
    local backup_file=$1
    local restore_dir="${HOME}/Documents/${PROJECT_NAME}-restored-${TIMESTAMP}"

    log_info "Restoring from: ${backup_file}"
    log_info "Restore location: ${restore_dir}"

    # Extract backup
    mkdir -p "${restore_dir}"
    tar -xzf "${backup_file}" -C "$(dirname "${restore_dir}")"

    # Rename to include timestamp
    mv "$(dirname "${restore_dir}")/${PROJECT_NAME}" "${restore_dir}"

    log_success "✅ Backup restored to: ${restore_dir}"
    log_info "Next steps:"
    echo "  1. cd ${restore_dir}"
    echo "  2. npm install"
    echo "  3. cp .env.example .env.local  # Add your secrets"
    echo "  4. npm run dev"
}

################################################################################
# Scheduler Setup
################################################################################

setup_daily_schedule() {
    log_info "Setting up daily backup schedule..."

    # Create LaunchAgent plist for macOS
    local plist_file="${HOME}/Library/LaunchAgents/com.kazi.backup.plist"

    cat > "${plist_file}" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.kazi.backup</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>${SCRIPT_DIR}/backup-agent.sh</string>
        <string>--auto</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>2</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>
    <key>StandardOutPath</key>
    <string>${BACKUP_ROOT}/logs/backup-stdout.log</string>
    <key>StandardErrorPath</key>
    <string>${BACKUP_ROOT}/logs/backup-stderr.log</string>
</dict>
</plist>
EOF

    # Load the LaunchAgent
    launchctl unload "${plist_file}" 2>/dev/null || true
    launchctl load "${plist_file}"

    log_success "✅ Daily backup scheduled for 2:00 AM"
    log_info "LaunchAgent created: ${plist_file}"

    # Create cron alternative script
    cat > "${SCRIPT_DIR}/setup-cron-backup.sh" <<'CRONSCRIPT'
#!/bin/bash
# Alternative: Setup via cron (if LaunchAgent doesn't work)
echo "Setting up cron job for daily backups..."
(crontab -l 2>/dev/null; echo "0 2 * * * $SCRIPT_DIR/backup-agent.sh --auto") | crontab -
echo "✅ Cron job created: Daily backup at 2:00 AM"
CRONSCRIPT

    chmod +x "${SCRIPT_DIR}/setup-cron-backup.sh"

    log_success "Backup scheduler configured successfully!"
}

################################################################################
# Main Entry Point
################################################################################

show_usage() {
    cat <<USAGE
KAZI Platform Backup Agent v1.0

Usage: $0 [OPTION]

Options:
    --auto              Run automated backup (used by scheduler)
    --backup            Create manual backup now
    --list              List all available backups
    --restore <file>    Restore from specific backup file
    --report            Generate and display backup report
    --setup             Setup daily backup schedule
    --help              Show this help message

Examples:
    $0 --backup                    # Create backup now
    $0 --list                      # List all backups
    $0 --restore ~/kazi-backups/local/daily/backup.tar.gz
    $0 --setup                     # Setup daily automated backups

USAGE
}

main() {
    case "${1:-}" in
        --auto|--backup)
            run_backup
            ;;
        --list)
            list_backups
            ;;
        --restore)
            if [ -z "${2:-}" ]; then
                log_error "Please specify backup file to restore"
                exit 1
            fi
            restore_from_backup "$2"
            ;;
        --report)
            generate_backup_report
            cat "${BACKUP_ROOT}/BACKUP_REPORT.md"
            ;;
        --setup)
            setup_daily_schedule
            ;;
        --help|*)
            show_usage
            ;;
    esac
}

# Run main function
main "$@"
