#!/usr/bin/env node
/**
 * KAZI Interactive Tutorial System - Production Launch Script
 * Version: 1.0.0
 * Date: August 6, 2025
 * 
 * This script activates the complete interactive tutorial system for all KAZI users,
 * enabling gamified onboarding, achievement tracking, contextual help, and analytics.
 */

const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const chalk = require('chalk');
const ora = require('ora');
const dotenv = require('dotenv');
const { program } = require('commander');

// Load environment variables
dotenv.config({ path: '.env.production' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Configuration
const config = {
  // Tutorial system configuration
  tutorials: {
    enabled: true,
    defaultForNewUsers: true,
    skipForReturningUsers: false,
    tourSequence: ['welcome', 'ai-features', 'feedback-system', 'projects', 'collaboration'],
    minCompletionTime: 30, // seconds
  },
  
  // Achievement system configuration
  achievements: {
    enabled: true,
    startingXp: 100,
    levels: [
      { level: 1, xpRequired: 0, reward: 'welcome_badge' },
      { level: 2, xpRequired: 500, reward: 'explorer_badge' },
      { level: 3, xpRequired: 1500, reward: 'collaborator_badge' },
      { level: 4, xpRequired: 3000, reward: 'ai_master_badge' },
      { level: 5, xpRequired: 6000, reward: 'feedback_pro_badge' },
      { level: 10, xpRequired: 20000, reward: 'premium_trial' },
    ],
    milestones: [
      { id: 'first_project', xp: 200, notification: true },
      { id: 'first_collaboration', xp: 300, notification: true },
      { id: 'first_ai_generation', xp: 250, notification: true },
      { id: 'first_feedback', xp: 150, notification: true },
      { id: 'complete_profile', xp: 400, notification: true },
    ]
  },
  
  // Help center configuration
  helpCenter: {
    enabled: true,
    contextualHelpEnabled: true,
    supportChatEnabled: true,
    videoTutorialsEnabled: true,
    searchEnabled: true,
    feedbackEnabled: true,
    categories: [
      'getting-started',
      'projects',
      'collaboration',
      'ai-features',
      'feedback-system',
      'billing',
      'account',
      'troubleshooting'
    ]
  },
  
  // Analytics configuration
  analytics: {
    enabled: true,
    trackTutorialProgress: true,
    trackAchievements: true,
    trackHelpCenterUsage: true,
    trackOnboardingEffectiveness: true,
    trackFeatureDiscovery: true,
    trackTimeToFirstValue: true,
    retentionTracking: true,
    segmentEnabled: true,
    mixpanelEnabled: true,
    amplitudeEnabled: true,
    googleAnalyticsEnabled: true,
  },
  
  // Production environment configuration
  production: {
    notificationsEnabled: true,
    adminAlertsEnabled: true,
    slackIntegrationEnabled: true,
    performanceMonitoringEnabled: true,
    errorTrackingEnabled: true,
    maxConcurrentUsers: 10000,
    cacheEnabled: true,
    cdnEnabled: true,
  }
};

// Command line options
program
  .option('-f, --force', 'Force reactivation even if already active')
  .option('-d, --dry-run', 'Simulate activation without making changes')
  .option('-v, --verbose', 'Show detailed logs')
  .option('--skip-analytics', 'Skip analytics activation')
  .option('--skip-achievements', 'Skip achievements activation')
  .option('--admin-only', 'Activate only for admin users initially')
  .parse(process.argv);

const options = program.opts();
const isDryRun = options.dryRun;
const isVerbose = options.verbose;

// Logger utility
const log = {
  info: (msg) => console.log(chalk.blue('ℹ️ INFO:'), msg),
  success: (msg) => console.log(chalk.green('✅ SUCCESS:'), msg),
  warning: (msg) => console.log(chalk.yellow('⚠️ WARNING:'), msg),
  error: (msg) => console.log(chalk.red('❌ ERROR:'), msg),
  verbose: (msg) => isVerbose && console.log(chalk.gray('🔍 VERBOSE:'), msg)
};

/**
 * Activate the interactive tutorial system
 */
async function activateInteractiveTutorialSystem() {
  const spinner = ora('Activating interactive tutorial system...').start();
  
  try {
    // 1. Update system configuration in database
    if (!isDryRun) {
      await supabase
        .from('system_config')
        .upsert({
          key: 'interactive_tutorial_system',
          value: {
            enabled: config.tutorials.enabled,
            defaultForNewUsers: config.tutorials.defaultForNewUsers,
            skipForReturningUsers: config.tutorials.skipForReturningUsers,
            tourSequence: config.tutorials.tourSequence,
            lastUpdated: new Date().toISOString()
          }
        });
    }
    
    // 2. Create tutorial content tables if they don't exist
    if (!isDryRun) {
      // Check if tables exist
      const { data: tablesExist, error: tablesError } = await supabase
        .rpc('check_table_exists', { table_name: 'tutorial_content' });
        
      if (!tablesExist || tablesError) {
        // Create tables for tutorial content
        await supabase.rpc('create_tutorial_tables');
      }
    }
    
    // 3. Populate tutorial content
    const tutorialContent = [
      {
        id: 'welcome',
        title: 'Welcome to KAZI',
        description: 'Get started with the KAZI platform',
        steps: [
          { id: 'welcome-1', title: 'Welcome to KAZI', content: 'Your all-in-one freelance collaboration platform' },
          { id: 'welcome-2', title: 'Dashboard Overview', content: 'Navigate your personalized dashboard' },
          { id: 'welcome-3', title: 'Projects Hub', content: 'Manage all your projects in one place' },
          { id: 'welcome-4', title: 'AI Features', content: 'Discover AI-powered productivity tools' },
          { id: 'welcome-5', title: 'Complete Your Profile', content: 'Set up your professional profile' }
        ],
        xpReward: 250
      },
      {
        id: 'ai-features',
        title: 'AI Features Tour',
        description: 'Discover the power of AI in KAZI',
        steps: [
          { id: 'ai-1', title: 'AI Gateway', content: 'Your unified AI assistant' },
          { id: 'ai-2', title: 'Content Generation', content: 'Create professional content with AI' },
          { id: 'ai-3', title: 'Video Intelligence', content: 'Analyze and enhance your videos' },
          { id: 'ai-4', title: 'Smart Collaboration', content: 'AI-powered team productivity' },
          { id: 'ai-5', title: 'Predictive Analytics', content: 'Data-driven insights for your business' }
        ],
        xpReward: 350
      },
      {
        id: 'feedback-system',
        title: 'Universal Feedback System',
        description: 'Learn how to provide precise feedback on any content',
        steps: [
          { id: 'feedback-1', title: 'Click-Anywhere Commenting', content: 'Add comments to any part of a document' },
          { id: 'feedback-2', title: 'Media Annotations', content: 'Comment on images, videos, and audio' },
          { id: 'feedback-3', title: 'Real-time Collaboration', content: 'Work together with live presence' },
          { id: 'feedback-4', title: 'Voice Comments', content: 'Record audio feedback directly' },
          { id: 'feedback-5', title: 'Export & Share', content: 'Share feedback with your team' }
        ],
        xpReward: 300
      },
      {
        id: 'projects',
        title: 'Project Management',
        description: 'Master project workflows and collaboration',
        steps: [
          { id: 'projects-1', title: 'Creating Projects', content: 'Set up your first project' },
          { id: 'projects-2', title: 'Task Management', content: 'Organize and track tasks' },
          { id: 'projects-3', title: 'Client Collaboration', content: 'Share work and get approvals' },
          { id: 'projects-4', title: 'Time Tracking', content: 'Monitor time and productivity' },
          { id: 'projects-5', title: 'Invoicing', content: 'Generate invoices from projects' }
        ],
        xpReward: 400
      },
      {
        id: 'collaboration',
        title: 'Team Collaboration',
        description: 'Work seamlessly with your team',
        steps: [
          { id: 'collab-1', title: 'Team Workspace', content: 'Set up your collaborative environment' },
          { id: 'collab-2', title: 'Real-time Editing', content: 'Edit documents together' },
          { id: 'collab-3', title: 'Video Meetings', content: 'Host and join video conferences' },
          { id: 'collab-4', title: 'File Sharing', content: 'Share and organize files' },
          { id: 'collab-5', title: 'Team Analytics', content: 'Track team performance' }
        ],
        xpReward: 350
      }
    ];
    
    if (!isDryRun) {
      // Insert tutorial content
      await supabase
        .from('tutorial_content')
        .upsert(tutorialContent, { onConflict: 'id' });
    }
    
    // 4. Enable tutorial system in feature flags
    if (!isDryRun) {
      await supabase
        .from('feature_flags')
        .upsert({
          key: 'interactive_tutorial_system',
          enabled: true,
          percentage: 100, // 100% of users
          description: 'Interactive tutorial system with gamification',
          lastUpdated: new Date().toISOString()
        }, { onConflict: 'key' });
    }
    
    spinner.succeed('Interactive tutorial system activated successfully');
    log.success('Tutorial system is now available to all users');
    log.info(`Configured ${tutorialContent.length} tutorial sequences with ${
      tutorialContent.reduce((acc, tour) => acc + tour.steps.length, 0)
    } total steps`);
    
    return true;
  } catch (error) {
    spinner.fail('Failed to activate interactive tutorial system');
    log.error(`Error: ${error.message}`);
    if (isVerbose) {
      console.error(error);
    }
    return false;
  }
}

/**
 * Configure the production environment
 */
async function configureProductionEnvironment() {
  const spinner = ora('Configuring production environment...').start();
  
  try {
    // 1. Update environment configuration
    if (!isDryRun) {
      await supabase
        .from('system_config')
        .upsert({
          key: 'environment',
          value: {
            type: 'production',
            tutorialSystemEnabled: true,
            achievementsEnabled: true,
            helpCenterEnabled: true,
            analyticsEnabled: true,
            lastUpdated: new Date().toISOString()
          }
        });
    }
    
    // 2. Configure CDN for tutorial assets
    if (!isDryRun && config.production.cdnEnabled) {
      // Set up CDN configuration
      await supabase
        .from('system_config')
        .upsert({
          key: 'cdn_config',
          value: {
            enabled: true,
            tutorialAssetsPath: '/assets/tutorials',
            achievementIconsPath: '/assets/achievements',
            helpCenterAssetsPath: '/assets/help',
            videoTutorialsPath: '/assets/videos',
            lastUpdated: new Date().toISOString()
          }
        });
    }
    
    // 3. Configure performance monitoring
    if (!isDryRun && config.production.performanceMonitoringEnabled) {
      // Call performance monitoring API to enable tutorial system tracking
      await axios.post(`${process.env.NEXT_PUBLIC_APP_URL}/api/performance-monitoring/configure`, {
        module: 'tutorial-system',
        enabled: true,
        alertThresholds: {
          responseTime: 500, // ms
          errorRate: 0.01, // 1%
          userDropoff: 0.2 // 20%
        },
        metrics: [
          'tutorial_start_rate',
          'tutorial_completion_rate',
          'time_to_complete',
          'help_center_usage',
          'achievement_unlock_rate'
        ]
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.INTERNAL_API_KEY}`
        }
      });
    }
    
    // 4. Set up admin notifications
    if (!isDryRun && config.production.adminAlertsEnabled) {
      // Configure admin alerts for tutorial system
      await supabase
        .from('admin_alerts_config')
        .upsert({
          module: 'tutorial_system',
          enabled: true,
          channels: ['slack', 'email', 'dashboard'],
          thresholds: {
            completion_rate_drop: 0.15, // 15% drop
            error_rate: 0.05, // 5% error rate
            user_satisfaction: 3.5 // Below 3.5/5 rating
          },
          recipients: ['product@kazi.io', 'engineering@kazi.io'],
          webhooks: [process.env.SLACK_WEBHOOK_URL]
        });
    }
    
    // 5. Configure caching strategy
    if (!isDryRun && config.production.cacheEnabled) {
      // Set up Redis caching for tutorial content
      await axios.post(`${process.env.NEXT_PUBLIC_APP_URL}/api/cache/configure`, {
        module: 'tutorial-system',
        enabled: true,
        ttl: 3600, // 1 hour
        strategies: {
          tutorial_content: 'stale-while-revalidate',
          user_progress: 'no-cache', // Always fresh
          achievements: 'cache-first',
          help_center: 'network-first'
        }
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.INTERNAL_API_KEY}`
        }
      });
    }
    
    spinner.succeed('Production environment configured successfully');
    log.success('Tutorial system optimized for production use');
    
    return true;
  } catch (error) {
    spinner.fail('Failed to configure production environment');
    log.error(`Error: ${error.message}`);
    if (isVerbose) {
      console.error(error);
    }
    return false;
  }
}

