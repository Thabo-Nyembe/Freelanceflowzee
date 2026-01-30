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
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  console.log('Capturing final demo screenshots...\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--window-size=1920,1080']
  });

  let success = 0;
  let failed = 0;

  for (const route of ROUTES) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    try {
      // Use domcontentloaded like the test script
      await page.goto(`${BASE_URL}${route.path}?demo=true`, {
        waitUntil: 'domcontentloaded',
        timeout: 15000
      });

      // Wait for content to render (same as test script)
      await new Promise(r => setTimeout(r, 3000));

      const bodyText = await page.evaluate(() => document.body.innerText);

      // Only capture if there's actual content
      if (bodyText.length > 200) {
        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, `${route.name}.png`),
          fullPage: false
        });
        console.log(`✓ ${route.name} (${bodyText.length} chars)`);
        success++;
      } else {
        console.log(`✗ ${route.name} - No content (${bodyText.length} chars)`);
        failed++;
      }
    } catch (error) {
      console.log(`✗ ${route.name} - Error: ${error.message.substring(0, 40)}`);
      failed++;
    } finally {
      await page.close();
    }
  }

  await browser.close();

  console.log(`\n=== SUMMARY ===`);
  console.log(`Success: ${success}/${ROUTES.length}`);
  console.log(`Failed: ${failed}/${ROUTES.length}`);
  console.log(`\nScreenshots saved to: ${SCREENSHOT_DIR}`);
}

main().catch(console.error);
