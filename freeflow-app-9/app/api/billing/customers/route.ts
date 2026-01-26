/**
 * Billing Customers API
 *
 * GET /api/billing/customers - List customers or get current user's billing info
 * POST /api/billing/customers - Create or sync customer to Lago
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { lagoBilling, type LagoCustomer } from '@/lib/billing/lago'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('billing-customers')

/**
 * Get customer billing information
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
    const customerId = searchParams.get('customerId')

    // If specific customer requested, check permissions
    const targetCustomerId = customerId || user.id

    // Check if user has permission to view this customer
    if (customerId && customerId !== user.id) {
      // Check if user is admin of the organization
      const { data: membership } = await supabase
        .from('organization_members')
        .select('role, organization_id')
        .eq('user_id', user.id)
        .in('role', ['admin', 'owner'])
        .single()

      if (!membership) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        )
      }

      // Verify the target customer is in the same org
      const { data: targetMembership } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', customerId)
        .eq('organization_id', membership.organization_id)
        .single()

      if (!targetMembership) {
        return NextResponse.json(
          { error: 'Customer not found in organization' },
          { status: 404 }
        )
      }
    }

    try {
      // Get customer from Lago
      const { customer } = await lagoBilling.getCustomer(targetCustomerId)

      // Get current usage
      const { customer_usage } = await lagoBilling.getCurrentUsage(targetCustomerId)

      // Get subscriptions
      const { subscriptions } = await lagoBilling.listSubscriptions(targetCustomerId)

      // Get wallets
      const { wallets } = await lagoBilling.listWallets(targetCustomerId)

      // Get recent invoices
      const { invoices } = await lagoBilling.listInvoices(targetCustomerId, undefined, undefined, 1, 10)

      return NextResponse.json({
        success: true,
        customer,
        current_usage: customer_usage,
        subscriptions,
        wallets,
        recent_invoices: invoices,
      })
    } catch {
      // Customer doesn't exist in Lago yet - return local data
      const { data: userData } = await supabase
        .from('users')
        .select('id, email, name, created_at')
        .eq('id', targetCustomerId)
        .single()

      return NextResponse.json({
        success: true,
        customer: null,
        local_user: userData,
        message: 'Customer not synced to billing system yet',
      })
    }
  } catch (error) {
    logger.error('Get billing customer error', { error })
    return NextResponse.json(
      { error: 'Failed to get billing customer' },
      { status: 500 }
    )
  }
}

/**
 * Create or sync customer to Lago
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
    const { userId, sync_only } = body

    // If syncing another user, check permissions
    const targetUserId = userId || user.id
    if (userId && userId !== user.id) {
      const { data: membership } = await supabase
        .from('organization_members')
        .select('role')
        .eq('user_id', user.id)
        .in('role', ['admin', 'owner'])
        .single()

      if (!membership) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        )
      }
    }

    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, name, organization_id')
      .eq('id', targetUserId)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get organization data if applicable
    let orgData = null
    if (userData.organization_id) {
      const { data: org } = await supabase
        .from('organizations')
        .select('id, name, billing_email')
        .eq('id', userData.organization_id)
        .single()
      orgData = org
    }

    // Check if customer exists in Lago
    let customer: LagoCustomer
    try {
      const response = await lagoBilling.getCustomer(targetUserId)
      customer = response.customer

      if (!sync_only) {
        // Update existing customer
        const updated = await lagoBilling.updateCustomer(targetUserId, {
          name: userData.name || userData.email,
          email: userData.email,
          metadata: [
            { key: 'user_id', value: targetUserId },
            ...(orgData ? [
              { key: 'organization_id', value: userData.organization_id },
              { key: 'organization_name', value: orgData.name },
            ] : []),
          ],
        })
        customer = updated.customer
      }
    } catch {
      // Create new customer
      const created = await lagoBilling.createCustomer({
        external_id: targetUserId,
        name: userData.name || userData.email,
        email: orgData?.billing_email || userData.email,
        currency: 'USD',
        timezone: 'UTC',
        metadata: [
          { key: 'user_id', value: targetUserId },
          ...(orgData ? [
            { key: 'organization_id', value: userData.organization_id },
            { key: 'organization_name', value: orgData.name },
          ] : []),
        ],
      })
      customer = created.customer
    }

    // Store sync record
    await supabase.from('billing_customers').upsert({
      user_id: targetUserId,
      lago_customer_id: customer.external_id,
      email: customer.email,
      name: customer.name,
      currency: customer.currency || 'USD',
      synced_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id',
    })

    return NextResponse.json({
      success: true,
      customer,
    }, { status: sync_only ? 200 : 201 })
  } catch (error) {
    logger.error('Create billing customer error', { error })
    return NextResponse.json(
      { error: 'Failed to create billing customer' },
      { status: 500 }
    )
  }
}