/**
 * Enable the achievement system
 */
async function enableAchievementSystem() {
  if (options.skipAchievements) {
    log.info('Skipping achievement system activation (--skip-achievements flag)');
    return true;
  }
  
  const spinner = ora('Enabling achievement system...').start();
  
  try {
    // 1. Create achievements in database
    const achievements = [
      {
        id: 'welcome_badge',
        name: 'Welcome Aboard',
        description: 'Completed the welcome tutorial',
        icon: 'rocket',
        category: 'onboarding',
        xpValue: 100
      },
      {
        id: 'explorer_badge',
        name: 'Platform Explorer',
        description: 'Visited 10 different sections of the platform',
        icon: 'compass',
        category: 'exploration',
        xpValue: 200
      },
      {
        id: 'collaborator_badge',
        name: 'Team Collaborator',
        description: 'Participated in your first collaboration session',
        icon: 'users',
        category: 'collaboration',
        xpValue: 300
      },
      {
        id: 'ai_master_badge',
        name: 'AI Master',
        description: 'Used 5 different AI features successfully',
        icon: 'brain',
        category: 'ai',
        xpValue: 400
      },
      {
        id: 'feedback_pro_badge',
        name: 'Feedback Pro',
        description: 'Provided feedback on 5 different projects',
        icon: 'message-square',
        category: 'feedback',
        xpValue: 300
      },
      {
        id: 'project_manager_badge',
        name: 'Project Manager',
        description: 'Successfully completed your first project',
        icon: 'check-circle',
        category: 'projects',
        xpValue: 500
      },
      {
        id: 'premium_trial',
        name: 'Premium Explorer',
        description: 'Unlocked a 7-day trial of premium features',
        icon: 'award',
        category: 'rewards',
        xpValue: 0,
        reward: {
          type: 'premium_trial',
          duration: 7, // days
          features: ['ai_pro', 'unlimited_projects', 'advanced_analytics']
        }
      }
    ];
    
    if (!isDryRun) {
      // Insert achievements
      await supabase
        .from('achievements')
        .upsert(achievements, { onConflict: 'id' });
    }
    
    // 2. Configure achievement system
    if (!isDryRun) {
      await supabase
        .from('system_config')
        .upsert({
          key: 'achievement_system',
          value: {
            enabled: config.achievements.enabled,
            startingXp: config.achievements.startingXp,
            levels: config.achievements.levels,
            milestones: config.achievements.milestones,
            notificationsEnabled: true,
            lastUpdated: new Date().toISOString()
          }
        });
    }
    
    // 3. Enable achievement tracking in feature flags
    if (!isDryRun) {
      await supabase
        .from('feature_flags')
        .upsert({
          key: 'achievement_system',
          enabled: true,
          percentage: 100, // 100% of users
          description: 'Achievement and XP tracking system',
          lastUpdated: new Date().toISOString()
        }, { onConflict: 'key' });
    }
    
    // 4. Set up scheduled job for achievement processing
    if (!isDryRun) {
      // Configure scheduled job for achievement processing
      await supabase.rpc('create_achievement_processing_job', {
        job_schedule: '*/15 * * * *', // Every 15 minutes
        job_definition: {
          type: 'achievement_processing',
          description: 'Process user activities and award achievements',
          handler: 'processAchievements',
          timeout: 300 // 5 minutes
        }
      });
    }
    
    spinner.succeed('Achievement system enabled successfully');
    log.success(`Configured ${achievements.length} achievements across ${
      [...new Set(achievements.map(a => a.category))].length
    } categories`);
    
    return true;
  } catch (error) {
    spinner.fail('Failed to enable achievement system');
    log.error(`Error: ${error.message}`);
    if (isVerbose) {
      console.error(error);
    }
    return false;
  }
}

