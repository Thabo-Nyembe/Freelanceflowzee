/**
 * Calendar Scheduling API - Single Resource Routes
 *
 * GET - Get single event, booking type, booking
 * PUT - Update event, availability, booking type, booking, confirm/cancel/reschedule
 * DELETE - Delete event, availability, booking type, calendar sync
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('calendar-scheduling')
