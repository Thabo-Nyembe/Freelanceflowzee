#!/bin/bash
#===============================================================================
# KAZI Production Deployment Script
# Version: 1.0.0
# Date: August 6, 2025
#
# Description: Comprehensive production deployment script for the KAZI platform
# with blue-green deployment, health checks, tutorial system activation,
# and performance monitoring.
#
# Usage: ./kazi-production-deployment.sh [options]
#
# Options:
#   --environment=<env>     Deployment environment (default: production)
#   --skip-tests            Skip running tests before deployment
#   --skip-backup           Skip database backup before deployment
#   --skip-tutorial         Skip tutorial system activation
#   --force                 Force deployment even if health checks fail
#   --dry-run               Simulate deployment without making changes
#   --verbose               Show detailed output
#   --help                  Show this help message
#===============================================================================

set -e

# ===== CONFIGURATION =====
# Default configuration values
APP_NAME="KAZI"
ENVIRONMENT="production"
DEPLOYMENT_ID=$(date +%Y%m%d%H%M%S)
CURRENT_DIR=$(pwd)
LOG_DIR="${CURRENT_DIR}/logs"
LOG_FILE="${LOG_DIR}/deployment-${DEPLOYMENT_ID}.log"
BACKUP_DIR="${CURRENT_DIR}/backups"
HEALTH_CHECK_RETRIES=5
HEALTH_CHECK_INTERVAL=10
ROLLBACK_ON_FAILURE=true
NOTIFY_ON_COMPLETION=true
SLACK_WEBHOOK_URL=${SLACK_WEBHOOK_URL:-""}
EMAIL_NOTIFICATIONS=${EMAIL_NOTIFICATIONS:-"admin@kazi.ai"}
SKIP_TESTS=false
SKIP_BACKUP=false
SKIP_TUTORIAL=false
FORCE_DEPLOY=false
DRY_RUN=false
VERBOSE=false

# Blue-green deployment settings
BLUE_PORT=9323
GREEN_PORT=9324
NGINX_CONF="/etc/nginx/sites-available/kazi"
CURRENT_LIVE="blue"
NEW_ENVIRONMENT="green"

# Database settings
DB_HOST=${DB_HOST:-"localhost"}
DB_NAME=${DB_NAME:-"kazi_production"}
DB_USER=${DB_USER:-"kazi_admin"}
DB_PASSWORD=${DB_PASSWORD:-""}
SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL:-""}
SUPABASE_KEY=${SUPABASE_SERVICE_ROLE_KEY:-""}

# Application settings
APP_URL=${NEXT_PUBLIC_APP_URL:-"https://app.kazi.ai"}
API_URL=${API_URL:-"https://api.kazi.ai"}
NODE_ENV="production"
NODE_OPTIONS="--max-old-space-size=4096"

# Tutorial system settings
TUTORIAL_SYSTEM_API_ENDPOINT="/api/tutorial-system/launch"
TUTORIAL_SYSTEM_COMPONENTS="tutorials,achievements,helpCenter,analytics"
TUTORIAL_SYSTEM_MODE="full"

# ===== PARSE COMMAND LINE ARGUMENTS =====
for arg in "$@"; do
  case $arg in
    --environment=*)
      ENVIRONMENT="${arg#*=}"
      shift
      ;;
    --skip-tests)
      SKIP_TESTS=true
      shift
      ;;
    --skip-backup)
      SKIP_BACKUP=true
      shift
      ;;
    --skip-tutorial)
      SKIP_TUTORIAL=true
      shift
      ;;
    --force)
      FORCE_DEPLOY=true
      shift
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --verbose)
      VERBOSE=true
      shift
      ;;
    --help)
      echo "KAZI Production Deployment Script"
      echo "Usage: ./kazi-production-deployment.sh [options]"
      echo ""
      echo "Options:"
      echo "  --environment=<env>     Deployment environment (default: production)"
      echo "  --skip-tests            Skip running tests before deployment"
      echo "  --skip-backup           Skip database backup before deployment"
      echo "  --skip-tutorial         Skip tutorial system activation"
      echo "  --force                 Force deployment even if health checks fail"
      echo "  --dry-run               Simulate deployment without making changes"
      echo "  --verbose               Show detailed output"
      echo "  --help                  Show this help message"
      exit 0
      ;;
    *)
      # Unknown option
      echo "Error: Unknown option '$arg'"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

# ===== UTILITY FUNCTIONS =====

