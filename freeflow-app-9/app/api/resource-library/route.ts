/**
 * Resource Library API Routes
 *
 * REST endpoints for Resource Library:
 * GET - List resources, categories, collections, downloads, bookmarks, tags, stats
 * POST - Create resource, collection, download, rating, comment, bookmark
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('resource-library')
