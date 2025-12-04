import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { extractProviderProfile, mergeOAuthProfile } from '@/lib/auth/profile-sync'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  if (code) {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('OAuth callback error:', error)
        return NextResponse.redirect(`${requestUrl.origin}/login?error=oauth_failed`)
      }

      // OAuth successful - sync profile data
      if (data.user) {
        try {
          // Get provider and user metadata from auth session
          const provider = data.user.app_metadata?.provider || 'unknown'
          const providerData = data.user.user_metadata || {}

          // Extract profile information from provider data
          const profileData = extractProviderProfile(provider, providerData)

          // Merge OAuth profile with existing profile (preserves user customizations)
          await mergeOAuthProfile(data.user.id, {
            email: data.user.email,
            ...profileData,
          })

          console.log(`Profile synced for user ${data.user.id} from ${provider}`)
        } catch (profileError) {
          // Log error but don't block login
          console.error('Profile sync error:', profileError)
        }
      }

      // Redirect to dashboard
      return NextResponse.redirect(`${requestUrl.origin}${next}`)
    } catch (error) {
      console.error('OAuth exchange error:', error)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=oauth_error`)
    }
  }

  // No code provided - redirect to login
  return NextResponse.redirect(`${requestUrl.origin}/login`)
}