import puppeteer from 'puppeteer';
import fs from 'fs';

// Batch 9: More v1 pages (e-m)
const pages = [
  '/v1/dashboard/events',
  '/v1/dashboard/expenses',
  '/v1/dashboard/faq',
  '/v1/dashboard/feedback',
  '/v1/dashboard/files',
  '/v1/dashboard/gamification',
  '/v1/dashboard/goals',
  '/v1/dashboard/help',
  '/v1/dashboard/integrations',
  '/v1/dashboard/invoices',
  '/v1/dashboard/leads',
  '/v1/dashboard/media',
  '/v1/dashboard/messages',
];

const baseUrl = 'http://localhost:9323';
const screenshotsDir = '/tmp/kazi-batch9';

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
