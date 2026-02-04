import puppeteer from 'puppeteer';
import fs from 'fs';
import { execSync } from 'child_process';

const screenshotsDir = '/tmp/kazi-app-screenshots';
if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });

// Get all v2 directories
const v2Dirs = execSync('find "app/(app)/dashboard" -maxdepth 1 -type d -name "*-v2" -exec basename {} \\;')
  .toString()
  .trim()
  .split('\n')
  .filter(d => d);

// Key pages to screenshot for analysis
const keyPages = [
  // Main dashboards
  'analytics-v2', 'crm-v2', 'leads-v2', 'wallet-v2',
  // Features
  'gamification-v2', 'loyalty-v2', 'community-v2', 'calendar-v2',
  // Work
  'projects-v2', 'tasks-v2', 'invoices-v2', 'clients-v2',
  // AI features
  'ai-create-v2', 'ai-agents-v2', 'ai-design-v2',
  // New pages
  'portfolio-v2', 'bookmarks-v2', 'proposals-v2',
  // Resources
  'resources-v2', 'files-v2', 'messaging-v2',
  // Fixed pages
  'video-review-v2', 'webhooks-v2', 'my-day-v2'
];

const pages = keyPages.filter(dir => v2Dirs.includes(dir)).map(dir => ({
  route: '/dashboard/' + dir,
  name: dir.replace('-v2', '')
}));

async function capture() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  let captured = 0;

  console.log('Capturing', pages.length, 'key pages...\n');

  for (const { route, name } of pages) {
    process.stdout.write(name.padEnd(20) + '... ');
    try {
      await page.goto('http://localhost:9323' + route + '?demo=true', { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise(r => setTimeout(r, 2000)); // Wait for animations
      await page.screenshot({ path: `${screenshotsDir}/${name}.png`, fullPage: false });
      console.log('OK');
      captured++;
    } catch (e) {
      console.log('TIMEOUT');
    }
  }

  await browser.close();
  console.log('\n=== Done ===');
  console.log('Captured:', captured, 'screenshots');
  console.log('Location:', screenshotsDir);
  console.log('\nView with: open', screenshotsDir);
}

capture().catch(console.error);