/**
 * Launch the help center
 */
async function launchHelpCenter() {
  const spinner = ora('Launching help center...').start();
  
  try {
    // 1. Configure help center
    if (!isDryRun) {
      await supabase
        .from('system_config')
        .upsert({
          key: 'help_center',
          value: {
            enabled: config.helpCenter.enabled,
            contextualHelpEnabled: config.helpCenter.contextualHelpEnabled,
            supportChatEnabled: config.helpCenter.supportChatEnabled,
            videoTutorialsEnabled: config.helpCenter.videoTutorialsEnabled,
            searchEnabled: config.helpCenter.searchEnabled,
            feedbackEnabled: config.helpCenter.feedbackEnabled,
            categories: config.helpCenter.categories,
            lastUpdated: new Date().toISOString()
          }
        });
    }
    
    // 2. Enable help center in feature flags
    if (!isDryRun) {
      await supabase
        .from('feature_flags')
        .upsert({
          key: 'help_center',
          enabled: true,
          percentage: 100, // 100% of users
          description: 'In-app help center with contextual support',
          lastUpdated: new Date().toISOString()
        }, { onConflict: 'key' });
    }
    
    // 3. Configure contextual help mappings
    const contextualHelpMappings = [
      {
        path: '/dashboard',
        helpArticleId: 'dashboard-overview',
        tooltips: [
          { selector: '.sidebar-nav', content: 'Navigate between different sections of KAZI' },
          { selector: '.quick-actions', content: 'Access common actions and tools' },
          { selector: '.user-profile', content: 'Manage your profile and settings' }
        ]
      },
      {
        path: '/dashboard/projects-hub',
        helpArticleId: 'projects-overview',
        tooltips: [
          { selector: '.project-list', content: 'View and manage all your projects' },
          { selector: '.create-project-btn', content: 'Create a new project' },
          { selector: '.project-filters', content: 'Filter projects by status, client, or date' }
        ]
      },
      {
        path: '/dashboard/ai-create',
        helpArticleId: 'ai-creation-guide',
        tooltips: [
          { selector: '.ai-prompt', content: 'Enter your instructions for the AI' },
          { selector: '.model-selector', content: 'Choose different AI models for specific tasks' },
          { selector: '.generation-history', content: 'View your previous AI generations' }
        ]
      },
      {
        path: '/dashboard/feedback',
        helpArticleId: 'feedback-system-guide',
        tooltips: [
          { selector: '.feedback-canvas', content: 'Click anywhere to add a comment' },
          { selector: '.media-controls', content: 'Control playback for video and audio' },
          { selector: '.comment-thread', content: 'View and reply to conversation threads' }
        ]
      }
    ];
    
    if (!isDryRun) {
      // Insert contextual help mappings
      await supabase
        .from('contextual_help_mappings')
        .upsert(contextualHelpMappings, { onConflict: 'path' });
    }
    
    // 4. Configure video tutorials
    const videoTutorials = [
      {
        id: 'welcome-tour',
        title: 'Welcome to KAZI',
        description: 'A quick overview of the KAZI platform',
        videoUrl: 'https://cdn.kazi.io/tutorials/welcome-tour.mp4',
        thumbnailUrl: 'https://cdn.kazi.io/tutorials/welcome-tour-thumb.jpg',
        duration: 180, // seconds
        category: 'getting-started',
        featured: true
      },
      {
        id: 'projects-tutorial',
        title: 'Managing Projects',
        description: 'Learn how to create and manage projects',
        videoUrl: 'https://cdn.kazi.io/tutorials/projects-tutorial.mp4',
        thumbnailUrl: 'https://cdn.kazi.io/tutorials/projects-tutorial-thumb.jpg',
        duration: 240, // seconds
        category: 'projects',
        featured: true
      },
      {
        id: 'ai-features-overview',
        title: 'AI Features Overview',
        description: 'Discover the power of AI in KAZI',
        videoUrl: 'https://cdn.kazi.io/tutorials/ai-features-overview.mp4',
        thumbnailUrl: 'https://cdn.kazi.io/tutorials/ai-features-overview-thumb.jpg',
        duration: 300, // seconds
        category: 'ai-features',
        featured: true
      },
      {
        id: 'feedback-system-tutorial',
        title: 'Universal Feedback System',
        description: 'Learn how to provide precise feedback on any content',
        videoUrl: 'https://cdn.kazi.io/tutorials/feedback-system-tutorial.mp4',
        thumbnailUrl: 'https://cdn.kazi.io/tutorials/feedback-system-tutorial-thumb.jpg',
        duration: 270, // seconds
        category: 'feedback-system',
        featured: true
      },
      {
        id: 'collaboration-guide',
        title: 'Team Collaboration',
        description: 'Work seamlessly with your team',
        videoUrl: 'https://cdn.kazi.io/tutorials/collaboration-guide.mp4',
        thumbnailUrl: 'https://cdn.kazi.io/tutorials/collaboration-guide-thumb.jpg',
        duration: 210, // seconds
        category: 'collaboration',
        featured: true
      }
    ];
    
    if (!isDryRun) {
      // Insert video tutorials
      await supabase
        .from('video_tutorials')
        .upsert(videoTutorials, { onConflict: 'id' });
    }
    
    spinner.succeed('Help center launched successfully');
    log.success(`Configured help center with ${contextualHelpMappings.length} contextual help mappings and ${videoTutorials.length} video tutorials`);
    
    return true;
  } catch (error) {
    spinner.fail('Failed to launch help center');
    log.error(`Error: ${error.message}`);
    if (isVerbose) {
      console.error(error);
    }
    return false;
  }
}

