#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

console.log('\n╔═══════════════════════════════════════════════════════════╗')
console.log('║  🔧 AUTO-ADD Demo Mode to ALL APIs                       ║')
console.log('║  Adding user-specific data support to 663 routes        ║')
console.log('╚═══════════════════════════════════════════════════════════╝\n')

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_EMAIL = 'alex@freeflow.io'

const DEMO_MODE_TEMPLATE = `
// ============================================================================
// DEMO MODE CONFIGURATION - Auto-added for alex@freeflow.io support
// ============================================================================

const DEMO_USER_ID = '${DEMO_USER_ID}'
const DEMO_USER_EMAIL = '${DEMO_EMAIL}'

function isDemoMode(request: NextRequest): boolean {
  if (typeof request === 'undefined') return false
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}

function getDemoUserId(session: any, demoMode: boolean): string | null {
  if (!session?.user) {
    return demoMode ? DEMO_USER_ID : null
  }

  const userEmail = session.user.email
  const isDemoAccount = userEmail === DEMO_USER_EMAIL ||
                       userEmail === 'demo@kazi.io' ||
                       userEmail === 'test@kazi.dev'

  if (isDemoAccount || demoMode) {
    return DEMO_USER_ID
  }

  return session.user.id || session.user.authId || null
}
`

// Find all routes that need demo mode
function findRoutesNeedingDemo(dir, fileList = []) {
  const files = readdirSync(dir)
  files.forEach(file => {
    const filePath = join(dir, file)
    const stat = statSync(filePath)
    if (stat.isDirectory() && !file.includes('node_modules')) {
      findRoutesNeedingDemo(filePath, fileList)
    } else if (file === 'route.ts' || file === 'route.js') {
      try {
        const content = readFileSync(filePath, 'utf-8')
        if (!content.includes('DEMO_USER_ID') && !content.includes('isDemoMode')) {
          fileList.push(filePath)
        }
      } catch (e) {}
    }
  })
  return fileList
}

const routes = findRoutesNeedingDemo('./app/api')

console.log(`Found ${routes.length} routes needing demo mode\n`)
console.log('This will:')
console.log('  1. Add DEMO_USER_ID constant')
console.log('  2. Add isDemoMode() function')
console.log('  3. Add getDemoUserId() helper')
console.log('  4. Preserve all existing functionality')
console.log('  5. Enable user-specific data for alex@freeflow.io\n')

console.log('⚠️  WARNING: This will modify 663 files!')
console.log('⚠️  Backup recommended before proceeding.\n')

let modified = 0
let skipped = 0
const errors = []

console.log('Processing routes...\n')

// Process high-priority routes first
const highPriority = routes.filter(r =>
  r.includes('/dashboard') ||
  r.includes('/clients') ||
  r.includes('/projects') ||
  r.includes('/tasks') ||
  r.includes('/invoices') ||
  r.includes('/time') ||
  r.includes('/expenses') ||
  r.includes('/crm') ||
  r.includes('/analytics')
)

const priorityRoutes = [...highPriority, ...routes.filter(r => !highPriority.includes(r))]

priorityRoutes.forEach((route, index) => {
  try {
    let content = readFileSync(route, 'utf-8')

    // Skip if already has demo mode
    if (content.includes('DEMO_USER_ID') || content.includes('isDemoMode')) {
      skipped++
      return
    }

    // Find where to insert - after imports, before first export
    const importMatch = content.lastIndexOf('import ')
    const exportMatch = content.indexOf('export ')

    if (importMatch > -1 && exportMatch > importMatch) {
      // Find end of last import line
      const afterImports = content.indexOf('\n', importMatch)
      if (afterImports > -1) {
        // Insert demo mode configuration
        content = content.slice(0, afterImports + 1) +
                 DEMO_MODE_TEMPLATE +
                 content.slice(afterImports + 1)

        writeFileSync(route, content, 'utf-8')
        modified++

        if (modified % 50 === 0) {
          console.log(`   ✅ Modified ${modified} routes...`)
        }
      }
    } else {
      skipped++
    }
  } catch (error) {
    errors.push({ route, error: error.message })
  }
})

console.log('\n═══════════════════════════════════════════════════════════')
console.log('📊 RESULTS')
console.log('═══════════════════════════════════════════════════════════')
console.log(`✅ Modified:  ${modified} routes`)
console.log(`⚪ Skipped:   ${skipped} routes`)
console.log(`❌ Errors:    ${errors.length} routes`)

if (errors.length > 0 && errors.length < 20) {
  console.log('\n❌ Errors:')
  errors.forEach(e => console.log(`   ${e.route}: ${e.error}`))
}

console.log('\n💡 Next Steps:')
console.log('   1. Review changes: git diff app/api')
console.log('   2. Test key endpoints')
console.log('   3. Commit changes: git commit -am "Add demo mode to all APIs"')
console.log('   4. Test with alex@freeflow.io user')
console.log('\n═══════════════════════════════════════════════════════════\n')
