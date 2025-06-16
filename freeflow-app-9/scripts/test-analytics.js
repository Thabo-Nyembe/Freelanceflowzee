#!/usr/bin/env node

/**
 * Quick Analytics Test
 * Run this to verify your analytics system is working
 */

async function testAnalytics() {
  console.log('🧪 Testing Analytics System...');
  
  try {
    // Test event tracking endpoint
    const response = await fetch('http://localhost:3000/api/analytics/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'test',
        event_name: 'system_test',
        session_id: 'test_session_' + Date.now(),
        properties: { test: true }
      })
    });
    
    if (response.ok) {
      console.log('✅ Analytics endpoint working');
    } else {
      console.log('❌ Analytics endpoint failed');
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    console.log('Make sure your development server is running: npm run dev');
  }
}

if (require.main === module) {
  testAnalytics();
}

module.exports = { testAnalytics };
