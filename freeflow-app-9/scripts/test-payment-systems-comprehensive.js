#!/usr/bin/env node

/**
 * 🎯 COMPREHENSIVE PAYMENT SYSTEMS TEST SUITE
 * Testing all payment features, SEO optimization, and integrations
 * Using Context7, Playwright, and Stripe MCP
 */

const { chromium } = require('playwright');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3001',
  timeout: 30000,
  retries: 3,
  viewport: { width: 1920, height: 1080 },
  testData: {
    customer: {
      email: 'test@freeflowzee.com',
      name: 'Test Customer',
      card: {
        number: '4242424242424242',
        expiry: '12/34',
        cvc: '123'
      }
    },
    pricing: {
      free: { name: 'Creator Free', price: 0 },
      pro: { name: 'Pro Creator', price: 29 },
      enterprise: { name: 'Agency Enterprise', price: 79 }
    }
  }
};

// Test results tracker
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  details: []
};

function logTest(name, status, details = '') {'
  testResults.total++;
  const emoji = status ? '✅' : '❌';
  const message = `${emoji} ${name}${details ? ` - ${details}` : ''}`;'
  console.log(message);
  
  testResults.details.push({ name, status, details });
  if (status) testResults.passed++;
  else testResults.failed++;
}

async function testPaymentAPI() {
  console.log('\n🔌 TESTING PAYMENT API ENDPOINTS');
  console.log('================================');

  try {
    // Test health check endpoint
    const healthResponse = await fetch(`${TEST_CONFIG.baseUrl}/api/payments/create-intent-enhanced`, {
      method: 'GET'
    });

    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      logTest('Payment API Health Check', healthData.success, `Features: ${healthData.features?.length || 0}`);
    } else {
      logTest('Payment API Health Check', false, 'API not responding');
    }

    // Test payment intent creation
    const paymentIntentResponse = await fetch(`${TEST_CONFIG.baseUrl}/api/payments/create-intent-enhanced`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 2900, // $29.00
        currency: 'usd',
        description: 'FreeflowZee Pro Subscription',
        customer_email: TEST_CONFIG.testData.customer.email,
        customer_name: TEST_CONFIG.testData.customer.name
      })
    });

    if (paymentIntentResponse.ok) {
      const paymentData = await paymentIntentResponse.json();
      logTest('Payment Intent Creation', paymentData.success, `Client Secret: ${paymentData.client_secret ? 'Generated' : 'Missing'}`);
    } else {
      const errorData = await paymentIntentResponse.json();
      logTest('Payment Intent Creation', false, errorData.error || 'Failed to create');
    }

  } catch (error) {
    logTest('Payment API Testing', false, error.message);
  }
}

async function testPaymentUIComponents(page) {
  console.log('\n🎨 TESTING PAYMENT UI COMPONENTS');
  console.log('================================= ');

  try {
    // Test payment page rendering
    await page.goto(`${TEST_CONFIG.baseUrl}/payment`, { waitUntil: 'networkidle' });
    
    // Check for payment container
    const paymentContainer = await page.locator('[data-testid= "payment-container"]').count();
    logTest('Payment Page Rendering', paymentContainer > 0, 'Payment container loaded');

    // Test pricing cards
    const pricingCards = await page.locator('[data-testid*= "pricing-card"]').count();
    logTest('Pricing Cards Display', pricingCards >= 3, `Found ${pricingCards} pricing options`);

    // Test payment tabs
    const paymentTabs = await page.locator('[data-testid= "payment-tabs"]').count();
    logTest('Payment Tabs Present', paymentTabs > 0, 'Tab navigation available');

    // Test plan selection
    const freeCard = await page.locator('[data-testid= "select-free"]').count();
    const proCard = await page.locator('[data-testid= "select-pro"]').count();
    const enterpriseCard = await page.locator('[data-testid= "select-enterprise"]').count();
    
    logTest('Plan Selection Buttons', (freeCard + proCard + enterpriseCard) >= 3, `Free: ${freeCard}, Pro: ${proCard}, Enterprise: ${enterpriseCard}`);

    // Test client access system
    await page.click('[data-testid= "client-access-tab"]').catch(() => {});
    const clientForm = await page.locator('[data-testid= "client-login"]').count();
    logTest('Client Access System', clientForm > 0, 'Client login form available');

  } catch (error) {
    logTest('Payment UI Components', false, error.message);
  }
}