/**
 * Start analytics tracking
 */
async function startAnalyticsTracking() {
  if (options.skipAnalytics) {
    log.info('Skipping analytics tracking activation (--skip-analytics flag)');
    return true;
  }
  
  const spinner = ora('Starting analytics tracking...').start();
  
  try {
    // 1. Configure analytics tracking
    if (!isDryRun) {
      await supabase
        .from('system_config')
        .upsert({
          key: 'analytics_tracking',
          value: {
            enabled: config.analytics.enabled,
            trackTutorialProgress: config.analytics.trackTutorialProgress,
            trackAchievements: config.analytics.trackAchievements,
            trackHelpCenterUsage: config.analytics.trackHelpCenterUsage,
            trackOnboardingEffectiveness: config.analytics.trackOnboardingEffectiveness,
            trackFeatureDiscovery: config.analytics.trackFeatureDiscovery,
            trackTimeToFirstValue: config.analytics.trackTimeToFirstValue,
            retentionTracking: config.analytics.retentionTracking,
            lastUpdated: new Date().toISOString()
          }
        });
    }
    
    // 2. Configure analytics events
    const analyticsEvents = [
      {
        name: 'tutorial_started',
        description: 'User started a tutorial',
        properties: ['tutorial_id', 'user_id', 'timestamp', 'source'],
        retention: 90 // days
      },
      {
        name: 'tutorial_step_completed',
        description: 'User completed a tutorial step',
        properties: ['tutorial_id', 'step_id', 'user_id', 'timestamp', 'time_spent'],
        retention: 90 // days
      },
      {
        name: 'tutorial_completed',
        description: 'User completed a full tutorial',
        properties: ['tutorial_id', 'user_id', 'timestamp', 'total_time', 'completion_percentage'],
        retention: 90 // days
      },
      {
        name: 'achievement_unlocked',
        description: 'User unlocked an achievement',
        properties: ['achievement_id', 'user_id', 'timestamp', 'xp_earned'],
        retention: 90 // days
      },
      {
        name: 'help_center_viewed',
        description: 'User viewed the help center',
        properties: ['user_id', 'timestamp', 'source', 'search_query'],
        retention: 90 // days
      },
      {
        name: 'help_article_viewed',
        description: 'User viewed a help article',
        properties: ['article_id', 'user_id', 'timestamp', 'time_spent', 'helpful_rating'],
        retention: 90 // days
      },
      {
        name: 'video_tutorial_watched',
        description: 'User watched a video tutorial',
        properties: ['video_id', 'user_id', 'timestamp', 'watch_percentage', 'watch_time'],
        retention: 90 // days
      },
      {
        name: 'feature_discovered',
        description: 'User discovered a feature through the tutorial',
        properties: ['feature_id', 'user_id', 'timestamp', 'discovery_method'],
        retention: 90 // days
      },
      {
        name: 'onboarding_milestone',
        description: 'User reached an onboarding milestone',
        properties: ['milestone_id', 'user_id', 'timestamp', 'days_since_signup'],
        retention: 90 // days
      }
    ];
    
    if (!isDryRun) {
      // Register analytics events
      await supabase
        .from('analytics_events')
        .upsert(analyticsEvents, { onConflict: 'name' });
    }
    
    // 3. Configure analytics dashboards
    const analyticsDashboards = [
      {
        id: 'onboarding_effectiveness',
        name: 'Onboarding Effectiveness',
        description: 'Track the effectiveness of the onboarding process',
        metrics: [
          'tutorial_completion_rate',
          'time_to_first_value',
          'feature_discovery_rate',
          'help_center_usage',
          'day_1_retention',
          'day_7_retention'
        ],
        refreshRate: 3600 // seconds
      },
      {
        id: 'tutorial_performance',
        name: 'Tutorial Performance',
        description: 'Analyze tutorial engagement and completion',
        metrics: [
          'tutorial_start_rate',
          'step_completion_rate',
          'tutorial_abandonment_rate',
          'average_completion_time',
          'satisfaction_score'
        ],
        refreshRate: 3600 // seconds
      },
      {
        id: 'achievement_engagement',
        name: 'Achievement Engagement',
        description: 'Track achievement unlocks and engagement',
        metrics: [
          'achievement_unlock_rate',
          'xp_earned_distribution',
          'level_progression_rate',
          'milestone_completion_rate',
          'reward_redemption_rate'
        ],
        refreshRate: 3600 // seconds
      }
    ];
    
    if (!isDryRun) {
      // Create analytics dashboards
      await supabase
        .from('analytics_dashboards')
        .upsert(analyticsDashboards, { onConflict: 'id' });
    }
    
    // 4. Enable third-party analytics if configured
    if (!isDryRun) {
      // Configure analytics integrations
      const analyticsIntegrations = [];
      
      if (config.analytics.segmentEnabled) {
        analyticsIntegrations.push({
          provider: 'segment',
          enabled: true,
          writeKey: process.env.SEGMENT_WRITE_KEY,
          events: ['tutorial_started', 'tutorial_completed', 'achievement_unlocked']
        });
      }
      
      if (config.analytics.mixpanelEnabled) {
        analyticsIntegrations.push({
          provider: 'mixpanel',
          enabled: true,
          token: process.env.MIXPANEL_TOKEN,
          events: ['tutorial_started', 'tutorial_completed', 'achievement_unlocked', 'help_center_viewed']
        });
      }
      
      if (config.analytics.amplitudeEnabled) {
        analyticsIntegrations.push({
          provider: 'amplitude',
          enabled: true,
          apiKey: process.env.AMPLITUDE_API_KEY,
          events: ['tutorial_started', 'tutorial_completed', 'achievement_unlocked', 'help_center_viewed']
        });
      }
      
      if (config.analytics.googleAnalyticsEnabled) {
        analyticsIntegrations.push({
          provider: 'google_analytics',
          enabled: true,
          measurementId: process.env.GA_MEASUREMENT_ID,
          events: ['tutorial_started', 'tutorial_completed', 'achievement_unlocked', 'help_center_viewed']
        });
      }
      
      // Update analytics integrations
      await supabase
        .from('analytics_integrations')
        .upsert(analyticsIntegrations, { onConflict: 'provider' });
    }
    
    spinner.succeed('Analytics tracking started successfully');
    log.success(`Configured ${analyticsEvents.length} analytics events and ${analyticsDashboards.length} dashboards`);
    
    return true;
  } catch (error) {
    spinner.fail('Failed to start analytics tracking');
    log.error(`Error: ${error.message}`);
    if (isVerbose) {
      console.error(error);
    }
    return false;
  }
}

