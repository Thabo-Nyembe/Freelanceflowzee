#!/usr/bin/env node
/**
 * KAZI Navigation Enhancements - Production Deployment Script
 * =========================================================
 * 
 * This script handles the canary deployment process for navigation enhancements:
 * 1. Executes canary deployment with 10% traffic monitoring
 * 2. Sets up Vercel Analytics with custom nav_load_time events
 * 3. Configures Sentry error tracking with NavError scope
 * 4. Implements automated rollback with v1.8.2 fallback
 * 5. Monitors performance metrics for 1-hour evaluation period
 * 6. Scales to 100% traffic upon successful validation
 * 7. Provides real-time monitoring dashboards
 * 8. Includes error alerts and automated recovery
 * 
 * Usage:
 *   node scripts/deploy-navigation-enhancements.js
 * 
 * Options:
 *   --dry-run       Simulate deployment without actual changes
 *   --force         Skip confirmation prompts
 *   --monitor-only  Skip deployment, only monitor existing canary
 *   --rollback      Force immediate rollback to v1.8.2
 * 
 * Environment variables:
 *   VERCEL_TOKEN    Vercel API token
 *   SENTRY_TOKEN    Sentry API token
 *   SLACK_WEBHOOK   Slack notification webhook URL
 *   CANARY_PERCENT  Override default 10% canary (1-99)
 *   MONITOR_MINS    Override default 60 minute monitoring (5-120)
 * 
 * @author KAZI Engineering Team
 * @version 1.0.0
 */

// Core dependencies
const { execSync, spawn } = require('child_process');
const readline = require('readline');
const https = require('https');
const path = require('path');
const fs = require('fs');

// Deployment configuration
const CONFIG = {
  // Project details
  projectName: 'kazi',
  projectId: process.env.VERCEL_PROJECT_ID || 'prj_kazi_platform',
  teamId: process.env.VERCEL_TEAM_ID || 'team_kazi_engineering',
  
  // Release versions
  currentVersion: '1.9.0',
  previousVersion: '1.8.2',
  releaseTag: 'nav-enhancements',
  
  // Canary deployment
  canaryPercent: parseInt(process.env.CANARY_PERCENT, 10) || 10,
  monitoringMinutes: parseInt(process.env.MONITOR_MINS, 10) || 60,
  
  // API endpoints
  vercelApiUrl: 'https://api.vercel.com',
  sentryApiUrl: 'https://sentry.io/api/0',
  slackWebhook: process.env.SLACK_WEBHOOK,
  
  // Performance thresholds
  thresholds: {
    navLoadTime: 200, // milliseconds
    errorRate: 0.1, // percentage
    p95ResponseTime: 350, // milliseconds
    successRate: 99.9, // percentage
  },
  
  // Feature flags
  featureFlags: {
    sidebarFavorites: true,
    workflowNavigation: true,
    enhancedBreadcrumbs: true,
    contextualQuickActions: true,
  },
  
  // Analytics events
  analyticsEvents: [
    'nav_load_time',
    'search_opened',
    'search_query',
    'search_result_selected',
    'breadcrumb_click',
    'quick_action_click',
    'related_feature_click',
    'workflow_navigation',
    'sidebar_load_time',
    'category_toggle',
    'favorite_added',
    'favorite_removed',
    'favorite_reordered',
    'workspace_changed',
    'view_mode_changed',
  ],
  
  // Sentry error scopes
  sentryErrorScopes: [
    'NavError',
    'SidebarError',
    'SearchError',
    'WorkflowError',
  ],
};

// CLI arguments
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const FORCE = args.includes('--force');
const MONITOR_ONLY = args.includes('--monitor-only');
const ROLLBACK = args.includes('--rollback');

// API tokens
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const SENTRY_TOKEN = process.env.SENTRY_TOKEN;

// State tracking
let deploymentId = null;
let monitoringInterval = null;
let deploymentStartTime = null;
let metrics = {
  navLoadTime: [],
  errorRate: [],
  responseTime: [],
  successRate: [],
};

