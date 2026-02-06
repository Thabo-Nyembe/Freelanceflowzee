/**
 * Files Hub API Routes
 *
 * REST endpoints for File Management:
 * GET - List files, folders, get stats
 * POST - Create file, folder
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
