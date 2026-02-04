#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

console.log('\n╔═══════════════════════════════════════════════════════════╗')
console.log('║  🔍 Comprehensive API Audit                              ║')
console.log('║  Checking ALL API routes for demo mode support          ║')
console.log('╚═══════════════════════════════════════════════════════════╝\n')

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_EMAIL = 'alex@freeflow.io'

// Recursively find all route.ts files in app/api
function findAllRoutes(dir, fileList = []) {
  const files = readdirSync(dir)

  files.forEach(file => {
    const filePath = join(dir, file)
    const stat = statSync(filePath)

    if (stat.isDirectory() && !file.includes('node_modules')) {
      findAllRoutes(filePath, fileList)
    } else if (file === 'route.ts' || file === 'route.js') {
      fileList.push(filePath)
    }
  })

  return fileList
}

const apiDir = './app/api'
const routes = findAllRoutes(apiDir)

console.log(`📁 Found ${routes.length} API route files\n`)

let hasDemoSupport = 0
let needsDemoSupport = 0
let hasAlexEmail = 0
let needsAlexEmail = 0
const missingDemoRoutes = []
const missingAlexRoutes = []

console.log('🔍 Analyzing routes...\n')

routes.forEach(route => {
  try {
    const content = readFileSync(route, 'utf-8')
    const routePath = route.replace('./app/api/', '/api/').replace('/route.ts', '').replace('/route.js', '')

    const hasDEMO_USER_ID = content.includes('DEMO_USER_ID') || content.includes(DEMO_USER_ID)
    const hasIsDemoMode = content.includes('isDemoMode') || content.includes("searchParams.get('demo')")
    const hasAlexEmailCheck = content.includes(DEMO_EMAIL)

    if (hasDEMO_USER_ID || hasIsDemoMode) {
      hasDemoSupport++
      if (hasAlexEmailCheck) {
        hasAlexEmail++
      } else {
        needsAlexEmail++
        missingAlexRoutes.push(routePath)
      }
    } else {
      needsDemoSupport++
      missingDemoRoutes.push(routePath)
    }
  } catch (error) {
    console.log(`⚠️  Error reading ${route}: ${error.message}`)
  }
})

console.log('═══════════════════════════════════════════════════════════')
console.log('📊 AUDIT RESULTS')
console.log('═══════════════════════════════════════════════════════════')
console.log(`\nTotal API Routes:              ${routes.length}`)
console.log(`\n✅ Has Demo Mode Support:       ${hasDemoSupport} (${((hasDemoSupport/routes.length)*100).toFixed(1)}%)`)
console.log(`   └─ With alex@freeflow.io:   ${hasAlexEmail}`)
console.log(`   └─ Missing alex check:      ${needsAlexEmail}`)
console.log(`\n❌ Needs Demo Mode Support:     ${needsDemoSupport} (${((needsDemoSupport/routes.length)*100).toFixed(1)}%)`)

if (missingDemoRoutes.length > 0) {
  console.log('\n📋 PRIORITY ROUTES NEEDING DEMO SUPPORT:')
  console.log('═══════════════════════════════════════════════════════════')

  // Show high-priority business routes first
  const highPriority = missingDemoRoutes.filter(r =>
    r.includes('/dashboard') ||
    r.includes('/clients') ||
    r.includes('/projects') ||
    r.includes('/tasks') ||
    r.includes('/invoices') ||
    r.includes('/time') ||
    r.includes('/expenses') ||
    r.includes('/reports') ||
    r.includes('/analytics') ||
    r.includes('/crm')
  )

  if (highPriority.length > 0) {
    console.log('\n🔥 HIGH PRIORITY (Business Core):')
    highPriority.slice(0, 20).forEach(r => console.log(`   • ${r}`))
    if (highPriority.length > 20) {
      console.log(`   ... and ${highPriority.length - 20} more`)
    }
  }

  const other = missingDemoRoutes.filter(r => !highPriority.includes(r))
  if (other.length > 0) {
    console.log('\n⚪ OTHER ROUTES:')
    other.slice(0, 10).forEach(r => console.log(`   • ${r}`))
    if (other.length > 10) {
      console.log(`   ... and ${other.length - 10} more`)
    }
  }
}

if (missingAlexRoutes.length > 0 && missingAlexRoutes.length < 30) {
  console.log('\n📋 ROUTES WITH DEMO SUPPORT BUT MISSING alex@freeflow.io CHECK:')
  console.log('═══════════════════════════════════════════════════════════')
  missingAlexRoutes.forEach(r => console.log(`   • ${r}`))
}

console.log('\n═══════════════════════════════════════════════════════════')
console.log('💡 RECOMMENDATION')
console.log('═══════════════════════════════════════════════════════════')

if (needsDemoSupport < 50) {
  console.log('✅ Good news! Most APIs already have demo support.')
  console.log(`   Only ${needsDemoSupport} routes need demo mode added.`)
  console.log('\n   Next: Add demo support to high-priority routes.')
} else {
  console.log('⚠️  Many APIs need demo support added.')
  console.log(`   ${needsDemoSupport} routes need demo mode configuration.`)
  console.log('\n   Strategy: Add demo support to high-priority business routes first.')
}

console.log('\n📝 Standard Demo Mode Pattern:')
console.log(`
const DEMO_USER_ID = '${DEMO_USER_ID}'

function isDemoMode(request: NextRequest): boolean {
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}

// In GET handler:
const demoMode = isDemoMode(request)
const isDemoAccount = userEmail === '${DEMO_EMAIL}'
const effectiveUserId = isDemoAccount ? DEMO_USER_ID : userId
`)

console.log('═══════════════════════════════════════════════════════════\n')
