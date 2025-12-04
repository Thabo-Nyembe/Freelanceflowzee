#!/bin/bash

# Script to add OnboardingTourLauncher to key dashboard pages

echo "Adding OnboardingTourLauncher to key dashboard pages..."

# List of pages to update
PAGES=(
  "app/(app)/dashboard/projects-hub/page.tsx"
  "app/(app)/dashboard/settings/page.tsx"
  "app/(app)/dashboard/my-day/page.tsx"
  "app/(app)/dashboard/ai-create/page.tsx"
  "app/(app)/dashboard/files-hub/page.tsx"
)

for page in "${PAGES[@]}"; do
  if [ -f "$page" ]; then
    # Check if already has the import
    if grep -q "OnboardingTourLauncher" "$page"; then
      echo "✓ $page already has OnboardingTourLauncher"
    else
      echo "→ Adding OnboardingTourLauncher to $page"
      # Add import after other imports (after line with 'from' that comes before export/const)
      sed -i.bak '/^import.*from/a\
import { OnboardingTourLauncher } from '\''@/components/onboarding-tour-launcher'\''
' "$page"
      echo "  ✓ Import added"
    fi
  else
    echo "✗ $page not found"
  fi
done

echo ""
echo "Done! Review the changes and add <OnboardingTourLauncher /> to the UI manually where appropriate."
