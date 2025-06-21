#!/bin/bash
# Quick Demo Test Script

echo "🎭 TESTING DEMO SYSTEM"
echo "======================="

echo "1. Testing demo router..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/demo-features
echo " - Demo router HTTP status: $?"

echo "2. Testing dashboard..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/dashboard
echo " - Dashboard HTTP status: $?"

echo "3. Testing projects hub..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/dashboard/projects-hub
echo " - Projects hub HTTP status: $?"

echo ""
echo "✅ Demo system test complete!"
echo "🌐 Access demo at: http://localhost:3001/demo-features"
