import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const roleId = searchParams.get('role_id')
    const resource = searchParams.get('resource')

    // Get roles
    const rolesQuery = supabase
      .from('roles')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('name', { ascending: true })

    const { data: roles, error: rolesError } = await rolesQuery

    if (rolesError) throw rolesError

    // Get permissions
    let permissionsQuery = supabase
      .from('permissions')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)

    if (roleId) {
      permissionsQuery = permissionsQuery.eq('role_id', roleId)
    }
    if (resource) {
      permissionsQuery = permissionsQuery.eq('resource', resource)
    }

    const { data: permissions, error: permissionsError } = await permissionsQuery

    if (permissionsError) throw permissionsError

    // Get team members with their roles
    const { data: teamMembers, error: teamError } = await supabase
      .from('team_members')
      .select('*, roles(name)')
      .eq('user_id', user.id)
      .is('deleted_at', null)

    if (teamError) throw teamError

    return NextResponse.json({
      roles,
      permissions,
      teamMembers
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, ...data } = body

    if (type === 'role') {
      const { data: role, error } = await supabase
        .from('roles')
        .insert({
          ...data,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return NextResponse.json({ data: role }, { status: 201 })
    } else if (type === 'permission') {
      const { data: permission, error } = await supabase
        .from('permissions')
        .insert({
          ...data,
          user_id: user.id,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return NextResponse.json({ data: permission }, { status: 201 })
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, type, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const table = type === 'role' ? 'roles' : 'permissions'

    const { data, error } = await supabase
      .from(table)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    const type = searchParams.get('type')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const table = type === 'role' ? 'roles' : 'permissions'

    const { error } = await supabase
      .from(table)
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
