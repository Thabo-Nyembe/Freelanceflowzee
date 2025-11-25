import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard/overview'

  if (code) {
    try {
      const supabase = await createClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('OAuth callback error:', error)
        return NextResponse.redirect(`${requestUrl.origin}/login?error=oauth_failed`)
      }

      // OAuth successful - redirect to dashboard
      return NextResponse.redirect(`${requestUrl.origin}${next}`)
    } catch (error) {
      console.error('OAuth exchange error:', error)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=oauth_error`)
    }
  }

  // No code provided - redirect to login
  return NextResponse.redirect(`${requestUrl.origin}/login`)
}