/**
 * Document Management API - Single Resource Routes
 *
 * GET - Get single folder, document
 * PUT - Update folder, document, toggle star, move, resolve comment, update share
 * DELETE - Delete folder, document, comment, share
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('document-management')
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'
