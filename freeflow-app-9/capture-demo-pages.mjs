import puppeteer from 'puppeteer';
import fs from 'fs';

const screenshotsDir = '/tmp/kazi-demo-screenshots';
if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });

const demoPages = [
  { route: '/', name: 'landing' },
  { route: '/login', name: 'login' },
  { route: '/dashboard/projects-v2', name: 'projects' },
  { route: '/dashboard/tasks-v2', name: 'tasks' },
  { route: '/dashboard/invoices-v2', name: 'invoices' },
  { route: '/dashboard/clients-v2', name: 'clients' },
  { route: '/dashboard/calendar-v2', name: 'calendar' },
  { route: '/dashboard/messages-v2', name: 'messages' },
  { route: '/dashboard/files-hub-v2', name: 'files' },
  { route: '/dashboard/analytics-v2', name: 'analytics' },
  { route: '/dashboard/ai-assistant-v2', name: 'ai-assistant' },
  { route: '/dashboard/ai-design-v2', name: 'ai-design' },
  { route: '/dashboard/crm-v2', name: 'crm' },
  { route: '/dashboard/wallet-v2', name: 'wallet' },
  { route: '/dashboard/team-v2', name: 'team' },
];

async function captureScreenshots() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  let ok = 0, errors = 0;
  const errorPages = [];

  console.log('Capturing screenshots of ' + demoPages.length + ' key pages...\n');

  for (const { route, name } of demoPages) {
    process.stdout.write(name + '... ');

    try {
      await page.goto('http://localhost:9323' + route + '?demo=true', {
        waitUntil: 'networkidle2',
        timeout: 25000
      });
      await new Promise(r => setTimeout(r, 1500));

      const content = await page.content();
      const hasError = content.includes('Dashboard Error') ||
                       content.includes('is not defined') ||
                       content.includes('is not a function') ||
                       content.includes('Cannot read properties') ||
                       content.includes('Objects are not valid') ||
                       content.includes('fewer hooks');

      await page.screenshot({ path: screenshotsDir + '/' + name + '.png', fullPage: false });

      if (hasError) {
        console.log('ERROR - screenshot saved');
        errors++;
        errorPages.push({ route, name });
      } else {
        console.log('OK');
        ok++;
      }
    } catch (e) {
      console.log('TIMEOUT');
    }
  }

  await browser.close();

  console.log('\n=== RESULTS ===');
  console.log('OK: ' + ok);
  console.log('Errors: ' + errors);
  console.log('\nScreenshots saved to: ' + screenshotsDir);

  if (errorPages.length > 0) {
    console.log('\nPages with errors:');
    errorPages.forEach(p => console.log('  ' + p.route));
  }
}

captureScreenshots().catch(console.error);
