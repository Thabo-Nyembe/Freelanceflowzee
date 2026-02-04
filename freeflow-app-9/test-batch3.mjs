import puppeteer from 'puppeteer';
import fs from 'fs';

// Batch 3: More v1 and v2 dashboard pages
const pages = [
  '/v1/dashboard/profile',
  '/v1/dashboard/files',
  '/v1/dashboard/notifications',
  '/v1/dashboard/community',
  '/v1/dashboard/support',
  '/v1/dashboard/crm',
  '/v1/dashboard/expenses',
  '/v1/dashboard/time-tracking',
  '/v1/dashboard/goals',
  '/v1/dashboard/documents',
  '/dashboard/projects-v2',
  '/dashboard/invoices-v2',
  '/dashboard/calendar-v2',
  '/dashboard/payments-v2',
  '/dashboard/reports-v2',
  '/dashboard/profiles-v2',
];

const baseUrl = 'http://localhost:9323';
const screenshotsDir = '/tmp/kazi-batch3';

async function testPages() {
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  const results = { ok: [], error: [], timeout: [] };

  console.log('Testing ' + pages.length + ' pages...\n');

  for (let i = 0; i < pages.length; i++) {
    const route = pages[i];
    const name = route.replace(/\//g, '-').replace(/^-/, '');

    process.stdout.write('[' + (i+1) + '/' + pages.length + '] ' + route + '... ');

    try {
      await page.goto(baseUrl + route + '?demo=true', {
        waitUntil: 'networkidle2',
        timeout: 25000
      });

      await new Promise(r => setTimeout(r, 2000));
      await page.screenshot({ path: screenshotsDir + '/' + name + '.png' });

      const content = await page.content();
      const hasError = content.includes('Something went wrong') ||
                      content.includes('Dashboard Error') ||
                      content.includes('not authenticated') ||
                      content.includes('Failed to load') ||
                      content.includes('Error loading') ||
                      content.includes('Try Again');

      if (hasError) {
        console.log('ERROR');
        results.error.push(route);
      } else {
        console.log('OK');
        results.ok.push(route);
      }
    } catch (err) {
      console.log('TIMEOUT');
      results.timeout.push(route);
    }
  }

  await browser.close();

  console.log('\n=== RESULTS ===');
  console.log('OK:', results.ok.length);
  console.log('Errors:', results.error.length);
  console.log('Timeouts:', results.timeout.length);

  if (results.error.length > 0) {
    console.log('\nPages with errors:');
    results.error.forEach(p => console.log('  ' + p));
  }
  if (results.timeout.length > 0) {
    console.log('\nPages that timed out:');
    results.timeout.forEach(p => console.log('  ' + p));
  }

  console.log('\nScreenshots saved to: ' + screenshotsDir);
}

testPages().catch(console.error);
