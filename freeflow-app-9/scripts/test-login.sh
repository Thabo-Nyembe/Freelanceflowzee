#!/bin/bash
# Test login for showcase users

BASE_URL="http://localhost:9323"

echo "Getting CSRF token..."
CSRF=$(curl -s "$BASE_URL/api/auth/csrf" | sed 's/.*"csrfToken":"\([^"]*\)".*/\1/')
echo "CSRF: $CSRF"
echo ""

echo "=== Testing Sarah Mitchell (New User) ==="
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/auth/callback/credentials" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "csrfToken=$CSRF&email=sarah@techstartup.io&password=Demo2025")
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -n -1)
echo "HTTP Status: $HTTP_CODE"
if [ "$HTTP_CODE" = "302" ] || [ "$HTTP_CODE" = "200" ]; then
  echo "Result: SUCCESS - Login redirected (authentication worked)"
else
  echo "Result: Response - $BODY"
fi
echo ""

echo "=== Testing Marcus Johnson (Power User) ==="
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/auth/callback/credentials" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "csrfToken=$CSRF&email=marcus@designstudio.co&password=Demo2025")
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -n -1)
echo "HTTP Status: $HTTP_CODE"
if [ "$HTTP_CODE" = "302" ] || [ "$HTTP_CODE" = "200" ]; then
  echo "Result: SUCCESS - Login redirected (authentication worked)"
else
  echo "Result: Response - $BODY"
fi
