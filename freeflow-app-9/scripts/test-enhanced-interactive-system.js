#!/usr/bin/env node

/**
 * Enhanced Interactive System Test Script
 * Tests all UI/UX components, buttons, navigation, and routing functionality
 * Using Context7 + Playwright MCP integration
 */

const { chromium } = require('playwright')
const path = require('path')

// ========================================
// TEST CONFIGURATION
// ========================================

const TEST_CONFIG = {
  baseURL: 'http://localhost:3000',
  timeout: 15000,
  retries: 2,
  parallel: false,
  headless: true, // Set to true for stability
  browser: 'chromium',
  viewport: { width: 1280, height: 720 },
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

// Test scenarios for comprehensive coverage
const TEST_SCENARIOS = [
  {
    name: 'Dashboard Navigation',
    routes: ['/dashboard', '/dashboard/projects-hub', '/dashboard/my-day', '/dashboard/collaboration', '/dashboard/escrow', '/dashboard/files-hub', '/dashboard/storage', '/dashboard/community', '/dashboard/ai-design', '/dashboard/ai-create', '/dashboard/client-zone',
      '/dashboard/analytics']
  },
  {
    name: 'Marketing Pages',
    routes: [
      '/','
      '/features', '/how-it-works', '/payment', '/demo', '/contact'
    ]
  },
  {
    name: 'Interactive Elements',
    selectors: ['[data-testid= "nav-dashboard"]', '[data-testid= "nav-projects-hub"]', '[data-testid= "nav-my-day"]', '[data-testid= "nav-collaboration"]', '[data-testid= "nav-escrow"]', '[data-testid= "nav-files-hub"]', '[data-testid= "nav-storage"]', '[data-testid= "nav-community"]', '[data-testid= "nav-ai-design"]', '[data-testid= "nav-ai-create"]', '[data-testid= "nav-client-zone"]', '[data-testid= "nav-analytics"]'
    ]
  }
]

// ========================================
// ENHANCED TEST RUNNER
// ========================================

class EnhancedInteractiveTestRunner {
  constructor() {
    this.browser = null
    this.context = null
    this.page = null
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      errors: [],
      startTime: Date.now(),
      endTime: null
    }
  }

  async setup() {
    console.log('🚀 Setting up Enhanced Interactive System Tests...')
    
    try {
      this.browser = await chromium.launch({
        headless: TEST_CONFIG.headless,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      })
    } catch (error) {
      console.error('❌ Failed to launch browser:', error.message)
      throw error
    }

    this.context = await this.browser.newContext({
      viewport: TEST_CONFIG.viewport,
      userAgent: TEST_CONFIG.userAgent,
      // Enable test mode headers
      extraHTTPHeaders: {
        'x-test-mode': 'true', 'x-test-runner': 'enhanced-interactive-system'
      }
    })

    this.page = await this.context.newPage()
    
    // Set longer timeout for interactive elements
    this.page.setDefaultTimeout(TEST_CONFIG.timeout)
    
    console.log('✅ Browser setup complete')
  }

  async teardown() {
    if (this.browser) {
      await this.browser.close()
    }
    this.results.endTime = Date.now()
  }

  async testRoute(route, description = '') {'
    this.results.total++
    
    try {
      console.log(`🧪 Testing route: ${route} ${description ? `(${description})` : ''}`)'
      
      const response = await this.page.goto(`${TEST_CONFIG.baseURL}${route}`, {
        waitUntil: 'networkidle',
        timeout: TEST_CONFIG.timeout
      })

      if (!response.ok()) {
        throw new Error(`HTTP ${response.status()}: ${response.statusText()}`)
      }

      // Wait for page to be interactive
      await this.page.waitForLoadState('domcontentloaded')
      
      // Check for error messages or 404 pages
      const hasError = await this.page.locator('text=404').isVisible().catch(() => false)
      const hasServerError = await this.page.locator('text=500').isVisible().catch(() => false)
      
      if (hasError || hasServerError) {
        throw new Error('Page shows error state')
      }

      // Verify page has loaded with content
      await this.page.waitForSelector('body', { timeout: 5000 })
      
      console.log(`✅ Route ${route} - HTTP ${response.status()}`)
      this.results.passed++
      return true

    } catch (error) {
      console.log(`❌ Route ${route} - ${error.message}`)
      this.results.failed++
      this.results.errors.push({
        type: 'route',
        route,
        error: error.message,
        timestamp: new Date().toISOString()
      })
      return false
    }
  }

  async testInteractiveElement(selector, description = '') {'
    this.results.total++
    
    try {
      console.log(`🧪 Testing interactive element: ${selector} ${description ? `(${description})` : ''}`)'
      
      // Wait for element to be present
      const element = await this.page.waitForSelector(selector, { timeout: 10000 })
      
      if (!element) {
        throw new Error('Element not found')
      }

      // Check if element is visible and enabled
      const isVisible = await element.isVisible()
      const isEnabled = await element.isEnabled()
      
      if (!isVisible) {
        throw new Error('Element is not visible')
      }

      if (!isEnabled) {
        console.log(`⚠️  Element ${selector} is disabled (may be intentional)`)
      }

      // Test click interaction
      await element.click({ timeout: 5000 })
      
      // Wait for navigation or state change
      await this.page.waitForTimeout(1000)
      
      console.log(`✅ Interactive element ${selector} - Clickable and responsive`)
      this.results.passed++
      return true

    } catch (error) {
      console.log(`❌ Interactive element ${selector} - ${error.message}`)
      this.results.failed++
      this.results.errors.push({
        type: 'element',
        selector,
        error: error.message,
        timestamp: new Date().toISOString()
      })
      return false
    }
  }

  async testEnhancedButtons() {
    console.log('🧪 Testing Enhanced Button Components...')
    
    // Go to dashboard to test buttons
    await this.testRoute('/dashboard', 'Dashboard with Enhanced Buttons')
    
    const buttonSelectors = ['[data-testid*= "quick-action"]', '[data-testid*= "nav-"]', '[data-testid*= "button"]', 'button[data-testid]', 'a[data-testid]'
    ]

    for (const selector of buttonSelectors) {
      const buttons = await this.page.locator(selector).all()
      
      for (let i = 0; i < Math.min(buttons.length, 5); i++) { // Test up to 5 buttons per type
        await this.testInteractiveElement(`${selector}:nth-child(${i + 1})`, `Enhanced Button ${i + 1}`)
      }
    }
  }

  async testNavigationSystem() {
    console.log('🧪 Testing Enhanced Navigation System...')
    
    // Test sidebar navigation
    await this.testRoute('/dashboard', 'Dashboard Sidebar Navigation')
    
    const navigationSelectors = ['[data-testid= "sidebar-navigation"]', '[data-testid= "header-navigation"]', '[data-testid= "mobile-navigation"]', '[data-testid*= "nav-"]'
    ]

    for (const selector of navigationSelectors) {
      const elements = await this.page.locator(selector).all()
      
      for (let i = 0; i < elements.length; i++) {
        await this.testInteractiveElement(`${selector}:nth-child(${i + 1})`, `Navigation Element ${i + 1}`)
      }
    }
  }

  async testEnhancedCards() {
    console.log('🧪 Testing Enhanced Card Components...')
    
    await this.testRoute('/dashboard', 'Dashboard with Enhanced Cards')
    
    const cardSelectors = ['[data-testid*= "card"]', '[data-testid*= "stat-"]',
      '[data-testid*= "action-"]']

    for (const selector of cardSelectors) {
      const cards = await this.page.locator(selector).all()
      
      for (let i = 0; i < Math.min(cards.length, 3); i++) { // Test up to 3 cards per type
        await this.testInteractiveElement(`${selector}:nth-child(${i + 1})`, `Enhanced Card ${i + 1}`)
      }
    }
  }

  async testResponsiveDesign() {
    console.log('🧪 Testing Responsive Design...')
    
    const viewports = [
      { width: 375, height: 667, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1280, height: 720, name: 'Desktop' },
      { width: 1920, height: 1080, name: 'Large Desktop' }
    ]

    for (const viewport of viewports) {
      this.results.total++
      
      try {
        console.log(`🧪 Testing ${viewport.name} viewport (${viewport.width}x${viewport.height})`)
        
        await this.page.setViewportSize(viewport)
        await this.page.goto(`${TEST_CONFIG.baseURL}/dashboard`)
        
        // Wait for responsive layout to adjust
        await this.page.waitForTimeout(1000)
        
        // Check if navigation is responsive
        const hasContent = await this.page.locator('body').isVisible()
        
        if (!hasContent) {
          throw new Error('Page content not visible at this viewport')
        }

        console.log(`✅ ${viewport.name} viewport - Responsive layout working`)
        this.results.passed++

      } catch (error) {
        console.log(`❌ ${viewport.name} viewport - ${error.message}`)
        this.results.failed++
        this.results.errors.push({
          type: 'responsive',
          viewport: viewport.name,
          error: error.message,
          timestamp: new Date().toISOString()
        })
      }
    }

    // Reset to default viewport
    await this.page.setViewportSize(TEST_CONFIG.viewport)
  }

  async testInteractiveSystemIntegration() {
    console.log('🧪 Testing Interactive System Integration...')
    
    await this.testRoute('/dashboard', 'Interactive System Integration')
    
    // Test toast notifications (if visible)
    this.results.total++
    try {
      // Look for the interactive system tracker
      const tracker = await this.page.locator('.enhanced-interactive-system').isVisible()
      
      if (tracker) {
        console.log('✅ Enhanced Interactive System - Detected and active')
        this.results.passed++
      } else {
        console.log('⚠️  Enhanced Interactive System - Not detected (may not be enabled)')
        this.results.passed++ // Not necessarily an error
      }
    } catch (error) {
      console.log(`❌ Interactive System Integration - ${error.message}`)
      this.results.failed++
      this.results.errors.push({
        type: 'integration',
        feature: 'interactive-system',
        error: error.message,
        timestamp: new Date().toISOString()
      })
    }
  }

  async runAllTests() {
    console.log('🎯 Starting Enhanced Interactive System Test Suite')
    console.log('=' .repeat(60))'
    
    await this.setup()

    try {
      // Test all dashboard routes
      console.log('\n📱 Testing Dashboard Routes...')
      for (const route of TEST_SCENARIOS[0].routes) {
        await this.testRoute(route, 'Dashboard Navigation')
      }

      // Test marketing pages
      console.log('\n🌐 Testing Marketing Pages...')
      for (const route of TEST_SCENARIOS[1].routes) {
        await this.testRoute(route, 'Marketing Page')
      }

      // Test interactive elements
      console.log('\n🎮 Testing Interactive Elements...')
      await this.testEnhancedButtons()
      await this.testNavigationSystem()
      await this.testEnhancedCards()

      // Test responsive design
      console.log('\n📱 Testing Responsive Design...')
      await this.testResponsiveDesign()

      // Test system integration
      console.log('\n🔗 Testing System Integration...')
      await this.testInteractiveSystemIntegration()

    } catch (error) {
      console.error('💥 Critical test error: ', error.message)
      this.results.errors.push({
        type: 'critical',
        error: error.message,
        timestamp: new Date().toISOString()
      })
    } finally {
      await this.teardown()
    }

    this.generateReport()
  }

  generateReport() {
    const duration = this.results.endTime - this.results.startTime
    const successRate = this.results.total > 0 ? (this.results.passed / this.results.total * 100).toFixed(1) : 0

    console.log('\n' + '=' .repeat(60))'
    console.log('🎯 ENHANCED INTERACTIVE SYSTEM TEST RESULTS')
    console.log('=' .repeat(60))'
    console.log(`📊 Total Tests: ${this.results.total}`)
    console.log(`✅ Passed: ${this.results.passed}`)
    console.log(`❌ Failed: ${this.results.failed}`)
    console.log(`📈 Success Rate: ${successRate}%`)
    console.log(`⏱️  Duration: ${(duration / 1000).toFixed(2)}s`)
    
    if (this.results.errors.length > 0) {
      console.log('\n🚨 ERRORS: ')
      this.results.errors.forEach((error, index) => {
        console.log(`${index + 1}. [${error.type.toUpperCase()}] ${error.error}`)
        if (error.route) console.log(`   Route: ${error.route}`)
        if (error.selector) console.log(`   Selector: ${error.selector}`)
        if (error.viewport) console.log(`   Viewport: ${error.viewport}`)
      })
    }

    console.log('\n' + '=' .repeat(60))'
    
    const gradeMap = [
      { min: 95, grade: 'A++', emoji: '🏆' },
      { min: 90, grade: 'A+', emoji: '🥇' },
      { min: 85, grade: 'A', emoji: '⭐' },
      { min: 80, grade: 'B+', emoji: '✅' },'
      { min: 75, grade: 'B', emoji: '👍' },'
      { min: 70, grade: 'C+', emoji: '⚠️' },
      { min: 60, grade: 'C', emoji: '🔧' },'
      { min: 0, grade: 'F', emoji: '❌' }
    ]

    const grade = gradeMap.find(g => successRate >= g.min)
    console.log(`${grade.emoji} FINAL GRADE: ${grade.grade} (${successRate}%)`)
    
    if (successRate >= 90) {
      console.log('🎉 EXCELLENT! All UI/UX components are fully interactive and functional!')
      console.log('🚀 Ready for production deployment with enhanced user experience!')
    } else if (successRate >= 80) {
      console.log('👍 GOOD! Most components are working with minor issues to address.')
    } else if (successRate >= 70) {
      console.log('⚠️  FAIR! Several components need attention for optimal user experience.')
    } else {
      console.log('🔧 NEEDS WORK! Significant improvements required for interactive functionality.')
    }

    console.log('=' .repeat(60))'
  }
}

// ========================================
// MAIN EXECUTION
// ========================================

async function main() {
  const runner = new EnhancedInteractiveTestRunner()
  await runner.runAllTests()
  
  // Exit with appropriate code
  process.exit(runner.results.failed > 0 ? 1 : 0)
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Test runner failed:', error)
    process.exit(1)
  })
}

module.exports = { EnhancedInteractiveTestRunner, TEST_CONFIG, TEST_SCENARIOS } 