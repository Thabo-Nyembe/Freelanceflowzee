import puppeteer from 'puppeteer';
import fs from 'fs';

// Batch 2: More dashboard pages
const pages = [
  '/v1/dashboard/clients',
  '/v1/dashboard/tasks',
  '/v1/dashboard/payments',
  '/v1/dashboard/settings',
  '/v1/dashboard/team',
  '/v1/dashboard/analytics-advanced',
  '/v1/dashboard/accounting',
  '/v1/dashboard/reporting',
  '/dashboard/admin-v2',
  '/dashboard/analytics-v2',
  '/dashboard/clients-v2',
  '/dashboard/tasks-v2',
  '/dashboard/team-v2',
  '/dashboard/settings-v2',
  '/dashboard/notifications-v2',
  '/dashboard/crm-v2',
];

const baseUrl = 'http://localhost:9323';
const screenshotsDir = '/tmp/kazi-batch2';

async function testPages() {
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

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
      console.log('OK');
    } catch (err) {
      console.log('TIMEOUT');
    }
  }

  await browser.close();
  console.log('\nScreenshots saved to: ' + screenshotsDir);
}

testPages().catch(console.error);
