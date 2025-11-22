# Logger Migration Guide

## Overview

This guide helps migrate console statements to the centralized logger system for production readiness.

## Quick Start

### 1. Add Logger Import

```typescript
import { createFeatureLogger } from '@/lib/logger'

// Initialize at top of component/module
const logger = createFeatureLogger('FeatureName')
```

### 2. Migration Patterns

#### Simple Logging
```typescript
// Before:
console.log('📊 Loading data...')

// After:
logger.info('Loading data')
```

#### With Context
```typescript
// Before:
console.log('✅ Data loaded:', data.length, 'items')

// After:
logger.info('Data loaded successfully', { count: data.length })
```

#### Error Logging
```typescript
// Before:
console.error('❌ Failed:', error)

// After:
logger.error('Operation failed', { error })
```

#### Debug Information
```typescript
// Before:
console.log('🔍 Search term:', searchTerm)
console.log('📊 Filter:', filterType)

// After:
logger.debug('Search updated', { searchTerm, filterType })
```

## Log Levels

### When to use each level:

**`logger.debug()`** - Development/debugging info
- State changes
- Filter updates
- UI interactions
- Navigation events

**`logger.info()`** - Important user actions
- Data loaded
- Items created/updated
- User actions completed
- Success messages

**`logger.warn()`** - Warnings
- Validation issues
- Deprecated features
- Performance concerns
- Missing optional data

**`logger.error()`** - Errors
- API failures
- Exception handling
- Data validation errors
- Critical failures

## Real-World Examples

### Example 1: Data Loading
```typescript
// Before:
useEffect(() => {
  console.log('📊 REPORTS: Loading reports data...')
  const loadData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/reports')
      const result = await response.json()
      
      if (result.success) {
        console.log('✅ REPORTS: Data loaded -', result.reports.length, 'reports')
      }
    } catch (error) {
      console.error('❌ REPORTS: Load error:', error)
    }
  }
  loadData()
}, [])

// After:
useEffect(() => {
  logger.info('Loading reports data')
  const loadData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/reports')
      const result = await response.json()
      
      if (result.success) {
        logger.info('Data loaded successfully', { count: result.reports.length })
      }
    } catch (error) {
      logger.error('Failed to load reports', { error })
    }
  }
  loadData()
}, [])
```

### Example 2: User Actions
```typescript
// Before:
const handleQuickAction = (action: string) => {
  console.log('⚡ QUICK ACTION: Initiating', action)
  console.log('📊 QUICK ACTION: Processing request')
  // ... logic ...
  console.log('✅ QUICK ACTION: Completed', action)
}

// After:
const handleQuickAction = (action: string) => {
  logger.info('Quick action initiated', { action })
  // ... logic ...
  logger.info('Quick action completed', { action })
}
```

### Example 3: Reducer Actions
```typescript
// Before:
function reducer(state, action) {
  console.log('🔄 REDUCER: Action:', action.type)
  
  switch (action.type) {
    case 'ADD_ITEM':
      console.log('✅ Item added - ID:', action.item.id)
      return { ...state, items: [...state.items, action.item] }
  }
}

// After:
function reducer(state, action) {
  logger.debug('Reducer action', { action: action.type })
  
  switch (action.type) {
    case 'ADD_ITEM':
      logger.info('Item added', { id: action.item.id })
      return { ...state, items: [...state.items, action.item] }
  }
}
```

### Example 4: Task Operations (My Day Page)
```typescript
// Before:
const addTask = async () => {
  console.log('➕ ADDING NEW TASK')
  console.log('📝 Title:', newTaskTitle)
  console.log('🎯 Priority:', newTaskPriority)
  
  try {
    const result = await api.createTask(...)
    console.log('✅ Task created successfully')
    console.log('📋 Next steps available')
  } catch (error) {
    console.error('❌ Task creation failed:', error)
  }
}

// After:
const addTask = async () => {
  logger.info('Adding new task', {
    title: newTaskTitle,
    priority: newTaskPriority
  })
  
  try {
    const result = await api.createTask(...)
    logger.info('Task added successfully', {
      taskId: result.id,
      title: result.title
    })
  } catch (error) {
    logger.error('Failed to add task', { error, title: newTaskTitle })
  }
}
```

