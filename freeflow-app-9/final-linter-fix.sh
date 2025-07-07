#!/bin/bash

echo "Applying final comprehensive linter fixes..."

# Find all TypeScript/TSX files
FILES=$(find . -name "*.tsx" -o -name "*.ts" | grep -v node_modules | grep -v ".next")

for file in $FILES; do
  # Skip if file doesn't exist
  [ ! -f "$file" ] && continue
  
  # Fix React unused import at position 3:8
  sed -i '' 's/^import React,/\/\/ import React,/' "$file"
  sed -i '' 's/^import React from/\/\/ import React from/' "$file"
  
  # Fix useState unused import at position 3:17 and 3:29
  sed -i '' 's/, useState//' "$file"
  sed -i '' 's/{ useState }/{}/' "$file"
  sed -i '' 's/import { useState }/\/\/ import { useState }/' "$file"
  
  # Fix Link unused import at position 4:8
  sed -i '' 's/^import Link from/\/\/ import Link from/' "$file"
  
  # Fix Button unused import at positions 6:10 and 4:10
  sed -i '' 's/import { Button }/\/\/ import { Button }/' "$file"
  sed -i '' 's/, Button//' "$file"
  
  # Fix Textarea unused import
  sed -i '' 's/import { Textarea }/\/\/ import { Textarea }/' "$file"
  sed -i '' 's/, Textarea//' "$file"
  
  # Fix Tabs related unused imports
  sed -i '' 's/, Tabs//' "$file"
  sed -i '' 's/, TabsContent//' "$file"
  sed -i '' 's/, TabsList//' "$file"
  sed -i '' 's/, TabsTrigger//' "$file"
  
  # Fix CreatorMarketplace unused import
  sed -i '' 's/import { CreatorMarketplace }/\/\/ import { CreatorMarketplace }/' "$file"
  
  # Fix request parameter (change to _request)
  sed -i '' 's/({ request })/({ request: _request })/' "$file"
  sed -i '' 's/(request:/(request: _request/' "$file"
  
  # Clean up empty import braces
  sed -i '' 's/import { } from/\/\/ import { } from/' "$file"
  sed -i '' 's/import {}/\/\/ import {}/' "$file"
done

echo "Applied comprehensive linter fixes to all TypeScript files"