# Logging function
log() {
  local level=$1
  local message=$2
  local timestamp=$(date "+%Y-%m-%d %H:%M:%S")
  
  # Create log directory if it doesn't exist
  mkdir -p "${LOG_DIR}"
  
  # Format the log message
  local formatted_message="[${timestamp}] [${level}] ${message}"
  
  # Write to log file
  echo "${formatted_message}" >> "${LOG_FILE}"
  
  # Output to console with color based on level
  if [[ "${level}" == "INFO" ]]; then
    echo -e "\033[0;34m${formatted_message}\033[0m"
  elif [[ "${level}" == "SUCCESS" ]]; then
    echo -e "\033[0;32m${formatted_message}\033[0m"
  elif [[ "${level}" == "WARNING" ]]; then
    echo -e "\033[0;33m${formatted_message}\033[0m"
  elif [[ "${level}" == "ERROR" ]]; then
    echo -e "\033[0;31m${formatted_message}\033[0m"
  else
    echo "${formatted_message}"
  fi
}

# Verbose logging function
vlog() {
  if [[ "${VERBOSE}" == true ]]; then
    log "DEBUG" "$1"
  fi
}

# Error handling function
handle_error() {
  local exit_code=$?
  local line_number=$1
  
  if [[ $exit_code -ne 0 ]]; then
    log "ERROR" "Error occurred at line ${line_number} with exit code ${exit_code}"
    
    if [[ "${ROLLBACK_ON_FAILURE}" == true && "${DRY_RUN}" == false ]]; then
      log "WARNING" "Initiating rollback procedure..."
      rollback
    fi
    
    send_notification "KAZI Deployment Failed" "Deployment failed at stage: ${CURRENT_STAGE}. Check logs for details."
    
    exit $exit_code
  fi
}

# Set up error trap
trap 'handle_error $LINENO' ERR

# Send notification function
send_notification() {
  local title=$1
  local message=$2
  
  if [[ "${NOTIFY_ON_COMPLETION}" == true ]]; then
    # Send Slack notification if webhook URL is configured
    if [[ -n "${SLACK_WEBHOOK_URL}" ]]; then
      vlog "Sending Slack notification: ${title}"
      
      if [[ "${DRY_RUN}" == false ]]; then
        curl -s -X POST -H 'Content-type: application/json' \
          --data "{\"text\":\"*${title}*\n${message}\"}" \
          "${SLACK_WEBHOOK_URL}" > /dev/null
      else
        vlog "[DRY RUN] Would send Slack notification: ${title}"
      fi
    fi
    
    # Send email notification if configured
    if [[ -n "${EMAIL_NOTIFICATIONS}" ]]; then
      vlog "Sending email notification to: ${EMAIL_NOTIFICATIONS}"
      
      if [[ "${DRY_RUN}" == false ]]; then
        echo "${message}" | mail -s "${title}" "${EMAIL_NOTIFICATIONS}"
      else
        vlog "[DRY RUN] Would send email notification: ${title}"
      fi
    fi
  fi
}

# Execute command with dry run support
execute() {
  local command=$1
  local description=$2
  
  vlog "Executing: ${command}"
  
  if [[ "${DRY_RUN}" == false ]]; then
    eval ${command}
    local exit_code=$?
    
    if [[ $exit_code -ne 0 ]]; then
      log "ERROR" "Command failed: ${description}"
      return $exit_code
    fi
  else
    log "DRY RUN" "Would execute: ${command}"
  fi
  
  return 0
}

# ===== DEPLOYMENT FUNCTIONS =====

# Initialize deployment
initialize() {
  CURRENT_STAGE="Initialization"
  log "INFO" "Starting ${APP_NAME} deployment to ${ENVIRONMENT} environment (ID: ${DEPLOYMENT_ID})"
  log "INFO" "Deployment mode: $(if [[ "${DRY_RUN}" == true ]]; then echo "DRY RUN"; else echo "LIVE"; fi)"
  
  # Create necessary directories
  mkdir -p "${LOG_DIR}"
  mkdir -p "${BACKUP_DIR}"
  
  # Check if we're in the correct directory
  if [[ ! -f "package.json" ]]; then
    log "ERROR" "Not in the project root directory. Please run this script from the project root."
    exit 1
  fi
  
  # Check for required environment variables
  if [[ -z "${SUPABASE_URL}" || -z "${SUPABASE_KEY}" ]]; then
    log "ERROR" "Required environment variables are missing. Please check SUPABASE_URL and SUPABASE_KEY."
    exit 1
  fi
  
  # Determine current live environment
  if [[ -f ".env.deployment" ]]; then
    source .env.deployment
    CURRENT_LIVE=${CURRENT_LIVE:-"blue"}
  fi
  
  # Set new environment
  if [[ "${CURRENT_LIVE}" == "blue" ]]; then
    NEW_ENVIRONMENT="green"
  else
    NEW_ENVIRONMENT="blue"
  fi
  
  NEW_PORT=$(if [[ "${NEW_ENVIRONMENT}" == "blue" ]]; then echo "${BLUE_PORT}"; else echo "${GREEN_PORT}"; fi)
  
  log "INFO" "Current live environment: ${CURRENT_LIVE}"
  log "INFO" "New deployment environment: ${NEW_ENVIRONMENT}"
  
  # Initialize metrics collection
  START_TIME=$(date +%s)
}

