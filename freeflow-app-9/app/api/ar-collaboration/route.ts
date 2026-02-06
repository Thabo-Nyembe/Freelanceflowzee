/**
 * AR Collaboration API Routes
 *
 * REST endpoints for AR Collaboration:
 * GET - List sessions, participants, objects, interactions, recordings, stats
 * POST - Create session, participant, object, interaction, recording
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('ar-collaboration')
