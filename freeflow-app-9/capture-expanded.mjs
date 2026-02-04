import puppeteer from 'puppeteer';
import fs from 'fs';

const screenshotsDir = '/tmp/kazi-expanded-screenshots';
if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });

const pages = [
  // V2 dashboards
  { route: '/dashboard/analytics-v2', name: 'analytics' },
  { route: '/dashboard/calendar-v2', name: 'calendar' },
  { route: '/dashboard/portfolio-v2', name: 'portfolio' },
  { route: '/dashboard/invoices-v2', name: 'invoices' },
  { route: '/dashboard/clients-v2', name: 'clients' },
  { route: '/dashboard/projects-v2', name: 'projects' },
  { route: '/dashboard/tasks-v2', name: 'tasks' },
  { route: '/dashboard/contracts-v2', name: 'contracts' },
  { route: '/dashboard/messaging-v2', name: 'messaging' },
  { route: '/dashboard/files-v2', name: 'files' },
  { route: '/dashboard/bookmarks-v2', name: 'bookmarks' },
  { route: '/dashboard/settings-v2', name: 'settings' },
  { route: '/dashboard/notifications-v2', name: 'notifications' },
  // AI features
  { route: '/dashboard/ai-agents-v2', name: 'ai-agents' },
  { route: '/dashboard/ai-create-v2', name: 'ai-create' },
  { route: '/dashboard/ai-design-v2', name: 'ai-design' },
  // More dashboards
  { route: '/dashboard/proposals-v2', name: 'proposals' },
  { route: '/dashboard/time-tracking-v2', name: 'time-tracking' },
  { route: '/dashboard/expenses-v2', name: 'expenses' },
  { route: '/dashboard/reports-v2', name: 'reports' },
];

async function capture() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  let ok = 0, errors = 0, notFound = 0;

  for (const { route, name } of pages) {
    process.stdout.write(name + '... ');
    try {
      const response = await page.goto('http://localhost:9323' + route + '?demo=true', { waitUntil: 'networkidle2', timeout: 20000 });
      await new Promise(r => setTimeout(r, 1000));

      const content = await page.content();
      const hasError = content.includes('Dashboard Error') || content.includes('is not defined');
      const is404 = content.includes('404') || content.includes('not found');

      await page.screenshot({ path: screenshotsDir + '/' + name + '.png' });

      if (is404) {
        console.log('404');
        notFound++;
      } else if (hasError) {
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
  console.log('\n✓ OK:', ok, '| ✗ Errors:', errors, '| 404:', notFound);
  console.log('Screenshots:', screenshotsDir);
}

capture().catch(console.error);