# Backup database
backup_database() {
  CURRENT_STAGE="Database Backup"
  
  if [[ "${SKIP_BACKUP}" == true ]]; then
    log "WARNING" "Database backup skipped as requested"
    return 0
  fi
  
  log "INFO" "Creating database backup..."
  
  local backup_file="${BACKUP_DIR}/kazi_db_backup_${DEPLOYMENT_ID}.sql"
  
  if [[ "${DRY_RUN}" == false ]]; then
    # Create backup directory if it doesn't exist
    mkdir -p "${BACKUP_DIR}"
    
    # Execute database backup
    if [[ -n "${SUPABASE_URL}" && -n "${SUPABASE_KEY}" ]]; then
      log "INFO" "Using Supabase for database backup"
      
      # Use Supabase CLI for backup if available
      if command -v supabase &> /dev/null; then
        execute "supabase db dump -f ${backup_file}" "Supabase database backup"
      else
        log "WARNING" "Supabase CLI not found, using pg_dump directly"
        execute "PGPASSWORD='${DB_PASSWORD}' pg_dump -h ${DB_HOST} -U ${DB_USER} -d ${DB_NAME} -f ${backup_file}" "PostgreSQL database backup"
      fi
    else
      # Fallback to direct PostgreSQL backup
      execute "PGPASSWORD='${DB_PASSWORD}' pg_dump -h ${DB_HOST} -U ${DB_USER} -d ${DB_NAME} -f ${backup_file}" "PostgreSQL database backup"
    fi
    
    # Verify backup file exists and has content
    if [[ -f "${backup_file}" && -s "${backup_file}" ]]; then
      log "SUCCESS" "Database backup created successfully: ${backup_file}"
    else
      log "ERROR" "Database backup failed or is empty"
      if [[ "${FORCE_DEPLOY}" != true ]]; then
        exit 1
      fi
    fi
  else
    log "DRY RUN" "Would create database backup: ${backup_file}"
  fi
}

# Run tests
run_tests() {
  CURRENT_STAGE="Testing"
  
  if [[ "${SKIP_TESTS}" == true ]]; then
    log "WARNING" "Tests skipped as requested"
    return 0
  fi
  
  log "INFO" "Running tests before deployment..."
  
  # Run different types of tests
  execute "npm run test" "Unit tests"
  log "SUCCESS" "Unit tests passed"
  
  execute "npm run test:integration" "Integration tests"
  log "SUCCESS" "Integration tests passed"
  
  execute "npm run test:e2e" "End-to-end tests"
  log "SUCCESS" "End-to-end tests passed"
  
  log "SUCCESS" "All tests passed successfully"
}

# Build application
build_application() {
  CURRENT_STAGE="Build"
  
  log "INFO" "Building application for ${ENVIRONMENT} environment..."
  
  # Create environment-specific .env file
  if [[ -f ".env.${ENVIRONMENT}" ]]; then
    execute "cp .env.${ENVIRONMENT} .env.local" "Setting up environment variables"
  else
    log "WARNING" "Environment file .env.${ENVIRONMENT} not found, using default .env"
    execute "cp .env .env.local" "Setting up default environment variables"
  fi
  
  # Add deployment-specific variables
  cat << EOF >> .env.local
# Deployment configuration
NODE_ENV=production
NEXT_PUBLIC_DEPLOYMENT_ID=${DEPLOYMENT_ID}
NEXT_PUBLIC_DEPLOYMENT_ENV=${NEW_ENVIRONMENT}
NEXT_PUBLIC_APP_PORT=${NEW_PORT}
EOF
  
  # Install dependencies
  execute "npm ci --production" "Installing dependencies"
  
  # Build the application
  execute "npm run build" "Building application"
  
  log "SUCCESS" "Application built successfully"
}

