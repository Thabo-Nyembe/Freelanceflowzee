/**
 * User Management API Routes
 *
 * REST endpoints for User Management:
 * GET - List users, invitations, activity, departments, teams, stats, permissions
 * POST - Create invitation, department, team, log activity, bulk operations
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, DEMO_USER_ID } from '@/lib/demo-auth'

const logger = createSimpleLogger('user-management')
