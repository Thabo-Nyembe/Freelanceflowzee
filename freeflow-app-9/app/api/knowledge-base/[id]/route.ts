/**
 * Knowledge Base API - Single Resource Routes
 *
 * GET - Get single article, video, category
 * PUT - Update article, video, category, FAQ
 * DELETE - Delete article, video, category, FAQ, bookmark
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'
