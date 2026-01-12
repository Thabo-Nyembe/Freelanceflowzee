import { test, Page } from '@playwright/test';

/**
 * Comprehensive User Walkthrough Test
 * This test simulates a new user exploring the entire KAZI platform
 * and identifies any broken buttons, features, or micro-features that need wiring
 */

// Helper to wait for page load
async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
}

// Helper to check if element is visible and clickable
async function checkInteractiveElement(page: Page, selector: string, name: string) {
  const element = page.locator(selector).first();
  const isVisible = await element.isVisible().catch(() => false);
  const isEnabled = isVisible ? await element.isEnabled().catch(() => false) : false;

  console.log(`[${isVisible ? '✓' : '✗'}] ${name}: ${isVisible ? (isEnabled ? 'VISIBLE & ENABLED' : 'VISIBLE BUT DISABLED') : 'NOT FOUND'}`);

  return { isVisible, isEnabled, element };
}

// Helper to test button functionality
async function testButton(page: Page, buttonText: string, context: string) {
  try {
    const button = page.getByRole('button', { name: new RegExp(buttonText, 'i') }).first();
    const isVisible = await button.isVisible({ timeout: 2000 }).catch(() => false);

    if (isVisible) {
      const isEnabled = await button.isEnabled();
      console.log(`  [${isEnabled ? '✓' : '⚠'}] "${buttonText}" button in ${context}: ${isEnabled ? 'WORKING' : 'DISABLED'}`);

      if (isEnabled) {
        // Click and check for response
        await button.click();
        await page.waitForTimeout(500);
        console.log(`    → Clicked successfully`);
        return true;
      }
    } else {
      console.log(`  [✗] "${buttonText}" button NOT FOUND in ${context}`);
    }
  } catch (error) {
    console.log(`  [✗] Error testing "${buttonText}": ${error.message}`);
  }
  return false;
}

