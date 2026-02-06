/**
 * Notification Settings API Routes
 *
 * REST endpoints for Notification Settings:
 * GET - Preferences, schedules, templates, delivery logs, push tokens, unsubscribes, stats
 * POST - Create preferences, schedules, templates, logs, push tokens, unsubscribes
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('notification-settings')
