/**
 * Directory Attribute Mappings API
 *
 * GET /api/auth/directory/mappings - List attribute mappings
 * POST /api/auth/directory/mappings - Create attribute mapping
 * PUT /api/auth/directory/mappings - Update attribute mappings (batch)
 * DELETE /api/auth/directory/mappings - Delete attribute mapping
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * List attribute mappings for a connection
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const connectionId = searchParams.get('connectionId')

    if (!connectionId) {
      return NextResponse.json(
        { error: 'connectionId is required' },
        { status: 400 }
      )
    }

    // Get connection and verify access
    const { data: connection } = await supabase
      .from('directory_connections')
      .select('organization_id')
      .eq('id', connectionId)
      .single()

    if (!connection) {
      return NextResponse.json(
        { error: 'Connection not found' },
        { status: 404 }
      )
    }

    // Verify user has admin access
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', connection.organization_id)
      .eq('user_id', user.id)
      .single()

    if (!membership || !['admin', 'owner'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Get mappings
    const { data: mappings, error: mappingsError } = await supabase
      .from('directory_attribute_mappings')
      .select('*')
      .eq('connection_id', connectionId)
      .order('source_attribute')

    if (mappingsError) {
      throw mappingsError
    }

    // Get default mappings for the provider
    const { data: connDetails } = await supabase
      .from('directory_connections')
      .select('provider')
      .eq('id', connectionId)
      .single()

    const defaultMappings = getDefaultMappings(connDetails?.provider || 'azure_ad')

    return NextResponse.json({
      success: true,
      mappings: mappings || [],
      defaultMappings
    })
  } catch (error) {
    console.error('Get attribute mappings error:', error)
    return NextResponse.json(
      { error: 'Failed to get attribute mappings' },
      { status: 500 }
    )
  }
}

/**
 * Create a new attribute mapping
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      connectionId,
      sourceAttribute,
      targetAttribute,
      transform,
      isRequired = false
    } = body

    if (!connectionId || !sourceAttribute || !targetAttribute) {
      return NextResponse.json(
        { error: 'connectionId, sourceAttribute, and targetAttribute are required' },
        { status: 400 }
      )
    }

    // Validate target attribute
    const validTargets = [
      'email', 'name', 'first_name', 'last_name', 'phone',
      'avatar_url', 'job_title', 'department', 'manager_id',
      'location', 'timezone', 'locale', 'metadata'
    ]
    if (!validTargets.includes(targetAttribute)) {
      return NextResponse.json(
        { error: `Invalid target attribute. Valid values: ${validTargets.join(', ')}` },
        { status: 400 }
      )
    }

    // Get connection and verify access
    const { data: connection } = await supabase
      .from('directory_connections')
      .select('organization_id')
      .eq('id', connectionId)
      .single()

    if (!connection) {
      return NextResponse.json(
        { error: 'Connection not found' },
        { status: 404 }
      )
    }

    // Verify user has admin access
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', connection.organization_id)
      .eq('user_id', user.id)
      .single()

    if (!membership || !['admin', 'owner'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Check for duplicate mapping
    const { data: existing } = await supabase
      .from('directory_attribute_mappings')
      .select('id')
      .eq('connection_id', connectionId)
      .eq('target_attribute', targetAttribute)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: `Mapping for ${targetAttribute} already exists` },
        { status: 409 }
      )
    }

    // Create mapping
    const { data: mapping, error: createError } = await supabase
      .from('directory_attribute_mappings')
      .insert({
        connection_id: connectionId,
        source_attribute: sourceAttribute,
        target_attribute: targetAttribute,
        transform: transform || null,
        is_required: isRequired
      })
      .select()
      .single()

    if (createError) {
      throw createError
    }

    return NextResponse.json({
      success: true,
      mapping
    }, { status: 201 })
  } catch (error) {
    console.error('Create attribute mapping error:', error)
    return NextResponse.json(
      { error: 'Failed to create attribute mapping' },
      { status: 500 }
    )
  }
}

/**
 * Update attribute mappings (batch update)
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { connectionId, mappings } = body

    if (!connectionId || !mappings || !Array.isArray(mappings)) {
      return NextResponse.json(
        { error: 'connectionId and mappings array are required' },
        { status: 400 }
      )
    }

    // Get connection and verify access
    const { data: connection } = await supabase
      .from('directory_connections')
      .select('organization_id')
      .eq('id', connectionId)
      .single()

    if (!connection) {
      return NextResponse.json(
        { error: 'Connection not found' },
        { status: 404 }
      )
    }

    // Verify user has admin access
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', connection.organization_id)
      .eq('user_id', user.id)
      .single()

    if (!membership || !['admin', 'owner'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Delete existing mappings
    await supabase
      .from('directory_attribute_mappings')
      .delete()
      .eq('connection_id', connectionId)

    // Insert new mappings
    if (mappings.length > 0) {
      const mappingsToInsert = mappings.map((m: {
        sourceAttribute: string
        targetAttribute: string
        transform?: string
        isRequired?: boolean
      }) => ({
        connection_id: connectionId,
        source_attribute: m.sourceAttribute,
        target_attribute: m.targetAttribute,
        transform: m.transform || null,
        is_required: m.isRequired || false
      }))

      const { error: insertError } = await supabase
        .from('directory_attribute_mappings')
        .insert(mappingsToInsert)

      if (insertError) {
        throw insertError
      }
    }

    // Get updated mappings
    const { data: updatedMappings } = await supabase
      .from('directory_attribute_mappings')
      .select('*')
      .eq('connection_id', connectionId)

    return NextResponse.json({
      success: true,
      mappings: updatedMappings
    })
  } catch (error) {
    console.error('Update attribute mappings error:', error)
    return NextResponse.json(
      { error: 'Failed to update attribute mappings' },
      { status: 500 }
    )
  }
}

/**
 * Delete an attribute mapping
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const mappingId = searchParams.get('id')

    if (!mappingId) {
      return NextResponse.json(
        { error: 'Mapping ID is required' },
        { status: 400 }
      )
    }

    // Get mapping and connection
    const { data: mapping } = await supabase
      .from('directory_attribute_mappings')
      .select('connection_id')
      .eq('id', mappingId)
      .single()

    if (!mapping) {
      return NextResponse.json(
        { error: 'Mapping not found' },
        { status: 404 }
      )
    }

    // Get connection
    const { data: connection } = await supabase
      .from('directory_connections')
      .select('organization_id')
      .eq('id', mapping.connection_id)
      .single()

    if (!connection) {
      return NextResponse.json(
        { error: 'Connection not found' },
        { status: 404 }
      )
    }

    // Verify user has admin access
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', connection.organization_id)
      .eq('user_id', user.id)
      .single()

    if (!membership || !['admin', 'owner'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Delete mapping
    const { error: deleteError } = await supabase
      .from('directory_attribute_mappings')
      .delete()
      .eq('id', mappingId)

    if (deleteError) {
      throw deleteError
    }

    return NextResponse.json({
      success: true,
      message: 'Mapping deleted'
    })
  } catch (error) {
    console.error('Delete attribute mapping error:', error)
    return NextResponse.json(
      { error: 'Failed to delete attribute mapping' },
      { status: 500 }
    )
  }
}

/**
 * Get default attribute mappings for a provider
 */
