import puppeteer from 'puppeteer';

const pages = [
  { route: '/dashboard/portfolio-v2', name: 'portfolio' },
  { route: '/dashboard/bookmarks-v2', name: 'bookmarks' },
  { route: '/dashboard/proposals-v2', name: 'proposals' },
];

async function capture() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  for (const { route, name } of pages) {
    process.stdout.write(name + '... ');
    try {
      const response = await page.goto('http://localhost:9323' + route + '?demo=true', { waitUntil: 'networkidle2', timeout: 25000 });
      await new Promise(r => setTimeout(r, 1500));

      const content = await page.content();
      const hasError = content.includes('Dashboard Error') || content.includes('is not defined') || content.includes('Unhandled Runtime Error');

      if (response.status() !== 200) {
        console.log('HTTP ' + response.status());
      } else if (hasError) {
        console.log('ERROR');
      } else {
        console.log('OK');
      }
    } catch (e) {
      console.log('TIMEOUT');
    }
  }

  await browser.close();
}

capture().catch(console.error);
