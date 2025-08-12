/**
 * KAZI Interactive Tutorial System - Launch API
 * 
 * This API endpoint integrates with the tutorial system launch script and provides
 * a programmatic way to activate the complete interactive tutorial system.
 * 
 * Version: 1.0.0
 * Date: August 6, 2025
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import { z } from 'zod';
import { verifyAuthToken } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { metrics } from '@/lib/metrics';

// Promisify exec for async/await usage
const execAsync = promisify(exec);

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Request validation schema
const launchRequestSchema = z.object({
  mode: z.enum(['full', 'dry-run', 'admin-only']).default('full'),
  components: z.object({
    tutorials: z.boolean().default(true),
    achievements: z.boolean().default(true),
    helpCenter: z.boolean().default(true),
    analytics: z.boolean().default(true),
  }).default({}),
  options: z.object({
    force: z.boolean().default(false),
    verbose: z.boolean().default(false),
    notifyAdmins: z.boolean().default(true),
  }).default({}),
});

// Response types
type LaunchStatus = 'success' | 'partial' | 'failed';

interface ComponentStatus {
  name: string;
  status: 'success' | 'failed' | 'skipped';
  message?: string;
  details?: Record<string, any>;
}

interface LaunchResponse {
  status: LaunchStatus;
  timestamp: string;
  requestId: string;
  components: ComponentStatus[];
  logs?: string[];
  error?: string;
}

/**
 * GET handler - Check tutorial system status
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // Verify authentication
    const authResult = await verifyAuthToken(req);
    if (!authResult.isValid) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Valid authentication required' },
        { status: 401 }
      );
    }

    // Check if user has required permissions
    if (!authResult.permissions.includes('admin:tutorial-system')) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Check tutorial system status
    const { data: systemConfig, error: configError } = await supabase
      .from('system_config')
      .select('key, value')
      .in('key', [
        'interactive_tutorial_system',
        'achievement_system',
        'help_center',
        'analytics_tracking'
      ]);

    if (configError) {
      logger.error('Error fetching tutorial system status', { error: configError });
      return NextResponse.json(
        { error: 'Database error', message: 'Failed to fetch tutorial system status' },
        { status: 500 }
      );
    }

    // Transform data into status object
    const status = systemConfig.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {} as Record<string, any>);

    // Check if script exists
    const scriptPath = path.join(process.cwd(), 'kazi-launch-user-training.js');
    const scriptExists = fs.existsSync(scriptPath);

    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      tutorialSystem: {
        components: status,
        scriptAvailable: scriptExists,
        isActive: status.interactive_tutorial_system?.enabled === true,
      }
    });
  } catch (error) {
    logger.error('Unexpected error in tutorial system status check', { error });
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to check tutorial system status' },
      { status: 500 }
    );
  }
}

/**
 * POST handler - Launch tutorial system
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const requestId = crypto.randomUUID();
  const startTime = performance.now();
  
  try {
    // Start tracking metrics
    metrics.increment('tutorial_system.launch.attempts');
    
    // Verify authentication
    const authResult = await verifyAuthToken(req);
    if (!authResult.isValid) {
      metrics.increment('tutorial_system.launch.auth_failures');
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Valid authentication required' },
        { status: 401 }
      );
    }

    // Check if user has required permissions
    if (!authResult.permissions.includes('admin:tutorial-system')) {
      metrics.increment('tutorial_system.launch.permission_failures');
      return NextResponse.json(
        { error: 'Forbidden', message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    let requestBody;
    try {
      requestBody = await req.json();
      requestBody = launchRequestSchema.parse(requestBody);
    } catch (error) {
      logger.error('Invalid request body', { error, requestId });
      metrics.increment('tutorial_system.launch.validation_failures');
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid request format' },
        { status: 400 }
      );
    }

    // Check if script exists
    const scriptPath = path.join(process.cwd(), 'kazi-launch-user-training.js');
    if (!fs.existsSync(scriptPath)) {
      logger.error('Tutorial launch script not found', { path: scriptPath, requestId });
      metrics.increment('tutorial_system.launch.script_missing');
      return NextResponse.json(
        { error: 'Configuration Error', message: 'Tutorial launch script not found' },
        { status: 500 }
      );
    }

    // Build command with options
    const { mode, components, options } = requestBody;
    const commandArgs = [];

    // Add mode flags
    if (mode === 'dry-run') commandArgs.push('--dry-run');
    if (mode === 'admin-only') commandArgs.push('--admin-only');

    // Add component flags
    if (!components.achievements) commandArgs.push('--skip-achievements');
    if (!components.analytics) commandArgs.push('--skip-analytics');

    // Add option flags
    if (options.force) commandArgs.push('--force');
    if (options.verbose) commandArgs.push('--verbose');

    // Execute the script
    logger.info('Launching tutorial system', { requestId, mode, components });
    
    // Record launch attempt in database
    await supabase
      .from('system_events')
      .insert({
        type: 'tutorial_system_launch',
        user_id: authResult.userId,
        details: {
          requestId,
          mode,
          components,
          options
        }
      });

    // Execute the script
    const command = `node ${scriptPath} ${commandArgs.join(' ')}`;
    const { stdout, stderr } = await execAsync(command);

    // Parse output to determine component statuses
    const componentStatuses = parseScriptOutput(stdout);
    
    // Determine overall status
    const failedComponents = componentStatuses.filter(c => c.status === 'failed');
    let status: LaunchStatus = 'success';
    
    if (failedComponents.length > 0) {
      if (failedComponents.length === componentStatuses.length) {
        status = 'failed';
      } else {
        status = 'partial';
      }
    }

    // Log completion
    const duration = Math.round(performance.now() - startTime);
    logger.info('Tutorial system launch completed', { 
      requestId, 
      status, 
      duration,
      componentCount: componentStatuses.length,
      failedCount: failedComponents.length 
    });
    
    // Track metrics
    metrics.increment(`tutorial_system.launch.${status}`);
    metrics.timing('tutorial_system.launch.duration', duration);
    
    // Prepare response
    const response: LaunchResponse = {
      status,
      timestamp: new Date().toISOString(),
      requestId,
      components: componentStatuses,
    };
    
    // Include logs in verbose mode
    if (options.verbose) {
      response.logs = stdout.split('\n').filter(Boolean);
    }

    // Update system status in database
    await updateSystemStatus(status, componentStatuses);

    // Send notifications if enabled and successful
    if (options.notifyAdmins && (status === 'success' || status === 'partial')) {
      await sendAdminNotifications(status, componentStatuses, requestId);
    }

    return NextResponse.json(response);
  } catch (error: any) {
    // Log error
    logger.error('Failed to launch tutorial system', { 
      requestId, 
      error: error.message,
      stack: error.stack
    });
    
    // Track failure
    metrics.increment('tutorial_system.launch.errors');
    
    // Return error response
    return NextResponse.json({
      status: 'failed',
      timestamp: new Date().toISOString(),
      requestId,
      error: 'Failed to launch tutorial system',
      message: error.message,
      components: []
    }, { status: 500 });
  }
}

/**
 * Parse script output to determine component statuses
 */
