#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { glob } = require('glob')

async function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8')
  let modified = false

  // Pattern 1: Fix <img> tags without loading attribute
  const imgPattern = /<img\s+([^>]*?)>/g
  const imgMatches = [...content.matchAll(imgPattern)]

  for (const match of imgMatches) {
    const attributes = match[1]
    // Only add loading if not already present
    if (!attributes.includes('loading=')) {
      const replacement = `<img ${attributes} loading="lazy">`
      content = content.replace(match[0], replacement)
      modified = true
    }
  }

  // Pattern 2: Fix Next.js Image components without loading prop
  const nextImagePattern = /<Image\s+([^>]*?)(?:\/?>|>)/g
  const imageMatches = [...content.matchAll(nextImagePattern)]

  for (const match of imageMatches) {
    const attributes = match[1]
    // Only add loading if not already present
    if (!attributes.includes('loading=') && !attributes.includes('priority')) {
      const replacement = `<Image ${attributes} loading="lazy"${match[0].endsWith('/>') ? '/>' : '>'}`
      content = content.replace(match[0], replacement)
      modified = true
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8')
    console.log(`✓ Fixed: ${filePath}`)
    return 1
  }
  return 0
}

async function main() {
  console.log('🔍 Finding files with images...\n')

  const patterns = [
    'app/v2/dashboard/**/*.tsx',
    'app/(app)/dashboard/**/*.tsx',
    'app/v1/dashboard/**/*.tsx',
    'components/**/*.tsx'
  ]

  let totalFixed = 0
  for (const pattern of patterns) {
    const files = await glob(pattern, { cwd: process.cwd() })
    console.log(`Checking ${files.length} files for pattern: ${pattern}`)

    for (const file of files) {
      const fixed = await fixFile(file)
      totalFixed += fixed
    }
  }

  console.log(`\n✅ Fixed ${totalFixed} files with lazy loading`)
}

main().catch(console.error)
