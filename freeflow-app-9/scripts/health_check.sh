#!/bin/bash
# Quick health check for FreeflowZee

echo "🏥 FreeflowZee Health Check"

# Check if app can start
echo "Checking app startup..."
if timeout 10s npm run build >/dev/null 2>&1; then
    echo "✅ Build: PASS"
else
    echo "❌ Build: FAIL"
fi

# Check critical files
echo "Checking critical files..."
files=("package.json" "next.config.js" "app/page.tsx")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file: EXISTS"
    else
        echo "❌ $file: MISSING"
    fi
done

# Check avatar files
echo "Checking avatar files..."
avatars=("alice" "john" "bob" "jane" "mike" "client-1")
for avatar in "${avatars[@]}"; do
    if [ -f "public/avatars/$avatar.jpg" ]; then
        echo "✅ Avatar $avatar: EXISTS"
    else
        echo "❌ Avatar $avatar: MISSING"
    fi
done

# Check if server can start (quick test)
echo "Quick server test..."
if pgrep -f "next dev" >/dev/null; then
    echo "✅ Server: RUNNING"
else
    echo "ℹ️  Server: NOT RUNNING (normal if not started)"
fi

echo "Health check complete!"