function parseScriptOutput(output: string): ComponentStatus[] {
  const componentStatuses: ComponentStatus[] = [];
  const lines = output.split('\n');
  
  // Define patterns to match component status lines
  const successPattern = /(Interactive tutorial system|Achievement system|Help center|Analytics tracking) (enabled|launched|started|configured) successfully/i;
  const failurePattern = /Failed to (enable|activate|launch|start|configure) (Interactive tutorial system|Achievement system|Help center|Analytics tracking)/i;
  
  // Process each line
  for (const line of lines) {
    // Check for success patterns
    const successMatch = line.match(successPattern);
    if (successMatch) {
      const componentName = mapComponentName(successMatch[1]);
      componentStatuses.push({
        name: componentName,
        status: 'success',
        message: line.trim()
      });
      continue;
    }
    
    // Check for failure patterns
    const failureMatch = line.match(failurePattern);
    if (failureMatch) {
      const componentName = mapComponentName(failureMatch[2]);
      componentStatuses.push({
        name: componentName,
        status: 'failed',
        message: line.trim()
      });
    }
  }
  
  // Ensure all expected components are included
  const expectedComponents = ['tutorials', 'achievements', 'helpCenter', 'analytics'];
  for (const component of expectedComponents) {
    if (!componentStatuses.some(c => c.name === component)) {
      componentStatuses.push({
        name: component,
        status: 'skipped',
        message: `Component ${component} was skipped or not processed`
      });
    }
  }
  
  return componentStatuses;
}