test.describe('Comprehensive KAZI Platform Walkthrough', () => {
  test.beforeEach(async ({ page }) => {
    // Start at the home page
    await page.goto('http://localhost:9323');
    await waitForPageLoad(page);
  });

  test('1. Landing Page & Navigation', async ({ page }) => {
    console.log('\n🏠 TESTING LANDING PAGE\n');

    // Check hero section
    await checkInteractiveElement(page, 'h1', 'Hero Heading');

    // Test navigation buttons
    await testButton(page, 'Get Started', 'Landing Page');
    await testButton(page, 'Sign Up', 'Landing Page');
    await testButton(page, 'Log In', 'Landing Page');
    await testButton(page, 'Login', 'Landing Page');

    // Check for features section
    const features = await page.locator('text=/feature/i').count();
    console.log(`  Found ${features} feature mentions`);

    // Navigate to dashboard (assuming it redirects or has a link)
    try {
      await page.goto('http://localhost:9323/dashboard');
      await waitForPageLoad(page);
      console.log('  ✓ Successfully navigated to dashboard');
    } catch (error) {
      console.log(`  ✗ Could not navigate to dashboard: ${error.message}`);
    }
  });

  test('2. Dashboard Overview - Main Hub', async ({ page }) => {
    console.log('\n📊 TESTING DASHBOARD OVERVIEW\n');

    await page.goto('http://localhost:9323/dashboard');
    await waitForPageLoad(page);

    // Check sidebar navigation
    console.log('Sidebar Navigation:');
    const navItems = [
      'Dashboard', 'My Day', 'Projects', 'Clients', 'Files',
      'AI Create', 'AI Design', 'Video Studio', 'Audio Studio',
      'Collaboration', 'Analytics', 'Settings'
    ];

    for (const item of navItems) {
      await checkInteractiveElement(page, `text=${item}`, `Nav: ${item}`);
    }

    // Check widget cards
    console.log('\nDashboard Widgets:');
    const widgets = await page.locator('[class*="card"], [class*="Card"], [class*="widget"]').count();
    console.log(`  Found ${widgets} widget cards`);

    // Test quick action buttons
    await testButton(page, 'New Project', 'Dashboard');
    await testButton(page, 'New Task', 'Dashboard');
    await testButton(page, 'Upload', 'Dashboard');
    await testButton(page, 'Create', 'Dashboard');
  });

  test('3. My Day - Task Management', async ({ page }) => {
    console.log('\n📅 TESTING MY DAY PAGE\n');

    await page.goto('http://localhost:9323/dashboard/my-day-v2');
    await waitForPageLoad(page);

    // Check main sections
    await checkInteractiveElement(page, 'text=/task/i', 'Tasks Section');
    await checkInteractiveElement(page, 'text=/calendar/i', 'Calendar Section');
    await checkInteractiveElement(page, 'text=/note/i', 'Notes Section');

    // Test task management buttons
    console.log('\nTask Management:');
    await testButton(page, 'Add Task', 'My Day');
    await testButton(page, 'New Task', 'My Day');
    await testButton(page, 'Create Task', 'My Day');

    // Test calendar interactions
    console.log('\nCalendar Features:');
    const calendar = page.locator('[class*="calendar"]').first();
    if (await calendar.isVisible().catch(() => false)) {
      console.log('  ✓ Calendar widget visible');
      // Check for date cells
      const dates = await page.locator('[class*="date"], [role="gridcell"]').count();
      console.log(`  Found ${dates} date cells`);
    }

    // Test notes functionality
    console.log('\nNotes Features:');
    await testButton(page, 'Add Note', 'My Day');
    await testButton(page, 'New Note', 'My Day');

    // Check for task list
    const tasks = await page.locator('[class*="task"]').count();
    console.log(`  Found ${tasks} task-related elements`);
  });

  test('4. Projects Hub - Project Management', async ({ page }) => {
    console.log('\n🎯 TESTING PROJECTS HUB\n');

    await page.goto('http://localhost:9323/dashboard/projects-hub-v2');
    await waitForPageLoad(page);

    // Test project creation
    console.log('Project Creation:');
    await testButton(page, 'New Project', 'Projects Hub');
    await testButton(page, 'Create Project', 'Projects Hub');
    await testButton(page, 'Add Project', 'Projects Hub');

    // Check project views
    console.log('\nProject Views:');
    await testButton(page, 'Grid View', 'Projects Hub');
    await testButton(page, 'List View', 'Projects Hub');
    await testButton(page, 'Kanban', 'Projects Hub');

    // Check filters and sorting
    console.log('\nFilters & Sorting:');
    await checkInteractiveElement(page, '[class*="filter"]', 'Filter Controls');
    await checkInteractiveElement(page, '[class*="sort"]', 'Sort Controls');

    // Check for project cards
    const projects = await page.locator('[class*="project"]').count();
    console.log(`  Found ${projects} project-related elements`);

    // Test project actions
    console.log('\nProject Actions:');
    await testButton(page, 'View Details', 'Projects Hub');
    await testButton(page, 'Edit', 'Projects Hub');
    await testButton(page, 'Delete', 'Projects Hub');
    await testButton(page, 'Share', 'Projects Hub');
  });

  test('5. AI Create - AI Content Generation', async ({ page }) => {
    console.log('\n🤖 TESTING AI CREATE\n');

    await page.goto('http://localhost:9323/dashboard/ai-create-v2');
    await waitForPageLoad(page);

    // Check AI templates
    console.log('AI Templates:');
    const templates = await page.locator('[class*="template"]').count();
    console.log(`  Found ${templates} template elements`);

    // Test AI features
    console.log('\nAI Generation Features:');
    await testButton(page, 'Generate', 'AI Create');
    await testButton(page, 'Create with AI', 'AI Create');
    await testButton(page, 'New Generation', 'AI Create');

    // Check for model selection
    console.log('\nAI Model Controls:');
    await checkInteractiveElement(page, 'select', 'Model Selector');
    await checkInteractiveElement(page, '[class*="model"]', 'Model Options');

    // Test input areas
    const textarea = page.locator('textarea').first();
    if (await textarea.isVisible().catch(() => false)) {
      console.log('  ✓ Prompt input area found');
      await textarea.fill('Test prompt for AI generation');
      console.log('  ✓ Prompt input working');
    }

    // Check generation history
    console.log('\nGeneration History:');
    await testButton(page, 'History', 'AI Create');
    await testButton(page, 'View History', 'AI Create');
  });

  test('6. AI Design - Design Tools', async ({ page }) => {
    console.log('\n🎨 TESTING AI DESIGN\n');

    await page.goto('http://localhost:9323/dashboard/ai-design-v2');
    await waitForPageLoad(page);

    // Check design tools
    console.log('Design Tools:');
    await testButton(page, 'New Design', 'AI Design');
    await testButton(page, 'Create', 'AI Design');
    await testButton(page, 'Generate', 'AI Design');

    // Check canvas area
    const canvas = page.locator('canvas').first();
    if (await canvas.isVisible().catch(() => false)) {
      console.log('  ✓ Canvas element found');
    }

    // Test design templates
    const designTemplates = await page.locator('[class*="template"]').count();
    console.log(`  Found ${designTemplates} design template elements`);
  });

  test('7. Video Studio - Video Creation', async ({ page }) => {
    console.log('\n🎬 TESTING VIDEO STUDIO\n');

    await page.goto('http://localhost:9323/dashboard/video-studio-v2');
    await waitForPageLoad(page);

    // Check video controls
    console.log('Video Studio Features:');
    await testButton(page, 'New Video', 'Video Studio');
    await testButton(page, 'Upload', 'Video Studio');
    await testButton(page, 'Record', 'Video Studio');
    await testButton(page, 'Import', 'Video Studio');

    // Check editor interface
    console.log('\nVideo Editor:');
    await checkInteractiveElement(page, '[class*="timeline"]', 'Timeline');
    await checkInteractiveElement(page, '[class*="preview"]', 'Preview Area');

    // Test video actions
    await testButton(page, 'Play', 'Video Studio');
    await testButton(page, 'Export', 'Video Studio');
    await testButton(page, 'Save', 'Video Studio');
  });

  test('8. Audio Studio - Audio Creation', async ({ page }) => {
    console.log('\n🎵 TESTING AUDIO STUDIO\n');

    await page.goto('http://localhost:9323/dashboard/audio-studio-v2');
    await waitForPageLoad(page);

    // Check audio controls
    console.log('Audio Studio Features:');
    await testButton(page, 'New Audio', 'Audio Studio');
    await testButton(page, 'Upload', 'Audio Studio');
    await testButton(page, 'Record', 'Audio Studio');

    // Check waveform/visualizer
    const audioViz = await page.locator('[class*="wave"], [class*="visualiz"]').count();
    console.log(`  Found ${audioViz} audio visualization elements`);

    // Test audio actions
    await testButton(page, 'Play', 'Audio Studio');
    await testButton(page, 'Export', 'Audio Studio');
  });

  test('9. 3D Modeling - 3D Creation Tools', async ({ page }) => {
    console.log('\n🔲 TESTING 3D MODELING\n');

    await page.goto('http://localhost:9323/dashboard/3d-modeling');
    await waitForPageLoad(page);

    // Check 3D controls
    await testButton(page, 'New Model', '3D Modeling');
    await testButton(page, 'Import', '3D Modeling');
    await testButton(page, 'Upload', '3D Modeling');

    // Check for 3D viewport
    const canvas3d = page.locator('canvas').first();
    if (await canvas3d.isVisible().catch(() => false)) {
      console.log('  ✓ 3D viewport canvas found');
    }
  });

  test('10. Client Zone - Client Management', async ({ page }) => {
    console.log('\n👥 TESTING CLIENT ZONE\n');

    await page.goto('http://localhost:9323/dashboard/clients-v2');
    await waitForPageLoad(page);

    // Test client management
    console.log('Client Management:');
    await testButton(page, 'Add Client', 'Client Zone');
    await testButton(page, 'New Client', 'Client Zone');
    await testButton(page, 'Import Clients', 'Client Zone');

    // Check client list
    const clients = await page.locator('[class*="client"]').count();
    console.log(`  Found ${clients} client-related elements`);

    // Test client actions
    await testButton(page, 'View', 'Client Zone');
    await testButton(page, 'Edit', 'Client Zone');
    await testButton(page, 'Contact', 'Client Zone');
  });

  test('11. Files Hub - File Management', async ({ page }) => {
    console.log('\n📁 TESTING FILES HUB\n');

    await page.goto('http://localhost:9323/dashboard/files-hub-v2');
    await waitForPageLoad(page);

    // Test file operations
    console.log('File Operations:');
    await testButton(page, 'Upload', 'Files Hub');
    await testButton(page, 'New Folder', 'Files Hub');
    await testButton(page, 'Create Folder', 'Files Hub');

    // Check view options
    await testButton(page, 'Grid View', 'Files Hub');
    await testButton(page, 'List View', 'Files Hub');

    // Check file actions
    await testButton(page, 'Download', 'Files Hub');
    await testButton(page, 'Share', 'Files Hub');
    await testButton(page, 'Delete', 'Files Hub');

    // Check for file list
    const files = await page.locator('[class*="file"]').count();
    console.log(`  Found ${files} file-related elements`);
  });

  test('12. Collaboration - Team Features', async ({ page }) => {
    console.log('\n🤝 TESTING COLLABORATION\n');

    await page.goto('http://localhost:9323/dashboard/collaboration-v2');
    await waitForPageLoad(page);

    // Test collaboration features
    await testButton(page, 'New Room', 'Collaboration');
    await testButton(page, 'Join Room', 'Collaboration');
    await testButton(page, 'Invite', 'Collaboration');

    // Check messaging
    const messages = await page.locator('[class*="message"], [class*="chat"]').count();
    console.log(`  Found ${messages} messaging elements`);

    // Test collaboration tools
    await testButton(page, 'Screen Share', 'Collaboration');
    await testButton(page, 'Video Call', 'Collaboration');
    await testButton(page, 'Voice Call', 'Collaboration');
  });

  test('13. Analytics - Performance Metrics', async ({ page }) => {
    console.log('\n📈 TESTING ANALYTICS\n');

    await page.goto('http://localhost:9323/dashboard/analytics-v2');
    await waitForPageLoad(page);

    // Check for charts
    const charts = await page.locator('canvas, svg[class*="chart"]').count();
    console.log(`  Found ${charts} chart elements`);

    // Test analytics controls
    await testButton(page, 'Export', 'Analytics');
    await testButton(page, 'Download Report', 'Analytics');

    // Check date range selector
    await checkInteractiveElement(page, '[type="date"]', 'Date Selector');
  });

  test('14. Settings - User Preferences', async ({ page }) => {
    console.log('\n⚙️ TESTING SETTINGS\n');

    await page.goto('http://localhost:9323/dashboard/settings-v2');
    await waitForPageLoad(page);

    // Check settings sections
    console.log('Settings Sections:');
    await checkInteractiveElement(page, 'text=/profile/i', 'Profile Settings');
    await checkInteractiveElement(page, 'text=/account/i', 'Account Settings');
    await checkInteractiveElement(page, 'text=/notification/i', 'Notifications');
    await checkInteractiveElement(page, 'text=/security/i', 'Security');

    // Test settings actions
    await testButton(page, 'Save', 'Settings');
    await testButton(page, 'Update', 'Settings');
    await testButton(page, 'Cancel', 'Settings');

    // Check theme toggle
    await testButton(page, 'Dark Mode', 'Settings');
    await testButton(page, 'Light Mode', 'Settings');
  });

  test('15. Notifications - Notification Center', async ({ page }) => {
    console.log('\n🔔 TESTING NOTIFICATIONS\n');

    await page.goto('http://localhost:9323/dashboard/notifications-v2');
    await waitForPageLoad(page);

    // Check notification list
    const notifications = await page.locator('[class*="notification"]').count();
    console.log(`  Found ${notifications} notification elements`);

    // Test notification actions
    await testButton(page, 'Mark All Read', 'Notifications');
    await testButton(page, 'Clear All', 'Notifications');
    await testButton(page, 'Settings', 'Notifications');
  });

  test('16. Invoicing - Invoice Management', async ({ page }) => {
    console.log('\n💰 TESTING INVOICING\n');

    await page.goto('http://localhost:9323/dashboard/invoicing-v2');
    await waitForPageLoad(page);

    // Test invoice operations
    await testButton(page, 'New Invoice', 'Invoicing');
    await testButton(page, 'Create Invoice', 'Invoicing');

    // Check invoice list
    const invoices = await page.locator('[class*="invoice"]').count();
    console.log(`  Found ${invoices} invoice elements`);

    // Test invoice actions
    await testButton(page, 'Download', 'Invoicing');
    await testButton(page, 'Send', 'Invoicing');
    await testButton(page, 'Print', 'Invoicing');
  });

  test('17. Profile - User Profile', async ({ page }) => {
    console.log('\n👤 TESTING PROFILE\n');

    await page.goto('http://localhost:9323/dashboard/profile-v2');
    await waitForPageLoad(page);

    // Check profile sections
    await checkInteractiveElement(page, '[type="file"]', 'Avatar Upload');

    // Test profile actions
    await testButton(page, 'Save', 'Profile');
    await testButton(page, 'Update', 'Profile');
    await testButton(page, 'Upload Photo', 'Profile');

    // Check form fields
    const inputs = await page.locator('input').count();
    console.log(`  Found ${inputs} input fields`);
  });

  test('18. Time Tracking - Time Management', async ({ page }) => {
    console.log('\n⏱️ TESTING TIME TRACKING\n');

    await page.goto('http://localhost:9323/dashboard/time-tracking-v2');
    await waitForPageLoad(page);

    // Test timer controls
    await testButton(page, 'Start', 'Time Tracking');
    await testButton(page, 'Stop', 'Time Tracking');
    await testButton(page, 'Pause', 'Time Tracking');

    // Check time entries
    const entries = await page.locator('[class*="entry"], [class*="time"]').count();
    console.log(`  Found ${entries} time tracking elements`);
  });

  test('19. Comprehensive Button Audit', async ({ page }) => {
    console.log('\n🔍 COMPREHENSIVE BUTTON AUDIT\n');

    const pages = [
      '/dashboard',
      '/dashboard/my-day-v2',
      '/dashboard/projects-hub-v2',
      '/dashboard/ai-create-v2',
      '/dashboard/files-hub-v2',
      '/dashboard/collaboration-v2'
    ];

    const brokenButtons: string[] = [];
    const workingButtons: string[] = [];

    for (const pagePath of pages) {
      await page.goto(`http://localhost:9323${pagePath}`);
      await waitForPageLoad(page);

      console.log(`\nScanning: ${pagePath}`);

      const buttons = await page.locator('button').all();
      console.log(`  Found ${buttons.length} buttons`);

      for (let i = 0; i < Math.min(buttons.length, 10); i++) {
        try {
          const button = buttons[i];
          const text = await button.textContent() || `Button ${i}`;
          const isEnabled = await button.isEnabled();
          const isVisible = await button.isVisible();

          if (isVisible && isEnabled) {
            workingButtons.push(`${pagePath}: ${text.trim()}`);
            console.log(`    ✓ ${text.trim()}`);
          } else {
            brokenButtons.push(`${pagePath}: ${text.trim()} (${!isVisible ? 'hidden' : 'disabled'})`);
            console.log(`    ✗ ${text.trim()} (${!isVisible ? 'hidden' : 'disabled'})`);
          }
        } catch (error) {
          // Skip problematic buttons
        }
      }
    }

    console.log(`\n\n📊 AUDIT SUMMARY:`);
    console.log(`  Working Buttons: ${workingButtons.length}`);
    console.log(`  Broken Buttons: ${brokenButtons.length}`);

    if (brokenButtons.length > 0) {
      console.log(`\n⚠️ BROKEN BUTTONS TO FIX:`);
      brokenButtons.forEach(btn => console.log(`    - ${btn}`));
    }
  });
});