## Migration Workflow

### Step 1: Identify Pages
```bash
# Find pages with most console statements
find app -path "*/dashboard/*/page.tsx" -type f -exec sh -c 'count=$(grep -c "console\." "$1" 2>/dev/null || echo 0); echo "$count $1"' _ {} \; | sort -rn | head -20
```

### Step 2: Add Logger
```typescript
import { createFeatureLogger } from '@/lib/logger'
const logger = createFeatureLogger('PageName')
```

### Step 3: Replace Console Statements
- Start with error handling (console.error)
- Then user actions (console.log with emojis)
- Finally debug info (verbose console.log)

### Step 4: Verify
```bash
# Check TypeScript compilation
npx tsc --noEmit

# Count remaining console statements
grep -c "console\." app/path/to/page.tsx

# Run build
npm run build
```

## Best Practices

### ✅ DO:
- Use structured context objects
- Keep messages concise and clear
- Use appropriate log levels
- Include relevant IDs (userId, taskId, etc.)
- Log errors with error objects

### ❌ DON'T:
- Log sensitive data (passwords, tokens, PII)
- Use console.log directly
- Over-log (every state change)
- Use emojis in logger messages
- Log large objects without filtering

## Context Guidelines

### Good Context Examples:
```typescript
// User actions
logger.info('User logged in', { userId, timestamp })

// Data operations
logger.info('Report generated', { reportId, type, format })

// State changes
logger.debug('Filter updated', { filterType, value, resultCount })

// Errors
logger.error('API request failed', {
  error,
  endpoint,
  method,
  statusCode,
  retryCount
})
```

### Avoid:
```typescript
// Too verbose
logger.info('User clicked the button at the top right corner near the search box')

// No context
logger.info('Success')

// Sensitive data
logger.info('Login attempt', { password, ssn })

// Huge objects
logger.info('State updated', { entireState })
```

## Environment Behavior

### Development:
- All log levels enabled (debug, info, warn, error)
- Pretty formatting with emojis
- Timestamps included
- Console output visible

### Production:
- Only error level enabled
- JSON formatting
- Sent to log aggregation service
- Console.log disabled

## Progress Tracking

Current migration status:
- ✅ lib/logger.ts - Logger utility (175 lines)
- ✅ Reports page - 20 statements migrated
- ✅ Dashboard page - 15 statements migrated
- ✅ My Day page - 26 statements migrated
- 🔄 Total: 61/4,591 statements (1%)

High-priority pages:
1. collaboration (354 statements)
2. client-zone (237 statements)
3. video-studio (226 statements)
4. projects-hub (222 statements)
5. ai-design (191 statements)

## Automated Migration Script

```bash
#!/bin/bash
# migrate-logger.sh - Helper script for logger migration

PAGE=$1

if [ -z "$PAGE" ]; then
  echo "Usage: ./migrate-logger.sh path/to/page.tsx"
  exit 1
fi

# Count console statements
COUNT=$(grep -c "console\." "$PAGE")
echo "Found $COUNT console statements in $PAGE"

# Check if logger already imported
if grep -q "createFeatureLogger" "$PAGE"; then
  echo "✅ Logger already imported"
else
  echo "⚠️  Need to add logger import"
fi

# List all console statements
echo ""
echo "Console statements:"
grep -n "console\." "$PAGE" | head -20

---

## Automated Migration Tool

### NEW: Logger Migration Script

A comprehensive Node.js script to automate console statement analysis and migration guidance.

**Location:** `scripts/migrate-logger.js`

### Commands

#### 1. Platform Statistics
```bash
node scripts/migrate-logger.js stats
```

**Output:**
- Total files and console statements
- Migration progress percentage
- Top 15 pages by console count
- Estimated effort remaining

**Example:**
```
Total Files: 88
Total Console Statements: 4531
Files with Logger: 3
Migration Progress: 3.4%