/**
 * Map component names from script output to standardized keys
 */
function mapComponentName(rawName: string): string {
  const nameMappings: Record<string, string> = {
    'Interactive tutorial system': 'tutorials',
    'Achievement system': 'achievements',
    'Help center': 'helpCenter',
    'Analytics tracking': 'analytics'
  };
  
  return nameMappings[rawName] || rawName.toLowerCase().replace(/\s+/g, '');
}

/**
 * Update system status in database after launch
 */
async function updateSystemStatus(
  status: LaunchStatus, 
  components: ComponentStatus[]
): Promise<void> {
  try {
    // Update overall system status
    await supabase
      .from('system_config')
      .upsert({
        key: 'tutorial_system_status',
        value: {
          status,
          lastLaunch: new Date().toISOString(),
          componentStatus: components.reduce((acc, component) => {
            acc[component.name] = component.status;
            return acc;
          }, {} as Record<string, string>)
        }
      });
      
    // Log status update
    logger.info('Updated tutorial system status in database', { status });
  } catch (error) {
    // Log error but don't fail the request
    logger.error('Failed to update tutorial system status', { error });
  }
}

/**
 * Send notifications to administrators
 */
async function sendAdminNotifications(
  status: LaunchStatus,
  components: ComponentStatus[],
  requestId: string
): Promise<void> {
  try {
    // Create admin notification
    await supabase
      .from('admin_notifications')
      .insert({
        title: `Tutorial System ${status === 'success' ? 'Launched' : 'Partially Launched'}`,
        message: `The interactive tutorial system has been ${status === 'success' ? 'successfully launched' : 'partially launched'} in production.`,
        type: 'system_update',
        priority: status === 'success' ? 'normal' : 'high',
        read: false,
        metadata: {
          requestId,
          componentStatus: components.reduce((acc, component) => {
            acc[component.name] = component.status;
            return acc;
          }, {} as Record<string, string>),
          dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/admin/analytics/onboarding`
        }
      });
    
    // If Slack webhook is configured, send Slack notification
    const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (slackWebhookUrl) {
      const successfulComponents = components.filter(c => c.status === 'success').length;
      const failedComponents = components.filter(c => c.status === 'failed').length;
      
      const emoji = status === 'success' ? '🚀' : status === 'partial' ? '⚠️' : '❌';
      
      await fetch(slackWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `${emoji} *KAZI Interactive Tutorial System ${status === 'success' ? 'Launched' : 'Partially Launched'}!*`,
          blocks: [
            {
              type: 'header',
              text: {
                type: 'plain_text',
                text: `${emoji} KAZI Interactive Tutorial System ${status === 'success' ? 'Launched' : 'Partially Launched'}!`,
                emoji: true
              }
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `The interactive tutorial system has been ${status === 'success' ? 'successfully launched' : 'partially launched'} in production.`
              }
            },
            {
              type: 'section',
              fields: [
                {
                  type: 'mrkdwn',
                  text: `*Components:* ${successfulComponents} successful, ${failedComponents} failed`
                },
                {
                  type: 'mrkdwn',
                  text: `*Request ID:* ${requestId}`
                }
              ]
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: 'View the onboarding analytics dashboard to monitor user engagement.'
              },
              accessory: {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'View Dashboard',
                  emoji: true
                },
                url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/analytics/onboarding`
              }
            }
          ]
        })
      });
    }
    
    logger.info('Sent admin notifications', { status });
  } catch (error) {
    // Log error but don't fail the request
    logger.error('Failed to send admin notifications', { error });
  }
}
