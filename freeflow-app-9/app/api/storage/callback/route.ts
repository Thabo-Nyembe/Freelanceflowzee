import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createStorageConnection } from '@/lib/storage/storage-queries'
import { StorageProvider } from '@/lib/storage/providers'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'


const logger = createSimpleLogger('storage-callback')

// Validate returnTo path to prevent open redirect attacks
function isValidReturnPath(path: string): boolean {
  // Must start with / and not have protocol or //
  if (!path.startsWith('/') || path.startsWith('//')) {
    return false
  }
  // Must be a valid relative path under allowed routes
  const allowedPaths = ['/dashboard', '/settings', '/storage', '/files']
  return allowedPaths.some(allowed => path.startsWith(allowed))
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const state = requestUrl.searchParams.get('state')
  const error = requestUrl.searchParams.get('error')

  // Handle OAuth errors
  if (error) {
    logger.error('OAuth error', { error })
    return NextResponse.redirect(`${requestUrl.origin}/dashboard/storage?error=oauth_denied`)
  }

  if (!code || !state) {
    return NextResponse.redirect(`${requestUrl.origin}/dashboard/storage?error=invalid_request`)
  }

  try {
    // Decode state parameter
    const stateData = JSON.parse(atob(state))
    const provider: StorageProvider = stateData.provider
    // Validate returnTo path to prevent open redirect
    const rawReturnTo = stateData.returnTo || '/dashboard/storage'
    const returnTo = isValidReturnPath(rawReturnTo) ? rawReturnTo : '/dashboard/storage'

    // Get current user
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.redirect(`${requestUrl.origin}/login?error=unauthorized`)
    }

    // Exchange code for access token based on provider
    let accessToken = ''
    let refreshToken = ''
    let expiresAt: Date | undefined
    let accountEmail = ''
    let accountName = ''

    switch (provider) {
      case 'google-drive': {
        // Exchange code for Google Drive token
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code,
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            redirect_uri: `${requestUrl.origin}/api/storage/callback`,
            grant_type: 'authorization_code'
          })
        })

        const tokenData = await tokenResponse.json()

        if (tokenData.error) {
          throw new Error(tokenData.error_description || tokenData.error)
        }

        accessToken = tokenData.access_token
        refreshToken = tokenData.refresh_token
        expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000))

        // Get user info
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        })
        const userInfo = await userInfoResponse.json()
        accountEmail = userInfo.email
        accountName = userInfo.name
        break
      }

      case 'dropbox': {
        // Exchange code for Dropbox token
        const tokenResponse = await fetch('https://api.dropboxapi.com/oauth2/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code,
            client_id: process.env.NEXT_PUBLIC_DROPBOX_APP_KEY!,
            client_secret: process.env.DROPBOX_APP_SECRET!,
            redirect_uri: `${requestUrl.origin}/api/storage/callback`,
            grant_type: 'authorization_code'
          })
        })

        const tokenData = await tokenResponse.json()

        if (tokenData.error) {
          throw new Error(tokenData.error_description || tokenData.error)
        }

        accessToken = tokenData.access_token
        refreshToken = tokenData.refresh_token
        expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000))

        // Get account info
        const accountResponse = await fetch('https://api.dropboxapi.com/2/users/get_current_account', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        })
        const accountInfo = await accountResponse.json()
        accountEmail = accountInfo.email
        accountName = accountInfo.name.display_name
        break
      }

      case 'onedrive': {
        // Exchange code for OneDrive token
        const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code,
            client_id: process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID!,
            client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
            redirect_uri: `${requestUrl.origin}/api/storage/callback`,
            grant_type: 'authorization_code'
          })
        })

        const tokenData = await tokenResponse.json()

        if (tokenData.error) {
          throw new Error(tokenData.error_description || tokenData.error)
        }

        accessToken = tokenData.access_token
        refreshToken = tokenData.refresh_token
        expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000))

        // Get user info
        const userInfoResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        })
        const userInfo = await userInfoResponse.json()
        accountEmail = userInfo.mail || userInfo.userPrincipalName
        accountName = userInfo.displayName
        break
      }

      default:
        throw new Error(`Unsupported provider: ${provider}`)
    }

    // Save connection to database
    await createStorageConnection({
      user_id: user.id,
      provider,
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: expiresAt?.toISOString(),
      account_email: accountEmail,
      account_name: accountName,
      connected: true,
      last_sync: new Date().toISOString()
    })

    // Redirect back to storage page with success
    return NextResponse.redirect(`${requestUrl.origin}${returnTo}?connected=${provider}`)
  } catch (error) {
    logger.error('Storage OAuth callback error', { error })
    return NextResponse.redirect(`${requestUrl.origin}/dashboard/storage?error=connection_failed`)
  }
}
