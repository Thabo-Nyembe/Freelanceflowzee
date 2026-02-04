import puppeteer from 'puppeteer';
import fs from 'fs';

const screenshotsDir = '/tmp/kazi-final-screenshots';
if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });

const pages = [
  { route: '/dashboard/wallet-v2', name: 'wallet' },
  { route: '/dashboard/crm-v2', name: 'crm' },
  { route: '/dashboard/leads-v2', name: 'leads' },
  { route: '/dashboard/resources-v2', name: 'resources' },
  { route: '/v1/dashboard/activity-logs', name: 'activity-logs' },
  { route: '/dashboard/community-v2', name: 'community' },
  { route: '/dashboard/gamification-v2', name: 'gamification' },
  { route: '/dashboard/loyalty-v2', name: 'loyalty' },
];

async function capture() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  let ok = 0, errors = 0;

  for (const { route, name } of pages) {
    process.stdout.write(name + '... ');
    try {
      await page.goto('http://localhost:9323' + route + '?demo=true', { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise(r => setTimeout(r, 1500));

      const content = await page.content();
      const hasError = content.includes('Dashboard Error') || content.includes('is not defined');

      await page.screenshot({ path: screenshotsDir + '/' + name + '.png' });

      if (hasError) {
        console.log('ERROR');
        errors++;
      } else {
        console.log('OK');
        ok++;
      }
    } catch (e) {
      console.log('TIMEOUT');
    }
  }

  await browser.close();
  console.log('\nOK:', ok, 'Errors:', errors);
  console.log('Screenshots:', screenshotsDir);
}

capture().catch(console.error);
