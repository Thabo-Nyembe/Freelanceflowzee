import puppeteer from 'puppeteer';
import fs from 'fs';

// Batch 24: More v2 pages (e-l)
const pages = [
  '/dashboard/email-v2',
  '/dashboard/escrow-v2',
  '/dashboard/financial-v2',
  '/dashboard/forums-v2',
  '/dashboard/glossary-v2',
  '/dashboard/groups-v2',
  '/dashboard/hiring-v2',
  '/dashboard/ideas-v2',
  '/dashboard/import-v2',
  '/dashboard/jobs-v2',
  '/dashboard/kanban-v2',
  '/dashboard/learning-v2',
  '/dashboard/legal-v2',
];

const baseUrl = 'http://localhost:9323';
const screenshotsDir = '/tmp/kazi-batch24';

async function testPages() {
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  const results = { ok: [], error: [], timeout: [], notFound: [] };

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
      const has404 = content.includes('404') && content.includes('could not be found');
      const hasError = content.includes('Dashboard Error') ||
                      content.includes('is not defined') ||
                      content.includes('is not a function') ||
                      content.includes('Cannot read properties');

      if (has404) {
        console.log('404');
        results.notFound.push(route);
      } else if (hasError) {
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
  console.log('404s:', results.notFound.length);
  console.log('Timeouts:', results.timeout.length);

  if (results.error.length > 0) {
    console.log('\nPages with errors:');
    results.error.forEach(p => console.log('  ' + p));
  }
}

testPages().catch(console.error);
