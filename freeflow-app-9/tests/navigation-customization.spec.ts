import { test, expect } from '@playwright/test'

test.describe('Navigation Customization Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard
    await page.goto('http://localhost:9323/dashboard')

    // Wait for navigation to load
    await page.waitForSelector('[data-tour="sidebar-nav"]', { timeout: 10000 })
  })

  test('should display Customize Navigation button at bottom of sidebar', async ({ page }) => {
    // Check that Customize Navigation button exists at the bottom
    const customizeButton = page.locator('button:has-text("Customize Navigation")')
    await expect(customizeButton).toBeVisible()

    // Verify it's in the bottom section
    const buttonParent = customizeButton.locator('..')
    await expect(buttonParent).toHaveClass(/border-t/)
  })

  test('should have correct navigation order', async ({ page }) => {
    // Check that navigation categories are in the correct order
    const categories = page.locator('[data-tour="sidebar-nav"] .space-y-1 > div')

    // Get all category names
    const categoryNames = await categories.evaluateAll((elements) => {
      return elements
        .filter(el => el.querySelector('button'))
        .map(el => el.querySelector('button')?.textContent?.trim() || '')
    })

    // Verify order: AI Creative Suite → Storage → Business Intelligence → Business Admin Intelligence → Creative Studio → Settings
    expect(categoryNames).toContain('AI Creative Suite')
    expect(categoryNames).toContain('Storage')
    expect(categoryNames).toContain('Business Intelligence')
    expect(categoryNames).toContain('Business Admin Intelligence')
    expect(categoryNames).toContain('Creative Studio')
    expect(categoryNames).toContain('Settings')

    // Verify AI Creative Suite comes before Storage
    const aiIndex = categoryNames.indexOf('AI Creative Suite')
    const storageIndex = categoryNames.indexOf('Storage')
    expect(aiIndex).toBeLessThan(storageIndex)
  })

  test('should open customization dialog with 3 tabs', async ({ page }) => {
    // Click Customize Navigation button
    await page.click('button:has-text("Customize Navigation")')

    // Wait for dialog to appear
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 })

    // Verify dialog is visible
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog).toBeVisible()

    // Verify dialog title - use role-based selector
    await expect(page.getByRole('heading', { name: 'Customize Your Workspace' })).toBeVisible()

    // Verify 3 tabs exist - use role-based selectors for specificity
    await expect(page.getByRole('tab', { name: 'Quick Presets' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Customize' })).toBeVisible()
    await expect(page.getByRole('tab', { name: /My Presets/ })).toBeVisible()
  })

  test('should display 4 quick workflow presets', async ({ page }) => {
    // Open customization dialog
    await page.click('button:has-text("Customize Navigation")')
    await page.waitForSelector('[role="dialog"]')

    // Click Quick Presets tab
    await page.click('[role="tab"]:has-text("Quick Presets")')

    // Verify 4 workflow presets
    await expect(page.locator('text=Creator Mode')).toBeVisible()
    await expect(page.locator('text=Business Mode')).toBeVisible()
    await expect(page.locator('text=Developer Mode')).toBeVisible()
    await expect(page.locator('text=Full Access')).toBeVisible()
  })

  test('should apply Creator Mode workflow preset', async ({ page }) => {
    // Open customization dialog
    await page.click('button:has-text("Customize Navigation")')
    await page.waitForSelector('[role="dialog"]')

    // Click Quick Presets tab
    await page.click('[role="tab"]:has-text("Quick Presets")')

    // Apply Creator Mode
    await page.click('button:has-text("Creator Mode")')

    // Wait for toast notification
    await page.waitForSelector('text=Applied creator workflow', { timeout: 5000 })

    // Close dialog
    await page.keyboard.press('Escape')

    // Verify only creator-relevant sections are visible
    await expect(page.locator('text=AI Creative Suite')).toBeVisible()
    await expect(page.locator('text=Creative Studio')).toBeVisible()
    await expect(page.locator('text=Storage')).toBeVisible()
  })

  test('should toggle category visibility in Customize tab', async ({ page }) => {
    // Open customization dialog
    await page.click('button:has-text("Customize Navigation")')
    await page.waitForSelector('[role="dialog"]')

    // Click Customize tab
    await page.click('[role="tab"]:has-text("Customize")')

    // Find a category switch (e.g., Storage)
    const categorySection = page.locator('div:has-text("Storage")').first()
    const categorySwitch = categorySection.locator('[role="switch"]').first()

    // Get initial state
    const isChecked = await categorySwitch.getAttribute('data-state')

    // Toggle the switch
    await categorySwitch.click()

    // Verify state changed
    const newState = await categorySwitch.getAttribute('data-state')
    expect(newState).not.toBe(isChecked)
  })

  test('should save custom preset', async ({ page }) => {
    // Open customization dialog
    await page.click('button:has-text("Customize Navigation")')
    await page.waitForSelector('[role="dialog"]')

    // Click Customize tab
    await page.click('[role="tab"]:has-text("Customize")')

    // Scroll to save preset section
    const saveSection = page.locator('text=Save Current Layout as Preset')
    await saveSection.scrollIntoViewIfNeeded()

    // Enter preset name
    const presetInput = page.locator('input[placeholder*="My Morning Workflow"]')
    await presetInput.fill('Test Workflow')

    // Save preset
    await page.click('button:has-text("Save"):near(input[placeholder*="My Morning Workflow"])')

    // Wait for success toast
    await page.waitForSelector('text=Preset saved!', { timeout: 5000 })

    // Verify preset appears in My Presets tab
    await page.click('[role="tab"]:has-text("My Presets")')
    await expect(page.locator('text=Test Workflow')).toBeVisible()
  })

  test('should switch between saved presets', async ({ page }) => {
    // First create a preset (same as previous test)
    await page.click('button:has-text("Customize Navigation")')
    await page.waitForSelector('[role="dialog"]')
    await page.click('[role="tab"]:has-text("Customize")')

    const saveSection = page.locator('text=Save Current Layout as Preset')
    await saveSection.scrollIntoViewIfNeeded()

    const presetInput = page.locator('input[placeholder*="My Morning Workflow"]')
    await presetInput.fill('Switch Test Preset')
    await page.click('button:has-text("Save"):near(input[placeholder*="My Morning Workflow"])')
    await page.waitForSelector('text=Preset saved!', { timeout: 5000 })

    // Go to My Presets tab
    await page.click('[role="tab"]:has-text("My Presets")')

    // Switch to default
    await page.click('text=Default Layout')
    await page.waitForSelector('text=Default', { timeout: 2000 })

    // Switch back to custom preset
    await page.click('text=Switch Test Preset')

    // Verify checkmark shows on active preset
    const activePreset = page.locator('div:has-text("Switch Test Preset")').filter({ has: page.locator('[data-lucide="check-circle-2"]') })
    await expect(activePreset).toBeVisible()
  })

  test('should delete saved preset', async ({ page }) => {
    // Create a preset to delete
    await page.click('button:has-text("Customize Navigation")')
    await page.waitForSelector('[role="dialog"]')
    await page.click('[role="tab"]:has-text("Customize")')

    const presetInput = page.locator('input[placeholder*="My Morning Workflow"]')
    await presetInput.fill('Delete Me Preset')
    await page.click('button:has-text("Save"):near(input[placeholder*="My Morning Workflow"])')
    await page.waitForSelector('text=Preset saved!', { timeout: 5000 })

    // Go to My Presets tab
    await page.click('[role="tab"]:has-text("My Presets")')

    // Set up dialog confirmation handler
    page.on('dialog', dialog => dialog.accept())

    // Click delete button
    const presetCard = page.locator('div:has-text("Delete Me Preset")')
    const deleteButton = presetCard.locator('button:has([data-lucide="trash-2"])')
    await deleteButton.click()

    // Wait for deletion toast
    await page.waitForSelector('text=Deleted', { timeout: 5000 })

    // Verify preset is gone
    await expect(page.locator('text=Delete Me Preset')).not.toBeVisible()
  })

  test('should reset to default layout', async ({ page }) => {
    // Open customization dialog
    await page.click('button:has-text("Customize Navigation")')
    await page.waitForSelector('[role="dialog"]')

    // Click Customize tab
    await page.click('[role="tab"]:has-text("Customize")')

    // Scroll to reset button
    const resetButton = page.locator('button:has-text("Reset to Default Layout")')
    await resetButton.scrollIntoViewIfNeeded()

    // Click reset
    await resetButton.click()

    // Wait for success toast
    await page.waitForSelector('text=Navigation reset to defaults', { timeout: 5000 })
  })

  test('should verify Storage section has NewTab badge', async ({ page }) => {
    // Expand Storage section
    const storageButton = page.locator('button:has-text("Storage")')
    await storageButton.click()

    // Wait for items to appear
    await page.waitForSelector('text=Files Hub', { timeout: 3000 })

    // Verify Files Hub has NewTab badge
    const filesHub = page.locator('a[href="/dashboard/files-hub"]')
    await expect(filesHub).toBeVisible()

    const badge = filesHub.locator('text=NewTab')
    await expect(badge).toBeVisible()
  })

  test('should verify Settings section has NewTab badge', async ({ page }) => {
    // Expand Settings section
    const settingsButton = page.locator('button:has-text("Settings")').first()
    await settingsButton.click()

    // Wait for items to appear
    await page.waitForSelector('text=Notifications', { timeout: 3000 })

    // Verify Settings has NewTab badge
    const settingsLink = page.locator('a[href="/dashboard/settings"]')
    await expect(settingsLink).toBeVisible()

    const badge = settingsLink.locator('text=NewTab')
    await expect(badge).toBeVisible()
  })

  test('should verify Business Admin Intelligence (renamed from Admin & Business)', async ({ page }) => {
    // Check that the renamed section exists
    await expect(page.locator('text=Business Admin Intelligence')).toBeVisible()

    // Verify old name doesn't exist
    await expect(page.locator('text=Admin & Business')).not.toBeVisible()
  })

  test('should verify Quick Access is removed', async ({ page }) => {
    // Verify Quick Access section doesn't exist
    await expect(page.locator('text=Quick Access')).not.toBeVisible()
  })

  test('should persist customization after page reload', async ({ page }) => {
    // Apply a workflow preset
    await page.click('button:has-text("Customize Navigation")')
    await page.waitForSelector('[role="dialog"]')
    await page.click('[role="tab"]:has-text("Quick Presets")')
    await page.click('button:has-text("Business Mode")')
    await page.waitForSelector('text=Applied business workflow', { timeout: 5000 })

    // Close dialog
    await page.keyboard.press('Escape')

    // Reload page
    await page.reload()
    await page.waitForSelector('[data-tour="sidebar-nav"]', { timeout: 10000 })

    // Verify business sections are still visible
    await expect(page.locator('text=Business Intelligence')).toBeVisible()
    await expect(page.locator('text=Business Admin Intelligence')).toBeVisible()
  })

  test('should show onboarding tooltip on first visit (localStorage cleared)', async ({ page, context }) => {
    // Clear localStorage to simulate first visit
    await context.clearCookies()
    await page.evaluate(() => localStorage.clear())

    // Reload page
    await page.goto('http://localhost:9323/dashboard')
    await page.waitForSelector('[data-tour="sidebar-nav"]', { timeout: 10000 })

    // Wait for onboarding tooltip (3 second delay)
    await page.waitForSelector('text=Customize your navigation', { timeout: 10000 })

    // Verify "Show me" button exists
    await expect(page.locator('button:has-text("Show me")')).toBeVisible()
  })

  test('should track customization count in localStorage', async ({ page }) => {
    // Apply a workflow preset
    await page.click('button:has-text("Customize Navigation")')
    await page.waitForSelector('[role="dialog"]')
    await page.click('[role="tab"]:has-text("Quick Presets")')
    await page.click('button:has-text("Creator Mode")')
    await page.waitForSelector('text=customizations', { timeout: 5000 })

    // Check localStorage
    const customizationCount = await page.evaluate(() => {
      return localStorage.getItem('kazi-customization-count')
    })

    expect(customizationCount).toBeTruthy()
    expect(parseInt(customizationCount || '0')).toBeGreaterThan(0)
  })
})
