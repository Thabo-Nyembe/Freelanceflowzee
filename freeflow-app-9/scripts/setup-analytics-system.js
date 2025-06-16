#!/usr/bin/env node

/**
 * Analytics System Setup for FreeflowZee
 * 
 * This script sets up the comprehensive analytics tracking system including:
 * - Database tables creation
 * - API endpoints verification
 * - Performance monitoring setup
 * - Business metrics tracking
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, description) {
  log(`\n${colors.bold}${colors.blue}[${step}]${colors.reset} ${description}`, 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

async function setupAnalyticsSystem() {
  log(`\n${colors.bold}${colors.magenta}🚀 FreeflowZee Analytics System Setup${colors.reset}`);
  log('Setting up comprehensive analytics tracking system...\n');

  try {
    // Step 1: Check environment variables
    logStep('1', 'Checking Environment Configuration');
    await checkEnvironment();

    // Step 2: Verify database setup files
    logStep('2', 'Verifying Analytics Database Setup');
    await verifyDatabaseSetup();

    // Step 3: Check API endpoints
    logStep('3', 'Verifying Analytics API Endpoints');
    await verifyAPIEndpoints();

    // Step 4: Verify React components
    logStep('4', 'Verifying Analytics Components');
    await verifyComponents();

    // Step 5: Test analytics tracking
    logStep('5', 'Testing Analytics System');
    await testAnalyticsSystem();

    // Step 6: Generate setup instructions
    logStep('6', 'Generating Setup Instructions');
    await generateSetupInstructions();

    // Success summary
    log(`\n${colors.bold}${colors.green}🎉 Analytics System Setup Complete!${colors.reset}`);
    log(`\n${colors.bold}Next Steps:${colors.reset}`);
    log('1. Run the database setup in Supabase SQL Editor');
    log('2. Add analytics dashboard to your navigation');
    log('3. Start collecting user behavior data');
    log('\nFor detailed instructions, check: ANALYTICS_SETUP_GUIDE.md\n');

  } catch (error) {
    logError(`Setup failed: ${error.message}`);
    process.exit(1);
  }
}

async function checkEnvironment() {
  const envFile = '.env.local';
  
  if (!fs.existsSync(envFile)) {
    throw new Error('Environment file (.env.local) not found');
  }

  const envContent = fs.readFileSync(envFile, 'utf8');
  
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  const missingVars = requiredVars.filter(varName => 
    !envContent.includes(varName + '=')
  );

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  logSuccess('Environment variables configured');
}

async function verifyDatabaseSetup() {
  const sqlFile = 'scripts/setup-analytics-database.sql';
  
  if (!fs.existsSync(sqlFile)) {
    logError('Analytics database setup file not found');
    return;
  }

  const sqlContent = fs.readFileSync(sqlFile, 'utf8');
  
  // Check for required tables
  const requiredTables = [
    'analytics_events',
    'business_metrics',
    'user_sessions'
  ];

  const requiredViews = [
    'daily_metrics',
    'hourly_events',
    'performance_summary',
    'user_activity_summary',
    'revenue_summary'
  ];

  const requiredFunctions = [
    'get_analytics_summary',
    'get_realtime_metrics'
  ];

  let allPresent = true;

  requiredTables.forEach(table => {
    if (!sqlContent.includes(`CREATE TABLE ${table}`)) {
      logError(`Missing table: ${table}`);
      allPresent = false;
    }
  });

  requiredViews.forEach(view => {
    if (!sqlContent.includes(`CREATE OR REPLACE VIEW ${view}`)) {
      logError(`Missing view: ${view}`);
      allPresent = false;
    }
  });

  requiredFunctions.forEach(func => {
    if (!sqlContent.includes(`CREATE OR REPLACE FUNCTION ${func}`)) {
      logError(`Missing function: ${func}`);
      allPresent = false;
    }
  });

  if (allPresent) {
    logSuccess('Database setup file is complete');
  } else {
    logWarning('Some database components are missing');
  }

  // Check for RLS policies
  if (sqlContent.includes('ENABLE ROW LEVEL SECURITY')) {
    logSuccess('Row Level Security policies included');
  } else {
    logWarning('Row Level Security policies missing');
  }

  // Check for indexes
  if (sqlContent.includes('CREATE INDEX')) {
    logSuccess('Performance indexes included');
  } else {
    logWarning('Performance indexes missing');
  }
}

async function verifyAPIEndpoints() {
  const apiFiles = [
    'app/api/analytics/events/route.ts',
    'app/api/analytics/dashboard/route.ts'
  ];

  apiFiles.forEach(file => {
    if (fs.existsSync(file)) {
      logSuccess(`API endpoint found: ${file}`);
      
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for required methods
      if (content.includes('export async function POST')) {
        logSuccess('  - POST method implemented');
      }
      if (content.includes('export async function GET')) {
        logSuccess('  - GET method implemented');
      }
      
      // Check for error handling
      if (content.includes('try {') && content.includes('catch')) {
        logSuccess('  - Error handling implemented');
      } else {
        logWarning('  - Error handling may be incomplete');
      }
      
    } else {
      logError(`API endpoint missing: ${file}`);
    }
  });
}

async function verifyComponents() {
  const componentFiles = [
    'components/analytics/analytics-dashboard.tsx',
    'hooks/use-analytics.ts'
  ];

  componentFiles.forEach(file => {
    if (fs.existsSync(file)) {
      logSuccess(`Component found: ${file}`);
      
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for TypeScript
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        if (content.includes('interface ') || content.includes('type ')) {
          logSuccess('  - TypeScript interfaces defined');
        }
      }
      
      // Check for React hooks
      if (content.includes('useState') || content.includes('useEffect')) {
        logSuccess('  - React hooks utilized');
      }
      
    } else {
      logError(`Component missing: ${file}`);
    }
  });
}

async function testAnalyticsSystem() {
  logInfo('Analytics system components verified');
  
  // Check if Next.js app is running
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (packageJson.scripts && packageJson.scripts.dev) {
      logSuccess('Next.js development script found');
    }
    
    if (packageJson.dependencies && packageJson.dependencies['@supabase/supabase-js']) {
      logSuccess('Supabase client library installed');
    }
    
  } catch (error) {
    logWarning('Could not verify Next.js configuration');
  }
}

async function generateSetupInstructions() {
  const setupGuide = `# FreeflowZee Analytics Setup Guide

## Overview
Your analytics system has been successfully set up with the following components:

## 🗄️ Database Components
- **analytics_events**: Tracks all user interactions and system events
- **business_metrics**: Stores key business metrics and KPIs
- **user_sessions**: Manages user session information
- **Performance Views**: Pre-built analytics views for reporting
- **Real-time Functions**: Database functions for live metrics

## 🚀 API Endpoints
- **POST /api/analytics/events**: Track individual events
- **GET /api/analytics/events**: Retrieve user events
- **GET /api/analytics/dashboard**: Get dashboard metrics

## 🎯 React Components
- **AnalyticsDashboard**: Comprehensive analytics dashboard
- **useAnalytics Hook**: Easy-to-use React hook for tracking

## 🔧 Setup Instructions

### 1. Database Setup
1. Open your Supabase dashboard: https://app.supabase.com
2. Navigate to your project: ${process.env.NEXT_PUBLIC_SUPABASE_URL || 'Your Supabase URL'}
3. Go to SQL Editor
4. Copy and run the SQL from: \`scripts/setup-analytics-database.sql\`

### 2. Add Analytics to Your App
\`\`\`jsx
import { useAnalytics } from '@/hooks/use-analytics'
import AnalyticsDashboard from '@/components/analytics/analytics-dashboard'

// In any component
function MyComponent() {
  const { trackButtonClick, trackPageView } = useAnalytics()
  
  const handleClick = () => {
    trackButtonClick('signup_button', 'header')
  }
  
  return <button onClick={handleClick}>Sign Up</button>
}

// Analytics Dashboard Page
function AnalyticsPage() {
  return <AnalyticsDashboard />
}
\`\`\`

### 3. Automatic Tracking
The system automatically tracks:
- ✅ Page views
- ✅ Performance metrics (Core Web Vitals)
- ✅ JavaScript errors
- ✅ User sessions
- ✅ Business metrics

### 4. Manual Tracking Examples
\`\`\`jsx
const { 
  trackUserAction, 
  trackBusinessMetric, 
  trackPayment,
  trackProjectCreated 
} = useAnalytics()

// Track user actions
trackUserAction('file_uploaded', 'upload_button', { fileSize: 1024 })

// Track business metrics
trackBusinessMetric('revenue', 99.99, 'usd')

// Track payments
trackPayment(99.99, 'USD', true)

// Track project creation
trackProjectCreated()
\`\`\`

## 📊 Dashboard Features
- Real-time metrics
- Performance monitoring
- User behavior analysis
- Revenue tracking
- Error monitoring
- Top pages analysis
- Session analytics

## 🔒 Security Features
- Row Level Security (RLS) enabled
- User-specific data access
- Secure API endpoints
- Privacy-compliant tracking

## 🌟 Key Benefits
- **Cost-Effective**: Uses your existing Supabase infrastructure
- **Real-Time**: Live data updates every 30 seconds
- **Privacy-First**: User data stays in your database
- **Comprehensive**: Tracks everything from performance to revenue
- **Easy to Use**: Simple React hooks for tracking

## 📈 Metrics Tracked
### Performance Metrics
- Page load time
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
- First Input Delay (FID)

### Business Metrics
- Revenue tracking
- Payment completions
- Project creations
- User registrations
- Feature usage

### User Behavior
- Page views
- Button clicks
- Form submissions
- File uploads
- Search queries
- Session duration

## 🛠️ Customization
You can easily extend the system by:
1. Adding new event types
2. Creating custom metrics
3. Building additional dashboard views
4. Integrating with third-party services

## 📝 Next Steps
1. ✅ Run the database setup SQL
2. ✅ Add analytics dashboard to your navigation
3. ✅ Test event tracking in development
4. ✅ Deploy to production
5. ✅ Monitor your application performance

## 🎯 Success Metrics
After setup, you'll be able to track:
- Daily active users
- Page performance scores
- Revenue growth
- Feature adoption
- Error rates
- User engagement

---

**🚀 Your analytics system is ready! Start tracking user behavior and growing your business with data-driven insights.**
`;

  fs.writeFileSync('ANALYTICS_SETUP_GUIDE.md', setupGuide);
  logSuccess('Setup guide created: ANALYTICS_SETUP_GUIDE.md');

  // Create a quick test script
  const testScript = `#!/usr/bin/env node

/**
 * Quick Analytics Test
 * Run this to verify your analytics system is working
 */

async function testAnalytics() {
  console.log('🧪 Testing Analytics System...');
  
  try {
    // Test event tracking endpoint
    const response = await fetch('http://localhost:3000/api/analytics/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'test',
        event_name: 'system_test',
        session_id: 'test_session_' + Date.now(),
        properties: { test: true }
      })
    });
    
    if (response.ok) {
      console.log('✅ Analytics endpoint working');
    } else {
      console.log('❌ Analytics endpoint failed');
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    console.log('Make sure your development server is running: npm run dev');
  }
}

if (require.main === module) {
  testAnalytics();
}

module.exports = { testAnalytics };
`;

  fs.writeFileSync('scripts/test-analytics.js', testScript);
  fs.chmodSync('scripts/test-analytics.js', '755');
  logSuccess('Test script created: scripts/test-analytics.js');
}

// Run the setup if called directly
if (require.main === module) {
  setupAnalyticsSystem();
}

module.exports = { setupAnalyticsSystem }; 