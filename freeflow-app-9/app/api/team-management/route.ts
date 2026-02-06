/**
 * Team Management API Routes
 *
 * REST endpoints for Team Management:
 * GET - User roles, role permissions, user permissions, users by role, role summary
 * POST - Create role, permission, grant permission, batch grant permissions
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('team-management')
