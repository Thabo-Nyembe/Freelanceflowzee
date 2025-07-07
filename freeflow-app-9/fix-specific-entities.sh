#!/bin/bash

# Fix specific unescaped entities
sed -i '' "s/don't/don\&apos;t/g" components/storage/enterprise-dashboard.tsx
sed -i '' "s/don't/don\&apos;t/g" components/storage/startup-cost-dashboard.tsx
sed -i '' 's/"Export"/"Export"/g' components/video/VideoMessageRecorder.tsx
sed -i '' 's/"Capture"/"Capture"/g' components/video/VideoMessageRecorder.tsx
sed -i '' "s/can't/can\&apos;t/g" components/video/ai/transcription-viewer.tsx

echo "Fixed specific unescaped entities"
