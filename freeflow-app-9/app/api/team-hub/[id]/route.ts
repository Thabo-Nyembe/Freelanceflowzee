/**
 * Team Hub API - Single Resource Routes
 *
 * GET - Get single member or department
 * PUT - Update member or department
 * DELETE - Delete member or department
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('team-hub')