Top 15 Pages:
1. ⚠️ collaboration - 354 statements
2. ⚠️ client-zone - 237 statements
3. ⚠️ video-studio - 226 statements
```

#### 2. Analyze File
```bash
node scripts/migrate-logger.js analyze <file-path>
```

**Features:**
- Count console statements by type
- Show first 10 occurrences with line numbers
- Check if logger already imported
- Display file statistics

**Example:**
```bash
node scripts/migrate-logger.js analyze "app/(app)/dashboard/analytics/page.tsx"
```

#### 3. Migration Guide
```bash
node scripts/migrate-logger.js migrate <file-path> <feature-name>
```

**Features:**
- Shows logger import template
- Provides migration examples
- Suggests appropriate log levels
- Estimates migration time
- Best practices tips

**Example:**
```bash
node scripts/migrate-logger.js migrate "app/(app)/dashboard/analytics/page.tsx" "Analytics"
```

**Output:**
```
1️⃣  Add logger import at the top:
   import { createFeatureLogger } from '@/lib/logger'
   const logger = createFeatureLogger('Analytics')

2️⃣  Example Migrations:
   Before: console.log('📊 Loading data...')
   After:  logger.info('Loading data')
   Level:  info

3️⃣  Estimated Effort: 15 minutes
```

### Migration Workflow with Script

**Step 1: Get Platform Overview**
```bash
node scripts/migrate-logger.js stats
```
This shows you which pages have the most console statements.

**Step 2: Analyze Target Page**
```bash
node scripts/migrate-logger.js analyze "app/(app)/dashboard/collaboration/page.tsx"
```
Review the console statement breakdown.

**Step 3: Get Migration Guide**
```bash
node scripts/migrate-logger.js migrate "app/(app)/dashboard/collaboration/page.tsx" "Collaboration"
```
Follow the generated migration guide.

**Step 4: Migrate Manually**
1. Copy the logger import template
2. Paste at top of file
3. Replace console statements one by one
4. Use suggested log levels
5. Add structured context

**Step 5: Verify**
```bash
npx tsc --noEmit
npm run build
```

### Script Features

**Color-Coded Output:**
- 🟢 Green: Completed/Success
- 🟡 Yellow: Warnings/Remaining
- 🔴 Red: Errors
- 🔵 Blue: Information
- 🟣 Magenta: Section Headers
- 🔷 Cyan: Titles

**Smart Suggestions:**
- Detects error patterns → suggests logger.error
- Detects success patterns → suggests logger.info
- Detects debug patterns → suggests logger.debug
- Provides context examples

**Time Estimates:**
- Calculates per-file migration time
- Shows platform-wide effort remaining
- Based on ~120 statements/hour rate

### Quick Reference

```bash
# Show all commands
node scripts/migrate-logger.js help

# Get platform stats
node scripts/migrate-logger.js stats

# Analyze a file
node scripts/migrate-logger.js analyze <file>

# Get migration guide
node scripts/migrate-logger.js migrate <file> <name>
```

### Integration with Workflow

**Before Starting:**
```bash
# Check overall progress
node scripts/migrate-logger.js stats

# Pick highest priority page
node scripts/migrate-logger.js analyze "app/(app)/dashboard/collaboration/page.tsx"
```

**During Migration:**
```bash
# Get migration examples
node scripts/migrate-logger.js migrate "app/(app)/dashboard/collaboration/page.tsx" "Collaboration"

# Follow the guide
# Migrate console statements
# Test with TypeScript
```

**After Completion:**
```bash
# Verify progress
node scripts/migrate-logger.js stats

# Should see:
# Files with Logger: 4 (was 3)
# Migration Progress: 4.5% (was 3.4%)
```

---

## Summary

This migration guide provides:
- ✅ Manual migration patterns
- ✅ Real-world examples
- ✅ Automated analysis tool
- ✅ Migration workflow
- ✅ Best practices
- ✅ Progress tracking

Use the automated script to:
- Track platform-wide progress
- Identify high-priority pages
- Get migration guidance
- Estimate effort
- Speed up migration

**Next Steps:**
1. Run `node scripts/migrate-logger.js stats` to see current state
2. Pick a high-priority page from top 15
3. Run analyze and migrate commands
4. Follow the migration guide
5. Test and commit changes

