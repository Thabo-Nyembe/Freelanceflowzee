import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('features-notify')

/**
 * POST /api/features/notify - Subscribe to feature launch notifications
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const body = await request.json()
        const { email, user_id, feature, source } = body

        // Validate input
        if (!email && !user_id) {
            return NextResponse.json({
                success: false,
                error: 'Email or user ID required'
            }, { status: 400 })
        }

        // Insert notification subscription
        const { data, error } = await supabase
            .from('feature_notifications')
            .insert({
                user_id,
                email,
                feature: feature || 'general',
                source: source || 'manual',
                subscribed_at: new Date().toISOString(),
                status: 'active'
            })
            .select()
            .single()

        if (error) {
            // If table doesn't exist, create a fallback notification log
            if (error.code === '42P01') {
                // Table doesn't exist - log to console for now
                logger.info('Feature notification subscription', { email, user_id, feature, source })
                return NextResponse.json({
                    success: true,
                    message: 'Subscription received (logging mode)',
                    data: { email, feature }
                })
            }
            throw error
        }

        return NextResponse.json({
            success: true,
            message: 'Successfully subscribed to notifications',
            data
        })
    } catch (error) {
        logger.error('Feature notify error', { error })
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to subscribe'
        }, { status: 500 })
    }
}
