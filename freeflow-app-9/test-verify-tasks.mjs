import puppeteer from 'puppeteer';
import fs from 'fs';

const baseUrl = 'http://localhost:9323';

async function test() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  console.log('Testing tasks page...');

  await page.goto(baseUrl + '/v1/dashboard/tasks?demo=true', {
    waitUntil: 'networkidle2',
    timeout: 30000
  });

  await new Promise(r => setTimeout(r, 3000));
  await page.screenshot({ path: '/tmp/tasks-verify.png' });

  const content = await page.content();
  if (content.includes('Failed to load tasks')) {
    console.log('STILL HAS ERROR');
  } else {
    console.log('FIXED ✓');
  }

  await browser.close();
}

test().catch(console.error);
