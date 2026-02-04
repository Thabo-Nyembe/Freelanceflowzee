#!/bin/bash

# Script to optimize API routes by replacing heavy logger imports

echo "Optimizing API routes..."

# Find all route files with createFeatureLogger
routes=$(find app/api -name "route.ts" -exec grep -l "createFeatureLogger" {} \;)

for route in $routes; do
  echo "Optimizing: $route"

  # Replace the import
  sed -i '' "s/import { createFeatureLogger } from '@\/lib\/logger'/import { createSimpleLogger } from '@\/lib\/simple-logger'/g" "$route"

  # Replace the logger creation
  sed -i '' "s/const logger = createFeatureLogger(/const logger = createSimpleLogger(/g" "$route"
done

echo "Done! Optimized $(echo "$routes" | wc -l) routes"
