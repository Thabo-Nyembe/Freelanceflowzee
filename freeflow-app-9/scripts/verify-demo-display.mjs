#!/usr/bin/env node

/**
 * Verify Demo Data Display - Take screenshots and check for data
 */

import puppeteer from 'puppeteer';
import fs from 'fs';

const BASE_URL = 'http://localhost:9323';
const SCREENSHOT_DIR = './screenshots/demo-verify';

// Create screenshot directory
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function verifyPage(browser, name, path) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  console.log(`\nChecking: ${name}`);
  console.log(`  URL: ${BASE_URL}${path}?demo=true`);

  try {
    // Navigate with longer timeout
    await page.goto(`${BASE_URL}${path}?demo=true`, {
      waitUntil: 'domcontentloaded',
      timeout: 15000
    });

    // Wait for content to load
    await delay(3000);

    // Take screenshot
    const screenshotPath = `${SCREENSHOT_DIR}/${name}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`  Screenshot: ${screenshotPath}`);

    // Check page content
    const content = await page.evaluate(() => {
      const text = document.body.innerText;

      // Look for data indicators
      const hasProjects = /\d+\s*projects?/i.test(text) || /Enterprise Portal|Mobile App|Analytics Dashboard/i.test(text);
      const hasClients = /\d+\s*clients?/i.test(text) || /Acme Corporation|TechStart|DataFlow/i.test(text);
      const hasMoney = /\$[\d,]+/.test(text) && !/\$0\.00|\$0[^,\d]/.test(text);
      const hasPercentage = /\d{1,3}%/.test(text) && !/^0%$/.test(text);

      // Check for empty indicators
      const emptyIndicators = ['No projects', 'No clients', 'No tasks', 'Get started', 'Create your first'];
      const foundEmpty = emptyIndicators.filter(ind => text.includes(ind));

      return {
        hasProjects,
        hasClients,
        hasMoney,
        hasPercentage,
        foundEmpty,
        textSample: text.substring(0, 300)
      };
    });

    // Report findings
    if (content.hasProjects || content.hasClients || content.hasMoney) {
      console.log(`  ✓ DATA FOUND`);
      if (content.hasProjects) console.log(`    - Projects detected`);
      if (content.hasClients) console.log(`    - Clients detected`);
      if (content.hasMoney) console.log(`    - Money values detected`);
    } else if (content.foundEmpty.length > 0) {
      console.log(`  ⚠ EMPTY STATE: ${content.foundEmpty.join(', ')}`);
    } else {
      console.log(`  ? Unknown state`);
    }

  } catch (error) {
    console.log(`  ✗ Error: ${error.message}`);
  } finally {
    await page.close();
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('DEMO DATA VERIFICATION');
  console.log('='.repeat(60));

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  // Key pages to verify
  const pages = [
    { name: 'projects-hub', path: '/dashboard/projects-hub-v2' },
    { name: 'clients', path: '/dashboard/clients-v2' },
    { name: 'invoices', path: '/dashboard/invoices-v2' },
    { name: 'tasks', path: '/dashboard/tasks-v2' },
    { name: 'dashboard-main', path: '/dashboard' },
  ];

  for (const p of pages) {
    await verifyPage(browser, p.name, p.path);
  }

  await browser.close();

  console.log('\n' + '='.repeat(60));
  console.log('VERIFICATION COMPLETE');
  console.log(`Screenshots saved to: ${SCREENSHOT_DIR}/`);
  console.log('='.repeat(60));
}

main().catch(console.error);
