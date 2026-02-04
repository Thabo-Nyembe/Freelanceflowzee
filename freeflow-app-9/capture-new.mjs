import puppeteer from 'puppeteer';

const pages = [
  { route: '/dashboard/podcast-v2', name: 'podcast' },
  { route: '/dashboard/service-desk-v2', name: 'service-desk' },
  { route: '/dashboard/contracts-management-v2', name: 'contracts-management' },
  { route: '/dashboard/time-off-v2', name: 'time-off' },
  { route: '/dashboard/feedback-hub-v2', name: 'feedback-hub' },
];

async function capture() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  for (const { route, name } of pages) {
    process.stdout.write(name.padEnd(25) + '... ');
    try {
      const response = await page.goto('http://localhost:9323' + route + '?demo=true', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await new Promise(r => setTimeout(r, 2000));
      const status = response.status();
      if (status === 200) {
        await page.screenshot({ path: `/tmp/kazi-app-screenshots/${name}.png` });
        console.log('OK (200)');
      } else {
        console.log(`FAILED (${status})`);
      }
    } catch (err) {
      console.log(`ERROR: ${err.message}`);
    }
  }

  await browser.close();
  console.log('\nScreenshots saved to /tmp/kazi-app-screenshots/');
}

capture().catch(console.error);
