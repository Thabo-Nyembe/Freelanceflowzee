/**
 * Workflow Builder API - Single Resource Routes
 *
 * GET - Get single workflow
 * PUT - Update workflow, action, reorder actions
 * DELETE - Delete workflow, action
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'
