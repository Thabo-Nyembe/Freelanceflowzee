#!/usr/bin/env node

/**
 * Quick Demo Data Verification
 * Checks API endpoints to verify demo data is loading
 */

const BASE_URL = 'http://localhost:9323';

async function checkEndpoint(name, url) {
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.success) {
      console.log(`✓ ${name}: OK`);
      if (data.stats) {
        console.log(`  Projects: ${data.stats.projects?.total || 0}`);
        console.log(`  Clients: ${data.stats.clients?.total || 0}`);
        console.log(`  Tasks: ${data.stats.tasks?.total || 0}`);
      }
      if (data.data?.stats) {
        console.log(`  Projects: ${data.data.stats.projects?.total || 0}`);
        console.log(`  Clients: ${data.data.stats.clients?.total || 0}`);
        console.log(`  Tasks: ${data.data.stats.tasks?.total || 0}`);
      }
    } else {
      console.log(`✗ ${name}: ${data.error || 'Failed'}`);
    }
  } catch (error) {
    console.log(`✗ ${name}: ${error.message}`);
  }
}

async function main() {
  console.log('='.repeat(50));
  console.log('DEMO DATA API CHECK');
  console.log('='.repeat(50));

  await checkEndpoint('Dashboard API', `${BASE_URL}/api/dashboard?demo=true`);
  await checkEndpoint('Dashboard Stats', `${BASE_URL}/api/dashboard?demo=true&action=stats`);
  await checkEndpoint('Recent Projects', `${BASE_URL}/api/dashboard?demo=true&action=recent-projects`);
  await checkEndpoint('Quick Stats', `${BASE_URL}/api/dashboard?demo=true&action=quick-stats`);

  console.log('\n' + '='.repeat(50));
  console.log('CHECK COMPLETE');
  console.log('='.repeat(50));
}

main();