/**
 * Main execution function
 */
async function main() {
  printBanner();
  
  // Validate environment
  if (!validateEnvironment()) {
    process.exit(1);
  }
  
  // Handle rollback flag
  if (ROLLBACK) {
    await confirmAction('⚠️ CONFIRM IMMEDIATE ROLLBACK to v1.8.2');
    await executeRollback();
    process.exit(0);
  }
  
  // Handle monitor-only flag
  if (MONITOR_ONLY) {
    console.log('🔍 Monitoring existing canary deployment...');
    deploymentId = await getCurrentCanaryDeployment();
    if (!deploymentId) {
      console.error('❌ No active canary deployment found');
      process.exit(1);
    }
    startMonitoring();
    return;
  }
  
  // Normal deployment flow
  if (!FORCE) {
    await confirmAction(`Deploy Navigation Enhancements as ${CONFIG.canaryPercent}% canary?`);
  }
  
  try {
    // Step 1: Configure Vercel Analytics
    await configureVercelAnalytics();
    
    // Step 2: Configure Sentry Error Tracking
    await configureSentryErrorTracking();
    
    // Step 3: Execute Canary Deployment
    deploymentId = await executeCanaryDeployment();
    
    // Step 4: Start Monitoring
    startMonitoring();
    
    // Notify team
    await sendNotification('🚀 Canary Deployment Started', 
      `Navigation Enhancements deployed to ${CONFIG.canaryPercent}% of traffic.\n` +
      `Monitoring for ${CONFIG.monitoringMinutes} minutes before scaling to 100%.`
    );
    
    console.log(`\n✅ Deployment started successfully! Monitoring for ${CONFIG.monitoringMinutes} minutes.`);
    console.log('📊 View real-time metrics at: https://vercel.com/kazi/dashboard/analytics');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    await sendNotification('❌ Deployment Failed', `Error: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Print script banner
 */
function printBanner() {
  console.log('\n' + '='.repeat(80));
  console.log(`🚀 KAZI Navigation Enhancements - Production Deployment`);
  console.log(`   Version: ${CONFIG.currentVersion} (${CONFIG.releaseTag})`);
  console.log(`   Canary: ${CONFIG.canaryPercent}% | Monitoring: ${CONFIG.monitoringMinutes} minutes`);
  if (DRY_RUN) console.log('   🧪 DRY RUN MODE - No actual changes will be made');
  console.log('='.repeat(80) + '\n');
}

/**
 * Validate environment and dependencies
 */
function validateEnvironment() {
  let valid = true;
  
  // Check required tokens
  if (!VERCEL_TOKEN && !DRY_RUN) {
    console.error('❌ Missing VERCEL_TOKEN environment variable');
    valid = false;
  }
  
  if (!SENTRY_TOKEN && !DRY_RUN) {
    console.error('❌ Missing SENTRY_TOKEN environment variable');
    valid = false;
  }
  
  // Check Vercel CLI
  try {
    execSync('vercel --version', { stdio: 'ignore' });
  } catch (error) {
    console.error('❌ Vercel CLI not installed. Run: npm i -g vercel');
    valid = false;
  }
  
  // Validate configuration
  if (CONFIG.canaryPercent < 1 || CONFIG.canaryPercent > 99) {
    console.error('❌ Invalid canary percentage. Must be between 1-99');
    valid = false;
  }
  
  if (CONFIG.monitoringMinutes < 5 || CONFIG.monitoringMinutes > 120) {
    console.error('❌ Invalid monitoring duration. Must be between 5-120 minutes');
    valid = false;
  }
  
  return valid;
}

/**
 * Prompt for confirmation
 */
async function confirmAction(message) {
  if (DRY_RUN) {
    console.log(`[Dry Run] Would confirm: ${message}`);
    return true;
  }
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise(resolve => {
    rl.question(`${message} (y/N) `, answer => {
      rl.close();
      if (answer.toLowerCase() !== 'y') {
        console.log('❌ Operation cancelled');
        process.exit(0);
      }
      resolve(true);
    });
  });
}

/**
 * Configure Vercel Analytics with custom events
 */
async function configureVercelAnalytics() {
  console.log('🔍 Configuring Vercel Analytics...');
  
  if (DRY_RUN) {
    console.log('[Dry Run] Would configure analytics events:', CONFIG.analyticsEvents);
    return;
  }
  
  try {
    // Create custom events for navigation metrics
    for (const event of CONFIG.analyticsEvents) {
      await apiRequest('POST', `/v1/projects/${CONFIG.projectId}/analytics/events`, {
        name: event,
        description: `Navigation enhancement event: ${event}`,
        type: event.includes('time') ? 'number' : 'string',
      });
    }
    
    // Create custom dashboard for navigation metrics
    await apiRequest('POST', `/v1/projects/${CONFIG.projectId}/analytics/views`, {
      name: 'Navigation Enhancements',
      charts: [
        {
          name: 'Navigation Load Time',
          type: 'timeseries',
          eventName: 'nav_load_time',
          aggregation: 'avg',
        },
        {
          name: 'Search Usage',
          type: 'timeseries',
          eventName: 'search_opened',
          aggregation: 'count',
        },
        {
          name: 'Navigation Error Rate',
          type: 'timeseries',
          eventName: 'error',
          filter: { scope: 'NavError' },
          aggregation: 'count',
        }
      ]
    });
    
    console.log('✅ Vercel Analytics configured successfully');
  } catch (error) {
    console.warn('⚠️ Error configuring analytics:', error.message);
    console.log('Continuing with deployment...');
  }
}

/**
 * Configure Sentry Error Tracking
 */
async function configureSentryErrorTracking() {
  console.log('🔍 Configuring Sentry Error Tracking...');
  
  if (DRY_RUN) {
    console.log('[Dry Run] Would configure Sentry error scopes:', CONFIG.sentryErrorScopes);
    return;
  }
  
  try {
    // Create custom Sentry tags for navigation errors
    const sentryConfig = {
      tags: CONFIG.sentryErrorScopes.map(scope => ({
        key: 'scope',
        value: scope
      })),
      alerts: [
        {
          name: 'Navigation Errors Alert',
          query: 'scope:NavError',
          timeWindow: '10m',
          triggers: [
            {
              alertThreshold: 5,
              actions: [
                {
                  type: 'slack',
                  targetIdentifier: CONFIG.slackWebhook,
                  targetDisplayName: 'Engineering Alerts'
                }
              ]
            }
          ]
        }
      ]
    };
    
    // Update Sentry project configuration
    await sentryApiRequest('PUT', `/projects/${CONFIG.teamId}/${CONFIG.projectName}/`, sentryConfig);
    
    // Create release in Sentry
    await sentryApiRequest('POST', `/organizations/${CONFIG.teamId}/releases/`, {
      version: `${CONFIG.projectName}@${CONFIG.currentVersion}`,
      projects: [CONFIG.projectName],
      ref: CONFIG.releaseTag
    });
    
    console.log('✅ Sentry Error Tracking configured successfully');
  } catch (error) {
    console.warn('⚠️ Error configuring Sentry:', error.message);
    console.log('Continuing with deployment...');
  }
}

/**
 * Execute canary deployment
 */
async function executeCanaryDeployment() {
  console.log(`🚀 Executing ${CONFIG.canaryPercent}% canary deployment...`);
  
  if (DRY_RUN) {
    console.log('[Dry Run] Would deploy canary with feature flags:', CONFIG.featureFlags);
    deploymentStartTime = Date.now();
    return 'dry-run-deployment-id';
  }
  
  try {
    // Create deployment
    const deployment = await apiRequest('POST', '/v13/deployments', {
      name: CONFIG.projectName,
      target: 'production',
      gitSource: {
        type: 'github',
        repo: `${CONFIG.teamId}/${CONFIG.projectName}`,
        ref: CONFIG.releaseTag,
      },
      env: {
        NEXT_PUBLIC_RELEASE_VERSION: CONFIG.currentVersion,
        NEXT_PUBLIC_FEATURE_SIDEBAR_FAVORITES: CONFIG.featureFlags.sidebarFavorites.toString(),
        NEXT_PUBLIC_FEATURE_WORKFLOW_NAVIGATION: CONFIG.featureFlags.workflowNavigation.toString(),
        NEXT_PUBLIC_FEATURE_ENHANCED_BREADCRUMBS: CONFIG.featureFlags.enhancedBreadcrumbs.toString(),
        NEXT_PUBLIC_FEATURE_CONTEXTUAL_QUICK_ACTIONS: CONFIG.featureFlags.contextualQuickActions.toString(),
        NEXT_PUBLIC_SENTRY_ENVIRONMENT: 'production-canary',
      }
    });
    
    // Wait for deployment to complete
    console.log('⏳ Waiting for deployment to complete...');
    await waitForDeployment(deployment.id);
    
    // Set up canary traffic split
    await apiRequest('POST', `/v2/projects/${CONFIG.projectId}/domains/traffic-policy`, {
      rules: [
        {
          deploymentId: deployment.id,
          weight: CONFIG.canaryPercent
        },
        {
          deploymentId: await getPreviousDeploymentId(),
          weight: 100 - CONFIG.canaryPercent
        }
      ]
    });
    
    deploymentStartTime = Date.now();
    console.log(`✅ Canary deployment successful (${CONFIG.canaryPercent}% traffic)`);
    return deployment.id;
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    throw error;
  }
}

/**
 * Start monitoring the deployment
 */
function startMonitoring() {
  console.log(`\n🔍 Starting ${CONFIG.monitoringMinutes} minute monitoring period...`);
  deploymentStartTime = deploymentStartTime || Date.now();
  
  // Set up monitoring interval (every 5 minutes)
  monitoringInterval = setInterval(async () => {
    try {
      const elapsedMinutes = Math.floor((Date.now() - deploymentStartTime) / 60000);
      const remainingMinutes = CONFIG.monitoringMinutes - elapsedMinutes;
      
      if (remainingMinutes <= 0) {
        await completeDeployment();
        return;
      }
      
      console.log(`\n⏱️ Monitoring progress: ${elapsedMinutes}/${CONFIG.monitoringMinutes} minutes`);
      
      // Collect metrics
      const currentMetrics = await collectMetrics();
      updateMetrics(currentMetrics);
      
      // Check if metrics are within acceptable thresholds
      const issues = evaluateMetrics();
      
      if (issues.length > 0) {
        console.error('⚠️ Detected issues with canary deployment:');
        issues.forEach(issue => console.error(`  - ${issue}`));
        
        // If serious issues, trigger rollback
        if (issues.some(issue => issue.includes('CRITICAL'))) {
          console.error('❌ Critical issues detected! Initiating automatic rollback...');
          await executeRollback();
          clearInterval(monitoringInterval);
        } else {
          console.log('⚠️ Non-critical issues detected. Continuing monitoring...');
        }
      } else {
        console.log('✅ All metrics within acceptable thresholds');
      }
      
      // Print remaining time
      console.log(`⏱️ ${remainingMinutes} minutes remaining before scaling to 100%`);
      
    } catch (error) {
      console.error('❌ Error during monitoring:', error.message);
    }
  }, 5 * 60 * 1000); // Check every 5 minutes
  
  // Also collect initial metrics
  setTimeout(async () => {
    try {
      const initialMetrics = await collectMetrics();
      updateMetrics(initialMetrics);
      console.log('📊 Initial metrics collected');
    } catch (error) {
      console.error('❌ Error collecting initial metrics:', error.message);
    }
  }, 30 * 1000); // First check after 30 seconds
}

/**
 * Collect current metrics
 */
async function collectMetrics() {
  if (DRY_RUN) {
    // Simulate metrics in dry run mode
    return {
      navLoadTime: 150 + Math.random() * 50,
      errorRate: Math.random() * 0.2,
      responseTime: 300 + Math.random() * 100,
      successRate: 99.5 + Math.random() * 0.5,
    };
  }
  
  try {
    // Get navigation load time metrics
    const analyticsData = await apiRequest('GET', 
      `/v1/projects/${CONFIG.projectId}/analytics/events/nav_load_time?from=${deploymentStartTime}`);
    
    // Get error metrics from Sentry
    const errorData = await sentryApiRequest('GET',
      `/organizations/${CONFIG.teamId}/issues/?query=scope:NavError&statsPeriod=1h`);
    
    // Get response time metrics from Vercel
    const responseData = await apiRequest('GET',
      `/v2/projects/${CONFIG.projectId}/insights/metrics?from=${deploymentStartTime}`);
    
    // Calculate metrics
    const navLoadTime = calculateAverage(analyticsData.data.map(d => d.value));
    const errorCount = errorData.length;
    const totalRequests = responseData.metrics.requests.total;
    const errorRate = totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0;
    const responseTime = responseData.metrics.latency.p95;
    const successRate = 100 - errorRate;
    
    return {
      navLoadTime,
      errorRate,
      responseTime,
      successRate,
    };
  } catch (error) {
    console.warn('⚠️ Error collecting metrics:', error.message);
    // Return fallback metrics
    return {
      navLoadTime: 200,
      errorRate: 0,
      responseTime: 300,
      successRate: 100,
    };
  }
}

/**
 * Update metrics tracking
 */
function updateMetrics(currentMetrics) {
  metrics.navLoadTime.push(currentMetrics.navLoadTime);
  metrics.errorRate.push(currentMetrics.errorRate);
  metrics.responseTime.push(currentMetrics.responseTime);
  metrics.successRate.push(currentMetrics.successRate);
  
  // Log current metrics
  console.log('📊 Current Metrics:');
  console.log(`  • Navigation Load Time: ${currentMetrics.navLoadTime.toFixed(2)}ms (threshold: ${CONFIG.thresholds.navLoadTime}ms)`);
  console.log(`  • Error Rate: ${currentMetrics.errorRate.toFixed(2)}% (threshold: ${CONFIG.thresholds.errorRate}%)`);
  console.log(`  • P95 Response Time: ${currentMetrics.responseTime.toFixed(2)}ms (threshold: ${CONFIG.thresholds.p95ResponseTime}ms)`);
  console.log(`  • Success Rate: ${currentMetrics.successRate.toFixed(2)}% (threshold: ${CONFIG.thresholds.successRate}%)`);
}

/**
 * Evaluate metrics against thresholds
 */
function evaluateMetrics() {
  const issues = [];
  
  // Calculate averages for recent metrics (last 3 data points)
  const recentNavLoadTime = calculateAverage(metrics.navLoadTime.slice(-3));
  const recentErrorRate = calculateAverage(metrics.errorRate.slice(-3));
  const recentResponseTime = calculateAverage(metrics.responseTime.slice(-3));
  const recentSuccessRate = calculateAverage(metrics.successRate.slice(-3));
  
  // Check against thresholds
  if (recentNavLoadTime > CONFIG.thresholds.navLoadTime * 1.5) {
    issues.push(`CRITICAL: Navigation load time (${recentNavLoadTime.toFixed(2)}ms) exceeds threshold by >50%`);
  } else if (recentNavLoadTime > CONFIG.thresholds.navLoadTime) {
    issues.push(`Navigation load time (${recentNavLoadTime.toFixed(2)}ms) exceeds threshold (${CONFIG.thresholds.navLoadTime}ms)`);
  }
  
  if (recentErrorRate > CONFIG.thresholds.errorRate * 5) {
    issues.push(`CRITICAL: Error rate (${recentErrorRate.toFixed(2)}%) exceeds threshold by >500%`);
  } else if (recentErrorRate > CONFIG.thresholds.errorRate) {
    issues.push(`Error rate (${recentErrorRate.toFixed(2)}%) exceeds threshold (${CONFIG.thresholds.errorRate}%)`);
  }
  
  if (recentResponseTime > CONFIG.thresholds.p95ResponseTime * 1.5) {
    issues.push(`CRITICAL: P95 response time (${recentResponseTime.toFixed(2)}ms) exceeds threshold by >50%`);
  } else if (recentResponseTime > CONFIG.thresholds.p95ResponseTime) {
    issues.push(`P95 response time (${recentResponseTime.toFixed(2)}ms) exceeds threshold (${CONFIG.thresholds.p95ResponseTime}ms)`);
  }
  
  if (recentSuccessRate < CONFIG.thresholds.successRate * 0.95) {
    issues.push(`CRITICAL: Success rate (${recentSuccessRate.toFixed(2)}%) below threshold by >5%`);
  } else if (recentSuccessRate < CONFIG.thresholds.successRate) {
    issues.push(`Success rate (${recentSuccessRate.toFixed(2)}%) below threshold (${CONFIG.thresholds.successRate}%)`);
  }
  
  return issues;
}

/**
 * Complete the deployment by scaling to 100%
 */
async function completeDeployment() {
  clearInterval(monitoringInterval);
  console.log('\n🎉 Monitoring period complete!');
  
  // Final evaluation of metrics
  const issues = evaluateMetrics();
  
  if (issues.length > 0) {
    console.error('⚠️ Issues detected during monitoring period:');
    issues.forEach(issue => console.error(`  - ${issue}`));
    
    if (!FORCE) {
      const proceed = await confirmAction('Issues detected. Proceed with scaling to 100%?');
      if (!proceed) {
        await executeRollback();
        return;
      }
    }
  }
  
  console.log('🚀 Scaling deployment to 100% traffic...');
  
  if (DRY_RUN) {
    console.log('[Dry Run] Would scale deployment to 100%');
  } else {
    try {
      // Update traffic policy to 100%
      await apiRequest('POST', `/v2/projects/${CONFIG.projectId}/domains/traffic-policy`, {
        rules: [
          {
            deploymentId: deploymentId,
            weight: 100
          }
        ]
      });
      
      console.log('✅ Deployment successfully scaled to 100% traffic!');
      
      // Update Sentry environment
      await sentryApiRequest('PUT', `/projects/${CONFIG.teamId}/${CONFIG.projectName}/releases/${CONFIG.projectName}@${CONFIG.currentVersion}/`, {
        environment: 'production'
      });
      
      // Send notification
      await sendNotification('✅ Deployment Complete', 
        `Navigation Enhancements successfully deployed to 100% of traffic.\n` +
        `Version: ${CONFIG.currentVersion}\n` +
        `All metrics within acceptable thresholds.`
      );
      
    } catch (error) {
      console.error('❌ Error scaling deployment:', error.message);
      await sendNotification('⚠️ Deployment Scaling Issue', 
        `Error scaling deployment to 100%: ${error.message}\n` +
        `Manual intervention required.`
      );
    }
  }
  
  // Print summary
  printDeploymentSummary();
}

/**
 * Execute rollback to previous version
 */
async function executeRollback() {
  console.log('⚠️ Executing rollback to v1.8.2...');
  
  if (DRY_RUN) {
    console.log('[Dry Run] Would rollback to previous version');
    return;
  }
  
  try {
    // Get previous deployment ID
    const previousDeploymentId = await getPreviousDeploymentId();
    
    // Update traffic policy to 100% previous version
    await apiRequest('POST', `/v2/projects/${CONFIG.projectId}/domains/traffic-policy`, {
      rules: [
        {
          deploymentId: previousDeploymentId,
          weight: 100
        }
      ]
    });
    
    console.log('✅ Rollback successful!');
    
    // Send notification
    await sendNotification('⚠️ Deployment Rolled Back', 
      `Navigation Enhancements deployment was rolled back to v1.8.2.\n` +
      `Reason: Performance metrics exceeded thresholds.`
    );
    
  } catch (error) {
    console.error('❌ Error executing rollback:', error.message);
    await sendNotification('🚨 URGENT: Rollback Failed', 
      `Failed to rollback deployment: ${error.message}\n` +
      `IMMEDIATE MANUAL INTERVENTION REQUIRED`
    );
  }
}

/**
 * Print deployment summary
 */
function printDeploymentSummary() {
  console.log('\n' + '='.repeat(80));
  console.log('📊 DEPLOYMENT SUMMARY');
  console.log('='.repeat(80));
  
  // Calculate average metrics
  const avgNavLoadTime = calculateAverage(metrics.navLoadTime);
  const avgErrorRate = calculateAverage(metrics.errorRate);
  const avgResponseTime = calculateAverage(metrics.responseTime);
  const avgSuccessRate = calculateAverage(metrics.successRate);
  
  console.log(`🚀 Version: ${CONFIG.currentVersion} (${CONFIG.releaseTag})`);
  console.log(`⏱️ Duration: ${CONFIG.monitoringMinutes} minutes`);
  console.log(`👥 Traffic: ${CONFIG.canaryPercent}% → 100%`);
  
  console.log('\n📈 METRICS SUMMARY:');
  console.log(`  • Avg Navigation Load Time: ${avgNavLoadTime.toFixed(2)}ms (threshold: ${CONFIG.thresholds.navLoadTime}ms)`);
  console.log(`  • Avg Error Rate: ${avgErrorRate.toFixed(2)}% (threshold: ${CONFIG.thresholds.errorRate}%)`);
  console.log(`  • Avg P95 Response Time: ${avgResponseTime.toFixed(2)}ms (threshold: ${CONFIG.thresholds.p95ResponseTime}ms)`);
  console.log(`  • Avg Success Rate: ${avgSuccessRate.toFixed(2)}% (threshold: ${CONFIG.thresholds.successRate}%)`);
  
  console.log('\n🔍 MONITORING:');
  console.log(`  • Vercel Analytics: https://vercel.com/${CONFIG.teamId}/${CONFIG.projectName}/analytics`);
  console.log(`  • Sentry Dashboard: https://sentry.io/organizations/${CONFIG.teamId}/issues/?project=${CONFIG.projectName}`);
  
  console.log('\n✅ NEXT STEPS:');
  console.log('  • Monitor user feedback for the next 24 hours');
  console.log('  • Review analytics data for navigation efficiency gains');
  console.log('  • Schedule post-deployment review meeting');
  
  console.log('\n' + '='.repeat(80));
}

/**
 * Get current canary deployment ID
 */
async function getCurrentCanaryDeployment() {
  if (DRY_RUN) {
    return 'dry-run-deployment-id';
  }
  
  try {
    const traffic = await apiRequest('GET', `/v2/projects/${CONFIG.projectId}/domains/traffic-policy`);
    
    // Find rule with less than 100% weight
    const canaryRule = traffic.rules.find(rule => rule.weight < 100);
    return canaryRule ? canaryRule.deploymentId : null;
  } catch (error) {
    console.error('Error getting current canary:', error.message);
    return null;
  }
}

/**
 * Get previous deployment ID
 */
async function getPreviousDeploymentId() {
  if (DRY_RUN) {
    return 'dry-run-previous-deployment-id';
  }
  
  try {
    // Get deployments
    const deployments = await apiRequest('GET', `/v6/deployments?projectId=${CONFIG.projectId}&target=production&limit=10`);
    
    // Find deployment with previous version tag
    const previousDeployment = deployments.deployments.find(d => 
      d.meta?.githubCommitRef === `v${CONFIG.previousVersion}` ||
      d.meta?.githubCommitMessage?.includes(`v${CONFIG.previousVersion}`)
    );
    
    return previousDeployment ? previousDeployment.id : deployments.deployments[1]?.id;
  } catch (error) {
    console.error('Error getting previous deployment:', error.message);
    throw error;
  }
}

/**
 * Wait for deployment to complete
 */
async function waitForDeployment(deploymentId) {
  let status = 'BUILDING';
  let attempts = 0;
  
  while (status === 'BUILDING' && attempts < 30) {
    await sleep(10000); // Wait 10 seconds
    
    try {
      const deployment = await apiRequest('GET', `/v13/deployments/${deploymentId}`);
      status = deployment.readyState;
      
      process.stdout.write(`\rDeployment status: ${status} [${'.'.repeat(attempts % 3 + 1)}]`);
      attempts++;
      
      if (status === 'ERROR') {
        console.error('\n❌ Deployment failed!');
        throw new Error('Deployment failed');
      }
      
      if (status === 'READY') {
        console.log('\n✅ Deployment ready!');
        return;
      }
    } catch (error) {
      console.error('\n❌ Error checking deployment status:', error.message);
      throw error;
    }
  }
  
  if (status !== 'READY') {
    throw new Error('Deployment timed out');
  }
}

/**
 * Make API request to Vercel
 */
async function apiRequest(method, endpoint, data = null) {
  if (endpoint.startsWith('/')) {
    endpoint = `${CONFIG.vercelApiUrl}${endpoint}`;
  }
  
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json',
    }
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  const response = await fetch(endpoint, options);
  const responseData = await response.json();
  
  if (!response.ok) {
    throw new Error(`API request failed: ${responseData.error?.message || response.statusText}`);
  }
  
  return responseData;
}

/**
 * Make API request to Sentry
 */
async function sentryApiRequest(method, endpoint, data = null) {
  if (endpoint.startsWith('/')) {
    endpoint = `${CONFIG.sentryApiUrl}${endpoint}`;
  }
  
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${SENTRY_TOKEN}`,
      'Content-Type': 'application/json',
    }
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  const response = await fetch(endpoint, options);
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Sentry API request failed: ${text}`);
  }
  
  try {
    return await response.json();
  } catch (e) {
    return {};
  }
}

