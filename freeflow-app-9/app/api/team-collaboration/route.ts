/**
 * Team Collaboration API Routes
 *
 * REST endpoints for Team Management and Collaboration:
 * GET - Teams, members, invites, projects, channels, messages, activity, stats
 * POST - Create teams, invite members, add projects, create channels, send messages
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('team-collaboration')
