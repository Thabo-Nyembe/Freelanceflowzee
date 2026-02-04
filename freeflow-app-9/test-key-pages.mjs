import puppeteer from 'puppeteer';
import fs from 'fs';

const pages = [
  '/v1/dashboard',
  '/v1/dashboard/projects',
  '/v1/dashboard/invoices',
  '/v1/dashboard/calendar',
  '/v1/dashboard/messages',
  '/dashboard/ai-create-v2',
  '/dashboard/ai-assistant-v2',
  '/dashboard/messages-v2',
  '/dashboard/files-hub-v2',
  '/dashboard/expenses-v2',
  '/dashboard/collaboration-v2',
];

const baseUrl = 'http://localhost:9323';
const screenshotsDir = '/tmp/kazi-key-pages';

async function testPages() {
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  const results = { ok: [], error: [] };

  for (let i = 0; i < pages.length; i++) {
    const route = pages[i];
    const name = route.replace(/\//g, '-').replace(/^-/, '');

    console.log(`[${i+1}/${pages.length}] Testing ${route}...`);

    try {
      await page.goto(baseUrl + route + '?demo=true', {
        waitUntil: 'networkidle2',
        timeout: 20000
      });

      await new Promise(r => setTimeout(r, 2000));

      await page.screenshot({ path: `${screenshotsDir}/${name}.png` });

      const content = await page.content();
      const hasError = content.includes('Something went wrong') ||
                      content.includes('Dashboard Error') ||
                      content.includes('not authenticated');

      if (hasError) {
        console.log('  ERROR detected');
        results.error.push(route);
      } else {
        console.log('  OK');
        results.ok.push(route);
      }
    } catch (err) {
      console.log('  TIMEOUT');
      results.error.push(route);
    }
  }

  await browser.close();

  console.log('\n=== RESULTS ===');
  console.log('OK:', results.ok.length);
  console.log('Errors:', results.error.length);

  if (results.error.length > 0) {
    console.log('\nPages with errors:');
    results.error.forEach(p => console.log('  ' + p));
  }

  console.log('\nScreenshots saved to:', screenshotsDir);
}

testPages().catch(console.error);
