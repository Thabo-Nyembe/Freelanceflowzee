/**
 * Feature Roadmap API - Single Resource Routes
 *
 * GET - Get single feature, request, updates
 * PUT - Update request status (admin)
 * DELETE - (Reserved for admin operations)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('feature-roadmap')
