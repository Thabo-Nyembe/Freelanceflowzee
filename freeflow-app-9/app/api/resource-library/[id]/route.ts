/**
 * Resource Library API - Single Resource Routes
 *
 * GET - Get single resource, category, collection
 * PUT - Update resource, collection, comment
 * DELETE - Delete resource, collection, comment, bookmark, remove from collection
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('resource-library')