# Prepare new environment
prepare_environment() {
  CURRENT_STAGE="Environment Preparation"
  
  log "INFO" "Preparing ${NEW_ENVIRONMENT} environment..."
  
  # Create directory for the new environment if it doesn't exist
  local deploy_dir="/var/www/kazi/${NEW_ENVIRONMENT}"
  execute "mkdir -p ${deploy_dir}" "Creating deployment directory"
  
  # Copy build files to the new environment
  execute "rsync -av --delete .next ${deploy_dir}/" "Copying build files"
  execute "rsync -av --delete public ${deploy_dir}/" "Copying public assets"
  execute "rsync -av package.json package-lock.json .env.local ${deploy_dir}/" "Copying configuration files"
  
  # Copy deployment scripts
  execute "rsync -av scripts/production ${deploy_dir}/scripts/" "Copying production scripts"
  
  # Set up process manager configuration
  cat << EOF > "${deploy_dir}/ecosystem.config.js"
module.exports = {
  apps: [{
    name: 'kazi-${NEW_ENVIRONMENT}',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    watch: false,
    env: {
      PORT: ${NEW_PORT},
      NODE_ENV: 'production',
      DEPLOYMENT_ENV: '${NEW_ENVIRONMENT}'
    }
  }]
};
EOF
  
  log "SUCCESS" "Environment ${NEW_ENVIRONMENT} prepared successfully"
}

# Start new environment
start_new_environment() {
  CURRENT_STAGE="Environment Startup"
  
  log "INFO" "Starting application in ${NEW_ENVIRONMENT} environment..."
  
  local deploy_dir="/var/www/kazi/${NEW_ENVIRONMENT}"
  
  # Install dependencies in the deployment directory
  execute "cd ${deploy_dir} && npm ci --production" "Installing dependencies in deployment directory"
  
  # Start the application using PM2
  execute "cd ${deploy_dir} && pm2 start ecosystem.config.js" "Starting application with PM2"
  
  # Wait for the application to start
  log "INFO" "Waiting for application to start..."
  sleep 10
  
  log "SUCCESS" "Application started in ${NEW_ENVIRONMENT} environment on port ${NEW_PORT}"
}

# Run health checks
run_health_checks() {
  CURRENT_STAGE="Health Checks"
  
  log "INFO" "Running health checks on ${NEW_ENVIRONMENT} environment..."
  
  local health_endpoint="http://localhost:${NEW_PORT}/api/health"
  local retry_count=0
  local health_status=""
  
  while [[ $retry_count -lt $HEALTH_CHECK_RETRIES ]]; do
    log "INFO" "Health check attempt ${retry_count + 1}/${HEALTH_CHECK_RETRIES}..."
    
    if [[ "${DRY_RUN}" == false ]]; then
      health_status=$(curl -s -o /dev/null -w "%{http_code}" ${health_endpoint})
      
      if [[ "${health_status}" == "200" ]]; then
        log "SUCCESS" "Health check passed"
        
        # Additional checks
        # Check API endpoints
        local api_status=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:${NEW_PORT}/api/status")
        if [[ "${api_status}" != "200" ]]; then
          log "WARNING" "API status check failed with status ${api_status}"
        else
          log "SUCCESS" "API status check passed"
        fi
        
        # Check database connection
        local db_status=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:${NEW_PORT}/api/database/status")
        if [[ "${db_status}" != "200" ]]; then
          log "WARNING" "Database connection check failed with status ${db_status}"
        else
          log "SUCCESS" "Database connection check passed"
        fi
        
        return 0
      else
        log "WARNING" "Health check failed with status ${health_status}"
        retry_count=$((retry_count + 1))
        sleep ${HEALTH_CHECK_INTERVAL}
      fi
    else
      log "DRY RUN" "Would check health endpoint: ${health_endpoint}"
      return 0
    fi
  done
  
  log "ERROR" "Health checks failed after ${HEALTH_CHECK_RETRIES} attempts"
  
  if [[ "${FORCE_DEPLOY}" == true ]]; then
    log "WARNING" "Proceeding with deployment despite failed health checks (--force flag used)"
    return 0
  else
    return 1
  fi
}

