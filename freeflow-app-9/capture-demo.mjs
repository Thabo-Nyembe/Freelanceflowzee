import puppeteer from 'puppeteer';
import fs from 'fs';

const pages = [
  // Core Dashboard
  { url: '/v1/dashboard?demo=true', name: '01-dashboard' },
  { url: '/v1/dashboard/projects?demo=true', name: '02-projects' },
  { url: '/v1/dashboard/invoices?demo=true', name: '03-invoices' },
  { url: '/v1/dashboard/calendar?demo=true', name: '04-calendar' },
  { url: '/v1/dashboard/messages?demo=true', name: '05-messages-v1' },

  // AI Features
  { url: '/dashboard/ai-create-v2?demo=true', name: '06-ai-create' },
  { url: '/dashboard/ai-assistant-v2?demo=true', name: '07-ai-assistant' },
  { url: '/dashboard/ai-design-v2?demo=true', name: '08-ai-design' },
  { url: '/dashboard/ai-image-generator?demo=true', name: '09-ai-image' },
  { url: '/dashboard/ai-video-studio?demo=true', name: '10-ai-video' },
  { url: '/dashboard/ai-music-studio?demo=true', name: '11-ai-music' },

  // Collaboration
  { url: '/dashboard/messages-v2?demo=true', name: '12-messages-v2' },
  { url: '/dashboard/collaboration-v2?demo=true', name: '13-collaboration' },
  { url: '/dashboard/files-hub-v2?demo=true', name: '14-files-hub' },
  { url: '/dashboard/assets-v2?demo=true', name: '15-assets' },

  // Business Tools
  { url: '/dashboard/expenses-v2?demo=true', name: '16-expenses' },
  { url: '/dashboard/workflows-v2?demo=true', name: '17-workflows' },
  { url: '/dashboard/milestones-v2?demo=true', name: '18-milestones' },
  { url: '/dashboard/documents-v2?demo=true', name: '19-documents' },
  { url: '/dashboard/compliance-v2?demo=true', name: '20-compliance' },
  { url: '/dashboard/announcements-v2?demo=true', name: '21-announcements' },
  { url: '/dashboard/audit-logs-v2?demo=true', name: '22-audit-logs' },
  { url: '/dashboard/deployments-v2?demo=true', name: '23-deployments' },
  { url: '/dashboard/maintenance-v2?demo=true', name: '24-maintenance' },
];

const baseUrl = 'http://localhost:9323';
const screenshotsDir = '/tmp/kazi-screenshots';

async function captureScreenshots() {
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  const errors = [];
  const fetchErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push({ page: page.url(), text: msg.text() });
    }
  });

  page.on('pageerror', error => {
    errors.push({ page: page.url(), text: error.message });
  });

  page.on('requestfailed', request => {
    const failure = request.failure();
    fetchErrors.push({
      url: request.url(),
      failure: failure ? failure.errorText : 'unknown'
    });
  });

  console.log('Starting screenshot capture of ' + pages.length + ' pages...\n');

  for (const p of pages) {
    try {
      console.log('Capturing ' + p.name + '...');
      await page.goto(baseUrl + p.url, { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise(r => setTimeout(r, 2000));

      await page.screenshot({
        path: screenshotsDir + '/' + p.name + '.png',
        fullPage: false
      });
      console.log('  ✓ Saved');
    } catch (err) {
      console.log('  ✗ Error: ' + err.message);
    }
  }

  await browser.close();

  console.log('\n========================================');
  console.log('SCREENSHOT CAPTURE COMPLETE');
  console.log('========================================');
  console.log('Screenshots saved to: ' + screenshotsDir);

  if (errors.length > 0) {
    console.log('\n=== CONSOLE ERRORS ===');
    errors.forEach(e => console.log('- ' + e.text.slice(0, 150)));
  }

  if (fetchErrors.length > 0) {
    console.log('\n=== FETCH/NETWORK ERRORS ===');
    fetchErrors.forEach(e => console.log('- ' + e.url + ': ' + e.failure));
  }

  if (errors.length === 0 && fetchErrors.length === 0) {
    console.log('\n✓ No errors detected during capture');
  }
}

captureScreenshots().catch(console.error);
