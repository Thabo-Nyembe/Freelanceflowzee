#!/bin/bash

# Fix specific unused imports in specific files
sed -i '' 's/import { DollarSign, Lightbulb }/\/\/ import { DollarSign, Lightbulb }/' app/\(app\)/dashboard/ai-enhanced/page.tsx
sed -i '' 's/import { Clock }/\/\/ import { Clock }/' app/\(app\)/dashboard/collaboration/page.tsx
sed -i '' 's/import React, { useState }/import React/' app/\(app\)/dashboard/cv-portfolio/page.tsx
sed -i '' 's/({ user })/({ user: _user })/' app/\(app\)/dashboard/dashboard-layout-client.tsx
sed -i '' 's/import React, { useState, useEffect }/\/\/ import React, { useState, useEffect }/' app/\(app\)/dashboard/enhanced-interactive-dashboard.tsx

# Fix unused imports in other files
sed -i '' 's/import { Input }/\/\/ import { Input }/' app/\(app\)/dashboard/escrow/page.tsx
sed -i '' 's/import { EscrowProject }/\/\/ import { EscrowProject }/' app/\(app\)/dashboard/escrow/page.tsx

echo "Fixed specific file issues"