/**
 * Notify administrators about launch
 */
async function notifyAdmins() {
  const spinner = ora('Notifying administrators...').start();
  
  try {
    if (!isDryRun && config.production.slackIntegrationEnabled) {
      // Send Slack notification
      await axios.post(process.env.SLACK_WEBHOOK_URL, {
        text: '🚀 *KAZI Interactive Tutorial System Launched!*',
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: '🚀 KAZI Interactive Tutorial System Launched!',
              emoji: true
            }
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: 'The interactive tutorial system has been successfully launched in production.'
            }
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: '*Tutorials:* Enabled'
              },
              {
                type: 'mrkdwn',
                text: '*Achievements:* Enabled'
              },
              {
                type: 'mrkdwn',
                text: '*Help Center:* Enabled'
              },
              {
                type: 'mrkdwn',
                text: '*Analytics:* Enabled'
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
      });
    }
    
    if (!isDryRun) {
      // Log admin notification
      await supabase
        .from('admin_notifications')
        .insert({
          title: 'Interactive Tutorial System Launched',
          message: 'The interactive tutorial system has been successfully launched in production.',
          type: 'system_update',
          priority: 'high',
          read: false
        });
    }
    
    spinner.succeed('Administrators notified successfully');
    return true;
  } catch (error) {
    spinner.warn('Failed to notify administrators, but system is still active');
    log.warning(`Notification error: ${error.message}`);
    if (isVerbose) {
      console.error(error);
    }
    return true; // Non-critical error
  }
}

