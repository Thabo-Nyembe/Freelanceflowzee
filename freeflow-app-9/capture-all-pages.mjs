import puppeteer from 'puppeteer';
import fs from 'fs';

// Get all dashboard routes from the filesystem
const getAllRoutes = () => {
  const routes = [];
  const findPages = (dir, prefix = '') => {
    try {
      const items = fs.readdirSync(dir, { withFileTypes: true });
      for (const item of items) {
        if (item.isDirectory()) {
          // Skip dynamic routes like [id]
          if (!item.name.startsWith('[')) {
            findPages(`${dir}/${item.name}`, `${prefix}/${item.name}`);
          }
        } else if (item.name === 'page.tsx') {
          routes.push(prefix || '/');
        }
      }
    } catch (e) {}
  };

  // Find v1 dashboard routes
  findPages('app/v1/dashboard', '/v1/dashboard');
  // Find v2 dashboard routes
  findPages('app/v2/dashboard', '/v2/dashboard');
  // Find (app) dashboard routes
  findPages('app/(app)/dashboard', '/dashboard');

  return routes.sort();
};

const baseUrl = 'http://localhost:9323';
const screenshotsDir = '/tmp/kazi-all-screenshots';

async function captureAllPages() {
  const routes = getAllRoutes();
  console.log('Found ' + routes.length + ' dashboard pages to test\n');

  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  const results = {
    passed: [],
    errors: [],
    loading: [],
    timeout: []
  };

  const consoleErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push({ url: page.url(), text: msg.text() });
    }
  });

  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];
    const safeName = route.replace(/\//g, '-').replace(/^-/, '') || 'root';

    process.stdout.write(`[${i+1}/${routes.length}] ${route}...`);

    try {
      await page.goto(baseUrl + route + '?demo=true', {
        waitUntil: 'networkidle2',
        timeout: 15000
      });

      await new Promise(r => setTimeout(r, 1500));

      // Check for error states in the page
      const pageContent = await page.content();
      const hasError = pageContent.includes('Something went wrong') ||
                       pageContent.includes('not authenticated') ||
                       pageContent.includes('Error loading');
      const hasLoading = pageContent.includes('Loading...') &&
                        !pageContent.includes('class="') &&
                        pageContent.length < 50000;

      await page.screenshot({
        path: `${screenshotsDir}/${safeName}.png`,
        fullPage: false
      });

      if (hasError) {
        console.log(' ERROR');
        results.errors.push(route);
      } else if (hasLoading) {
        console.log(' LOADING');
        results.loading.push(route);
      } else {
        console.log(' OK');
        results.passed.push(route);
      }
    } catch (err) {
      console.log(' TIMEOUT');
      results.timeout.push(route);
    }
  }

  await browser.close();

  // Summary
  console.log('\n========================================');
  console.log('FULL APP TEST COMPLETE');
  console.log('========================================');
  console.log('Total pages: ' + routes.length);
  console.log('Passed: ' + results.passed.length);
  console.log('Errors: ' + results.errors.length);
  console.log('Loading states: ' + results.loading.length);
  console.log('Timeouts: ' + results.timeout.length);

  if (results.errors.length > 0) {
    console.log('\n=== PAGES WITH ERRORS ===');
    results.errors.forEach(r => console.log('  ' + r));
  }

  if (results.timeout.length > 0) {
    console.log('\n=== PAGES THAT TIMED OUT ===');
    results.timeout.forEach(r => console.log('  ' + r));
  }

  console.log('\nScreenshots saved to: ' + screenshotsDir);

  // Save results to JSON
  fs.writeFileSync('/tmp/kazi-test-results.json', JSON.stringify(results, null, 2));
}

captureAllPages().catch(console.error);
