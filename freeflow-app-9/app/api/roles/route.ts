import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'list': {
        const { data, error } = await supabase
          .from('roles')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'audit': {
        const { data: roles, error } = await supabase
          .from('roles')
          .select('*, role_permissions(*)')

        if (error) throw error

        const auditResults = {
          totalRoles: roles?.length || 0,
          permissionsCounts: roles?.map(r => ({
            role: r.name,
            permissions: r.role_permissions?.length || 0
          })),
          lastAudit: new Date().toISOString(),
          status: 'verified'
        }

        return NextResponse.json({ data: auditResults })
      }

      case 'export': {
        const format = searchParams.get('format') || 'json'
        const { data, error } = await supabase
          .from('roles')
          .select('*, role_permissions(*)')

        if (error) throw error

        if (format === 'csv') {
          const csvRows = ['Role,Description,Permissions Count,Created At']
          data?.forEach(role => {
            csvRows.push(`"${role.name}","${role.description || ''}",${role.role_permissions?.length || 0},"${role.created_at}"`)
          })
          return new NextResponse(csvRows.join('\n'), {
            headers: {
              'Content-Type': 'text/csv',
              'Content-Disposition': `attachment; filename="roles-export-${Date.now()}.csv"`
            }
          })
        }

        return NextResponse.json({ data })
      }

      default: {
        const { data, error } = await supabase
          .from('roles')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        return NextResponse.json({ data })
      }
    }
  } catch (error: any) {
    console.error('Roles API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch roles' },
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
      case 'create': {
        const { name, description, permissions } = body
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('roles')
          .insert({
            name,
            description,
            created_by: user?.id,
            created_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error) throw error

        // Insert permissions if provided
        if (permissions?.length && data?.id) {
          const permissionRows = permissions.map((p: string) => ({
            role_id: data.id,
            permission: p
          }))
          await supabase.from('role_permissions').insert(permissionRows)
        }

        return NextResponse.json({ data })
      }

      case 'update': {
        const { roleId, name, description, permissions } = body

        const { data, error } = await supabase
          .from('roles')
          .update({
            name,
            description,
            updated_at: new Date().toISOString()
          })
          .eq('id', roleId)
          .select()
          .single()

        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'delete': {
        const { roleId } = body

        // Delete permissions first
        await supabase
          .from('role_permissions')
          .delete()
          .eq('role_id', roleId)

        const { error } = await supabase
          .from('roles')
          .delete()
          .eq('id', roleId)

        if (error) throw error
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        )
    }
  } catch (error: any) {
    console.error('Roles API error:', error)
    return NextResponse.json(
      { error: error.message || 'Operation failed' },
      { status: 500 }
    )
  }
}
