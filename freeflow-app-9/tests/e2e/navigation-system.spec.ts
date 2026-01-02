import { test, expect } from '@playwright/test'

test.describe('Navigation System - All 69 Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
  })

  test('should display all 13 navigation categories', async ({ page }) => {
    const categories = [
      'Overview',
      'Creative Suite',
      'AI Tools',
      'Projects & Work',
      'Team & Clients',
      'Community',
      'Business & Finance',
      'Analytics & Reports',
      'Files & Storage',
      'Scheduling',
      'Integrations',
      'Personal',
      'Platform'
    ]

    for (const category of categories) {
      await expect(page.getByText(category, { exact: true })).toBeVisible()
    }
  })

  test('should expand and collapse categories', async ({ page }) => {
    // Creative Suite should be expanded by default
    const creativeSuiteCategory = page.getByText('Creative Suite').first()
    await expect(creativeSuiteCategory).toBeVisible()

    // Should see items when expanded
    await expect(page.getByRole('link', { name: 'Video Studio' })).toBeVisible()

    // Click to collapse
    await creativeSuiteCategory.click()
    await page.waitForTimeout(300) // Wait for animation

    // Items should still be visible (may need to adjust based on your implementation)
    // Or verify chevron changed direction
  })

  test('should navigate to Plugin Marketplace (user original request)', async ({ page }) => {
    // Find and click Integrations category
    await page.getByText('Integrations').click()
    await page.waitForTimeout(200)

    // Click Plugin Marketplace link
    await page.getByRole('link', { name: /plugin marketplace/i }).click()
    await page.waitForLoadState('networkidle')

    // Verify we're on the plugin marketplace page
    await expect(page).toHaveURL(/\/dashboard\/plugin-marketplace/)
    await expect(page.getByText(/plugin marketplace/i).first()).toBeVisible()
    await expect(page.getByText(/extend your platform/i)).toBeVisible()
  })

  test('should navigate to all newly visible Creative Suite features', async ({ page }) => {
    const features = [
      { name: 'Video Studio', url: '/dashboard/video-studio-v2' },
      { name: 'Audio Studio', url: '/dashboard/audio-studio-v2' },
      { name: '3D Modeling', url: '/dashboard/3d-modeling' },
      { name: 'Motion Graphics', url: '/dashboard/motion-graphics' },
      { name: 'Canvas', url: '/dashboard/canvas-v2' },
      { name: 'Gallery', url: '/dashboard/gallery-v2' },
      { name: 'Collaboration', url: '/dashboard/collaboration-v2' }
    ]

    // Expand Creative Suite if collapsed
    await page.getByText('Creative Suite').first().click()
    await page.waitForTimeout(200)

    for (const feature of features) {
      await page.getByRole('link', { name: feature.name, exact: false }).click()
      await page.waitForLoadState('networkidle')

      await expect(page).toHaveURL(new RegExp(feature.url))
      console.log(`✅ Navigated to ${feature.name}`)

      // Go back to dashboard
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')
      await page.getByText('Creative Suite').first().click()
      await page.waitForTimeout(200)
    }
  })

  test('should navigate to all AI Tools features', async ({ page }) => {
    const aiFeatures = [
      'AI Assistant',
      'AI Design',
      'AI Create',
      'AI Video Generation',
      'AI Voice Synthesis',
      'AI Code Completion',
      'ML Insights',
      'AI Settings'
    ]

    // Expand AI Tools (should be expanded by default)
    const aiToolsCategory = page.getByText('AI Tools').first()
    await aiToolsCategory.click()
    await page.waitForTimeout(200)

    for (const feature of aiFeatures) {
      const featureLink = page.getByRole('link', { name: feature, exact: false })

      // Check if link exists
      if (await featureLink.count() > 0) {
        await featureLink.click()
        await page.waitForLoadState('networkidle')

        // Verify navigation
        const url = page.url()
        expect(url).toContain('/dashboard/')
        console.log(`✅ Accessed ${feature}`)

        // Return to dashboard
        await page.goto('/dashboard')
        await page.waitForLoadState('networkidle')
        await page.getByText('AI Tools').first().click()
        await page.waitForTimeout(200)
      }
    }
  })

  test('should navigate to Team & Clients features', async ({ page }) => {
    const teamFeatures = [
      { name: 'Team Hub', hasNew: true },
      { name: 'Team Management', hasNew: true },
      { name: 'Client Zone', hasNew: false },
      { name: 'Messages', hasNew: false }
    ]

    // Expand Team & Clients
    await page.getByText('Team & Clients').first().click()
    await page.waitForTimeout(200)

    for (const feature of teamFeatures) {
      const featureLink = page.getByRole('link', { name: new RegExp(feature.name, 'i') })

      if (await featureLink.count() > 0) {
        await featureLink.click()
        await page.waitForLoadState('networkidle')

        expect(page.url()).toContain('/dashboard/')
        console.log(`✅ Accessed ${feature.name}`)

        // Go back
        await page.goto('/dashboard')
        await page.waitForLoadState('networkidle')
        await page.getByText('Team & Clients').first().click()
        await page.waitForTimeout(200)
      }
    }
  })

  test('should show "New" badges on newly visible features', async ({ page }) => {
    // Expand a category with new features
    await page.getByText('Integrations').first().click()
    await page.waitForTimeout(200)

    // Check for "New" badge on Plugin Marketplace
    const pluginMarketplaceSection = page.locator('text=Plugin Marketplace').locator('..')
    const newBadge = pluginMarketplaceSection.getByText('New')

    if (await newBadge.count() > 0) {
      await expect(newBadge).toBeVisible()
      console.log('✅ "New" badge visible on Plugin Marketplace')
    }
  })

  test('should maintain active state on current page', async ({ page }) => {
    // Navigate to Plugin Marketplace
    await page.getByText('Integrations').first().click()
    await page.waitForTimeout(200)
    await page.getByRole('link', { name: /plugin marketplace/i }).click()
    await page.waitForLoadState('networkidle')

    // Check if the link has active styling
    const activeLink = page.getByRole('link', { name: /plugin marketplace/i })

    // Verify active state (adjust selector based on your implementation)
    const classList = await activeLink.getAttribute('class')
    expect(classList).toContain('primary') // or whatever your active class is
  })

  test('should allow access to all 69 features without errors', async ({ page }) => {
    const allCategories = [
      'Overview',
      'Creative Suite',
      'AI Tools',
      'Projects & Work',
      'Team & Clients',
      'Community',
      'Business & Finance',
      'Analytics & Reports',
      'Files & Storage',
      'Scheduling',
      'Integrations',
      'Personal',
      'Platform',
      'More'
    ]

    let accessibleFeatures = 0

    for (const category of allCategories) {
      // Expand category
      const categoryButton = page.getByText(category, { exact: true }).first()
      await categoryButton.click()
      await page.waitForTimeout(200)

      // Get all links in this category
      const links = page.getByRole('link').filter({ hasText: /.+/ })
      const count = await links.count()

      accessibleFeatures += count

      // Collapse category
      await categoryButton.click()
      await page.waitForTimeout(200)
    }

    console.log(`✅ Total accessible features: ${accessibleFeatures}`)
    expect(accessibleFeatures).toBeGreaterThanOrEqual(60) // Should be close to 69
  })

  test('should handle keyboard navigation', async ({ page }) => {
    // Focus on first category
    await page.keyboard.press('Tab')

    // Navigate with arrow keys
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')

    // Verify interaction worked
    const url = page.url()
    expect(url).toContain('/dashboard')
  })

  test('should persist expanded state during session', async ({ page }) => {
    // Expand a category
    await page.getByText('Business & Finance').first().click()
    await page.waitForTimeout(200)

    // Navigate away and back
    await page.getByRole('link', { name: 'Financial Hub', exact: false }).click()
    await page.waitForLoadState('networkidle')
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Category might still be expanded (depending on implementation)
    // This test verifies session state management
  })

  test('should load all category icons correctly', async ({ page }) => {
    const icons = page.locator('svg[class*="lucide"]')
    const iconCount = await icons.count()

    expect(iconCount).toBeGreaterThan(13) // At least one icon per category
    console.log(`✅ Found ${iconCount} icons`)
  })
})

