import puppeteer from 'puppeteer';
import { execSync } from 'child_process';

// Get all v2 directories
const v2Dirs = execSync('find "app/(app)/dashboard" -maxdepth 1 -type d -name "*-v2" -exec basename {} \\;')
  .toString()
  .trim()
  .split('\n')
  .filter(d => d);

const pages = v2Dirs.map(dir => ({
  route: '/dashboard/' + dir,
  name: dir.replace('-v2', '')
}));

async function test() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  let ok = 0, errors = 0;
  const errorPages = [];

  console.log('Testing', pages.length, 'v2 pages (current state)...\n');

  for (const { route, name } of pages) {
    process.stdout.write(name.substring(0, 22).padEnd(24) + '... ');
    try {
      const response = await page.goto('http://localhost:9323' + route + '?demo=true', { waitUntil: 'networkidle2', timeout: 12000 });
      await new Promise(r => setTimeout(r, 600));

      const content = await page.content();
      const hasError = content.includes('Dashboard Error') || content.includes('is not defined') || content.includes('Unhandled Runtime Error') || content.includes('Module not found');

      if (response.status() >= 400) {
        console.log('HTTP ' + response.status());
        errors++;
        errorPages.push({ name, type: 'HTTP ' + response.status() });
      } else if (hasError) {
        console.log('ERROR');
        errors++;
        errorPages.push({ name, type: 'Runtime Error' });
      } else {
        console.log('OK');
        ok++;
      }
    } catch (e) {
      console.log('TIMEOUT');
    }
  }

  await browser.close();
  console.log('\n=== Summary ===');
  console.log('OK:', ok, '| Errors:', errors);

  if (errorPages.length > 0) {
    console.log('\nPages with errors:');
    errorPages.forEach(p => console.log(`  - ${p.name}-v2: ${p.type}`));
  } else {
    console.log('\nAll pages working!');
  }
}

test().catch(console.error);
