import puppeteer from 'puppeteer';
import fs from 'fs';

// Batch 14: More v2 dashboard pages (c-g)
const pages = [
  '/dashboard/crm-v2',
  '/dashboard/dashboards-v2',
  '/dashboard/documents-v2',
  '/dashboard/events-v2',
  '/dashboard/expenses-v2',
  '/dashboard/faq-v2',
  '/dashboard/feedback-v2',
  '/dashboard/files-hub-v2',
  '/dashboard/gamification-v2',
  '/dashboard/goals-v2',
];

const baseUrl = 'http://localhost:9323';
const screenshotsDir = '/tmp/kazi-batch14';

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
                      content.includes('is not a function') ||
                      content.includes('Cannot read properties');

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
