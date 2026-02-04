import puppeteer from 'puppeteer';

async function capture() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  await page.goto('http://localhost:9323/dashboard/my-day-v2?demo=true', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: '/tmp/kazi-app-screenshots/my-day-fixed.png' });
  console.log('Screenshot saved: /tmp/kazi-app-screenshots/my-day-fixed.png');

  await browser.close();
}

capture().catch(console.error);
