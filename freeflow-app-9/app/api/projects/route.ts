import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get current user
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch projects for the user
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Projects fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
    }

    return NextResponse.json(projects)
  } catch (error) {
    console.error('Projects API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Basic validation
    if (!body.title || !body.description) {
      return NextResponse.json({ 
        error: 'Title and description are required',
        details: 'Both title and description must be provided'
      }, { status: 400 })
    }

    // Create project data
    const projectData = {
      title: body.title,
      description: body.description,
      client_name: body.client_name || null,
      client_email: body.client_email || null,
      budget: body.budget || 0,
      priority: body.priority || 'medium',
      start_date: body.start_date || null,
      end_date: body.end_date || null,
      status: 'active',
      progress: 0,
      spent: 0,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Insert project into database
    const { data: project, error } = await supabase
      .from('projects')
      .insert([projectData])
      .select()
      .single()

    if (error) {
      console.error('Project creation error:', error)
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
    }

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('Projects API POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 