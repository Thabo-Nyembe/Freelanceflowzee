/**
 * Desktop App API - Single Resource Routes
 *
 * GET - Get single project, build, distribution, framework
 * PUT - Update project, build, distribution, archive/unarchive project
 * DELETE - Delete project, build, distribution
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'
