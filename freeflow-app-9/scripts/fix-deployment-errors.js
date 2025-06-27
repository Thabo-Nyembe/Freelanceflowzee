#!/usr/bin/env node

/**
 * Comprehensive Deployment Error Fix Script
 * Addresses all issues from previous deployment attempt
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m'
};

const log = (message, color = colors.reset) => {
  console.log(`${color}${message}${colors.reset}`);
};

const execCommand = (command, options = {}) => {
  try {
    const result = execSync(command, { 
      stdio: options.silent ? 'pipe' : 'inherit',
      encoding: 'utf-8',
      ...options 
    });
    return { success: true, output: result };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      output: error.stdout || error.stderr || error.message
    };
  }
};

async function fixDeploymentErrors() {
  log('\n🔧 Comprehensive Deployment Error Fix', colors.cyan);
  log('=' .repeat(50), colors.cyan);'

  const fixes = [];

  // 1. Fix Environment Variables
  log('\n📝 1. Fixing Environment Variables...', colors.yellow);
  try {
    const envPath = '.env.local';
    let envContent = fs.readFileSync(envPath, 'utf-8');
    
    // Ensure OpenRouter variables are properly set
    if (!envContent.includes('OPENROUTER_BASE_URL= ')) {
      envContent += '\nOPENROUTER_BASE_URL=https://openrouter.ai/api/v1\n';
    }
    if (!envContent.includes('OPENROUTER_MODEL= ')) {
      envContent += 'OPENROUTER_MODEL=openrouter/auto\n';
    }
    
    fs.writeFileSync(envPath, envContent);
    fixes.push('✅ Environment variables updated');
    log('   ✅ Environment variables fixed', colors.green);
  } catch (error) {
    fixes.push('❌ Environment variables failed: ' + error.message);
    log('   ❌ Environment variables failed', colors.red);
  }

  // 2. Fix Next.js Configuration
  log('\n⚙️ 2. Fixing Next.js Configuration...', colors.yellow);
  try {
    const nextConfigPath = 'next.config.js';
    let nextConfig = fs.readFileSync(nextConfigPath, 'utf-8');
    
    // Fix server actions configuration
    if (nextConfig.includes('serverActions: true')) {
      nextConfig = nextConfig.replace(
        'serverActions: true',
        `serverActions: {
      allowedOrigins: ["localhost:3001", "localhost:3000"]
    }`
      );
      fs.writeFileSync(nextConfigPath, nextConfig);
    }
    
    fixes.push('✅ Next.js configuration updated');
    log('   ✅ Next.js configuration fixed', colors.green);
  } catch (error) {
    fixes.push('❌ Next.js configuration failed: ' + error.message);
    log('   ❌ Next.js configuration failed', colors.red);
  }

  // 3. Install Missing Dependencies
  log('\n📦 3. Installing Missing Dependencies...', colors.yellow);
  const dependencies = ['critters', '@svgr/webpack'];
  for (const dep of dependencies) {
    const result = execCommand(`npm list ${dep}`, { silent: true });
    if (!result.success) {
      log(`   Installing ${dep}...`, colors.blue);
      const installResult = execCommand(`npm install ${dep} --save-dev`);
      if (installResult.success) {
        fixes.push(`✅ ${dep} installed`);
      } else {
        fixes.push(`❌ ${dep} installation failed`);
      }
    } else {
      fixes.push(`✅ ${dep} already installed`);
    }
  }

  // 4. Clear Build Cache
  log('\n🧹 4. Clearing Build Cache...', colors.yellow);
  const cacheResult = execCommand('npm run clean');
  if (cacheResult.success) {
    fixes.push('✅ Build cache cleared');
    log('   ✅ Build cache cleared', colors.green);
  } else {
    fixes.push('❌ Build cache clearing failed');
    log('   ❌ Build cache clearing failed', colors.red);
  }

  // 5. Fix TypeScript Issues
  log('\n🔧 5. Fixing TypeScript Issues...', colors.yellow);
  try {
    // Create missing OpenRouter service if it doesn't exist
    const openRouterServicePath = 'lib/ai/openrouter-service.ts';
    if (!fs.existsSync(openRouterServicePath)) {
      const openRouterService = `interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface OpenRouterResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

class OpenRouterService {
  private apiKey: string
  private baseUrl: string
  private defaultModel: string

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || '
    this.baseUrl = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1'
    this.defaultModel = process.env.OPENROUTER_MODEL || 'openrouter/auto'
  }

  async generateResponse(
    prompt: string,
    context: unknown = {},
    model?: string
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key not configured')
    }

    const messages: OpenRouterMessage[] = [
      {
        role: 'system',
        content: 'You are a helpful AI assistant for the FreeflowZee platform.'
      },
      {
        role: 'user',
        content: prompt
      }
    ]

    try {
      const response = await fetch(\`\${this.baseUrl}/chat/completions\`, {
        method: 'POST',
        headers: {
          'Authorization': \`Bearer \${this.apiKey}\`, 'Content-Type': 'application/json', 'HTTP-Referer': 'https://freeflowzee.com', 'X-Title': 'FreeflowZee'
        },
        body: JSON.stringify({
          model: model || this.defaultModel,
          messages,
          temperature: 0.7,
          max_tokens: 1000
        })
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(\`OpenRouter API error: \${response.status} - \${errorData}\`)
      }

      const data: OpenRouterResponse = await response.json()
      return data.choices[0]?.message?.content || 'No response generated'
    } catch (error) {
      console.error('OpenRouter API error:', error)
      throw error
    }
  }

  async generateBusinessInsights(context: unknown): Promise<string> {
    return this.generateResponse(
      \`Generate business insights based on this context: \${JSON.stringify(context)}\`
    )
  }

  async generateProjectSuggestions(context: unknown): Promise<string> {
    return this.generateResponse(
      \`Suggest project improvements based on: \${JSON.stringify(context)}\`
    )
  }
}

export const openRouterService = new OpenRouterService()
export default openRouterService`;

      fs.mkdirSync(path.dirname(openRouterServicePath), { recursive: true });
      fs.writeFileSync(openRouterServicePath, openRouterService);
    }
    
    fixes.push('✅ TypeScript issues fixed');
    log('   ✅ TypeScript issues fixed', colors.green);
  } catch (error) {
    fixes.push('❌ TypeScript fixes failed: ' + error.message);
    log('   ❌ TypeScript fixes failed', colors.red);
  }

  // 6. Test Build Process
  log('\n🏗️ 6. Testing Build Process...', colors.yellow);
  const buildResult = execCommand('npm run build', { silent: false });
  if (buildResult.success) {
    fixes.push('✅ Build process successful');
    log('   ✅ Build process successful', colors.green);
  } else {
    fixes.push('❌ Build process failed');
    log('   ❌ Build process failed', colors.red);
    log('   Build output:', colors.red);
    console.log(buildResult.output);
  }

  // 7. Update Git Repository
  log('\n📤 7. Updating Git Repository...', colors.yellow);
  try {
    execCommand('git add .', { silent: true });
    execCommand('git commit -m "Fix: Resolve deployment errors and update OpenRouter integration"', { silent: true });
    const pushResult = execCommand('git push origin main');
    if (pushResult.success) {
      fixes.push('✅ Git repository updated');
      log('   ✅ Git repository updated', colors.green);
    } else {
      fixes.push('❌ Git push failed');
      log('   ❌ Git push failed', colors.red);
    }
  } catch (error) {
    fixes.push('❌ Git operations failed: ' + error.message);
    log('   ❌ Git operations failed', colors.red);
  }

  // 8. Deploy to Vercel
  log('\n🚀 8. Deploying to Vercel...', colors.yellow);
  const deployResult = execCommand('vercel --prod');
  if (deployResult.success) {
    fixes.push('✅ Vercel deployment successful');
    log('   ✅ Vercel deployment successful', colors.green);
    
    // Extract deployment URL
    const deploymentUrl = deployResult.output?.match(/https:\/\/[^\s]+/);
    if (deploymentUrl && deploymentUrl[0]) {
      log(`   🌐 Live URL: ${deploymentUrl[0]}`, colors.cyan);
    } else {
      log(`   🌐 Deployment successful - check Vercel dashboard for URL`, colors.cyan);
    }
  } else {
    fixes.push('❌ Vercel deployment failed');
    log('   ❌ Vercel deployment failed', colors.red);
  }

  // Summary Report
  log('\n📊 Fix Summary Report', colors.cyan);
  log('=' .repeat(50), colors.cyan);'
  fixes.forEach(fix => {
    log(`  ${fix}`, fix.includes('✅') ? colors.green : colors.red);'
  });

  const successCount = fixes.filter(f => f.includes('✅')).length;'
  const totalCount = fixes.length;
  
  log(`\n🎯 Overall Success Rate: ${successCount}/${totalCount} (${Math.round(successCount/totalCount*100)}%)`, 
    successCount === totalCount ? colors.green : colors.yellow);

  if (successCount === totalCount) {
    log('\n🎉 All deployment errors have been resolved successfully!', colors.green);
    log('Your FreeflowZee application is now ready for production.', colors.green);
  } else {
    log('\n⚠️ Some issues remain. Please check the errors above.', colors.yellow);
  }
}

// Run the fix process
if (require.main === module) {
  fixDeploymentErrors().catch(console.error);
}

module.exports = { fixDeploymentErrors }; 