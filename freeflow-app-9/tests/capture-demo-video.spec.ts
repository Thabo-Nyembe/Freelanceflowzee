/**
 * KAZI Demo Video Capture Script
 *
 * This script automates browser interactions to capture screenshots and videos
 * for the demo videos. Run with: npx playwright test scripts/capture-demo-video.ts
 *
 * Or for video recording: npx playwright test scripts/capture-demo-video.ts --headed
 */

import { test, expect, Page } from '@playwright/test'
import path from 'path'
import fs from 'fs'

const BASE_URL = 'http://localhost:9323'
const DEMO_URL = `${BASE_URL}/dashboard?demo=true`
const OUTPUT_DIR = path.join(process.cwd(), 'demo-captures')

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}

// Helper to wait for animations
async function waitForAnimations(page: Page) {
  await page.waitForTimeout(500)
}

// Helper to take a labeled screenshot
async function captureScreen(page: Page, name: string) {
  await waitForAnimations(page)
  const filename = `${name.replace(/\s+/g, '-').toLowerCase()}.png`
  await page.screenshot({
    path: path.join(OUTPUT_DIR, filename),
    fullPage: false
  })
  console.log(`  ✓ Captured: ${filename}`)
}

test.describe('KAZI Demo Capture', () => {

  test.beforeEach(async ({ page }) => {
    // Set viewport for consistent captures
    await page.setViewportSize({ width: 1920, height: 1080 })
  })

  test('Video 1: Platform Overview', async ({ page }) => {
    console.log('\n📹 Video 1: Platform Overview\n')

    // Scene 1: Dashboard
    await page.goto(DEMO_URL)
    await page.waitForLoadState('networkidle')
    await captureScreen(page, '01-dashboard-overview')

    // Scene 2: Projects Hub
    await page.click('text=Projects')
    await page.waitForLoadState('networkidle')
    await waitForAnimations(page)
    await captureScreen(page, '02-projects-hub')

    // Scene 3: Time Tracking
    await page.click('text=Time Tracking')
    await page.waitForLoadState('networkidle')
    await captureScreen(page, '03-time-tracking')

    // Scene 4: Invoices
    await page.click('text=Invoices')
    await page.waitForLoadState('networkidle')
    await captureScreen(page, '04-invoices')

    // Scene 5: Clients
    await page.click('text=Clients')
    await page.waitForLoadState('networkidle')
    await captureScreen(page, '05-clients')

    // Scene 6: Messages
    await page.click('text=Messages')
    await page.waitForLoadState('networkidle')
    await captureScreen(page, '06-messages')

    // Scene 7: Files
    await page.click('text=Files')
    await page.waitForLoadState('networkidle')
    await captureScreen(page, '07-files')

    // Scene 8: AI Tools (if available)
    const aiLink = page.locator('text=AI').first()
    if (await aiLink.isVisible()) {
      await aiLink.click()
      await page.waitForLoadState('networkidle')
      await captureScreen(page, '08-ai-tools')
    }

    // Scene 9: Settings
    await page.click('text=Settings')
    await page.waitForLoadState('networkidle')
    await captureScreen(page, '09-settings')

    console.log('\n✅ Video 1 captures complete\n')
  })

  test('Video 2: Getting Started Flow', async ({ page }) => {
    console.log('\n📹 Video 2: Getting Started Flow\n')

    // Start at dashboard
    await page.goto(DEMO_URL)
    await page.waitForLoadState('networkidle')

    // Navigate to Clients
    await page.click('text=Clients')
    await page.waitForLoadState('networkidle')
    await captureScreen(page, '10-clients-page')

    // Look for Add Client button
    const addClientBtn = page.locator('button:has-text("Add"), button:has-text("New Client"), a:has-text("Add Client")').first()
    if (await addClientBtn.isVisible()) {
      await addClientBtn.click()
      await page.waitForTimeout(500)
      await captureScreen(page, '11-add-client-form')
    }

    // Navigate to Projects
    await page.click('text=Projects')
    await page.waitForLoadState('networkidle')
    await captureScreen(page, '12-projects-page')

    // Look for New Project button
    const newProjectBtn = page.locator('button:has-text("New Project"), button:has-text("Create"), a:has-text("New Project")').first()
    if (await newProjectBtn.isVisible()) {
      await newProjectBtn.click()
      await page.waitForTimeout(500)
      await captureScreen(page, '13-new-project-form')
    }

    console.log('\n✅ Video 2 captures complete\n')
  })

  test('Video 3: Invoicing Walkthrough', async ({ page }) => {
    console.log('\n📹 Video 3: Invoicing Walkthrough\n')

    // Navigate to Invoices
    await page.goto(`${BASE_URL}/dashboard/invoices?demo=true`)
    await page.waitForLoadState('networkidle')
    await captureScreen(page, '20-invoices-list')

    // Look for New Invoice button
    const newInvoiceBtn = page.locator('button:has-text("New Invoice"), button:has-text("Create Invoice"), a:has-text("New Invoice")').first()
    if (await newInvoiceBtn.isVisible()) {
      await newInvoiceBtn.click()
      await page.waitForTimeout(500)
      await captureScreen(page, '21-new-invoice-form')
    }

    // Try to navigate to an invoice detail page
    const invoiceLink = page.locator('a[href*="/invoice"], tr:has-text("INV")').first()
    if (await invoiceLink.isVisible()) {
      await invoiceLink.click()
      await page.waitForLoadState('networkidle')
      await captureScreen(page, '22-invoice-detail')
    }

    console.log('\n✅ Video 3 captures complete\n')
  })

  test('Video 4: AI Features Demo', async ({ page }) => {
    console.log('\n📹 Video 4: AI Features Demo\n')

    // Navigate to AI Dashboard
    await page.goto(`${BASE_URL}/dashboard/ai?demo=true`)
    await page.waitForLoadState('networkidle')
    await captureScreen(page, '30-ai-dashboard')

    // Try AI Create/Studio
    await page.goto(`${BASE_URL}/dashboard/ai-create?demo=true`)
    await page.waitForLoadState('networkidle')
    await captureScreen(page, '31-ai-create')

    // Try AI Design
    await page.goto(`${BASE_URL}/dashboard/ai-design?demo=true`)
    await page.waitForLoadState('networkidle')
    await captureScreen(page, '32-ai-design')

    console.log('\n✅ Video 4 captures complete\n')
  })

  test('Full Page Gallery', async ({ page }) => {
    console.log('\n📸 Capturing Full Page Gallery\n')

    const pages = [
      { url: '/dashboard', name: 'dashboard' },
      { url: '/dashboard/my-day', name: 'my-day' },
      { url: '/dashboard/projects', name: 'projects' },
      { url: '/dashboard/time-tracking', name: 'time-tracking' },
      { url: '/dashboard/invoices', name: 'invoices' },
      { url: '/dashboard/clients', name: 'clients' },
      { url: '/dashboard/messages', name: 'messages' },
      { url: '/dashboard/files', name: 'files' },
      { url: '/dashboard/calendar', name: 'calendar' },
      { url: '/dashboard/analytics', name: 'analytics' },
      { url: '/dashboard/team', name: 'team' },
      { url: '/dashboard/settings', name: 'settings' },
    ]

    for (const p of pages) {
      try {
        await page.goto(`${BASE_URL}${p.url}?demo=true`, { timeout: 10000 })
        await page.waitForLoadState('networkidle', { timeout: 5000 })
        await captureScreen(page, `gallery-${p.name}`)
      } catch (e) {
        console.log(`  ⚠ Skipped: ${p.name} (page not available)`)
      }
    }

    console.log('\n✅ Gallery captures complete\n')
  })

})

// Video recording configuration
test.use({
  video: 'on',
  screenshot: 'on',
})
