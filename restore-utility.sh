#!/bin/bash

################################################################################
# KAZI Platform Restore Utility
# Interactive restore tool with version control and fallback
################################################################################

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_ROOT="${HOME}/kazi-backups"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

################################################################################
# Display Functions
################################################################################

show_header() {
    clear
    echo -e "${CYAN}"
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║                                                                ║"
    echo "║           KAZI Platform Restore Utility v1.0                   ║"
    echo "║                                                                ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
}

show_menu() {
    echo -e "${GREEN}Available Options:${NC}"
    echo ""
    echo "  1. 📋 List all backups"
    echo "  2. 🔍 Search backups by date"
    echo "  3. 📦 Restore from daily backup"
    echo "  4. 📦 Restore from weekly backup"
    echo "  5. 📦 Restore from monthly backup"
    echo "  6. 🏷️  Restore from git tag"
    echo "  7. 💾 Restore from restore point"
    echo "  8. 🔄 Quick restore (latest backup)"
    echo "  9. 📊 View backup report"
    echo "  0. ❌ Exit"
    echo ""
}

################################################################################
# Listing Functions
################################################################################

list_all_backups() {
    show_header
    echo -e "${YELLOW}📁 All Available Backups${NC}"
    echo "════════════════════════════════════════════════════════════════"
    echo ""

    echo -e "${BLUE}DAILY BACKUPS:${NC}"
    if ls "${BACKUP_ROOT}/local/daily"/*.tar.gz 1>/dev/null 2>&1; then
        ls -lht "${BACKUP_ROOT}/local/daily"/*.tar.gz | head -10 | nl
    else
        echo "  No daily backups found"
    fi
    echo ""

    echo -e "${BLUE}WEEKLY BACKUPS:${NC}"
    if ls "${BACKUP_ROOT}/local/weekly"/*.tar.gz 1>/dev/null 2>&1; then
        ls -lht "${BACKUP_ROOT}/local/weekly"/*.tar.gz | nl
    else
        echo "  No weekly backups found"
    fi
    echo ""

    echo -e "${BLUE}MONTHLY BACKUPS:${NC}"
    if ls "${BACKUP_ROOT}/local/monthly"/*.tar.gz 1>/dev/null 2>&1; then
        ls -lht "${BACKUP_ROOT}/local/monthly"/*.tar.gz | nl
    else
        echo "  No monthly backups found"
    fi
    echo ""

    read -p "Press Enter to continue..."
}

search_backups_by_date() {
    show_header
    echo -e "${YELLOW}🔍 Search Backups by Date${NC}"
    echo "════════════════════════════════════════════════════════════════"
    echo ""

    read -p "Enter date (YYYY-MM-DD): " search_date

    echo ""
    echo -e "${GREEN}Results for ${search_date}:${NC}"
    echo ""

    find "${BACKUP_ROOT}/local" -name "*${search_date}*.tar.gz" -exec ls -lh {} \; | nl

    echo ""
    read -p "Press Enter to continue..."
}

################################################################################
# Restore Functions
################################################################################

restore_from_daily() {
    show_header
    echo -e "${YELLOW}📦 Restore from Daily Backup${NC}"
    echo "════════════════════════════════════════════════════════════════"
    echo ""

    if ! ls "${BACKUP_ROOT}/local/daily"/*.tar.gz 1>/dev/null 2>&1; then
        echo -e "${RED}No daily backups found${NC}"
        read -p "Press Enter to continue..."
        return
    fi

    echo "Available daily backups:"
    echo ""
    ls -lht "${BACKUP_ROOT}/local/daily"/*.tar.gz | head -10 | nl
    echo ""

    read -p "Enter backup number to restore (or 'c' to cancel): " backup_num

    if [ "$backup_num" = "c" ]; then
        return
    fi

    local backup_file=$(ls -t "${BACKUP_ROOT}/local/daily"/*.tar.gz | sed -n "${backup_num}p")

    if [ -z "$backup_file" ]; then
        echo -e "${RED}Invalid selection${NC}"
        read -p "Press Enter to continue..."
        return
    fi

    perform_restore "$backup_file"
}

restore_from_git_tag() {
    show_header
    echo -e "${YELLOW}🏷️  Restore from Git Tag${NC}"
    echo "════════════════════════════════════════════════════════════════"
    echo ""

    local git_repo="${BACKUP_ROOT}/git-backups/freeflow-app-9-backups.git"

    if [ ! -d "$git_repo" ]; then
        echo -e "${RED}No git backups found${NC}"
        read -p "Press Enter to continue..."
        return
    fi

    echo "Available git backup tags:"
    echo ""
    cd "$git_repo"
    git tag | tail -20 | nl
    echo ""

    read -p "Enter tag number to restore (or 'c' to cancel): " tag_num

    if [ "$tag_num" = "c" ]; then
        return
    fi

    local tag_name=$(git tag | tail -20 | sed -n "${tag_num}p")

    if [ -z "$tag_name" ]; then
        echo -e "${RED}Invalid selection${NC}"
        read -p "Press Enter to continue..."
        return
    fi

    perform_git_restore "$tag_name"
}

quick_restore() {
    show_header
    echo -e "${YELLOW}🔄 Quick Restore (Latest Backup)${NC}"
    echo "════════════════════════════════════════════════════════════════"
    echo ""

    local latest_backup=$(ls -t "${BACKUP_ROOT}/local/daily"/*.tar.gz 2>/dev/null | head -1)

    if [ -z "$latest_backup" ]; then
        echo -e "${RED}No backups found${NC}"
        read -p "Press Enter to continue..."
        return
    fi

    echo "Latest backup found:"
    echo ""
    ls -lh "$latest_backup"
    echo ""

    read -p "Restore this backup? (y/n): " confirm

    if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
        perform_restore "$latest_backup"
    fi
}

perform_restore() {
    local backup_file=$1
    local timestamp=$(date +"%Y-%m-%d_%H-%M-%S")
    local restore_dir="${HOME}/Documents/freeflow-app-9-restored-${timestamp}"

    echo ""
    echo -e "${GREEN}Starting restore...${NC}"
    echo ""
    echo "Backup file: ${backup_file}"
    echo "Restore location: ${restore_dir}"
    echo ""

    read -p "Continue? (y/n): " confirm

    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
        echo "Restore cancelled"
        read -p "Press Enter to continue..."
        return
    fi

    echo ""
    echo -e "${BLUE}Extracting backup...${NC}"

    # Extract backup
    tar -xzf "${backup_file}" -C "$(dirname "${restore_dir}")"

    # Rename to include timestamp
    mv "$(dirname "${restore_dir}")/freeflow-app-9" "${restore_dir}"

    echo ""
    echo -e "${GREEN}✅ Restore completed successfully!${NC}"
    echo ""
    echo "Location: ${restore_dir}"
    echo ""
    echo "Next steps:"
    echo "  1. cd ${restore_dir}"
    echo "  2. npm install"
    echo "  3. cp .env.example .env.local"
    echo "  4. Edit .env.local with your secrets"
    echo "  5. npm run dev"
    echo ""

    read -p "Press Enter to continue..."
}

perform_git_restore() {
    local tag_name=$1
    local timestamp=$(date +"%Y-%m-%d_%H-%M-%S")
    local restore_dir="${HOME}/Documents/freeflow-app-9-restored-${timestamp}"
    local git_repo="${BACKUP_ROOT}/git-backups/freeflow-app-9-backups.git"

    echo ""
    echo -e "${GREEN}Starting git restore...${NC}"
    echo ""
    echo "Git tag: ${tag_name}"
    echo "Restore location: ${restore_dir}"
    echo ""

    read -p "Continue? (y/n): " confirm

    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
        echo "Restore cancelled"
        read -p "Press Enter to continue..."
        return
    fi

    echo ""
    echo -e "${BLUE}Cloning from git backup...${NC}"

    # Clone and checkout tag
    git clone "${git_repo}" "${restore_dir}"
    cd "${restore_dir}"
    git checkout "${tag_name}"

    echo ""
    echo -e "${GREEN}✅ Git restore completed successfully!${NC}"
    echo ""
    echo "Location: ${restore_dir}"
    echo ""
    echo "Next steps:"
    echo "  1. cd ${restore_dir}"
    echo "  2. npm install"
    echo "  3. cp .env.example .env.local"
    echo "  4. Edit .env.local with your secrets"
    echo "  5. npm run dev"
    echo ""

    read -p "Press Enter to continue..."
}

view_backup_report() {
    show_header
    echo -e "${YELLOW}📊 Backup Report${NC}"
    echo "════════════════════════════════════════════════════════════════"
    echo ""

    if [ -f "${BACKUP_ROOT}/BACKUP_REPORT.md" ]; then
        cat "${BACKUP_ROOT}/BACKUP_REPORT.md"
    else
        echo -e "${RED}No backup report found${NC}"
        echo "Run a backup first to generate a report"
    fi

    echo ""
    read -p "Press Enter to continue..."
}

################################################################################
# Main Menu Loop
################################################################################

main_menu() {
    while true; do
        show_header
        show_menu

        read -p "Select option: " choice

        case $choice in
            1) list_all_backups ;;
            2) search_backups_by_date ;;
            3) restore_from_daily ;;
            4) restore_from_daily ;;  # Can be customized for weekly
            5) restore_from_daily ;;  # Can be customized for monthly
            6) restore_from_git_tag ;;
            7) restore_from_daily ;;  # Can be customized for restore points
            8) quick_restore ;;
            9) view_backup_report ;;
            0)
                echo ""
                echo -e "${GREEN}Goodbye!${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}Invalid option${NC}"
                sleep 1
                ;;
        esac
    done
}

################################################################################
# Entry Point
################################################################################

# Check if backup directory exists
if [ ! -d "${BACKUP_ROOT}" ]; then
    echo -e "${RED}Backup directory not found!${NC}"
    echo ""
    echo "Please run the backup agent first:"
    echo "  ./backup-agent.sh --backup"
    exit 1
fi

# Start main menu
main_menu
