import { readFileSync, writeFileSync } from 'fs'
import { execSync } from 'child_process'

console.log('🎨 Fixing Viewport Constraints for Better Feature Showcase\n')
console.log('='.repeat(70))

// Find all files with max-w-[1800px] or max-w-[1600px]
console.log('\n📋 Finding files with viewport constraints...\n')

const filesOutput = execSync(
  `grep -r "max-w-\\[1800px\\]\\|max-w-\\[1600px\\]" app/\\(app\\)/dashboard --include="*-client.tsx" -l`,
  { encoding: 'utf-8' }
)

const files = filesOutput.trim().split('\n').filter(Boolean)

console.log(`\n📊 Found ${files.length} files with constrained viewports\n`)

let fixedCount = 0
let changesLog = []

for (const filePath of files) {
  console.log(`📄 Processing: ${filePath}`)

  try {
    let content = readFileSync(filePath, 'utf-8')
    let modified = false
    let fileChanges = []

    // Replace max-w-[1800px] with max-w-full
    const count1800 = (content.match(/max-w-\[1800px\]/g) || []).length
    if (count1800 > 0) {
      content = content.replace(/max-w-\[1800px\]/g, 'max-w-full')
      modified = true
      fileChanges.push(`  - Replaced ${count1800} instance(s) of max-w-[1800px] → max-w-full`)
    }

    // Replace max-w-[1600px] with max-w-full
    const count1600 = (content.match(/max-w-\[1600px\]/g) || []).length
    if (count1600 > 0) {
      content = content.replace(/max-w-\[1600px\]/g, 'max-w-full')
      modified = true
      fileChanges.push(`  - Replaced ${count1600} instance(s) of max-w-[1600px] → max-w-full`)
    }

    // Fix common height constraints that cause scrolling
    const heightPatterns = [
      {
        old: /h-\[calc\(100vh-400px\)\]/g,
        new: 'h-[calc(100vh-250px)]',
        desc: 'h-[calc(100vh-400px)] → h-[calc(100vh-250px)]'
      },
      {
        old: /h-\[calc\(100vh-380px\)\]/g,
        new: 'h-[calc(100vh-250px)]',
        desc: 'h-[calc(100vh-380px)] → h-[calc(100vh-250px)]'
      },
      {
        old: /h-\[calc\(100vh-350px\)\]/g,
        new: 'h-[calc(100vh-250px)]',
        desc: 'h-[calc(100vh-350px)] → h-[calc(100vh-250px)]'
      }
    ]

    for (const pattern of heightPatterns) {
      const countHeight = (content.match(pattern.old) || []).length
      if (countHeight > 0) {
        content = content.replace(pattern.old, pattern.new)
        modified = true
        fileChanges.push(`  - Fixed ${countHeight} height constraint(s): ${pattern.desc}`)
      }
    }

    // Expand narrow message containers
    const widthPatterns = [
      {
        old: /max-w-\[80%\]/g,
        new: 'max-w-[90%]',
        desc: 'max-w-[80%] → max-w-[90%]'
      },
      {
        old: /max-w-4xl/g,
        new: 'max-w-6xl',
        desc: 'max-w-4xl → max-w-6xl'
      },
      {
        old: /max-w-3xl/g,
        new: 'max-w-5xl',
        desc: 'max-w-3xl → max-w-5xl'
      }
    ]

    for (const pattern of widthPatterns) {
      const countWidth = (content.match(pattern.old) || []).length
      if (countWidth > 0) {
        content = content.replace(pattern.old, pattern.new)
        modified = true
        fileChanges.push(`  - Expanded ${countWidth} content width(s): ${pattern.desc}`)
      }
    }

    if (modified) {
      writeFileSync(filePath, content, 'utf-8')
      fixedCount++
      console.log(`  ✅ Fixed`)
      fileChanges.forEach(change => console.log(change))
      changesLog.push({ file: filePath, changes: fileChanges })
    } else {
      console.log(`  ⏭️  No changes needed`)
    }

  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`)
  }

  console.log('')
}

console.log('='.repeat(70))
console.log(`\n✅ Fixed ${fixedCount} files!`)
console.log(`\n📈 Summary:`)
console.log(`   - Removed constrained max-widths to use full viewport`)
console.log(`   - Increased viewport height usage (reduced header space)`)
console.log(`   - Expanded content widths for better feature visibility`)
console.log(`   - Better showcase experience across all dashboard pages`)
console.log('\n💡 Pages now use maximum available screen space!')
console.log('='.repeat(70))

// Write detailed log
const logContent = changesLog.map(({ file, changes }) =>
  `${file}\n${changes.join('\n')}\n`
).join('\n')

writeFileSync('viewport-fixes-log.txt', logContent, 'utf-8')
console.log('\n📝 Detailed log written to: viewport-fixes-log.txt\n')
