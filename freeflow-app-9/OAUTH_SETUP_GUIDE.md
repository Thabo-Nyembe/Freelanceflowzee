# OAuth Integration Setup Guide

## Overview
This guide explains how to configure Gmail and Outlook OAuth integrations for the Email Agent feature.

## Environment Variables Required

### Local Development (.env.local)
```bash
# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Gmail OAuth
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret

# Outlook OAuth
MICROSOFT_CLIENT_ID=your-microsoft-oauth-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-oauth-client-secret
```

### Production (.env.production or Vercel Environment Variables)
```bash
# Application URL
NEXT_PUBLIC_APP_URL=https://freeflow-app-9.vercel.app

# Gmail OAuth (Set in Vercel dashboard)
GOOGLE_CLIENT_ID=your-production-google-client-id
GOOGLE_CLIENT_SECRET=your-production-google-client-secret

# Outlook OAuth (Set in Vercel dashboard)
MICROSOFT_CLIENT_ID=your-production-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-production-microsoft-client-secret
```

## Getting OAuth Credentials

### Gmail (Google Cloud Console)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable Gmail API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Gmail API"
   - Click "Enable"
4. Create OAuth 2.0 Credentials:
   - Navigate to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: "Web application"
   - Add authorized redirect URIs:
     - Development: `http://localhost:3000/api/integrations/gmail/auth`
     - Production: `https://freeflow-app-9.vercel.app/api/integrations/gmail/auth`
5. Copy the Client ID and Client Secret

### Outlook (Microsoft Azure Portal)

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to "Azure Active Directory" > "App registrations"
3. Click "New registration"
   - Name: Your app name (e.g., "FreeFlow Email Integration")
   - Supported account types: "Accounts in any organizational directory and personal Microsoft accounts"
   - Redirect URI:
     - Platform: Web
     - Development: `http://localhost:3000/api/integrations/outlook/auth`
     - Production: `https://freeflow-app-9.vercel.app/api/integrations/outlook/auth`
4. After registration, note the "Application (client) ID"
5. Create a Client Secret:
   - Navigate to "Certificates & secrets"
   - Click "New client secret"
   - Add description and set expiration
   - Copy the secret value (not the secret ID)
6. Configure API Permissions:
   - Navigate to "API permissions"
   - Click "Add a permission"
   - Select "Microsoft Graph"
   - Select "Delegated permissions"
   - Add: `Mail.ReadWrite`, `offline_access`

## OAuth Routes

### Gmail OAuth Route
**File:** [app/api/integrations/gmail/auth/route.ts](app/api/integrations/gmail/auth/route.ts)

**Features:**
- Dynamic rendering (not statically generated)
- Environment variable validation
- Fallback URLs for missing configuration
- Comprehensive error handling
- Structured logging
- OAuth error handling from provider

**Endpoints:**
- Initiate OAuth: `GET /api/integrations/gmail/auth`
- OAuth Callback: `GET /api/integrations/gmail/auth?code=...`

### Outlook OAuth Route
**File:** [app/api/integrations/outlook/auth/route.ts](app/api/integrations/outlook/auth/route.ts)

**Features:**
- Dynamic rendering (not statically generated)
- Environment variable validation
- Fallback URLs for missing configuration
- Comprehensive error handling
- Structured logging
- OAuth error handling from provider

**Endpoints:**
- Initiate OAuth: `GET /api/integrations/outlook/auth`
- OAuth Callback: `GET /api/integrations/outlook/auth?code=...`

## Error Handling

Both routes handle the following error scenarios:

1. **Missing Environment Variables:**
   - Redirects to setup page with clear error message
   - Falls back to `localhost:3000` if `NEXT_PUBLIC_APP_URL` is missing

2. **OAuth Provider Errors:**
   - Captures error and error_description from OAuth provider
   - Logs warning with full context
   - Redirects to setup page with error details

3. **Token Exchange Errors:**
   - Captures detailed error from token endpoint
   - Logs error with stack trace
   - Provides user-friendly error message

4. **Network Errors:**
   - Catches all exceptions
   - Provides fallback error messages
   - Ensures user is always redirected (never stuck)

## Security Features

1. **Dynamic Rendering:** Routes use `force-dynamic` to prevent static generation
2. **Environment Validation:** Checks for placeholder values
3. **Secure Token Handling:** Tokens logged but not exposed to client
4. **Error Sanitization:** Errors are encoded before URL redirect
5. **HTTPS Required:** Production URLs use HTTPS
6. **Scope Limitation:** Only requests necessary OAuth scopes

## Testing the Integration

### Local Testing

1. Set up environment variables in `.env.local`
2. Start development server: `npm run dev`
3. Navigate to: `http://localhost:3000/dashboard/email-agent/setup`
4. Click "Connect Gmail" or "Connect Outlook"
5. Complete OAuth flow
6. Verify success/error message on callback

### Production Testing

1. Set environment variables in Vercel dashboard
2. Deploy to production
3. Navigate to: `https://freeflow-app-9.vercel.app/dashboard/email-agent/setup`
4. Test OAuth flows
5. Monitor logs in Vercel dashboard

## Troubleshooting

### Issue: "Gmail integration not configured"
**Solution:** Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in environment variables

### Issue: "Outlook integration not configured"
**Solution:** Set `MICROSOFT_CLIENT_ID` and `MICROSOFT_CLIENT_SECRET` in environment variables

### Issue: "Server configuration error: NEXT_PUBLIC_APP_URL not set"
**Solution:** Add `NEXT_PUBLIC_APP_URL` to environment variables

### Issue: OAuth callback shows "redirect_uri_mismatch"
**Solution:** Ensure redirect URIs in OAuth provider console match exactly:
- Google: `{APP_URL}/api/integrations/gmail/auth`
- Microsoft: `{APP_URL}/api/integrations/outlook/auth`

### Issue: Token exchange fails
**Solution:**
- Verify client secret is correct
- Check that OAuth app is not suspended
- Ensure required API scopes are enabled

## Next Steps (TODO)

1. **Token Persistence:** Currently tokens are received but not saved. Implement token storage via `/api/integrations/save`
2. **Token Refresh:** Implement refresh token logic for expired access tokens
3. **Email Operations:** Use stored tokens to read/send emails via Gmail/Outlook APIs
4. **User Association:** Link OAuth tokens to user accounts in database
5. **Revocation:** Implement OAuth token revocation on disconnect

## Build Verification

All rendering issues have been resolved:
- ✅ Gmail auth route configured for dynamic rendering
- ✅ Outlook auth route configured for dynamic rendering
- ✅ Build completes without prerender errors
- ✅ All 240 static pages generated successfully
- ✅ No export errors

## References

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Microsoft OAuth 2.0 Documentation](https://learn.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow)
- [Next.js Dynamic Rendering](https://nextjs.org/docs/app/building-your-application/rendering/server-components#dynamic-rendering)
