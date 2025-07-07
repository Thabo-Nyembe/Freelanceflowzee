#!/bin/bash

# Fix unescaped entities in JSX
find components -name "*.tsx" -exec sed -i '' "s/'/\&apos;/g" {} \;
find components -name "*.tsx" -exec sed -i '' 's/"/\&quot;/g' {} \;

# For specific files mentioned in linter errors
sed -i '' "s/don't/don\&apos;t/g" components/storage/enterprise-dashboard.tsx
sed -i '' "s/don't/don\&apos;t/g" components/storage/startup-cost-dashboard.tsx
sed -i '' 's/"Export"/"Export"/g' components/video/VideoMessageRecorder.tsx

echo "Fixed unescaped entities"