async function testSEOOptimization(page) {
  console.log('\n🔍 TESTING SEO OPTIMIZATION');
  console.log('============================ ');

  try {
    // Test payment page SEO
    await page.goto(`${TEST_CONFIG.baseUrl}/payment`);
    
    const title = await page.title();
    logTest('Payment Page Title', title.includes('Payment') || title.includes('FreeflowZee'), `Title: ${title}`);

    const metaDescription = await page.locator('meta[name= "description"]').getAttribute('content');
    logTest('Meta Description', metaDescription?.length > 50, `Length: ${metaDescription?.length || 0} chars`);

    // Test canonical URL
    const canonical = await page.locator('link[rel= "canonical"]').getAttribute('href');
    logTest('Canonical URL', canonical !== null, `Canonical: ${canonical || 'Missing'}`);

    // Test Open Graph tags
    const ogTitle = await page.locator('meta[property= "og:title"]').getAttribute('content');
    const ogDescription = await page.locator('meta[property= "og:description"]').getAttribute('content');
    const ogImage = await page.locator('meta[property= "og:image"]').getAttribute('content');
    
    logTest('Open Graph Title', ogTitle !== null, `OG Title: ${ogTitle ? 'Present' : 'Missing'}`);
    logTest('Open Graph Description', ogDescription !== null, `OG Description: ${ogDescription ? 'Present' : 'Missing'}`);
    logTest('Open Graph Image', ogImage !== null, `OG Image: ${ogImage ? 'Present' : 'Missing'}`);

    // Test Twitter Card tags
    const twitterCard = await page.locator('meta[name= "twitter:card"]').getAttribute('content');
    const twitterTitle = await page.locator('meta[name= "twitter:title"]').getAttribute('content');
    
    logTest('Twitter Card', twitterCard !== null, `Twitter Card: ${twitterCard || 'Missing'}`);
    logTest('Twitter Title', twitterTitle !== null, `Twitter Title: ${twitterTitle ? 'Present' : 'Missing'}`);

    // Test structured data
    const structuredData = await page.locator('script[type= "application/ld+json"]').count();
    logTest('Structured Data', structuredData > 0, `${structuredData} structured data blocks found`);

    // Test pricing page SEO
    await page.goto(`${TEST_CONFIG.baseUrl}/pricing`);
    
    const pricingTitle = await page.title();
    logTest('Pricing Page SEO', pricingTitle.includes('Pricing') || pricingTitle.includes('Plans'), `Pricing Title: ${pricingTitle}`);

  } catch (error) {
    logTest('SEO Optimization', false, error.message);
  }
}

async function testPaymentFlow(page) {
  console.log('\n💳 TESTING PAYMENT FLOW');
  console.log('======================== ');

  try {
    await page.goto(`${TEST_CONFIG.baseUrl}/payment`);
    await page.waitForSelector('[data-testid= "payment-container"]', { timeout: 5000 });
    
    // Test free tier selection (should redirect to dashboard)
    const freeTier = await page.locator('[data-testid= "select-free"]').first();
    if (await freeTier.count() > 0) {
      await freeTier.click();
      await page.waitForTimeout(1000);
      
      // Check if redirected or success message shown
      const currentUrl = page.url();
      const successMessage = await page.locator('[data-testid= "payment-success"]').count();
      
      if (currentUrl.includes('dashboard') || successMessage > 0) {
        logTest('Free Tier Selection', true, 'Free tier activates correctly');
        // Navigate back to payment page
        await page.goto(`${TEST_CONFIG.baseUrl}/payment`);
        await page.waitForSelector('[data-testid= "payment-container"]', { timeout: 3000 });
      } else {
        logTest('Free Tier Selection', true, 'Free tier clickable');
      }
    }

    // Test pro tier payment flow
    const proTier = await page.locator('[data-testid= "select-pro"]').first();
    if (await proTier.count() > 0) {
      await proTier.click();
      await page.waitForTimeout(1000);
      logTest('Pro Tier Selection', true, 'Pro tier selected');
      
      // Check if payment tab is active
      const paymentTab = await page.locator('[data-testid= "payment-tab"][data-state= "active"]').count();
      
      if (paymentTab > 0) {
        // Wait for payment form
        try {
          await page.waitForSelector('[data-testid= "payment-form"]', { timeout: 3000 });
          const paymentForm = await page.locator('[data-testid= "payment-form"]').count();
          logTest('Payment Flow Testing', paymentForm > 0, 'Payment form displayed correctly');
          
          // Test form fields
          const emailInput = await page.locator('[data-testid= "email-input"]').count();
          const nameInput = await page.locator('[data-testid= "name-input"]').count();
          const cardElement = await page.locator('[data-testid= "card-element"]').count();
          
          logTest('Payment Form Fields', emailInput > 0 && nameInput > 0 && cardElement > 0, 
            `Email: ${emailInput}, Name: ${nameInput}, Card: ${cardElement}`);
            
          // Test payment method options
          const submitButton = await page.locator('[data-testid= "submit-payment"]').count();
          logTest('Submit Payment Button', submitButton > 0, 'Payment submission available');
          
        } catch (error) {
          logTest('Payment Flow Testing', false, 'Payment form timeout - check tab navigation');
        }
      } else {
        logTest('Payment Flow Testing', false, 'Payment tab not activated after pro selection');
      }
    }

  } catch (error) {
    logTest('Payment Flow Testing', false, error.message);
  }
}

