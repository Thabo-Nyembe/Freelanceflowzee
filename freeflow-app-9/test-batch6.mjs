import puppeteer from 'puppeteer';
import fs from 'fs';

// Batch 6: More specialized pages
const pages = [
  '/v1/dashboard/networking',
  '/v1/dashboard/knowledge-base',
  '/v1/dashboard/reviews',
  '/v1/dashboard/deposits',
  '/v1/dashboard/subscriptions',
  '/v1/dashboard/templates',
  '/v1/dashboard/automations',
  '/dashboard/networking-v2',
  '/dashboard/knowledge-base-v2',
  '/dashboard/reviews-v2',
  '/dashboard/deposits-v2',
  '/dashboard/subscriptions-v2',
  '/dashboard/templates-v2',
  '/dashboard/automations-v2',
  '/dashboard/quick-actions-v2',
  '/dashboard/feedback-v2',
];

const baseUrl = 'http://localhost:9323';
const screenshotsDir = '/tmp/kazi-batch6';

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
        timeout: 25000
      });

      await new Promise(r => setTimeout(r, 2000));
      await page.screenshot({ path: screenshotsDir + '/' + name + '.png' });

      const content = await page.content();
      const has404 = content.includes('404') || content.includes('Not Found') || content.includes('This page could not be found');
      const hasError = content.includes('Dashboard Error') ||
                      content.includes('is not defined') ||
                      content.includes('Cannot read properties');

      if (has404) {
        console.log('404');
        results.notFound.push(route);
      } else if (hasError) {
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
  console.log('404s:', results.notFound.length);
  console.log('Timeouts:', results.timeout.length);

  if (results.error.length > 0) {
    console.log('\nPages with errors:');
    results.error.forEach(p => console.log('  ' + p));
  }
  if (results.notFound.length > 0) {
    console.log('\nPages not found (404):');
    results.notFound.forEach(p => console.log('  ' + p));
  }
  if (results.timeout.length > 0) {
    console.log('\nPages that timed out:');
    results.timeout.forEach(p => console.log('  ' + p));
  }

  console.log('\nScreenshots saved to: ' + screenshotsDir);
}

testPages().catch(console.error);
