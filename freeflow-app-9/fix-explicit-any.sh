#!/bin/bash

# Fix explicit any types with proper types
sed -i '' 's/structuredData?: any/structuredData?: Record<string, unknown>/' components/seo/dynamic-seo.tsx
sed -i '' 's/: any/: Record<string, unknown>/g' components/unified-sidebar.tsx
sed -i '' 's/: any/: Record<string, unknown>/g' components/team-collaboration-hub.tsx
sed -i '' 's/: any/: Record<string, unknown>/g' components/team-hub.tsx

echo "Fixed explicit any types in components"
