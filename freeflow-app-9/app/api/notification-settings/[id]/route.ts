/**
 * Notification Settings API - Single Resource Routes
 *
 * GET - Get single schedule, template, delivery log, push token
 * PUT - Update preference, schedule, template, delivery log, push token, unsubscribe
 * DELETE - Delete preference, schedule, template, push token
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('notification-settings')
