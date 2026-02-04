import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

// Discover all v1 dashboard pages
function discoverPages() {
  const dashboardDir = './app/v1/dashboard';
  const pages = [];

  const dirs = fs.readdirSync(dashboardDir);
  for (const dir of dirs) {
    const fullPath = path.join(dashboardDir, dir);
    if (fs.statSync(fullPath).isDirectory()) {
      // Check if it has a page.tsx
      const pagePath = path.join(fullPath, 'page.tsx');
      if (fs.existsSync(pagePath)) {
        pages.push('/v1/dashboard/' + dir);
      }
    }
  }

  return pages;
}

const pages = discoverPages();
const baseUrl = 'http://localhost:9323';
const screenshotsDir = '/tmp/kazi-v1-all';

async function testPages() {
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  const results = { ok: [], error: [], timeout: [] };
  const errors = [];

  console.log('Testing ' + pages.length + ' v1 dashboard pages...\n');

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
                      content.includes('Application error');

      if (hasError) {
        console.log('ERROR');
        results.error.push(route);
        // Extract error message
        const match = content.match(/(is not defined|Cannot read properties[^<]*)/);
        if (match) {
          errors.push({ route, error: match[0] });
        }
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

  if (errors.length > 0) {
    console.log('\nError details:');
    errors.forEach(e => console.log('  ' + e.route + ': ' + e.error.substring(0, 80)));
  }

  console.log('\nScreenshots of errors saved to: ' + screenshotsDir);
}

testPages().catch(console.error);
