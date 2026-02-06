/**
 * Team Management API - Single Resource Routes
 *
 * GET - Get single role, role permission, user permission
 * PUT - Update role, role permission, revoke user permission
 * DELETE - Delete role, role permission, user permission, deactivate role
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('team-management')