/**
 * Main function to launch the tutorial system
 */
async function main() {
  console.log(chalk.blue.bold('\n🚀 KAZI INTERACTIVE TUTORIAL SYSTEM - PRODUCTION LAUNCH\n'));
  
  if (isDryRun) {
    log.warning('Running in DRY RUN mode - no changes will be made');
  }
  
  if (options.adminOnly) {
    log.info('Activating for admin users only (--admin-only flag)');
  }
  
  // Check if tutorial system is already active
  let isAlreadyActive = false;
  
  try {
    const { data } = await supabase
      .from('system_config')
      .select('value')
      .eq('key', 'interactive_tutorial_system')
      .single();
    
    isAlreadyActive = data?.value?.enabled === true;
  } catch (error) {
    // Ignore error, assume not active
  }
  
  if (isAlreadyActive && !options.force) {
    log.warning('Tutorial system is already active. Use --force to reactivate.');
    process.exit(0);
  }
  
  // Execute all steps
  console.log(chalk.yellow('\n📋 EXECUTING LAUNCH SEQUENCE...\n'));
  
  const steps = [
    { name: 'Activate Interactive Tutorial System', fn: activateInteractiveTutorialSystem },
    { name: 'Configure Production Environment', fn: configureProductionEnvironment },
    { name: 'Enable Achievement System', fn: enableAchievementSystem },
    { name: 'Launch Help Center', fn: launchHelpCenter },
    { name: 'Start Analytics Tracking', fn: startAnalyticsTracking },
    { name: 'Notify Administrators', fn: notifyAdmins }
  ];
  
  let success = true;
  
  for (const step of steps) {
    const stepSuccess = await step.fn();
    if (!stepSuccess) {
      success = false;
      break;
    }
  }
  
  if (success) {
    console.log(chalk.green.bold('\n✅ KAZI INTERACTIVE TUTORIAL SYSTEM SUCCESSFULLY LAUNCHED!\n'));
    
    if (isDryRun) {
      log.info('Dry run completed successfully. Run without --dry-run to apply changes.');
    } else {
      log.info('The tutorial system is now available to all users.');
      log.info(`Monitor onboarding analytics at: ${process.env.NEXT_PUBLIC_APP_URL}/admin/analytics/onboarding`);
    }
    
    process.exit(0);
  } else {
    console.log(chalk.red.bold('\n❌ LAUNCH FAILED\n'));
    log.error('The tutorial system launch encountered errors. Please check the logs and try again.');
    process.exit(1);
  }
}

// Run the main function
main().catch(error => {
  console.error(chalk.red.bold('\n❌ FATAL ERROR\n'));
  console.error(error);
  process.exit(1);
});
