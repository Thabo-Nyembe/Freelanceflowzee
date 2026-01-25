import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('recruitment')

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'applications': {
        const jobId = searchParams.get('jobId')
        let query = supabase.from('job_applications').select('*')

        if (jobId) {
          query = query.eq('job_id', jobId)
        }

        const { data, error } = await query.order('created_at', { ascending: false })
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'jobs': {
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'talent_pool': {
        const { data, error } = await supabase
          .from('talent_pool')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'match_jobs': {
        const candidateId = searchParams.get('candidateId')
        const { data: candidate, error: candError } = await supabase
          .from('talent_pool')
          .select('skills, experience_years')
          .eq('id', candidateId)
          .single()

        if (candError) throw candError

        const { data: jobs, error: jobsError } = await supabase
          .from('jobs')
          .select('*')
          .eq('status', 'open')

        if (jobsError) throw jobsError

        // Simple matching based on skills overlap
        const matchedJobs = jobs?.filter(job => {
          const jobSkills = job.required_skills || []
          const candidateSkills = candidate?.skills || []
          return jobSkills.some((s: string) => candidateSkills.includes(s))
        })

        return NextResponse.json({ data: matchedJobs })
      }

      default: {
        const { data, error } = await supabase
          .from('job_applications')
          .select('*, jobs(*)')
          .order('created_at', { ascending: false })

        if (error) throw error
        return NextResponse.json({ data })
      }
    }
  } catch (error: any) {
    logger.error('Recruitment API error', { error })
    return NextResponse.json(
      { error: error.message || 'Failed to fetch recruitment data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'send_offer': {
        const { candidateId, candidateName, offerId, offerDetails } = body

        // Update offer status
        if (offerId) {
          await supabase
            .from('job_offers')
            .update({ status: 'sent', sent_at: new Date().toISOString() })
            .eq('id', offerId)
        }

        // In production: send email via SendGrid/Resend
        return NextResponse.json({
          success: true,
          message: `Offer sent to ${candidateName}`
        })
      }

      case 'schedule_interview': {
        const { candidateId, candidateName, interviewDate, interviewType } = body
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('interviews')
          .insert({
            candidate_id: candidateId,
            scheduled_date: interviewDate,
            interview_type: interviewType,
            created_by: user?.id,
            status: 'scheduled'
          })
          .select()
          .single()

        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'import_candidates': {
        const { candidates } = body
        const { data: { user } } = await supabase.auth.getUser()

        const candidatesWithUser = candidates.map((c: any) => ({
          ...c,
          added_by: user?.id,
          created_at: new Date().toISOString()
        }))

        const { data, error } = await supabase
          .from('talent_pool')
          .insert(candidatesWithUser)
          .select()

        if (error) throw error
        return NextResponse.json({ data, imported: data?.length || 0 })
      }

      case 'advance_stage': {
        const { applicationId, newStage } = body

        const { data, error } = await supabase
          .from('job_applications')
          .update({ stage: newStage, updated_at: new Date().toISOString() })
          .eq('id', applicationId)
          .select()
          .single()

        if (error) throw error
        return NextResponse.json({ data })
      }

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        )
    }
  } catch (error: any) {
    logger.error('Recruitment API error', { error })
    return NextResponse.json(
      { error: error.message || 'Operation failed' },
      { status: 500 }
    )
  }
}