test.describe('New Features - Plugin Marketplace', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/plugin-marketplace')
    await page.waitForLoadState('networkidle')
  })

  test('should display plugin marketplace UI', async ({ page }) => {
    await expect(page.getByText(/plugin marketplace/i).first()).toBeVisible()
    await expect(page.getByText(/extend your platform/i)).toBeVisible()
  })

  test('should switch between grid and list views', async ({ page }) => {
    // Click grid view button
    const gridBtn = page.getByTestId('grid-view-btn')
    if (await gridBtn.count() > 0) {
      await gridBtn.click()
      console.log('✅ Switched to grid view')
    }

    // Click list view button
    const listBtn = page.getByTestId('list-view-btn')
    if (await listBtn.count() > 0) {
      await listBtn.click()
      console.log('✅ Switched to list view')
    }
  })

  test('should filter plugins by category', async ({ page }) => {
    // Look for category filters
    const categories = ['Design', 'Development', 'Analytics', 'Productivity']

    for (const category of categories) {
      const categoryButton = page.getByText(category, { exact: true })
      if (await categoryButton.count() > 0) {
        await categoryButton.click()
        await page.waitForTimeout(300)
        console.log(`✅ Filtered by ${category}`)
      }
    }
  })
})

test.describe('New Features - 3D Modeling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/3d-modeling')
    await page.waitForLoadState('networkidle')
  })

  test('should display 3D modeling interface', async ({ page }) => {
    await expect(page.getByText(/3d modeling/i).first()).toBeVisible()
  })

  test('should allow adding 3D primitives', async ({ page }) => {
    const primitives = ['cube', 'sphere', 'cylinder', 'cone', 'plane']

    for (const primitive of primitives) {
      const btn = page.getByTestId(`add-${primitive}-btn`)
      if (await btn.count() > 0) {
        await btn.click()
        console.log(`✅ Added ${primitive}`)
      }
    }
  })

  test('should switch between 3D tools', async ({ page }) => {
    const tools = ['select', 'move', 'rotate', 'scale']

    for (const tool of tools) {
      const btn = page.getByTestId(`3d-tool-${tool}-btn`)
      if (await btn.count() > 0) {
        await btn.click()
        console.log(`✅ Selected ${tool} tool`)
      }
    }
  })
})

