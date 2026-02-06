/**
 * Files Hub API - Single Resource Routes
 *
 * GET - Get single file
 * PUT - Update file, toggle star, move to folder
 * DELETE - Delete file
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('files-hub')
