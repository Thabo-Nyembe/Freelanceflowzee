import puppeteer from 'puppeteer';
import { execSync } from 'child_process';
import fs from 'fs';

const screenshotsDir = '/tmp/kazi-complete-verification';
if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });

// Get ALL v2 pages dynamically
const allPages = execSync('find "app/(app)/dashboard" -maxdepth 1 -type d -name "*-v2" -exec basename {} \\;')
  .toString()
  .trim()
  .split('\n')
  .filter(d => d)
  .sort();

console.log(`Found ${allPages.length} v2 pages to verify\n`);

async function verifyAllPages() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  const baseUrl = 'http://localhost:9323/dashboard';
  const results = { success: [], errors: [], warnings: [] };

  console.log('🚀 Starting COMPLETE app verification...\n');
  console.log(`Testing all ${allPages.length} v2 pages`);
  console.log('='.repeat(60));

  for (let i = 0; i < allPages.length; i++) {
    const pageName = allPages[i];
    const url = `${baseUrl}/${pageName}`;
    const filename = `${screenshotsDir}/${pageName}.png`;
    const progress = `[${(i + 1).toString().padStart(3)}/${allPages.length}]`;

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await new Promise(resolve => setTimeout(resolve, 1500));

      const pageInfo = await page.evaluate(() => {
        const hasError = document.body.innerText.includes('Error') ||
                        document.body.innerText.includes('404') ||
                        document.body.innerText.includes('not found');
        const title = document.title;
        return { hasError, title };
      });

      await page.screenshot({ path: filename, fullPage: false });

      if (pageInfo.hasError) {
        console.log(`${progress} ⚠️  ${pageName.padEnd(45)} - WARNING`);
        results.warnings.push({ page: pageName, url, title: pageInfo.title });
      } else {
        console.log(`${progress} ✅ ${pageName.padEnd(45)} - OK`);
        results.success.push({ page: pageName, url, title: pageInfo.title });
      }
    } catch (error) {
      console.log(`${progress} ❌ ${pageName.padEnd(45)} - FAILED`);
      results.errors.push({ page: pageName, url, error: error.message.slice(0, 80) });
    }

    // Progress update every 50 pages
    if ((i + 1) % 50 === 0) {
      console.log('\n' + '-'.repeat(60));
      console.log(`Progress: ${i + 1}/${allPages.length} pages tested`);
      console.log(`✅ Success: ${results.success.length} | ⚠️  Warnings: ${results.warnings.length} | ❌ Errors: ${results.errors.length}`);
      console.log('-'.repeat(60) + '\n');
    }
  }

  await browser.close();

  // Final Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 COMPLETE VERIFICATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Pages: ${allPages.length}`);
  console.log(`✅ Successful: ${results.success.length} (${((results.success.length/allPages.length)*100).toFixed(1)}%)`);
  console.log(`⚠️  Warnings: ${results.warnings.length} (${((results.warnings.length/allPages.length)*100).toFixed(1)}%)`);
  console.log(`❌ Errors: ${results.errors.length} (${((results.errors.length/allPages.length)*100).toFixed(1)}%)`);
  console.log(`\n📁 Screenshots: ${screenshotsDir}`);

  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    totalPages: allPages.length,
    results
  };
  fs.writeFileSync('/tmp/verification-report.json', JSON.stringify(report, null, 2));
  console.log('📄 Report saved: /tmp/verification-report.json');

  if (results.errors.length > 0) {
    console.log('\n❌ ERRORS (' + results.errors.length + '):');
    results.errors.slice(0, 20).forEach(({ page, error }) => {
      console.log(`  - ${page}: ${error}`);
    });
    if (results.errors.length > 20) {
      console.log(`  ... and ${results.errors.length - 20} more errors`);
    }
  }

  if (results.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS (' + results.warnings.length + '):');
    results.warnings.slice(0, 20).forEach(({ page }) => {
      console.log(`  - ${page}`);
    });
    if (results.warnings.length > 20) {
      console.log(`  ... and ${results.warnings.length - 20} more warnings`);
    }
  }

  return results;
}

verifyAllPages().catch(console.error);
