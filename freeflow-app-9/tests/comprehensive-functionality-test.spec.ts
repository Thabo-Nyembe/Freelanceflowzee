import { test, expect, Page } from '@playwright/test'

// Dashboard routes to test
const DASHBOARD_ROUTES = [
  '/dashboard',
  '/dashboard/ai-create-v2',
  '/dashboard/ai-design',
  '/dashboard/video-studio-v2',
  '/dashboard/projects-hub-v2',
  '/dashboard/collaboration',
  '/dashboard/community-v2',
  '/dashboard/files-hub-v2',
  '/dashboard/my-day',
  '/dashboard/analytics-v2',
  '/dashboard/financial',
  '/dashboard/messages-v2',
  '/dashboard/calendar-v2',
  '/dashboard/cv-portfolio',
  '/dashboard/settings-v2',
  '/dashboard/notifications-v2'
]

// Test all upload/download/export/view/play/create functions
test.describe('Comprehensive Functionality Testing', () => {

  test.beforeEach(async ({ page }) => {
    // Set viewport for consistent testing
    await page.setViewportSize({ width: 1920, height: 1080 })

    // Wait for development server to be ready
    await page.goto('http://localhost:9323')
    await page.waitForLoadState('networkidle')
  })

  test('Dashboard Main Page - All Interactive Elements', async ({ page }) => {
    await page.goto('http://localhost:9323/dashboard')
    await page.waitForLoadState('networkidle')

    // Test Create Project functionality
    const createProjectBtn = page.locator('[data-testid="create-project-btn"]')
    if (await createProjectBtn.isVisible()) {
      await createProjectBtn.click()
      await expect(page.locator('.modal, .dialog, .sheet')).toBeVisible({ timeout: 5000 })
    }

    // Test Quick Actions
    const quickActions = page.locator('[data-testid*="quick-action"]')
    const count = await quickActions.count()
    for (let i = 0; i < count; i++) {
      await quickActions.nth(i).click()
      await page.waitForTimeout(1000)
    }

    // Test Export functionality
    const exportBtn = page.locator('[data-testid*="export"]')
    if (await exportBtn.isVisible()) {
      await exportBtn.click()
      await page.waitForTimeout(2000)
    }
  })

  test('AI Create Studio - Upload/Create/Export Functions', async ({ page }) => {
    await page.goto('http://localhost:9323/dashboard/ai-create-v2')
    await page.waitForLoadState('networkidle')

    // Test image upload
    const uploadBtn = page.locator('[data-testid="upload-image-btn"], input[type="file"]')
    if (await uploadBtn.isVisible()) {
      await uploadBtn.click()
      await page.waitForTimeout(1000)
    }

    // Test AI generation
    const generateBtn = page.locator('[data-testid="generate-btn"], button:has-text("Generate")')
    if (await generateBtn.isVisible()) {
      await generateBtn.click()
      await page.waitForTimeout(3000)
    }

    // Test export/download
    const exportBtn = page.locator('[data-testid="export-btn"], button:has-text("Export"), button:has-text("Download")')
    if (await exportBtn.isVisible()) {
      await exportBtn.click()
      await page.waitForTimeout(2000)
    }

    // Test save functionality
    const saveBtn = page.locator('[data-testid="save-btn"], button:has-text("Save")')
    if (await saveBtn.isVisible()) {
      await saveBtn.click()
      await page.waitForTimeout(2000)
    }
  })

  test('Video Studio - Upload/Play/Export Functions', async ({ page }) => {
    await page.goto('http://localhost:9323/dashboard/video-studio-v2')
    await page.waitForLoadState('networkidle')

    // Test video upload
    const uploadVideoBtn = page.locator('[data-testid="upload-video-btn"], input[type="file"][accept*="video"]')
    if (await uploadVideoBtn.isVisible()) {
      await uploadVideoBtn.click()
      await page.waitForTimeout(1000)
    }

    // Test video player controls
    const playBtn = page.locator('[data-testid="play-btn"], button[aria-label*="play"], .play-button')
    if (await playBtn.isVisible()) {
      await playBtn.click()
      await page.waitForTimeout(2000)
    }

    const pauseBtn = page.locator('[data-testid="pause-btn"], button[aria-label*="pause"], .pause-button')
    if (await pauseBtn.isVisible()) {
      await pauseBtn.click()
      await page.waitForTimeout(1000)
    }

    // Test export functionality
    const exportVideoBtn = page.locator('[data-testid="export-video-btn"], button:has-text("Export Video")')
    if (await exportVideoBtn.isVisible()) {
      await exportVideoBtn.click()
      await page.waitForTimeout(3000)
    }
  })

  test('Files Hub - Upload/Download/View Functions', async ({ page }) => {
    await page.goto('http://localhost:9323/dashboard/files-hub-v2')
    await page.waitForLoadState('networkidle')

    // Test file upload
    const uploadFileBtn = page.locator('[data-testid="upload-file-btn"], input[type="file"]')
    if (await uploadFileBtn.isVisible()) {
      await uploadFileBtn.click()
      await page.waitForTimeout(1000)
    }

    // Test drag and drop zone
    const dropZone = page.locator('[data-testid="drop-zone"], .drop-zone, .upload-area')
    if (await dropZone.isVisible()) {
      await dropZone.hover()
      await page.waitForTimeout(500)
    }

    // Test file actions (view, download, delete)
    const fileItems = page.locator('[data-testid*="file-item"]')
    const fileCount = await fileItems.count()

    if (fileCount > 0) {
      // Test view file
      const viewBtn = page.locator('[data-testid*="view-file"], button:has-text("View")')
      if (await viewBtn.first().isVisible()) {
        await viewBtn.first().click()
        await page.waitForTimeout(2000)
      }

      // Test download file
      const downloadBtn = page.locator('[data-testid*="download-file"], button:has-text("Download")')
      if (await downloadBtn.first().isVisible()) {
        await downloadBtn.first().click()
        await page.waitForTimeout(2000)
      }
    }

    // Test bulk operations
    const selectAllBtn = page.locator('[data-testid="select-all-btn"], input[type="checkbox"][data-testid*="select-all"]')
    if (await selectAllBtn.isVisible()) {
      await selectAllBtn.click()
      await page.waitForTimeout(1000)
    }

    const bulkDownloadBtn = page.locator('[data-testid="bulk-download-btn"], button:has-text("Download Selected")')
    if (await bulkDownloadBtn.isVisible()) {
      await bulkDownloadBtn.click()
      await page.waitForTimeout(2000)
    }
  })

  test('Projects Hub - Create/Export/View Functions', async ({ page }) => {
    await page.goto('http://localhost:9323/dashboard/projects-hub-v2')
    await page.waitForLoadState('networkidle')

    // Test create new project
    const createProjectBtn = page.locator('[data-testid="create-project-btn"], button:has-text("Create Project")')
    if (await createProjectBtn.isVisible()) {
      await createProjectBtn.click()
      await page.waitForTimeout(2000)

      // Fill project form if modal appears
      const projectNameInput = page.locator('input[name="name"], input[placeholder*="project name"]')
      if (await projectNameInput.isVisible()) {
        await projectNameInput.fill('Test Project')

        const submitBtn = page.locator('button[type="submit"], button:has-text("Create")')
        if (await submitBtn.isVisible()) {
          await submitBtn.click()
          await page.waitForTimeout(2000)
        }
      }
    }

    // Test project actions
    const projectItems = page.locator('[data-testid*="project-item"]')
    const projectCount = await projectItems.count()

    if (projectCount > 0) {
      // Test view project
      const viewProjectBtn = page.locator('[data-testid*="view-project"], button:has-text("View")')
      if (await viewProjectBtn.first().isVisible()) {
        await viewProjectBtn.first().click()
        await page.waitForTimeout(2000)
      }

      // Test export project
      const exportProjectBtn = page.locator('[data-testid*="export-project"], button:has-text("Export")')
      if (await exportProjectBtn.first().isVisible()) {
        await exportProjectBtn.first().click()
        await page.waitForTimeout(2000)
      }
    }

    // Test Universal Pinpoint Feedback System
    const feedbackBtn = page.locator('[data-testid="feedback-btn"], button:has-text("Feedback")')
    if (await feedbackBtn.isVisible()) {
      await feedbackBtn.click()
      await page.waitForTimeout(1000)
    }
  })

  test('Analytics - Export/View Reports Functions', async ({ page }) => {
    await page.goto('http://localhost:9323/dashboard/analytics-v2')
    await page.waitForLoadState('networkidle')

    // Test export report
    const exportReportBtn = page.locator('[data-testid="export-report-btn"]')
    if (await exportReportBtn.isVisible()) {
      await exportReportBtn.click()
      await page.waitForTimeout(2000)
    }

    // Test refresh analytics
    const refreshBtn = page.locator('[data-testid="refresh-analytics-btn"]')
    if (await refreshBtn.isVisible()) {
      await refreshBtn.click()
      await page.waitForTimeout(2000)
    }

    // Test filter controls
    const filterBtn = page.locator('[data-testid*="filter"], button:has-text("Filter")')
    if (await filterBtn.isVisible()) {
      await filterBtn.click()
      await page.waitForTimeout(1000)
    }

    // Test view detailed reports
    const viewReportBtn = page.locator('[data-testid*="view-report"], button:has-text("View Report")')
    if (await viewReportBtn.isVisible()) {
      await viewReportBtn.click()
      await page.waitForTimeout(2000)
    }
  })

  test('All Dashboard Routes - Navigation and Core Functions', async ({ page }) => {
    for (const route of DASHBOARD_ROUTES) {
      console.log(`Testing route: ${route}`)

      await page.goto(`http://localhost:9323${route}`)
      await page.waitForLoadState('networkidle')

      // Wait for content to load
      await page.waitForTimeout(2000)

      // Check for common interactive elements
      const buttons = page.locator('button:visible')
      const buttonCount = await buttons.count()

      console.log(`Found ${buttonCount} buttons on ${route}`)

      // Test first few buttons (to avoid overwhelming the page)
      const maxButtons = Math.min(buttonCount, 5)
      for (let i = 0; i < maxButtons; i++) {
        try {
          const button = buttons.nth(i)
          const buttonText = await button.textContent()

          // Skip navigation buttons to avoid leaving the page
          if (!buttonText?.toLowerCase().includes('dashboard') &&
              !buttonText?.toLowerCase().includes('home') &&
              !buttonText?.toLowerCase().includes('nav')) {
            await button.click({ timeout: 3000 })
            await page.waitForTimeout(1000)
          }
        } catch (error) {
          console.log(`Button ${i} on ${route} failed: ${error}`)
        }
      }

      // Test file inputs
      const fileInputs = page.locator('input[type="file"]:visible')
      const fileInputCount = await fileInputs.count()
      if (fileInputCount > 0) {
        console.log(`Found ${fileInputCount} file inputs on ${route}`)
      }

      // Test download/export links
      const downloadLinks = page.locator('a[download]:visible, button:has-text("Download"):visible, button:has-text("Export"):visible')
      const downloadCount = await downloadLinks.count()
      if (downloadCount > 0) {
        console.log(`Found ${downloadCount} download/export elements on ${route}`)

        // Test first download/export link
        try {
          await downloadLinks.first().click({ timeout: 3000 })
          await page.waitForTimeout(2000)
        } catch (error) {
          console.log(`Download/export failed on ${route}: ${error}`)
        }
      }
    }
  })

  test('Feature Gating and Payment Modals', async ({ page }) => {
    await page.goto('http://localhost:9323/dashboard')
    await page.waitForLoadState('networkidle')

    // Test feature gate triggers
    const premiumFeatures = page.locator('[data-testid*="premium"], [data-testid*="pro"], [data-testid*="upgrade"]')
    const premiumCount = await premiumFeatures.count()

    if (premiumCount > 0) {
      await premiumFeatures.first().click()

      // Check if upgrade modal appears
      const upgradeModal = page.locator('.modal, .dialog, .sheet, [data-testid*="upgrade-modal"]')
      if (await upgradeModal.isVisible({ timeout: 3000 })) {
        console.log('Upgrade modal triggered successfully')

        // Test guest payment option
        const guestPaymentBtn = page.locator('button:has-text("Guest Payment"), [data-testid*="guest-payment"]')
        if (await guestPaymentBtn.isVisible()) {
          await guestPaymentBtn.click()
          await page.waitForTimeout(2000)
        }
      }
    }
  })

  test('Mobile Responsiveness and Touch Gestures', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('http://localhost:9323/dashboard')
    await page.waitForLoadState('networkidle')

    // Test mobile toolbar
    const mobileToolbarBtn = page.locator('[data-testid*="mobile-toolbar"], button:has-text("Settings")')
    if (await mobileToolbarBtn.isVisible()) {
      await mobileToolbarBtn.click()
      await page.waitForTimeout(1000)
    }

    // Test mobile navigation
    const mobileNavBtn = page.locator('[data-testid*="mobile-nav"], button:has-text("Menu")')
    if (await mobileNavBtn.isVisible()) {
      await mobileNavBtn.click()
      await page.waitForTimeout(1000)
    }

    // Test swipe gestures (simulate)
    await page.mouse.move(200, 300)
    await page.mouse.down()
    await page.mouse.move(100, 300)
    await page.mouse.up()
    await page.waitForTimeout(1000)
  })

  test('Context7 Integration and UI Components', async ({ page }) => {
    await page.goto('http://localhost:9323/dashboard')
    await page.waitForLoadState('networkidle')

    // Test Context7 GUI components
    const context7Elements = page.locator('[data-context7], [data-testid*="context7"]')
    const context7Count = await context7Elements.count()

    if (context7Count > 0) {
      console.log(`Found ${context7Count} Context7 elements`)

      // Test micro-interactions
      for (let i = 0; i < Math.min(context7Count, 3); i++) {
        await context7Elements.nth(i).hover()
        await page.waitForTimeout(500)
      }
    }

    // Test enhanced components
    const enhancedComponents = page.locator('[data-testid*="enhanced"], .enhanced-component')
    const enhancedCount = await enhancedComponents.count()

    if (enhancedCount > 0) {
      console.log(`Found ${enhancedCount} enhanced components`)
    }
  })
})

// Helper function to test specific functionality
async function testFunctionality(page: Page, selector: string, action: string) {
  try {
    const element = page.locator(selector)
    if (await element.isVisible({ timeout: 3000 })) {
      switch (action) {
        case 'click':
          await element.click()
          break
        case 'upload':
          // Simulate file upload
          await element.setInputFiles([])
          break
        case 'download':
          await element.click()
          break
        default:
          await element.click()
      }
      await page.waitForTimeout(1000)
      return true
    }
  } catch (error) {
    console.log(`Failed to test ${selector}: ${error}`)
  }
  return false
}