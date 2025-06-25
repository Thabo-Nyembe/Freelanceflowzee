#!/usr/bin/env node

const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

class BatchedTestRunner {
  constructor() {
    this.testBatches = [
      {
        name: 'Landing Page Tests',
        tests: ['tests/e2e/landing-page.spec.ts'],
        timeout: 30000
      },
      {
        name: 'AI Create Tests',
        tests: ['tests/e2e/ai-create.spec.ts'],
        timeout: 45000
      },
      {
        name: 'Dashboard Navigation Tests',
        tests: ['tests/e2e/dashboard-navigation.spec.ts'],
        timeout: 30000
      },
      {
        name: 'Payment System Tests',
        tests: ['tests/e2e/payment-flow.spec.ts'],
        timeout: 30000
      },
      {
        name: 'API Tests',
        tests: ['tests/e2e/api-integration.spec.ts'],
        timeout: 20000
      }
    ]
    this.results = []
    this.serverPort = process.env.PORT || 3001
  }

  log(message, color = 'reset') {
    const colors = {
      reset: '\x1b[0m',
      bright: '\x1b[1m',
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      magenta: '\x1b[35m',
      cyan: '\x1b[36m'
    }
    console.log(`${colors[color]}${message}${colors.reset}`)
  }

  async checkServerHealth() {
    // Try multiple ports to find running server
    const ports = [3001, 3000, 3002, 3003, 3004, 3005]
    
    for (const port of ports) {
      try {
        const response = await fetch(`http://localhost:${port}`)
        if (response.ok) {
          this.serverPort = port
          return true
        }
      } catch (error) {
        // Continue to next port
      }
    }
    return false
  }

  async runPlaywrightBatch(batch) {
    this.log(`\n🧪 Running: ${batch.name}`, 'cyan')
    this.log(`📁 Tests: ${batch.tests.join(', ')}`, 'blue')

    return new Promise((resolve) => {
      const startTime = Date.now()
      
      // Only run tests that exist
      const existingTests = batch.tests.filter(test => 
        fs.existsSync(path.join(process.cwd(), test))
      )

      if (existingTests.length === 0) {
        this.log(`⚠️  No test files found for ${batch.name}`, 'yellow')
        resolve({
          name: batch.name,
          status: 'skipped',
          duration: 0,
          output: 'No test files found'
        })
        return
      }

      const args = [
        'playwright', 'test',
        ...existingTests,
        '--timeout', batch.timeout.toString(),
        '--workers', '1',
        '--reporter', 'line',
        '--max-failures', '3'
      ]

      const testProcess = spawn('npx', args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: process.cwd()
      })

      let output = ''
      let errorOutput = ''

      testProcess.stdout.on('data', (data) => {
        const text = data.toString()
        output += text
        console.log(text.trim())
      })

      testProcess.stderr.on('data', (data) => {
        const text = data.toString()
        errorOutput += text
        console.error(text.trim())
      })

      const timeout = setTimeout(() => {
        this.log(`⏰ Timeout reached for ${batch.name}`, 'yellow')
        testProcess.kill('SIGTERM')
      }, batch.timeout + 10000)

      testProcess.on('close', (code) => {
        clearTimeout(timeout)
        const duration = Date.now() - startTime
        
        const result = {
          name: batch.name,
          status: code === 0 ? 'passed' : 'failed',
          duration,
          output: output + errorOutput,
          exitCode: code
        }

        if (code === 0) {
          this.log(`✅ ${batch.name} - PASSED (${duration}ms)`, 'green')
        } else {
          this.log(`❌ ${batch.name} - FAILED (${duration}ms)`, 'red')
        }

        resolve(result)
      })

      testProcess.on('error', (error) => {
        clearTimeout(timeout)
        this.log(`💥 Error running ${batch.name}: ${error.message}`, 'red')
        resolve({
          name: batch.name,
          status: 'error',
          duration: Date.now() - startTime,
          output: error.message,
          error: error.message
        })
      })
    })
  }

  async runAllBatches() {
    this.log('🚀 Starting Batched Test Runner', 'bright')
    this.log(`🌐 Testing against server: http://localhost:${this.serverPort}`, 'blue')

    // Check server health
    const serverHealthy = await this.checkServerHealth()
    if (!serverHealthy) {
      this.log(`❌ Server not responding on port ${this.serverPort}`, 'red')
      this.log('💡 Make sure to run: npm run dev', 'yellow')
      return
    }
    this.log('✅ Server is healthy', 'green')

    const totalStart = Date.now()

    for (let i = 0; i < this.testBatches.length; i++) {
      const batch = this.testBatches[i]
      this.log(`\n📊 Batch ${i + 1}/${this.testBatches.length}`, 'magenta')
      
      const result = await this.runPlaywrightBatch(batch)
      this.results.push(result)

      // Small delay between batches
      if (i < this.testBatches.length - 1) {
        this.log('⏳ Waiting 3 seconds before next batch...', 'yellow')
        await new Promise(resolve => setTimeout(resolve, 3000))
      }
    }

    this.generateReport(Date.now() - totalStart)
  }

  generateReport(totalDuration) {
    this.log('\n📈 TEST BATCH SUMMARY', 'bright')
    this.log('=' .repeat(50), 'blue')

    const passed = this.results.filter(r => r.status === 'passed').length
    const failed = this.results.filter(r => r.status === 'failed').length
    const skipped = this.results.filter(r => r.status === 'skipped').length
    const errors = this.results.filter(r => r.status === 'error').length

    this.results.forEach(result => {
      const icon = {
        passed: '✅',
        failed: '❌',
        skipped: '⚠️',
        error: '💥'
      }[result.status]
      
      const color = {
        passed: 'green',
        failed: 'red',
        skipped: 'yellow',
        error: 'red'
      }[result.status]

      this.log(`${icon} ${result.name} - ${result.status.toUpperCase()} (${result.duration}ms)`, color)
    })

    this.log('\n📊 STATISTICS:', 'bright')
    this.log(`✅ Passed: ${passed}`, 'green')
    this.log(`❌ Failed: ${failed}`, 'red')
    this.log(`⚠️  Skipped: ${skipped}`, 'yellow')
    this.log(`💥 Errors: ${errors}`, 'red')
    this.log(`⏱️  Total Duration: ${totalDuration}ms`, 'blue')

    const successRate = Math.round((passed / (passed + failed + errors)) * 100) || 0
    this.log(`📈 Success Rate: ${successRate}%`, successRate >= 80 ? 'green' : successRate >= 60 ? 'yellow' : 'red')

    // Save detailed report
    const reportPath = 'test-batch-report.json'
    fs.writeFileSync(reportPath, JSON.stringify({
      summary: { passed, failed, skipped, errors, successRate, totalDuration },
      results: this.results,
      timestamp: new Date().toISOString()
    }, null, 2))

    this.log(`\n💾 Detailed report saved: ${reportPath}`, 'cyan')
    
    if (failed > 0 || errors > 0) {
      this.log('\n🔍 FAILED TESTS DETAILS:', 'red')
      this.results
        .filter(r => r.status === 'failed' || r.status === 'error')
        .forEach(result => {
          this.log(`\n❌ ${result.name}:`, 'red')
          this.log(result.output.split('\n').slice(-10).join('\n'), 'reset')
        })
    }
  }
}

// Run if called directly
if (require.main === module) {
  const runner = new BatchedTestRunner()
  runner.runAllBatches().catch(error => {
    console.error('💥 Test runner failed:', error)
    process.exit(1)
  })
}

module.exports = BatchedTestRunner 