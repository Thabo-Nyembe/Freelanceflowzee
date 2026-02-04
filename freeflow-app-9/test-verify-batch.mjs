import puppeteer from 'puppeteer';
import fs from 'fs';

// Verify recently fixed pages
const pages = [
  '/v1/dashboard/badges',
  '/dashboard/badges-v2',
  '/dashboard/ai-design-v2',
];

const baseUrl = 'http://localhost:9323';

async function test() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  console.log('Verifying fixed pages...\n');

  for (const route of pages) {
    process.stdout.write(route + '... ');

    try {
      await page.goto(baseUrl + route + '?demo=true', {
        waitUntil: 'networkidle2',
        timeout: 20000
      });

      await new Promise(r => setTimeout(r, 1500));

      const content = await page.content();
      const hasError = content.includes('Dashboard Error') ||
                      content.includes('is not defined') ||
                      content.includes('is not a function');

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
}

test().catch(console.error);
