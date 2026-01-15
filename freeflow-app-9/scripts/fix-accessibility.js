#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { glob } = require('glob')

// Icon button patterns to fix with aria-labels
const iconButtonFixes = [
  {
    pattern: /<Button([^>]*?)onClick={handleNotifications}([^>]*?)>\s*<Bell/g,
    replacement: '<Button$1onClick={handleNotifications}$2 aria-label="Notifications">\n                  <Bell',
    label: 'Notifications'
  },
  {
    pattern: /<Button([^>]*?)onClick={handleExport}([^>]*?)>\s*<Download/g,
    replacement: '<Button$1onClick={handleExport}$2 aria-label="Export data">\n                  <Download',
    label: 'Export'
  },
  {
    pattern: /<Button([^>]*?)onClick={handleShare}([^>]*?)>\s*<Share2/g,
    replacement: '<Button$1onClick={handleShare}$2 aria-label="Share">\n                  <Share2',
    label: 'Share'
  },
  {
    pattern: /<Button([^>]*?)onClick={handleSettings}([^>]*?)>\s*<Settings/g,
    replacement: '<Button$1onClick={handleSettings}$2 aria-label="Settings">\n                  <Settings',
    label: 'Settings'
  },
  {
    pattern: /<Button([^>]*?)onClick={handleRefresh}([^>]*?)>\s*<RefreshCw/g,
    replacement: '<Button$1onClick={handleRefresh}$2 aria-label="Refresh">\n                  <RefreshCw',
    label: 'Refresh'
  },
  {
    pattern: /<Button([^>]*?)onClick={handleFilter}([^>]*?)>\s*<Filter/g,
    replacement: '<Button$1onClick={handleFilter}$2 aria-label="Filter">\n                  <Filter',
    label: 'Filter'
  },
  {
    pattern: /<Button([^>]*?)onClick={handleSearch}([^>]*?)>\s*<Search/g,
    replacement: '<Button$1onClick={handleSearch}$2 aria-label="Search">\n                  <Search',
    label: 'Search'
  },
  {
    pattern: /<Button([^>]*?)>\s*<MoreVertical/g,
    replacement: '<Button$1 aria-label="More options">\n                  <MoreVertical',
    label: 'More options'
  },
  {
    pattern: /<Button([^>]*?)>\s*<X className/g,
    replacement: '<Button$1 aria-label="Close">\n                  <X className',
    label: 'Close'
  }
]

// Avatar image pattern - add alt text
const avatarImagePattern = /<AvatarImage src=\{([^}]+)\} \/>/g

async function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8')
  let modified = false

  // Fix icon buttons
  for (const fix of iconButtonFixes) {
    if (fix.pattern.test(content) && !content.includes(`aria-label="${fix.label}"`)) {
      content = content.replace(fix.pattern, fix.replacement)
      modified = true
    }
  }

  // Fix avatar images - add alt text if missing
  const avatarMatches = [...content.matchAll(avatarImagePattern)]
  for (const match of avatarMatches) {
    const srcExpression = match[1]
    // Only add alt if not already present
    if (!match[0].includes('alt=')) {
      const replacement = `<AvatarImage src={${srcExpression}} alt="User avatar" />`
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
  console.log('🔍 Finding dashboard files...\n')

  const patterns = [
    'app/v2/dashboard/**/*-client.tsx',
    'app/(app)/dashboard/**/*-client.tsx',
    'app/v1/dashboard/**/page.tsx'
  ]

  let totalFixed = 0
  for (const pattern of patterns) {
    const files = await glob(pattern, { cwd: process.cwd() })
    console.log(`Found ${files.length} files for pattern: ${pattern}`)

    for (const file of files) {
      const fixed = await fixFile(file)
      totalFixed += fixed
    }
  }

  console.log(`\n✅ Fixed ${totalFixed} files with accessibility improvements`)
}

main().catch(console.error)