function getDefaultMappings(provider: string): Array<{
  sourceAttribute: string
  targetAttribute: string
  description: string
}> {
  const azureAdMappings = [
    { sourceAttribute: 'mail', targetAttribute: 'email', description: 'User email address' },
    { sourceAttribute: 'displayName', targetAttribute: 'name', description: 'Full display name' },
    { sourceAttribute: 'givenName', targetAttribute: 'first_name', description: 'First name' },
    { sourceAttribute: 'surname', targetAttribute: 'last_name', description: 'Last name' },
    { sourceAttribute: 'mobilePhone', targetAttribute: 'phone', description: 'Mobile phone number' },
    { sourceAttribute: 'jobTitle', targetAttribute: 'job_title', description: 'Job title' },
    { sourceAttribute: 'department', targetAttribute: 'department', description: 'Department' },
    { sourceAttribute: 'officeLocation', targetAttribute: 'location', description: 'Office location' }
  ]

  const googleMappings = [
    { sourceAttribute: 'primaryEmail', targetAttribute: 'email', description: 'Primary email' },
    { sourceAttribute: 'name.fullName', targetAttribute: 'name', description: 'Full name' },
    { sourceAttribute: 'name.givenName', targetAttribute: 'first_name', description: 'First name' },
    { sourceAttribute: 'name.familyName', targetAttribute: 'last_name', description: 'Last name' },
    { sourceAttribute: 'phones[0].value', targetAttribute: 'phone', description: 'Primary phone' },
    { sourceAttribute: 'organizations[0].title', targetAttribute: 'job_title', description: 'Job title' },
    { sourceAttribute: 'organizations[0].department', targetAttribute: 'department', description: 'Department' },
    { sourceAttribute: 'thumbnailPhotoUrl', targetAttribute: 'avatar_url', description: 'Profile photo' }
  ]

  const oktaMappings = [
    { sourceAttribute: 'profile.email', targetAttribute: 'email', description: 'Email address' },
    { sourceAttribute: 'profile.displayName', targetAttribute: 'name', description: 'Display name' },
    { sourceAttribute: 'profile.firstName', targetAttribute: 'first_name', description: 'First name' },
    { sourceAttribute: 'profile.lastName', targetAttribute: 'last_name', description: 'Last name' },
    { sourceAttribute: 'profile.mobilePhone', targetAttribute: 'phone', description: 'Mobile phone' },
    { sourceAttribute: 'profile.title', targetAttribute: 'job_title', description: 'Job title' },
    { sourceAttribute: 'profile.department', targetAttribute: 'department', description: 'Department' }
  ]

  const ldapMappings = [
    { sourceAttribute: 'mail', targetAttribute: 'email', description: 'Email address' },
    { sourceAttribute: 'cn', targetAttribute: 'name', description: 'Common name' },
    { sourceAttribute: 'givenName', targetAttribute: 'first_name', description: 'First name' },
    { sourceAttribute: 'sn', targetAttribute: 'last_name', description: 'Surname' },
    { sourceAttribute: 'telephoneNumber', targetAttribute: 'phone', description: 'Phone number' },
    { sourceAttribute: 'title', targetAttribute: 'job_title', description: 'Job title' },
    { sourceAttribute: 'department', targetAttribute: 'department', description: 'Department' }
  ]

  switch (provider) {
    case 'azure_ad':
      return azureAdMappings
    case 'google_workspace':
      return googleMappings
    case 'okta':
      return oktaMappings
    case 'onelogin':
      return oktaMappings // Similar to Okta
    case 'ldap':
      return ldapMappings
    default:
      return azureAdMappings
  }
}