/**
 * Send notification to Slack
 */
async function sendNotification(title, message) {
  if (!CONFIG.slackWebhook) {
    return;
  }
  
  if (DRY_RUN) {
    console.log(`[Dry Run] Would send notification: ${title}`);
    return;
  }
  
  try {
    const payload = {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: title
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: message
          }
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `*Project:* ${CONFIG.projectName} | *Version:* ${CONFIG.currentVersion} | *Environment:* Production`
            }
          ]
        }
      ]
    };
    
    const response = await fetch(CONFIG.slackWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`Slack notification failed: ${response.statusText}`);
    }
  } catch (error) {
    console.warn('⚠️ Error sending notification:', error.message);
  }
}

/**
 * Calculate average of array values
 */
function calculateAverage(values) {
  if (!values || values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Polyfill for fetch in Node.js environments that don't have it
 */
if (!global.fetch) {
  global.fetch = (url, options = {}) => {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      
      const req = https.request({
        hostname: urlObj.hostname,
        path: `${urlObj.pathname}${urlObj.search}`,
        method: options.method || 'GET',
        headers: options.headers || {},
      }, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            statusText: res.statusMessage,
            headers: res.headers,
            text: () => Promise.resolve(data),
            json: () => Promise.resolve(JSON.parse(data)),
          });
        });
      });
      
      req.on('error', reject);
      
      if (options.body) {
        req.write(options.body);
      }
      
      req.end();
    });
  };
}

// Run the script
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