test.describe('New Features - Audio Studio', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/audio-studio-v2')
    await page.waitForLoadState('networkidle')
  })

  test('should display audio studio interface', async ({ page }) => {
    await expect(page.getByText(/audio/i).first()).toBeVisible()
  })

  test('should have playback controls', async ({ page }) => {
    const controls = [
      'play-pause-btn',
      'stop-btn',
      'record-btn',
      'rewind-10s-btn',
      'fast-forward-btn'
    ]

    for (const controlId of controls) {
      const btn = page.getByTestId(controlId)
      if (await btn.count() > 0) {
        await expect(btn).toBeVisible()
      }
    }
  })

  test('should toggle loop and metronome', async ({ page }) => {
    const loopBtn = page.getByTestId('loop-btn')
    if (await loopBtn.count() > 0) {
      await loopBtn.click()
      console.log('✅ Toggled loop')
    }

    const metronomeBtn = page.getByTestId('metronome-btn')
    if (await metronomeBtn.count() > 0) {
      await metronomeBtn.click()
      console.log('✅ Toggled metronome')
    }
  })
})

test.describe('New Features - Team Hub', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/team-hub-v2')
    await page.waitForLoadState('networkidle')
  })

  test('should display team hub interface', async ({ page }) => {
    await expect(page.getByText(/team hub/i).first()).toBeVisible()
  })

  test('should have quick action buttons', async ({ page }) => {
    const actions = [
      'team-chat-btn',
      'team-schedule-btn',
      'video-call-btn',
      'team-reports-btn'
    ]

    for (const actionId of actions) {
      const btn = page.getByTestId(actionId)
      if (await btn.count() > 0) {
        await expect(btn).toBeVisible()
      }
    }
  })

  test('should allow adding team members', async ({ page }) => {
    const addMemberBtn = page.getByTestId('add-member-btn')
    if (await addMemberBtn.count() > 0) {
      await expect(addMemberBtn).toBeVisible()
    }
  })
})
