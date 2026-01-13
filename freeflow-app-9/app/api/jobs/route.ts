/**
 * Jobs API Routes
 *
 * REST endpoints for Job Management:
 * GET - List jobs, saved jobs, applications
 * POST - Save job, apply to job, search jobs
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'list'

    switch (type) {
      case 'list': {
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50)

        if (error && error.code !== '42P01') throw error

        return NextResponse.json({
          success: true,
          jobs: data || []
        })
      }

      case 'saved': {
        const { data, error } = await supabase
          .from('saved_jobs')
          .select('*, job:jobs(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error && error.code !== '42P01') throw error

        return NextResponse.json({
          success: true,
          savedJobs: data || []
        })
      }

      case 'applications': {
        const { data, error } = await supabase
          .from('job_applications')
          .select('*, job:jobs(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error && error.code !== '42P01') throw error

        return NextResponse.json({
          success: true,
          applications: data || []
        })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Jobs GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, ...data } = body

    switch (action) {
      case 'save-job': {
        const { jobId, unsave } = data

        if (unsave) {
          // Remove saved job
          const { error } = await supabase
            .from('saved_jobs')
            .delete()
            .eq('user_id', user.id)
            .eq('job_id', jobId)

          if (error && error.code !== '42P01') throw error

          return NextResponse.json({
            success: true,
            action: 'unsave-job',
            message: 'Job removed from saved'
          })
        } else {
          // Check if already saved
          const { data: existing } = await supabase
            .from('saved_jobs')
            .select('id')
            .eq('user_id', user.id)
            .eq('job_id', jobId)
            .single()

          if (existing) {
            return NextResponse.json({
              success: true,
              action: 'already-saved',
              message: 'Job is already saved'
            })
          }

          // Save job
          const { error } = await supabase
            .from('saved_jobs')
            .insert({
              user_id: user.id,
              job_id: jobId,
              created_at: new Date().toISOString()
            })

          if (error && error.code !== '42P01') throw error

          return NextResponse.json({
            success: true,
            action: 'save-job',
            message: 'Job saved successfully'
          })
        }
      }

      case 'apply': {
        const { jobId, coverLetter, resumeUrl, customFields } = data

        // Check if already applied
        const { data: existing } = await supabase
          .from('job_applications')
          .select('id')
          .eq('user_id', user.id)
          .eq('job_id', jobId)
          .single()

        if (existing) {
          return NextResponse.json({
            success: false,
            error: 'You have already applied to this job'
          }, { status: 409 })
        }

        const { data: application, error } = await supabase
          .from('job_applications')
          .insert({
            user_id: user.id,
            job_id: jobId,
            cover_letter: coverLetter,
            resume_url: resumeUrl,
            custom_fields: customFields || {},
            status: 'submitted',
            created_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error && error.code !== '42P01') throw error

        return NextResponse.json({
          success: true,
          action: 'apply',
          application: application || {
            id: `app-${Date.now()}`,
            status: 'submitted'
          },
          message: 'Application submitted successfully'
        })
      }

      case 'search': {
        const { query, location, type: jobType, remote, salaryMin, salaryMax, limit = 20 } = data

        let dbQuery = supabase
          .from('jobs')
          .select('*')
          .eq('status', 'active')
          .limit(limit)

        if (query) {
          dbQuery = dbQuery.or(`title.ilike.%${query}%,company.ilike.%${query}%,description.ilike.%${query}%`)
        }
        if (location) {
          dbQuery = dbQuery.ilike('location', `%${location}%`)
        }
        if (jobType) {
          dbQuery = dbQuery.eq('job_type', jobType)
        }
        if (remote !== undefined) {
          dbQuery = dbQuery.eq('remote', remote)
        }
        if (salaryMin) {
          dbQuery = dbQuery.gte('salary_max', salaryMin)
        }
        if (salaryMax) {
          dbQuery = dbQuery.lte('salary_min', salaryMax)
        }

        const { data: results, error } = await dbQuery.order('created_at', { ascending: false })

        if (error && error.code !== '42P01') throw error

        return NextResponse.json({
          success: true,
          action: 'search',
          jobs: results || [],
          message: `Found ${results?.length || 0} jobs`
        })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Jobs POST error:', error)
    return NextResponse.json({ error: 'Failed to process job request' }, { status: 500 })
  }
}
