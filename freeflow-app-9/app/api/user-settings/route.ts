/**
 * User Settings API Routes
 *
 * REST endpoints for User Settings Management:
 * GET - Profile, notification settings, security settings, appearance settings, all settings
 * POST - Create profile, notification settings, security settings, appearance settings
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('user-settings')
