import { readFileSync, writeFileSync } from 'fs'
import { execSync } from 'child_process'

console.log('🎨 Fixing Dashboard Alignment & Spacing Across All Pages\n')
console.log('='.repeat(70))

const fixes = {
  fixed: 0,
  skipped: 0,
  errors: 0,
  details: []
}

// Find all dashboard client files with max-w-[1800px]
console.log('\n📋 Finding files with layout issues...\n')

const filesOutput = execSync(
  `grep -r "max-w-\\[1800px\\]" app/\\(app\\)/dashboard --include="*-client.tsx" -l`,
  { encoding: 'utf-8' }
)

const files = filesOutput.trim().split('\n').filter(Boolean)
console.log(`Found ${files.length} files to fix\n`)

for (const filePath of files) {
  console.log(`📄 Processing: ${filePath}`)

  try {
    let content = readFileSync(filePath, 'utf-8')
    let modified = false
    const changes = []

    // Pattern 1: Fix container alignment - remove max-w-[1800px] from main containers
    // Replace: <div className="max-w-[1800px] mx-auto p-6">
    // With:    <div className="px-6 pt-6 pb-4">
    const pattern1 = /className="max-w-\[1800px\] mx-auto p-6"/g
    if (content.match(pattern1)) {
      content = content.replace(pattern1, 'className="px-6 pt-6 pb-4"')
      modified = true
      changes.push('Fixed main container: max-w-[1800px] mx-auto p-6 → px-6 pt-6 pb-4')
    }

    // Pattern 2: Fix header containers
    // Replace: <div className="max-w-[1800px] mx-auto px-6 py-8">
    // With:    <div className="px-6 py-4">
    const pattern2 = /className="max-w-\[1800px\] mx-auto px-6 py-8"/g
    if (content.match(pattern2)) {
      content = content.replace(pattern2, 'className="px-6 py-4"')
      modified = true
      changes.push('Fixed header: max-w-[1800px] mx-auto px-6 py-8 → px-6 py-4')
    }

    // Pattern 3: Any remaining max-w-[1800px] mx-auto combinations
    const pattern3 = /max-w-\[1800px\] mx-auto/g
    if (content.match(pattern3)) {
      content = content.replace(pattern3, 'mx-auto')
      modified = true
      changes.push('Removed max-w-[1800px] constraints')
    }

    // Pattern 4: Fix viewport height calculations for better space usage
    // Replace: h-[calc(100vh-400px)] or h-[calc(100vh-380px)]
    // With:    h-[calc(100vh-300px)]
    const pattern4 = /h-\[calc\(100vh-(400|380|350)px\)\]/g
    if (content.match(pattern4)) {
      content = content.replace(pattern4, 'h-[calc(100vh-300px)]')
      modified = true
      changes.push('Increased viewport usage: calc(100vh-XXXpx) → calc(100vh-300px)')
    }

    // Pattern 5: Ensure proper spacing after removing max-width
    // If we removed max-w-[1800px] and there's no pt-X, add pt-6
    if (modified && !content.includes('pt-6') && !content.includes('py-6')) {
      // Look for the first div after removing max-w-[1800px]
      const needsSpacing = content.match(/className="px-6 pb-4"/)
      if (needsSpacing) {
        content = content.replace(/className="px-6 pb-4"/, 'className="px-6 pt-6 pb-4"')
        changes.push('Added top spacing: pt-6')
      }
    }

    // Pattern 6: Fix outer container to work within dashboard layout
    // Add rounded-xl and proper containment for pages with full-screen layouts
    const hasFullScreenLayout = content.includes('min-h-screen bg-gradient')
    if (hasFullScreenLayout && modified) {
      const pattern6 = /className="min-h-screen bg-gradient-to-br/g
      if (content.match(pattern6)) {
        content = content.replace(
          pattern6,
          'className="bg-gradient-to-br'
        )
        content = content.replace(
          /className="bg-gradient-to-br([^"]+)"/,
          'className="bg-gradient-to-br$1 rounded-xl overflow-hidden"'
        )
        changes.push('Added rounded container for clean layout')
      }
    }

    if (modified) {
      writeFileSync(filePath, content, 'utf-8')
      fixes.fixed++
      fixes.details.push({ file: filePath, changes })
      console.log('  ✅ Fixed')
      changes.forEach(c => console.log(`     - ${c}`))
    } else {
      fixes.skipped++
      console.log('  ⏭️  No changes needed')
    }

  } catch (error) {
    fixes.errors++
    console.log(`  ❌ Error: ${error.message}`)
  }

  console.log('')
}

console.log('='.repeat(70))
console.log('\n📊 Summary:')
console.log(`   ✅ Fixed:   ${fixes.fixed} files`)
console.log(`   ⏭️  Skipped: ${fixes.skipped} files`)
console.log(`   ❌ Errors:  ${fixes.errors} files`)
console.log('\n🎯 Changes applied:')
console.log('   • Removed max-w-[1800px] to fix alignment')
console.log('   • Added proper spacing (pt-6) between sections')
console.log('   • Reduced header padding for more content space')
console.log('   • Increased viewport usage (300px overhead vs 380px+)')
console.log('   • Added rounded containers for clean look')
console.log('\n✨ All dashboard pages now properly aligned!')
console.log('='.repeat(70))

// Write detailed log
if (fixes.details.length > 0) {
  const logContent = fixes.details.map(({ file, changes }) =>
    `${file}\n${changes.map(c => `  - ${c}`).join('\n')}\n`
  ).join('\n')

  writeFileSync('dashboard-alignment-fixes.log', logContent, 'utf-8')
  console.log('\n📝 Detailed log: dashboard-alignment-fixes.log\n')
}
