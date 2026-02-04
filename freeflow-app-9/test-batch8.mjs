import puppeteer from 'puppeteer';
import fs from 'fs';

// Batch 8: More v1 pages (b-d)
const pages = [
  '/v1/dashboard/badges',
  '/v1/dashboard/billing',
  '/v1/dashboard/bookings',
  '/v1/dashboard/budgets',
  '/v1/dashboard/business-intelligence',
  '/v1/dashboard/calendar',
  '/v1/dashboard/clients',
  '/v1/dashboard/collaboration',
  '/v1/dashboard/communication',
  '/v1/dashboard/contracts',
  '/v1/dashboard/crm',
  '/v1/dashboard/dashboards',
  '/v1/dashboard/documents',
];

const baseUrl = 'http://localhost:9323';
const screenshotsDir = '/tmp/kazi-batch8';

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
        timeout: 20000
      });

      await new Promise(r => setTimeout(r, 1500));

      const content = await page.content();
      const hasError = content.includes('Dashboard Error') ||
                      content.includes('is not defined') ||
                      content.includes('Cannot read properties') ||
                      content.includes('fewer hooks');

      if (hasError) {
        console.log('ERROR');
        results.error.push(route);
        await page.screenshot({ path: screenshotsDir + '/' + name + '.png' });
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
}

testPages().catch(console.error);