# Switch traffic to new environment
switch_traffic() {
  CURRENT_STAGE="Traffic Switch"
  
  log "INFO" "Switching traffic to ${NEW_ENVIRONMENT} environment..."
  
  if [[ "${DRY_RUN}" == false ]]; then
    # Update Nginx configuration
    local nginx_conf_content=$(cat << EOF
server {
    listen 80;
    server_name app.kazi.ai;
    
    location / {
        proxy_pass http://localhost:${NEW_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
    )
    
    echo "${nginx_conf_content}" > "${NGINX_CONF}"
    
    # Test Nginx configuration
    execute "nginx -t" "Testing Nginx configuration"
    
    # Reload Nginx
    execute "systemctl reload nginx" "Reloading Nginx"
    
    # Update current live environment
    echo "CURRENT_LIVE=${NEW_ENVIRONMENT}" > .env.deployment
    
    log "SUCCESS" "Traffic successfully switched to ${NEW_ENVIRONMENT} environment"
  else
    log "DRY RUN" "Would switch traffic to ${NEW_ENVIRONMENT} environment"
  fi
}

# Activate tutorial system
activate_tutorial_system() {
  CURRENT_STAGE="Tutorial System Activation"
  
  if [[ "${SKIP_TUTORIAL}" == true ]]; then
    log "WARNING" "Tutorial system activation skipped as requested"
    return 0
  fi
  
  log "INFO" "Activating tutorial system..."
  
  local api_endpoint="${APP_URL}${TUTORIAL_SYSTEM_API_ENDPOINT}"
  local auth_token=$(cat .env.local | grep "ADMIN_API_TOKEN" | cut -d '=' -f2)
  
  if [[ -z "${auth_token}" ]]; then
    log "WARNING" "Admin API token not found, generating temporary token"
    auth_token="deployment-token-${DEPLOYMENT_ID}"
  fi
  
  local request_body=$(cat << EOF
{
  "mode": "${TUTORIAL_SYSTEM_MODE}",
  "components": {
    "tutorials": true,
    "achievements": true,
    "helpCenter": true,
    "analytics": true
  },
  "options": {
    "force": false,
    "verbose": ${VERBOSE},
    "notifyAdmins": true
  }
}
EOF
  )
  
  if [[ "${DRY_RUN}" == false ]]; then
    local response=$(curl -s -X POST \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer ${auth_token}" \
      -d "${request_body}" \
      "${api_endpoint}")
    
    local status=$(echo "${response}" | grep -o '"status":"[^"]*"' | cut -d '"' -f4)
    
    if [[ "${status}" == "success" || "${status}" == "partial" ]]; then
      log "SUCCESS" "Tutorial system activated with status: ${status}"
    else
      log "WARNING" "Tutorial system activation returned status: ${status}"
      log "WARNING" "Response: ${response}"
      
      if [[ "${FORCE_DEPLOY}" != true ]]; then
        log "ERROR" "Tutorial system activation failed"
        return 1
      fi
    fi
  else
    log "DRY RUN" "Would activate tutorial system with API endpoint: ${api_endpoint}"
  fi
  
  log "SUCCESS" "Tutorial system activation completed"
}

# Set up performance monitoring
setup_performance_monitoring() {
  CURRENT_STAGE="Performance Monitoring"
  
  log "INFO" "Setting up performance monitoring..."
  
  # Configure monitoring endpoints
  local monitoring_endpoints=(
    "/api/performance-monitoring/metrics"
    "/api/performance-monitoring/alerts"
    "/api/performance-monitoring/logs"
  )
  
  if [[ "${DRY_RUN}" == false ]]; then
    # Enable performance monitoring in environment
    cat << EOF >> .env.local
# Performance monitoring configuration
NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING=true
NEXT_PUBLIC_METRICS_INTERVAL=60000
NEXT_PUBLIC_ENABLE_ERROR_TRACKING=true
EOF
    
    # Copy updated environment to deployment directory
    execute "cp .env.local /var/www/kazi/${NEW_ENVIRONMENT}/.env.local" "Updating environment configuration"
    
    # Restart application to apply changes
    execute "cd /var/www/kazi/${NEW_ENVIRONMENT} && pm2 restart ecosystem.config.js" "Restarting application"
    
    # Wait for the application to restart
    log "INFO" "Waiting for application to restart..."
    sleep 10
    
    # Verify monitoring endpoints
    for endpoint in "${monitoring_endpoints[@]}"; do
      local status=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:${NEW_PORT}${endpoint}")
      
      if [[ "${status}" == "200" || "${status}" == "204" ]]; then
        log "SUCCESS" "Monitoring endpoint ${endpoint} is available"
      else
        log "WARNING" "Monitoring endpoint ${endpoint} returned status ${status}"
      fi
    done
  else
    log "DRY RUN" "Would set up performance monitoring with endpoints: ${monitoring_endpoints[*]}"
  fi
  
  log "SUCCESS" "Performance monitoring setup completed"
}

# Clean up old environment
cleanup_old_environment() {
  CURRENT_STAGE="Cleanup"
  
  log "INFO" "Cleaning up old environment (${CURRENT_LIVE})..."
  
  if [[ "${DRY_RUN}" == false ]]; then
    # Stop the old environment
    execute "pm2 stop kazi-${CURRENT_LIVE}" "Stopping old environment"
    
    # Keep the old environment files for potential rollback
    log "INFO" "Old environment files preserved for potential rollback"
  else
    log "DRY RUN" "Would clean up old environment: ${CURRENT_LIVE}"
  fi
  
  log "SUCCESS" "Cleanup completed"
}

# Rollback function
rollback() {
  CURRENT_STAGE="Rollback"
  
  log "WARNING" "Initiating rollback procedure..."
  
  if [[ "${DRY_RUN}" == false ]]; then
    # Switch traffic back to the old environment
    local old_port=$(if [[ "${CURRENT_LIVE}" == "blue" ]]; then echo "${BLUE_PORT}"; else echo "${GREEN_PORT}"; fi)
    
    # Update Nginx configuration
    local nginx_conf_content=$(cat << EOF
server {
    listen 80;
    server_name app.kazi.ai;
    
    location / {
        proxy_pass http://localhost:${old_port};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
    )
    
    echo "${nginx_conf_content}" > "${NGINX_CONF}"
    
    # Test and reload Nginx
    nginx -t && systemctl reload nginx
    
    # Start the old environment if it was stopped
    pm2 start kazi-${CURRENT_LIVE} || true
    
    # Keep the current live setting
    echo "CURRENT_LIVE=${CURRENT_LIVE}" > .env.deployment
    
    log "WARNING" "Rollback completed. Traffic switched back to ${CURRENT_LIVE} environment."
    
    send_notification "KAZI Deployment Rollback" "Deployment was rolled back due to errors. The application is now running on the previous ${CURRENT_LIVE} environment."
  else
    log "DRY RUN" "Would perform rollback to ${CURRENT_LIVE} environment"
  fi
}

# Finalize deployment
finalize() {
  CURRENT_STAGE="Finalization"
  
  # Calculate deployment duration
  END_TIME=$(date +%s)
  DURATION=$((END_TIME - START_TIME))
  
  log "INFO" "Deployment completed in ${DURATION} seconds"
  
  # Create deployment summary
  local summary="Deployment Summary:
- Deployment ID: ${DEPLOYMENT_ID}
- Environment: ${ENVIRONMENT}
- Active environment: ${NEW_ENVIRONMENT}
- Port: ${NEW_PORT}
- Duration: ${DURATION} seconds
- Status: Success"
  
  log "INFO" "${summary}"
  
  # Save deployment info
  if [[ "${DRY_RUN}" == false ]]; then
    cat << EOF > "deployment-${DEPLOYMENT_ID}.json"
{
  "id": "${DEPLOYMENT_ID}",
  "environment": "${ENVIRONMENT}",
  "activeEnvironment": "${NEW_ENVIRONMENT}",
  "port": ${NEW_PORT},
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "duration": ${DURATION},
  "status": "success"
}
EOF
  fi
  
  # Send completion notification
  send_notification "KAZI Deployment Successful" "Deployment ${DEPLOYMENT_ID} to ${ENVIRONMENT} completed successfully in ${DURATION} seconds."
  
  log "SUCCESS" "Deployment ${DEPLOYMENT_ID} completed successfully!"
}

# ===== MAIN EXECUTION =====

# Main deployment process
main() {
  # Initialize deployment
  initialize
  
  # Backup database
  backup_database
  
  # Run tests
  run_tests
  
  # Build application
  build_application
  
  # Prepare new environment
  prepare_environment
  
  # Start new environment
  start_new_environment
  
  # Run health checks
  run_health_checks
  
  # Switch traffic to new environment
  switch_traffic
  
  # Activate tutorial system
  activate_tutorial_system
  
  # Set up performance monitoring
  setup_performance_monitoring
  
  # Clean up old environment
  cleanup_old_environment
  
  # Finalize deployment
  finalize
}

# Start deployment
main
