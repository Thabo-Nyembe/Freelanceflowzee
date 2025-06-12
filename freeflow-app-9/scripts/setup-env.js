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

const envPath = path.join(process.cwd(), '.env.local');

const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://zozfeysmzonzvrelyhyf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvemZleXNtem9uenZyZWx5aGpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NzY0NDQsImV4cCI6MjA2NDA1MjQ0NH0.3O11VF8z3--02c30k2Cv2-tEghS0dam_ykzuUhNTjH0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvemZleXNtem9uenZyZWx5aGpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODQ3NjQ0NCwiZXhwIjoyMDY0MDUyNDQ0fQ.Oqh7EhNfb53G

# Application Configuration
NEXTAUTH_SECRET=your-secret-key-here-${Math.random().toString(36).substring(2, 15)}
NEXTAUTH_URL=http://localhost:3000

# Demo Mode (set to false for production)
DEMO_MODE=false
`;

try {
  fs.writeFileSync(envPath, envContent);
  log('✅ Environment file created successfully at .env.local', 'green');
  log('🔧 Supabase credentials configured', 'blue');
  log('🚀 You can now restart your development server', 'green');
  log('', 'reset');
  log('Test credentials:', 'blue');
  log('Email: thabo@kaleidocraft.co.za', 'reset');
  log('Password: password1234', 'reset');
} catch (error) {
  log(`❌ Error creating environment file: ${error.message}`, 'red');
  log('', 'reset');
  log('Please manually create .env.local with the following content:', 'yellow');
  log('', 'reset');
  log(envContent, 'blue');
} 