#!/bin/bash

# Fix simple unused imports in multiple files
sed -i '' 's/import { AlertCircle } from/\/\/ import { AlertCircle } from/' components/verification-reminder.tsx
sed -i '' 's/import { useState } from/\/\/ import { useState } from/' components/video/ai-insights.tsx
sed -i '' 's/import { useEffect } from/\/\/ import { useEffect } from/' components/video/ai/transcription-viewer.tsx
sed -i '' 's/import { cn } from/\/\/ import { cn } from/' components/video/video-comments.tsx
sed -i '' 's/import { cn } from/\/\/ import { cn } from/' components/video/video-sharing-controls.tsx

echo "Fixed simple unused imports"
