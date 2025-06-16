#!/usr/bin/env node

/**
 * Environment Keys Reader for FreeflowZee
 * 
 * This script reads and displays the current environment variables from .env.local
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
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    log(`❌ Environment file not found: ${filePath}`, 'red');
    return {};
  }

  const envContent = fs.readFileSync(filePath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });

  return envVars;
}

function maskSensitiveValue(key, value) {
  const sensitiveKeys = ['SECRET', 'KEY', 'TOKEN', 'PASSWORD'];
  const isSensitive = sensitiveKeys.some(word => key.toUpperCase().includes(word));
  
  if (isSensitive && value.length > 8) {
    return value.substring(0, 8) + '...***';
  }
  return value;
}

function displayEnvKeys() {
  const envPath = path.join(process.cwd(), '.env.local');
  
  log('🔍 FreeflowZee Environment Variables Reader', 'cyan');
  log('=' .repeat(60), 'blue');
  
  const envVars = parseEnvFile(envPath);
  
  if (Object.keys(envVars).length === 0) {
    log('❌ No environment variables found', 'red');
    return;
  }

  // Group variables by category
  const categories = {
    'Supabase': ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_ACCESS_TOKEN'],
    'AWS/S3': ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_S3_ENDPOINT'],
    'Wasabi': ['WASABI_ACCESS_KEY_ID', 'WASABI_SECRET_ACCESS_KEY', 'WASABI_BUCKET_NAME', 'WASABI_REGION', 'WASABI_ENDPOINT'],
    'Stripe': ['STRIPE_PUBLISHABLE_KEY', 'STRIPE_SECRET_KEY'],
    'Vercel': ['VERCEL_TOKEN'],
    'Storage': ['STORAGE_PROVIDER', 'STORAGE_LARGE_FILE_THRESHOLD', 'STORAGE_ARCHIVE_THRESHOLD'],
    'Startup Optimization': ['STARTUP_MODE', 'STORAGE_AGGRESSIVE_OPTIMIZATION', 'STORAGE_MONTHLY_BUDGET', 'STORAGE_SUPABASE_LIMIT'],
    'Vercel Config': ['VERCEL_FUNCTION_TIMEOUT', 'VERCEL_MEMORY_ALLOCATION', 'VERCEL_REGIONS', 'VERCEL_CACHING'],
    'Other': []
  };

  // Display by category
  for (const [category, keys] of Object.entries(categories)) {
    const categoryVars = keys.filter(key => envVars[key]);
    
    if (categoryVars.length > 0) {
      log(`\n📂 ${category}:`, 'yellow');
      log('-'.repeat(40), 'blue');
      
      categoryVars.forEach(key => {
        const value = envVars[key];
        const displayValue = maskSensitiveValue(key, value);
        log(`  ${key}: ${displayValue}`, 'green');
      });
    }
  }

  // Display uncategorized variables
  const categorizedKeys = Object.values(categories).flat();
  const uncategorized = Object.keys(envVars).filter(key => !categorizedKeys.includes(key));
  
  if (uncategorized.length > 0) {
    log(`\n📂 Other:`, 'yellow');
    log('-'.repeat(40), 'blue');
    
    uncategorized.forEach(key => {
      const value = envVars[key];
      const displayValue = maskSensitiveValue(key, value);
      log(`  ${key}: ${displayValue}`, 'green');
    });
  }

  log(`\n📊 Summary:`, 'cyan');
  log(`  Total variables: ${Object.keys(envVars).length}`, 'blue');
  log(`  File location: ${envPath}`, 'blue');
  log('=' .repeat(60), 'blue');
}

// Add command line options
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  log('🔍 FreeflowZee Environment Keys Reader', 'cyan');
  log('', 'reset');
  log('Usage:', 'yellow');
  log('  node scripts/get-env-keys.js          # Display all environment variables', 'green');
  log('  node scripts/get-env-keys.js --raw    # Display raw values (no masking)', 'green');
  log('  node scripts/get-env-keys.js --help   # Show this help', 'green');
  process.exit(0);
}

// Main execution
try {
  displayEnvKeys();
} catch (error) {
  log(`❌ Error reading environment variables: ${error.message}`, 'red');
  process.exit(1);
} 