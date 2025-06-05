#!/usr/bin/env node

/**
 * Environment Setup Script for FreeflowZee
 * 
 * This script helps set up environment variables for Supabase integration.
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function createEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');
  
  const envContent = `# Supabase Configuration
# Replace with your actual Supabase project credentials
NEXT_PUBLIC_SUPABASE_URL=https://rxkunedfjccggovbmbnx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4a3VuZWRmamNjZ2dvdmJtYm54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2NDY2MTcsImV4cCI6MjA2NDIyMjYxN30.L2Fax_SYBf0i0-HdcUUudQpO1ktREpgMvnqmNuVr3s0

# Service Key (Keep secret, only use server-side)
SUPABASE_SERVICE_ROLE_KEY=sbp_7275d8493dd8478f4d0f1c73598ca7794be9b094

# Other environment variables
# NEXTAUTH_SECRET=your_nextauth_secret
# NEXTAUTH_URL=http://localhost:3000
`;

  try {
    if (fs.existsSync(envPath)) {
      log('⚠️  .env.local already exists. Creating backup...', 'yellow');
      fs.copyFileSync(envPath, `${envPath}.backup`);
      log('✅ Backup created at .env.local.backup', 'green');
    }
    
    fs.writeFileSync(envPath, envContent);
    log('✅ .env.local file created successfully!', 'green');
    log('🔧 Supabase environment variables configured', 'blue');
    log('', 'reset');
    log('Your Supabase configuration:', 'blue');
    log('• Project URL: https://rxkunedfjccggovbmbnx.supabase.co', 'reset');
    log('• Anon Key: Configured ✓', 'reset');
    log('', 'reset');
    log('🚀 You can now run: pnpm run context7:dev', 'green');
    
  } catch (error) {
    log(`❌ Error creating .env.local: ${error.message}`, 'red');
    log('', 'reset');
    log('Manual setup instructions:', 'yellow');
    log('1. Create a file named .env.local in the project root', 'reset');
    log('2. Add the following content:', 'reset');
    log('', 'reset');
    log(envContent, 'blue');
  }
}

log('🔧 FreeflowZee Environment Setup', 'blue');
log('===============================', 'blue');
log('', 'reset');

createEnvFile(); 