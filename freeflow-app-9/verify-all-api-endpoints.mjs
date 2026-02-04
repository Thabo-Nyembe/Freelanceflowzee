#!/usr/bin/env node

console.log('\n╔═══════════════════════════════════════════════════════════╗')
console.log('║  🎯 Verifying ALL API Endpoints with Demo Data          ║')
console.log('║  Testing data accessibility for showcase                ║')
console.log('╚═══════════════════════════════════════════════════════════╝\n')

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
const BASE_URL = 'http://localhost:9323'

// All critical API endpoints for the showcase
const API_ENDPOINTS = [
  {
    name: 'Dashboard Overview',
    url: `/api/dashboard?demo=true`,
    expectedKeys: ['stats', 'projects', 'activity']
  },
  {
    name: 'Clients/CRM',
    url: `/api/clients?demo=true`,
    expectedKeys: ['clients', 'data']
  },
  {
    name: 'Projects',
    url: `/api/projects?demo=true`,
    expectedKeys: ['projects', 'data']
  },
  {
    name: 'Invoices',
    url: `/api/invoices?demo=true`,
    expectedKeys: ['invoices', 'data']
  },
  {
    name: 'Tasks',
    url: `/api/tasks?demo=true`,
    expectedKeys: ['tasks', 'data']
  },
  {
    name: 'Time Tracking',
    url: `/api/time-entries?demo=true`,
    expectedKeys: ['entries', 'data']
  },
  {
    name: 'Expenses',
    url: `/api/expenses?demo=true`,
    expectedKeys: ['expenses', 'data']
  },
  {
    name: 'Deals/Pipeline',
    url: `/api/deals?demo=true`,
    expectedKeys: ['deals', 'data']
  },
  {
    name: 'Analytics',
    url: `/api/analytics?demo=true`,
    expectedKeys: ['analytics', 'data', 'metrics']
  },
  {
    name: 'Team Members',
    url: `/api/team?demo=true`,
    expectedKeys: ['members', 'team', 'data']
  }
]

let passed = 0
let failed = 0
let warnings = 0
const results = []

console.log('🔍 Testing API endpoints...\n')

for (const endpoint of API_ENDPOINTS) {
  try {
    console.log(`Testing: ${endpoint.name}`)
    console.log(`   URL: ${endpoint.url}`)

    const response = await fetch(`${BASE_URL}${endpoint.url}`)

    if (!response.ok) {
      console.log(`   ❌ HTTP ${response.status} ${response.statusText}`)
      failed++
      results.push({
        name: endpoint.name,
        status: '❌',
        message: `HTTP ${response.status}`
      })
      console.log('')
      continue
    }

    const data = await response.json()

    // Check if response has expected structure
    const hasExpectedData = endpoint.expectedKeys.some(key => {
      if (data[key] !== undefined) {
        // Check if it's an array with items or a non-empty object
        if (Array.isArray(data[key])) {
          return data[key].length > 0
        }
        return true
      }
      return false
    })

    if (hasExpectedData) {
      // Count items if it's an array
      const dataArray = endpoint.expectedKeys
        .map(key => data[key])
        .find(val => Array.isArray(val))

      if (dataArray) {
        console.log(`   ✅ ${dataArray.length} items available`)
        passed++
        results.push({
          name: endpoint.name,
          status: '✅',
          message: `${dataArray.length} items`
        })
      } else {
        console.log(`   ✅ Data available`)
        passed++
        results.push({
          name: endpoint.name,
          status: '✅',
          message: 'Data available'
        })
      }
    } else {
      console.log(`   ⚠️  No data found (might need seeding)`)
      warnings++
      results.push({
        name: endpoint.name,
        status: '⚠️',
        message: 'No data'
      })
    }

    console.log('')

  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`)
    console.log('')
    failed++
    results.push({
      name: endpoint.name,
      status: '❌',
      message: error.message
    })
  }
}

// Summary
console.log('═══════════════════════════════════════════════════════════')
console.log('📊 API ENDPOINTS SUMMARY')
console.log('═══════════════════════════════════════════════════════════')

console.log(`\n✅ Working:  ${passed}/${API_ENDPOINTS.length}`)
console.log(`⚠️  No Data:  ${warnings}/${API_ENDPOINTS.length}`)
console.log(`❌ Failed:   ${failed}/${API_ENDPOINTS.length}`)

console.log('\n📋 Endpoint Results:\n')
results.forEach(r => {
  console.log(`${r.status} ${r.name.padEnd(25)} - ${r.message}`)
})

// Readiness assessment
console.log('\n═══════════════════════════════════════════════════════════')
const workingPercentage = (passed / API_ENDPOINTS.length) * 100

if (workingPercentage === 100) {
  console.log('🎉 ALL APIS WORKING!')
  console.log('   All endpoints returning data for showcase')
} else if (workingPercentage >= 70) {
  console.log('✅ MOSTLY READY')
  console.log('   Core APIs working, some may need data seeding')
} else if (workingPercentage >= 50) {
  console.log('⚠️  PARTIAL')
  console.log('   Some APIs working but many need attention')
} else {
  console.log('❌ NEEDS WORK')
  console.log('   Major API issues - check server and endpoints')
}

console.log('═══════════════════════════════════════════════════════════\n')

if (warnings > 0) {
  console.log('💡 Tip: Endpoints with no data may need demo data seeding.')
  console.log('   Run: npm run seed:demo or check verify-all-data.mjs\n')
}
