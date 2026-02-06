/**
 * Calendar Scheduling API Routes
 *
 * REST endpoints for Calendar & Scheduling:
 * GET - List events, availability, booking types, bookings, syncs, stats, available slots
 * POST - Create event, availability, booking type, booking, calendar sync
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('calendar-scheduling')
