import puppeteer from 'puppeteer';
import fs from 'fs';

const screenshotsDir = '/tmp/kazi-navigation-verification';
if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });

// Organized by main categories
const pagesToVerify = {
  'AI-Creative': [
    'ai-assistant-v2', 'ai-create-v2', 'ai-agents-v2', 'ai-code-builder-v2',
    'ai-design-v2', 'ai-video-v2', 'ai-voice-v2', 'ai-business-advisor',
    'ai-content-studio', 'ai-image-generator', 'ai-music-studio',
    'video-studio-v2', 'audio-studio-v2', 'content-studio-v2',
    'media-library-v2', '3d-modeling-v2', 'motion-graphics-v2'
  ],
  'CRM-Sales': [
    'crm-v2', 'sales-v2', 'leads-v2', 'opportunities-v2', 'deals-v2',
    'contacts-v2', 'pipeline-v2', 'quotes-v2', 'forecasting-v2',
    'territories-v2', 'commissions-v2'
  ],
  'Marketing': [
    'marketing-v2', 'campaigns-v2', 'content-calendar-v2', 'content-v2',
    'social-media-v2', 'seo-analytics-v2', 'email-campaigns-v2'
  ],
  'Projects': [
    'projects-v2', 'tasks-v2', 'calendar-v2', 'time-tracking-v2'
  ],
  'Finance': [
    'accounting-v2', 'invoices-v2', 'billing-v2', 'payments-v2',
    'expenses-v2', 'budgets-v2', 'financial-reports-v2', 'taxes-v2',
    'revenue-tracking-v2', 'cost-analysis-v2'
  ],
  'HR-People': [
    'team-v2', 'employees-v2', 'recruitment-v2', 'onboarding-v2',
    'offboarding-v2', 'payroll-v2', 'time-off-v2', 'leave-management-v2',
    'training-v2', 'certifications-v2', 'skills-matrix-v2',
    'performance-reviews-v2'
  ],
  'IT-Support': [
    'helpdesk-v2', 'tickets-v2', 'incidents-v2', 'assets-v2'
  ],
  'Compliance': [
    'audits-v2', 'policies-v2', 'contracts-v2', 'risks-v2',
    'compliance-tracking-v2'
  ],
  'Customer-Success': [
    'customer-service-v2', 'customer-success-v2', 'feedback-surveys-v2',
    'knowledge-base-v2', 'live-chat-v2'
  ],
  'Operations': [
    'inventory-v2', 'supply-chain-v2', 'quality-control-v2',
    'maintenance-schedules-v2', 'work-orders-v2'
  ],
  'Security': [
    'access-logs-v2', 'vulnerabilities-v2', 'security-policies-v2',
    'penetration-testing-v2'
  ],
  'Product': [
    'roadmap-v2', 'features-backlog-v2', 'releases-v2',
    'bugs-tracking-v2', 'testing-v2'
  ]
};

async function captureScreenshots() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  const baseUrl = 'http://localhost:9323/dashboard';
  let totalPages = 0;
  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  console.log('🚀 Starting comprehensive navigation verification...\n');

  for (const [category, pages] of Object.entries(pagesToVerify)) {
    console.log(`\n📂 Category: ${category}`);
    console.log('='.repeat(60));

    for (const pageName of pages) {
      totalPages++;
      const url = `${baseUrl}/${pageName}`;
      const filename = `${screenshotsDir}/${category}_${pageName}.png`;

      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Check for errors on page
        const hasError = await page.evaluate(() => {
          return document.body.innerText.includes('Error') ||
                 document.body.innerText.includes('404') ||
                 document.body.innerText.includes('not found');
        });

        await page.screenshot({ path: filename, fullPage: false });

        if (hasError) {
          console.log(`⚠️  ${pageName.padEnd(40)} - WARNING (possible error)`);
          errorCount++;
          errors.push({ page: pageName, category, type: 'content-error' });
        } else {
          console.log(`✅ ${pageName.padEnd(40)} - OK`);
          successCount++;
        }
      } catch (error) {
        console.log(`❌ ${pageName.padEnd(40)} - FAILED: ${error.message.slice(0, 50)}`);
        errorCount++;
        errors.push({ page: pageName, category, error: error.message });
      }
    }
  }

  await browser.close();

  console.log('\n' + '='.repeat(60));
  console.log('📊 VERIFICATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Pages Tested: ${totalPages}`);
  console.log(`✅ Successful: ${successCount} (${((successCount/totalPages)*100).toFixed(1)}%)`);
  console.log(`❌ Errors: ${errorCount} (${((errorCount/totalPages)*100).toFixed(1)}%)`);
  console.log(`\n📁 Screenshots saved to: ${screenshotsDir}`);

  if (errors.length > 0) {
    console.log('\n❌ ERRORS FOUND:');
    errors.forEach(({ page, category, error, type }) => {
      console.log(`  - ${category}/${page}: ${type || error}`);
    });
  }

  return { totalPages, successCount, errorCount, errors };
}

captureScreenshots().catch(console.error);
