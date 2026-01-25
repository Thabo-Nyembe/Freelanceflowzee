import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('white-label')

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'export': {
        const format = searchParams.get('format') || 'json'
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('white_label_config')
          .select('*')
          .eq('user_id', user?.id)
          .single()

        if (error && error.code !== 'PGRST116') throw error

        if (format === 'css') {
          const config = data || {}
          const css = `:root {
  --primary-color: ${config.primary_color || '#3B82F6'};
  --secondary-color: ${config.secondary_color || '#8B5CF6'};
  --background-color: ${config.background_color || '#ffffff'};
  --text-color: ${config.text_color || '#1F2937'};
  --border-radius: ${config.border_radius || '8px'};
  --font-family: ${config.font_family || 'Inter, sans-serif'};
}`
          return new NextResponse(css, {
            headers: { 'Content-Type': 'text/css' }
          })
        }

        return NextResponse.json({ data: data || {} })
      }

      case 'verify-domain': {
        const domain = searchParams.get('domain')
        // In production, this would do actual DNS verification
        const isValid = domain && domain.includes('.')
        return NextResponse.json({
          verified: isValid,
          domain,
          status: isValid ? 'verified' : 'invalid'
        })
      }

      default: {
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('white_label_config')
          .select('*')
          .eq('user_id', user?.id)
          .single()

        if (error && error.code !== 'PGRST116') throw error
        return NextResponse.json({ data: data || {} })
      }
    }
  } catch (error: any) {
    logger.error('White Label API error', { error })
    return NextResponse.json(
      { error: error.message || 'Failed to fetch configuration' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'save': {
        const { config } = body
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('white_label_config')
          .upsert({
            user_id: user?.id,
            brand_name: config.brandName,
            display_name: config.displayName,
            description: config.description,
            primary_color: config.primaryColor,
            secondary_color: config.secondaryColor,
            background_color: config.backgroundColor,
            text_color: config.textColor,
            border_radius: config.borderRadius,
            font_family: config.fontFamily,
            logo_url: config.logoUrl,
            favicon_url: config.faviconUrl,
            custom_domain: config.customDomain?.domain,
            custom_css: config.customCss,
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error) throw error
        return NextResponse.json({ data, success: true })
      }

      case 'upload_logo': {
        const { logoType, logoData } = body
        const { data: { user } } = await supabase.auth.getUser()

        // In production, this would upload to storage
        const logoUrl = `https://freeflow.app/logos/${user?.id}/${logoType}.png`

        const { error } = await supabase
          .from('white_label_config')
          .update({
            [`${logoType}_url`]: logoUrl,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user?.id)

        if (error) throw error
        return NextResponse.json({ success: true, url: logoUrl })
      }

      case 'apply_template': {
        const { template } = body
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('white_label_config')
          .upsert({
            user_id: user?.id,
            brand_name: template.name,
            display_name: template.name,
            description: template.description,
            primary_color: template.primaryColor,
            secondary_color: template.secondaryColor,
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error) throw error
        return NextResponse.json({ data, success: true })
      }

      case 'verify_domain': {
        const { domain } = body
        // In production, this would initiate DNS verification
        const isValid = domain && domain.includes('.') && domain.length > 3
        return NextResponse.json({
          verified: isValid,
          domain,
          status: isValid ? 'pending_verification' : 'invalid',
          dnsRecords: isValid ? [
            { type: 'CNAME', name: domain, value: 'custom.freeflow.app' },
            { type: 'TXT', name: `_verify.${domain}`, value: `freeflow-verify=${Date.now()}` }
          ] : []
        })
      }

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        )
    }
  } catch (error: any) {
    logger.error('White Label API error', { error })
    return NextResponse.json(
      { error: error.message || 'Operation failed' },
      { status: 500 }
    )
  }
}