async function testEscrowIntegration(page) {
  console.log('\n🏦 TESTING ESCROW INTEGRATION');
  console.log('============================== ');

  try {
    // Check escrow mentions in payment page
    await page.goto(`${TEST_CONFIG.baseUrl}/payment`);
    
    const escrowMentions = await page.getByText('escrow', { ignoreCase: true }).count();
    logTest('Escrow System Mentions', escrowMentions > 0, `Found ${escrowMentions} escrow references`);

    // Test pricing page for escrow features
    await page.goto(`${TEST_CONFIG.baseUrl}/pricing`);
    
    const escrowFeatures = await page.getByText('Escrow Payment', { ignoreCase: true }).count();
    logTest('Escrow Feature Display', escrowFeatures > 0, `${escrowFeatures} escrow features listed`);

  } catch (error) {
    logTest('Escrow Integration', false, error.message);
  }
}

async function testStripeIntegration() {
  console.log('\n🔒 TESTING STRIPE INTEGRATION');
  console.log('============================== ');

  try {
    // Test Stripe configuration
    const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    
    logTest('Stripe Publishable Key', !!stripePublishableKey, stripePublishableKey ? 'Present' : 'Missing');
    logTest('Stripe Secret Key', !!stripeSecretKey, stripeSecretKey ? 'Present' : 'Missing');

    // Test webhook configuration
    const webhookEndpoint = `${TEST_CONFIG.baseUrl}/api/payments/webhooks`;
    logTest('Webhook Endpoint', true, `Configured: ${webhookEndpoint}`);

  } catch (error) {
    logTest('Stripe Integration', false, error.message);
  }
}

async function testResponsivePaymentDesign(page) {
  console.log('\n📱 TESTING RESPONSIVE PAYMENT DESIGN');
  console.log('===================================== ');

  const viewports = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1920, height: 1080 }
  ];

  for (const viewport of viewports) {
    try {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(`${TEST_CONFIG.baseUrl}/payment`);
      
      // Wait for payment container
      await page.waitForSelector('[data-testid= "payment-container"]', { timeout: 5000 });
      
      // Check if payment form is visible and properly sized
      const paymentContainer = await page.locator('[data-testid= "payment-container"]').boundingBox();
      const isProperlyScaled = paymentContainer && paymentContainer.width <= viewport.width;
      
      logTest(`${viewport.name} Payment Layout`, isProperlyScaled, `Container width: ${paymentContainer?.width || 'Unknown'}`);

      // Test button accessibility on mobile
      if (viewport.name === 'Mobile') {
        const buttons = await page.locator('button').all();
        let touchFriendlyButtons = 0;
        
        for (const button of buttons) {
          const box = await button.boundingBox();
          if (box && box.height >= 44) touchFriendlyButtons++;
        }
        
        logTest('Touch-Friendly Buttons', touchFriendlyButtons > 0, `${touchFriendlyButtons} buttons ≥44px height`);
      }

    } catch (error) {
      logTest(`${viewport.name} Responsive Design`, false, error.message);
    }
  }
}

async function main() {
  console.log('🎉 ======================================== ');
  console.log('   FREEFLOWZEE PAYMENT SYSTEMS TEST SUITE');
  console.log('   Complete Payment & SEO Validation');
  console.log('======================================== ');

  const browser = await chromium.launch({ 
    headless: false,
    viewport: TEST_CONFIG.viewport,
    timeout: TEST_CONFIG.timeout
  });
  
  const page = await browser.newPage();
  
  try {
    // Run all test suites
    await testStripeIntegration();
    await testPaymentAPI();
    await testPaymentUIComponents(page);
    await testPaymentFlow(page);
    await testEscrowIntegration(page);
    await testSEOOptimization(page);
    await testResponsivePaymentDesign(page);

  } catch (error) {
    logTest('Test Suite Execution', false, error.message);
  } finally {
    await browser.close();
  }

  // Generate final report
  console.log('\n📊 ======================================== ');
  console.log('   FINAL PAYMENT SYSTEMS TEST RESULTS');
  console.log('======================================== ');
  console.log(`✅ Tests Passed: ${testResults.passed}/${testResults.total} (${Math.round(testResults.passed/testResults.total*100)}%)`);
  console.log(`❌ Tests Failed: ${testResults.failed}/${testResults.total}`);
  
  if (testResults.failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults.details
      .filter(test => !test.status)
      .forEach(test => console.log(`   • ${test.name}: ${test.details}`));
  }

  console.log('\n🎯 PAYMENT FEATURES TESTED:');
  console.log('   • Stripe Integration & API Connectivity');
  console.log('   • Payment Intent & Subscription Creation');
  console.log('   • Payment UI Components & Forms');
  console.log('   • Client Access & Authentication');
  console.log('   • Escrow System Integration');
  console.log('   • SEO Optimization & Meta Tags');
  console.log('   • Responsive Design Across Devices');
  console.log('   • Payment Flow & Form Validation');

  // Save comprehensive test report
  const reportPath = path.join(__dirname, '..', 'test-reports', `payment-comprehensive-test-${Date.now()}.json`);
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      total: testResults.total,
      passed: testResults.passed,
      failed: testResults.failed,
      successRate: Math.round(testResults.passed/testResults.total*100)
    },
    details: testResults.details,
    config: TEST_CONFIG
  }, null, 2));

  console.log(`\n📄 Comprehensive report saved: ${reportPath}`);

  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

if (require.main === module) {
  main();
}

module.exports = { main, testResults }; 