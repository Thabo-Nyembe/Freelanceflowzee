#!/bin/bash

# ============================================================================
# OPTIMIZE ALL LOGGERS - Replace createFeatureLogger with createSimpleLogger
# ============================================================================
# This script replaces the heavy createFeatureLogger import throughout the
# entire application with the lightweight createSimpleLogger.
# ============================================================================

echo "🔍 Finding all files using createFeatureLogger..."

# Find all TypeScript/JavaScript files using createFeatureLogger
files=$(find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/.next/*" \
  ! -path "*/build/*" \
  ! -path "*/.git/*" \
  -exec grep -l "createFeatureLogger" {} \;)

count=0

for file in $files; do
  # Skip the logger definition files themselves
  if [[ "$file" == *"lib/logger"* ]] || [[ "$file" == *"lib/simple-logger"* ]]; then
    echo "⏭️  Skipping logger definition: $file"
    continue
  fi

  echo "📝 Optimizing: $file"

  # Replace the import statement
  sed -i '' "s/import { createFeatureLogger } from '@\/lib\/logger'/import { createSimpleLogger } from '@\/lib\/simple-logger'/g" "$file"

  # Replace the logger creation call
  sed -i '' "s/const logger = createFeatureLogger(/const logger = createSimpleLogger(/g" "$file"

  # Also handle variations
  sed -i '' "s/createFeatureLogger(/createSimpleLogger(/g" "$file"

  ((count++))
done

echo ""
echo "✅ Done! Optimized $count files"
echo ""
echo "Summary:"
echo "  - Replaced createFeatureLogger with createSimpleLogger"
echo "  - Replaced heavy logger import with lightweight version"
echo "  - Application-wide optimization complete"
