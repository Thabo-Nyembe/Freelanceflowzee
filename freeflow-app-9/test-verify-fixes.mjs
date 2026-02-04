import puppeteer from 'puppeteer';
import fs from 'fs';

// Pages we just fixed
const pages = [
  '/v1/dashboard/files',
  '/v1/dashboard/community',
  '/v1/dashboard/team',
];

const baseUrl = 'http://localhost:9323';
const screenshotsDir = '/tmp/kazi-verify';

async function testPages() {
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  console.log('Verifying ' + pages.length + ' fixed pages...\n');

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
      const hasError = content.includes('Dashboard Error') ||
                      content.includes('not authenticated') ||
                      content.includes('is not defined');

      if (hasError) {
        console.log('STILL ERROR');
      } else {
        console.log('FIXED ✓');
      }
    } catch (err) {
      console.log('TIMEOUT');
    }
  }

  await browser.close();
  console.log('\nScreenshots saved to: ' + screenshotsDir);
}

testPages().catch(console.error);
