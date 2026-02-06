/**
 * Mobile App API - Single Resource Routes
 *
 * GET - Get single device, screen, build, template, test
 * PUT - Update device, screen, build, template, test, toggle favorite
 * DELETE - Delete device, screen, build, template, test
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('mobile-app')
