#!/usr/bin/env node

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:9323';
const SCREENSHOT_DIR = '/Users/thabonyembe/Documents/freeflow-app-9/demo-screenshots';

const ROUTES = [
  { path: '/v2/dashboard', name: '01-dashboard' },
  { path: '/v2/dashboard/projects', name: '02-projects' },
  { path: '/v2/dashboard/clients', name: '03-clients' },
  { path: '/v2/dashboard/invoices', name: '04-invoices' },
  { path: '/v2/dashboard/tasks', name: '05-tasks' },
  { path: '/v2/dashboard/calendar', name: '06-calendar' },
  { path: '/v2/dashboard/time-tracking', name: '07-time-tracking' },
  { path: '/v2/dashboard/analytics', name: '08-analytics' },
  { path: '/v2/dashboard/files', name: '09-files' },
  { path: '/v2/dashboard/messages', name: '10-messages' },
  { path: '/v2/dashboard/notifications', name: '11-notifications' },
  { path: '/v2/dashboard/team', name: '12-team' },
  { path: '/v2/dashboard/financial', name: '13-financial' },
  { path: '/v2/dashboard/profile', name: '14-profile' },
  { path: '/v2/dashboard/settings', name: '15-settings' },
  { path: '/v2/dashboard/reports', name: '16-reports' },
  { path: '/v2/dashboard/activity-logs', name: '17-activity-logs' },
  { path: '/v2/dashboard/integrations', name: '18-integrations' },
  { path: '/v2/dashboard/ai-assistant', name: '19-ai-assistant' },
  { path: '/v2/dashboard/crypto-payments', name: '20-crypto' },
  { path: '/v2/dashboard/escrow', name: '21-escrow' }
];

async function main() {
  // Create screenshot directory
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  console.log('='.repeat(60));
  console.log('CAPTURING DEMO MODE SCREENSHOTS');
  console.log('='.repeat(60));
  console.log(`Output directory: ${SCREENSHOT_DIR}\n`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--window-size=1920,1080']
  });

  const results = [];

  for (const route of ROUTES) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    try {
      console.log(`Capturing: ${route.name}...`);

      await page.goto(`${BASE_URL}${route.path}?demo=true`, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Wait for content to render
      await new Promise(r => setTimeout(r, 3000));

      const screenshotPath = path.join(SCREENSHOT_DIR, `${route.name}.png`);
      await page.screenshot({
        path: screenshotPath,
        fullPage: false // Capture viewport only for consistency
      });

      // Get page info
      const bodyText = await page.evaluate(() => document.body.innerText);
      const hasContent = bodyText.length > 200;

      results.push({
        name: route.name,
        path: route.path,
        screenshot: screenshotPath,
        contentLength: bodyText.length,
        hasContent,
        status: 'success'
      });

      console.log(`  ✓ Saved: ${route.name}.png (${bodyText.length} chars)`);

    } catch (error) {
      console.log(`  ✗ Error: ${error.message.substring(0, 50)}`);
      results.push({
        name: route.name,
        path: route.path,
        status: 'error',
        error: error.message
      });
    } finally {
      await page.close();
    }
  }

  await browser.close();

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));

  const successful = results.filter(r => r.status === 'success');
  const failed = results.filter(r => r.status === 'error');
  const withContent = results.filter(r => r.hasContent);

  console.log(`Screenshots captured: ${successful.length}/${ROUTES.length}`);
  console.log(`Pages with content: ${withContent.length}/${ROUTES.length}`);

  if (failed.length > 0) {
    console.log('\nFailed pages:');
    failed.forEach(r => console.log(`  - ${r.name}: ${r.error}`));
  }

  console.log(`\nScreenshots saved to: ${SCREENSHOT_DIR}`);

  // Save results JSON
  fs.writeFileSync(
    path.join(SCREENSHOT_DIR, 'results.json'),
    JSON.stringify(results, null, 2)
  );
}

main().catch(console.error);
