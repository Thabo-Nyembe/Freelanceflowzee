#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class EmergencyFixer {
  constructor() {
    this.fixes = [];
  }

  async log(message) {
    console.log(`[${new Date().toISOString()}] ${message}`);
  }

  async executeCommand(command) {
    return new Promise((resolve) => {
      exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
        resolve({
          success: !error,
          stdout: stdout || '',
          stderr: stderr || '',
          error: error
        });
      });
    });
  }

  async fixOptimizedImageSSR() {
    await this.log('🖼️ Fixing OptimizedImage SSR issues...');
    
    const filePath = 'components/ui/optimized-image.tsx';
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Fix the generateBlurDataURL function to be SSR-safe
      const fixedFunction = `  // Generate blur placeholder for better UX (SSR-safe)
  const generateBlurDataURL = (w: number, h: number) => {
    // Only generate blur data URL on client side
    if (typeof window === 'undefined') {
      return undefined
    }
    
    try {
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.fillStyle = '#f3f4f6'
        ctx.fillRect(0, 0, w, h)
      }
      return canvas.toDataURL()
    } catch (error) {
      return undefined
    }
  }`;

      content = content.replace(
        /\/\/ Generate blur placeholder for better UX[\s\S]*?return canvas\.toDataURL\(\)\s*}/,
        fixedFunction
      );
      
      fs.writeFileSync(filePath, content);
      this.fixes.push('Fixed OptimizedImage SSR compatibility');
    }
  }

  async fixDashboardImports() {
    await this.log('📊 Fixing dashboard imports...');
    
    const filePath = 'app/dashboard/page.tsx';
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Remove problematic OptimizedAvatar import
      content = content.replace(
        "import { OptimizedAvatar } from '@/components/ui/optimized-image'",
        "// import { OptimizedAvatar } from '@/components/ui/optimized-image' // Temporarily disabled for SSR"
      );
      
      fs.writeFileSync(filePath, content);
      this.fixes.push('Removed problematic OptimizedAvatar import from dashboard');
    }
  }

  async fixUnifiedTestRunner() {
    await this.log('🧪 Fixing unified test runner parsing...');
    
    const filePath = 'scripts/unified-test-runner.js';
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Fix the parseTestResults function
      const fixedFunction = `  parseTestResults(output) {
    let passed = 0;
    let failed = 0;
    
    // Add robust null and undefined checks
    if (!output || typeof output !== 'string') {
      return { passed: 0, failed: 0, total: 0 };
    }
    
    try {
      // Look for multiple patterns
      const passedMatch = output.match(/(\\d+)\\s+passed/i) || output.match(/✓\\s*(\\d+)/);
      const failedMatch = output.match(/(\\d+)\\s+failed/i) || output.match(/✘\\s*(\\d+)/);
      
      passed = passedMatch ? parseInt(passedMatch[1]) : 0;
      failed = failedMatch ? parseInt(failedMatch[1]) : 0;
      
      return { passed, failed, total: passed + failed };
    } catch (error) {
      console.warn('⚠️ Error parsing test results:', error.message);
      return { passed: 0, failed: 0, total: 0 };
    }
  }`;

      content = content.replace(
        /parseTestResults\(output\)[\s\S]*?return \{ passed, failed, total: passed \+ failed \};\s*}/,
        fixedFunction
      );
      
      fs.writeFileSync(filePath, content);
      this.fixes.push('Fixed unified test runner parsing errors');
    }
  }

  async cleanCaches() {
    await this.log('🧹 Cleaning all caches...');
    
    const commands = [
      'rm -rf .next',
      'rm -rf node_modules/.cache',
      'rm -rf test-results',
      'rm -rf playwright-report',
      'rm -rf tsconfig.tsbuildinfo'
    ];
    
    for (const cmd of commands) {
      await this.executeCommand(cmd);
    }
    
    this.fixes.push('Cleaned all cache directories');
  }

  async testBuild() {
    await this.log('🏗️ Testing build...');
    
    const result = await this.executeCommand('npm run build');
    if (result.success) {
      this.fixes.push('Build process working correctly');
      return true;
    } else {
      await this.log(`❌ Build failed: ${result.stderr}`);
      return false;
    }
  }

  async run() {
    await this.log('🚨 Starting Emergency Fix Process');
    
    try {
      await this.cleanCaches();
      await this.fixOptimizedImageSSR();
      await this.fixDashboardImports();
      await this.fixUnifiedTestRunner();
      
      const buildSuccess = await this.testBuild();
      
      await this.log('🏁 Emergency fixes completed!');
      await this.log(`✅ Applied ${this.fixes.length} fixes`);
      
      if (buildSuccess) {
        await this.log('🟢 Build is now working - you can run tests!');
      } else {
        await this.log('🟡 Build still has issues - manual intervention needed');
      }
      
      return buildSuccess;
      
    } catch (error) {
      await this.log(`💥 Fatal error during emergency fixes: ${error.message}`);
      return false;
    }
  }
}

if (require.main === module) {
  const fixer = new EmergencyFixer();
  fixer.run().then(success => {
    console.log(success ? '🟢 Emergency fixes successful!' : '🔴 Emergency fixes failed');
    process.exit(success ? 0 : 1);
  });
}

module.exports = EmergencyFixer; 