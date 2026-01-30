#!/usr/bin/env node
import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();

const errors = [];
page.on('console', msg => {
  if (msg.type() === 'error') {
    const text = msg.text();
    if (!text.includes('favicon') && !text.includes('404') && text.length > 10) {
      errors.push(text.substring(0, 100));
    }
  }
});

const pages = [
  { name: 'Dashboard', url: 'http://localhost:9323/dashboard?demo=true' },
  { name: 'Projects', url: 'http://localhost:9323/dashboard/projects-hub-v2?demo=true' },
  { name: 'Clients', url: 'http://localhost:9323/dashboard/clients-v2?demo=true' },
  { name: 'Invoices', url: 'http://localhost:9323/dashboard/invoices-v2?demo=true' },
  { name: 'V2 Dashboard', url: 'http://localhost:9323/v2/dashboard?demo=true' }
];

console.log('Quick Verification Test\n');
let passed = 0;
let failed = 0;

for (const p of pages) {
  errors.length = 0;
  await page.goto(p.url, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 2000));

  const title = await page.title();
  const content = await page.content();
  const has404 = content.includes('<title>404') || content.includes('>Page Not Found</h');

  if (has404 || errors.length > 0) {
    console.log(`✗ ${p.name}: ${has404 ? '404' : errors.length + ' errors'}`);
    failed++;
  } else {
    console.log(`✓ ${p.name}: OK (${title.substring(0, 30)})`);
    passed++;
  }
}

console.log(`\nResults: ${passed}/${pages.length} passed`);
if (errors.length > 0) {
  console.log('Last errors:', errors.slice(0, 3).join('\n  '));
}

await browser.close();
process.exit(failed > 0 ? 1 : 0);
