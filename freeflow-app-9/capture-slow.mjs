import puppeteer from 'puppeteer';
import fs from 'fs';

const screenshotsDir = '/tmp/kazi-app-screenshots';

const pages = [
  { route: '/dashboard/crm-v2', name: 'crm' },
  { route: '/dashboard/leads-v2', name: 'leads' },
  { route: '/dashboard/community-v2', name: 'community' },
];

async function capture() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  for (const { route, name } of pages) {
    process.stdout.write(name.padEnd(15) + '... ');
    try {
      await page.goto('http://localhost:9323' + route + '?demo=true', { waitUntil: 'domcontentloaded', timeout: 45000 });
      await new Promise(r => setTimeout(r, 3000));
      await page.screenshot({ path: `${screenshotsDir}/${name}.png`, fullPage: false });
      console.log('OK');
    } catch (e) {
      console.log('FAILED:', e.message.substring(0, 50));
    }
  }

  await browser.close();
  console.log('\nDone. Screenshots in:', screenshotsDir);
}

capture().catch(console.error);
