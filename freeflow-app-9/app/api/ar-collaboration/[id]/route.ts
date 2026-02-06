/**
 * AR Collaboration API - Single Resource Routes
 *
 * GET - Get single session
 * PUT - Update session, participant, object, recording
 * DELETE - Delete session, object
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('ar-collaboration')
