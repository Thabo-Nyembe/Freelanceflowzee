#!/usr/bin/env node

import http from 'http';

const pages = [
  '/dashboard/settings-v2',
  '/dashboard/time-tracking-v2',
  '/dashboard/reports-v2',
  '/dashboard/activity-logs-v2',
  '/dashboard/integrations-v2',
  '/dashboard/tasks-v2'
];

async function testPage(path) {
  return new Promise((resolve) => {
    const url = `http://localhost:9323${path}?demo=true`;
    const req = http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const hasContent = data.length > 1000;
        console.log(`${hasContent ? '✓' : '?'} ${path} (${data.length} bytes)`);
        resolve();
      });
    });
    req.on('error', (e) => {
      console.log(`✗ ${path} - Error: ${e.message}`);
      resolve();
    });
    req.setTimeout(10000, () => {
      console.log(`⏱ ${path} - Timeout`);
      req.destroy();
      resolve();
    });
  });
}

console.log('Testing previously failing pages...');
for (const page of pages) {
  await testPage(page);
}
console.log('Done.');
