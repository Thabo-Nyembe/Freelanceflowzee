/**
 * User Management API - Single Resource Routes
 *
 * GET - Get single user, user activity
 * PUT - Update user role, deactivate, reactivate, update department/team, update permissions
 * DELETE - Delete user, cancel invitation, delete department/team
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, DEMO_USER_ID } from '@/lib/demo-auth'

const logger = createSimpleLogger('user-management')
