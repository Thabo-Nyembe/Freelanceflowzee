import { test } from '@playwright/test'

test.describe('Visual Feature Inspection', () => {

  test('Dashboard Navigation and Feature Inspection', async ({ page }) => {
    page.setDefaultTimeout(10000)
    await page.setViewportSize({ width: 1920, height: 1080 })

    console.log('🔍 Inspecting main dashboard navigation and features...')

    await page.goto('http://localhost:9323/dashboard')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)

    // Take screenshots for visual inspection
    await page.screenshot({ path: 'dashboard-main.png', fullPage: true })

    // Check navigation structure
    const navigationStructure = await page.evaluate(() => {
      // Find navigation elements
      const mainNav = document.querySelector('nav')
      const sidebar = document.querySelector('.sidebar, [data-sidebar], [class*="sidebar"]')
      const header = document.querySelector('header')
      const footer = document.querySelector('footer')

      // Find dashboard navigation links
      const navLinks = Array.from(document.querySelectorAll('nav a, .nav-link, [role="navigation"] a')).map(link => ({
        text: link.textContent?.trim(),
        href: link.getAttribute('href'),
        visible: link.offsetParent !== null
      }))

      // Find sidebar navigation if exists
      const sidebarLinks = Array.from(document.querySelectorAll('.sidebar a, [data-sidebar] a, .side-nav a')).map(link => ({
        text: link.textContent?.trim(),
        href: link.getAttribute('href'),
        visible: link.offsetParent !== null
      }))

      // Find tab elements
      const tabs = Array.from(document.querySelectorAll('[role="tab"], .tab, [data-tab], .tabs-trigger')).map(tab => ({
        text: tab.textContent?.trim(),
        active: tab.classList.contains('active') || tab.getAttribute('aria-selected') === 'true',
        visible: tab.offsetParent !== null
      }))

      // Find action buttons
      const actionButtons = Array.from(document.querySelectorAll('button')).map(btn => ({
        text: btn.textContent?.trim(),
        type: btn.type,
        disabled: btn.disabled,
        visible: btn.offsetParent !== null
      })).filter(btn => btn.visible && btn.text)

      return {
        hasMainNav: !!mainNav,
        hasSidebar: !!sidebar,
        hasHeader: !!header,
        hasFooter: !!footer,
        navLinks: navLinks.filter(link => link.visible),
        sidebarLinks: sidebarLinks.filter(link => link.visible),
        tabs: tabs.filter(tab => tab.visible),
        actionButtons: actionButtons.slice(0, 20), // First 20 buttons
        pageTitle: document.title,
        bodyClasses: document.body.className
      }
    })

    console.log('📋 Dashboard Navigation Structure:')
    console.log(`  Main Nav: ${navigationStructure.hasMainNav}`)
    console.log(`  Sidebar: ${navigationStructure.hasSidebar}`)
    console.log(`  Header: ${navigationStructure.hasHeader}`)
    console.log(`  Navigation Links: ${navigationStructure.navLinks.length}`)
    console.log(`  Sidebar Links: ${navigationStructure.sidebarLinks.length}`)
    console.log(`  Tabs: ${navigationStructure.tabs.length}`)
    console.log(`  Action Buttons: ${navigationStructure.actionButtons.length}`)

    if (navigationStructure.navLinks.length > 0) {
      console.log('🔗 Navigation Links:')
      navigationStructure.navLinks.slice(0, 10).forEach(link => {
        console.log(`  - ${link.text} → ${link.href}`)
      })
    }

    if (navigationStructure.tabs.length > 0) {
      console.log('📑 Available Tabs:')
      navigationStructure.tabs.forEach(tab => {
        console.log(`  - ${tab.text} (${tab.active ? 'Active' : 'Inactive'})`)
      })
    }

    // Test key dashboard pages for missing elements
    const pagesToInspect = [
      { path: '/dashboard/ai-create', name: 'AI Create' },
      { path: '/dashboard/files-hub', name: 'Files Hub' },
      { path: '/dashboard/my-day', name: 'My Day' },
      { path: '/dashboard/time-tracking', name: 'Time Tracking' },
      { path: '/dashboard/calendar', name: 'Calendar' }
    ]

    for (const pageInfo of pagesToInspect) {
      console.log(`\n🔍 Inspecting ${pageInfo.name}...`)

      await page.goto(`http://localhost:9323${pageInfo.path}`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(2000)

      // Take screenshot
      await page.screenshot({ path: `${pageInfo.name.toLowerCase().replace(/ /g, '-')}.png` })

      const pageFeatures = await page.evaluate(() => {
        // Check for common missing features
        const features = {
          uploadArea: !!document.querySelector('input[type="file"], .upload-area, [data-upload], [class*="upload"]'),
          dragDropZone: !!document.querySelector('[data-drop-zone], .drop-zone, [class*="drop"]'),
          exportButtons: Array.from(document.querySelectorAll('button')).filter(btn => btn.textContent?.toLowerCase().includes('export')).length,
          saveButtons: Array.from(document.querySelectorAll('button')).filter(btn => btn.textContent?.toLowerCase().includes('save')).length,
          deleteButtons: Array.from(document.querySelectorAll('button')).filter(btn => btn.textContent?.toLowerCase().includes('delete')).length,
          editButtons: Array.from(document.querySelectorAll('button')).filter(btn => btn.textContent?.toLowerCase().includes('edit')).length,
          createButtons: Array.from(document.querySelectorAll('button')).filter(btn => btn.textContent?.toLowerCase().includes('create') || btn.textContent?.toLowerCase().includes('new')).length,
          forms: document.querySelectorAll('form').length,
          modals: document.querySelectorAll('.modal, .dialog, [role="dialog"]').length,
          tooltips: document.querySelectorAll('[title], [data-tooltip], .tooltip').length,
          progressBars: document.querySelectorAll('.progress, [role="progressbar"]').length,
          notifications: document.querySelectorAll('.notification, .toast, .alert').length,
          searchBoxes: document.querySelectorAll('input[type="search"], .search-input, [placeholder*="search"]').length,
          filterControls: document.querySelectorAll('.filter, [data-filter], select').length,
          sortControls: document.querySelectorAll('[data-sort], .sort-control').length,
          pagination: !!document.querySelector('.pagination, [data-pagination]')
        }

        // Get all interactive elements
        const buttons = Array.from(document.querySelectorAll('button')).map(btn => btn.textContent?.trim()).filter(text => text && text.length > 0)

        return {
          ...features,
          totalButtons: buttons.length,
          buttonTexts: buttons.slice(0, 15), // First 15 button texts
          hasInteractiveContent: buttons.length > 0 || features.forms > 0
        }
      })

      console.log(`  Features found:`)
      console.log(`    Upload Areas: ${pageFeatures.uploadArea}`)
      console.log(`    Drag & Drop: ${pageFeatures.dragDropZone}`)
      console.log(`    Export Buttons: ${pageFeatures.exportButtons}`)
      console.log(`    Forms: ${pageFeatures.forms}`)
      console.log(`    Modals: ${pageFeatures.modals}`)
      console.log(`    Search: ${pageFeatures.searchBoxes}`)
      console.log(`    Filters: ${pageFeatures.filterControls}`)
      console.log(`    Total Buttons: ${pageFeatures.totalButtons}`)

      if (pageFeatures.buttonTexts.length > 0) {
        console.log(`    Button Actions: ${pageFeatures.buttonTexts.slice(0, 8).join(', ')}`)
      }

      if (!pageFeatures.hasInteractiveContent) {
        console.log(`    ⚠️  WARNING: No interactive content found on ${pageInfo.name}`)
      }
    }

    // Check for missing micro-features by looking at component structure
    console.log('\n🔬 Checking for advanced micro-features...')

    await page.goto('http://localhost:9323/dashboard')
    await page.waitForLoadState('networkidle')

    const microFeatures = await page.evaluate(() => {
      return {
        // Animation features
        hasAnimations: document.querySelectorAll('[class*="animate"], [class*="transition"]').length > 0,
        hasHoverEffects: document.querySelectorAll('[class*="hover:"]').length > 0,

        // Layout features
        hasGridLayouts: document.querySelectorAll('[class*="grid"]').length > 0,
        hasFlexLayouts: document.querySelectorAll('[class*="flex"]').length > 0,
        hasResponsiveClasses: document.querySelectorAll('[class*="md:"], [class*="lg:"]').length > 0,

        // UI components
        hasDropdowns: document.querySelectorAll('[role="menu"], .dropdown').length > 0,
        hasAccordions: document.querySelectorAll('[data-accordion], .accordion').length > 0,
        hasCarousels: document.querySelectorAll('.carousel, [data-carousel]').length > 0,
        hasTabs: document.querySelectorAll('[role="tablist"], .tabs').length > 0,

        // Advanced features
        hasKeyboardNavigation: document.querySelectorAll('[tabindex], [accesskey]').length > 0,
        hasAriaLabels: document.querySelectorAll('[aria-label], [aria-labelledby]').length > 0,
        hasDataAttributes: document.querySelectorAll('[data-testid]').length > 0,

        // Interactive elements
        hasSliders: document.querySelectorAll('input[type="range"], .slider').length > 0,
        hasToggles: document.querySelectorAll('input[type="checkbox"], .toggle, .switch').length > 0,
        hasColorPickers: document.querySelectorAll('input[type="color"]').length > 0,
        hasDatePickers: document.querySelectorAll('input[type="date"], input[type="datetime-local"]').length > 0
      }
    })

    console.log('🎨 Micro-features Analysis:')
    Object.entries(microFeatures).forEach(([feature, present]) => {
      const status = present ? '✅' : '❌'
      console.log(`  ${status} ${feature}: ${present}`)
    })

    console.log('\n📊 Summary:')
    const presentFeatures = Object.values(microFeatures).filter(Boolean).length
    const totalFeatures = Object.keys(microFeatures).length
    console.log(`  Micro-features present: ${presentFeatures}/${totalFeatures} (${(presentFeatures/totalFeatures*100).toFixed(1)}%)`)

    // Log any critical missing features
    const criticalMissing = []
    if (!microFeatures.hasDropdowns) criticalMissing.push('Dropdown menus')
    if (!microFeatures.hasTabs) criticalMissing.push('Tab navigation')
    if (!microFeatures.hasAnimations) criticalMissing.push('Animations')
    if (!microFeatures.hasHoverEffects) criticalMissing.push('Hover effects')

    if (criticalMissing.length > 0) {
      console.log(`⚠️  Critical missing features: ${criticalMissing.join(', ')}`)
    }
  })
})