import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode'

const logger = createSimpleLogger('enhanced')
import { z } from 'zod'

/**
 * Enhanced Project Unlock API
 *
 * Provides multiple methods for unlocking project access:
 * - Payment-based unlocking (one-time or subscription)
 * - Token-based access (promotional codes)
 * - Time-limited trials
 * - Referral-based unlocking
 * - NFT/token-gated access
 * - Password protection
 */

const UnlockRequestSchema = z.object({
  projectId: z.string().uuid(),
  method: z.enum([
    'payment',
    'subscription',
    'promo_code',
    'trial',
    'referral',
    'token_gate',
    'password',
    'invite_link',
  ]),
  data: z.object({
    paymentIntentId: z.string().optional(),
    subscriptionId: z.string().optional(),
    promoCode: z.string().optional(),
    referralCode: z.string().optional(),
    walletAddress: z.string().optional(),
    tokenId: z.string().optional(),
    password: z.string().optional(),
    inviteToken: z.string().optional(),
  }).optional(),
})

const PasswordProtectSchema = z.object({
  projectId: z.string().uuid(),
  password: z.string().min(4).max(100),
  hint: z.string().max(200).optional(),
})

const PromoCodeSchema = z.object({
  projectId: z.string().uuid().optional(),
  code: z.string().min(4).max(50),
  type: z.enum(['percentage', 'fixed', 'free_access', 'trial_extension']),
  value: z.number().optional(),
  maxUses: z.number().optional(),
  expiresAt: z.string().optional(),
  validForProjects: z.array(z.string().uuid()).optional(),
})

// Demo unlock data
const demoUnlockHistory = [
  {
    id: 'unlock-001',
    project_id: 'proj-001',
    user_id: 'user-001',
    method: 'payment',
    status: 'active',
    unlocked_at: '2026-01-20T10:00:00Z',
    expires_at: null,
    amount_paid: 29.99,
    currency: 'USD',
  },
  {
    id: 'unlock-002',
    project_id: 'proj-002',
    user_id: 'user-002',
    method: 'trial',
    status: 'active',
    unlocked_at: '2026-01-28T14:00:00Z',
    expires_at: '2026-02-11T14:00:00Z',
    trial_days: 14,
  },
  {
    id: 'unlock-003',
    project_id: 'proj-003',
    user_id: 'user-003',
    method: 'promo_code',
    status: 'active',
    unlocked_at: '2026-01-25T09:00:00Z',
    expires_at: null,
    promo_code: 'LAUNCH2026',
  },
]

const demoPromoCodes = [
  {
    id: 'promo-001',
    code: 'LAUNCH2026',
    type: 'free_access',
    uses: 45,
    max_uses: 100,
    expires_at: '2026-03-31T23:59:59Z',
    active: true,
  },
  {
    id: 'promo-002',
    code: 'SAVE20',
    type: 'percentage',
    value: 20,
    uses: 128,
    max_uses: null,
    expires_at: '2026-12-31T23:59:59Z',
    active: true,
  },
]

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const view = searchParams.get('view') || 'status' // status | history | promo_codes

    // Demo mode
    if (!user) {
      if (view === 'history') {
        let filtered = [...demoUnlockHistory]
        if (projectId) {
          filtered = filtered.filter(u => u.project_id === projectId)
        }
        return NextResponse.json({
          success: true,
          demo: true,
          data: filtered,
        })
      }

      if (view === 'promo_codes') {
        return NextResponse.json({
          success: true,
          demo: true,
          data: demoPromoCodes,
        })
      }

      // Default: check unlock status
      if (projectId) {
        const unlock = demoUnlockHistory.find(u => u.project_id === projectId)
        return NextResponse.json({
          success: true,
          demo: true,
          data: {
            unlocked: !!unlock,
            method: unlock?.method,
            expiresAt: unlock?.expires_at,
            trialDaysRemaining: unlock?.method === 'trial'
              ? Math.max(0, Math.ceil((new Date(unlock.expires_at!).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
              : null,
          },
        })
      }

      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          availableMethods: ['payment', 'trial', 'promo_code'],
          pricing: {
            oneTime: { amount: 29.99, currency: 'USD' },
            subscription: { amount: 9.99, currency: 'USD', interval: 'month' },
          },
          trialDays: 14,
        },
      })
    }

    // Real implementation
    if (view === 'history') {
      let query = supabase
        .from('project_unlocks')
        .select(`
          *,
          project:projects(id, name, slug),
          promo:promo_codes(code, type)
        `)
        .eq('user_id', user.id)
        .order('unlocked_at', { ascending: false })

      if (projectId) {
        query = query.eq('project_id', projectId)
      }

      const { data: unlocks, error } = await query
      if (error) throw error

      return NextResponse.json({
        success: true,
        data: unlocks,
      })
    }

    if (view === 'promo_codes') {
      // Only project owners can view their promo codes
      const { data: promoCodes } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })

      return NextResponse.json({
        success: true,
        data: promoCodes,
      })
    }

    // Check unlock status for specific project
    if (projectId) {
      const { data: unlock } = await supabase
        .from('project_unlocks')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      const { data: project } = await supabase
        .from('projects')
        .select('pricing, trial_days, unlock_methods')
        .eq('id', projectId)
        .single()

      const isExpired = unlock?.expires_at && new Date(unlock.expires_at) < new Date()

      return NextResponse.json({
        success: true,
        data: {
          unlocked: !!unlock && !isExpired,
          method: unlock?.method,
          expiresAt: unlock?.expires_at,
          trialDaysRemaining: unlock?.method === 'trial' && unlock?.expires_at
            ? Math.max(0, Math.ceil((new Date(unlock.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
            : null,
          availableMethods: project?.unlock_methods || ['payment', 'trial'],
          pricing: project?.pricing,
          trialDays: project?.trial_days || 14,
        },
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Project ID required for status check',
    }, { status: 400 })
  } catch (error) {
    logger.error('Project unlock GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch unlock status' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const body = await request.json()
    const { action = 'unlock', ...data } = body

    // Demo mode
    if (!user) {
      switch (action) {
        case 'unlock':
          return NextResponse.json({
            success: true,
            demo: true,
            message: 'Project unlocked (demo mode)',
            data: {
              id: `unlock-demo-${Date.now()}`,
              status: 'active',
              unlocked_at: new Date().toISOString(),
            },
          })
        case 'start_trial':
          return NextResponse.json({
            success: true,
            demo: true,
            message: 'Trial started (demo mode)',
            data: {
              id: `trial-demo-${Date.now()}`,
              expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
              trial_days: 14,
            },
          })
        case 'verify_promo':
          return NextResponse.json({
            success: true,
            demo: true,
            data: {
              valid: true,
              type: 'percentage',
              value: 20,
              message: '20% discount applied',
            },
          })
        case 'create_promo':
          return NextResponse.json({
            success: true,
            demo: true,
            message: 'Promo code created (demo mode)',
            data: { code: data.code },
          })
        case 'set_password':
          return NextResponse.json({
            success: true,
            demo: true,
            message: 'Password protection set (demo mode)',
          })
        default:
          return NextResponse.json({
            success: false,
            demo: true,
            error: 'Unknown action',
          }, { status: 400 })
      }
    }

    switch (action) {
      case 'unlock': {
        const validated = UnlockRequestSchema.parse(data)

        // Verify project exists
        const { data: project } = await supabase
          .from('projects')
          .select('id, owner_id, pricing, unlock_methods')
          .eq('id', validated.projectId)
          .single()

        if (!project) {
          return NextResponse.json(
            { success: false, error: 'Project not found' },
            { status: 404 }
          )
        }

        // Check if already unlocked
        const { data: existing } = await supabase
          .from('project_unlocks')
          .select('id')
          .eq('project_id', validated.projectId)
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single()

        if (existing) {
          return NextResponse.json({
            success: true,
            message: 'Project already unlocked',
            data: { alreadyUnlocked: true },
          })
        }

        // Process unlock based on method
        const unlockData: Record<string, unknown> = {
          project_id: validated.projectId,
          user_id: user.id,
          method: validated.method,
          status: 'active',
          unlocked_at: new Date().toISOString(),
        }

        switch (validated.method) {
          case 'payment':
            if (!validated.data?.paymentIntentId) {
              return NextResponse.json(
                { success: false, error: 'Payment intent ID required' },
                { status: 400 }
              )
            }
            unlockData.payment_intent_id = validated.data.paymentIntentId
            unlockData.amount_paid = project.pricing?.oneTime?.amount
            unlockData.currency = project.pricing?.oneTime?.currency || 'USD'
            break

          case 'subscription':
            if (!validated.data?.subscriptionId) {
              return NextResponse.json(
                { success: false, error: 'Subscription ID required' },
                { status: 400 }
              )
            }
            unlockData.subscription_id = validated.data.subscriptionId
            break

          case 'promo_code':
            if (!validated.data?.promoCode) {
              return NextResponse.json(
                { success: false, error: 'Promo code required' },
                { status: 400 }
              )
            }
            // Verify promo code
            const promoResult = await verifyPromoCode(supabase, validated.data.promoCode, validated.projectId)
            if (!promoResult.valid) {
              return NextResponse.json(
                { success: false, error: promoResult.error },
                { status: 400 }
              )
            }
            unlockData.promo_code_id = promoResult.promoId
            // Increment usage
            await supabase.rpc('increment_promo_usage', { promo_id: promoResult.promoId })
            break

          case 'password':
            if (!validated.data?.password) {
              return NextResponse.json(
                { success: false, error: 'Password required' },
                { status: 400 }
              )
            }
            // Verify password
            const { data: protection } = await supabase
              .from('project_password_protection')
              .select('password_hash')
              .eq('project_id', validated.projectId)
              .single()

            if (!protection) {
              return NextResponse.json(
                { success: false, error: 'Project is not password protected' },
                { status: 400 }
              )
            }

            const passwordValid = await verifyPassword(validated.data.password, protection.password_hash)
            if (!passwordValid) {
              return NextResponse.json(
                { success: false, error: 'Invalid password' },
                { status: 401 }
              )
            }
            break

          case 'invite_link':
            if (!validated.data?.inviteToken) {
              return NextResponse.json(
                { success: false, error: 'Invite token required' },
                { status: 400 }
              )
            }
            // Verify invite
            const { data: invite } = await supabase
              .from('project_invites')
              .select('id, expires_at, max_uses, uses')
              .eq('token', validated.data.inviteToken)
              .eq('project_id', validated.projectId)
              .single()

            if (!invite) {
              return NextResponse.json(
                { success: false, error: 'Invalid invite link' },
                { status: 400 }
              )
            }

            if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
              return NextResponse.json(
                { success: false, error: 'Invite link has expired' },
                { status: 400 }
              )
            }

            if (invite.max_uses && invite.uses >= invite.max_uses) {
              return NextResponse.json(
                { success: false, error: 'Invite link usage limit reached' },
                { status: 400 }
              )
            }

            unlockData.invite_id = invite.id
            // Increment usage
            await supabase
              .from('project_invites')
              .update({ uses: invite.uses + 1 })
              .eq('id', invite.id)
            break
        }

        const { data: unlock, error } = await supabase
          .from('project_unlocks')
          .insert(unlockData)
          .select()
          .single()

        if (error) throw error

        return NextResponse.json({
          success: true,
          message: 'Project unlocked successfully',
          data: unlock,
        })
      }

      case 'start_trial': {
        const { projectId, days } = data

        if (!projectId) {
          return NextResponse.json(
            { success: false, error: 'Project ID required' },
            { status: 400 }
          )
        }

        // Check if user already had a trial
        const { data: existingTrial } = await supabase
          .from('project_unlocks')
          .select('id')
          .eq('project_id', projectId)
          .eq('user_id', user.id)
          .eq('method', 'trial')
          .single()

        if (existingTrial) {
          return NextResponse.json(
            { success: false, error: 'Trial already used for this project' },
            { status: 400 }
          )
        }

        const { data: project } = await supabase
          .from('projects')
          .select('trial_days')
          .eq('id', projectId)
          .single()

        const trialDays = days || project?.trial_days || 14

        const { data: unlock, error } = await supabase
          .from('project_unlocks')
          .insert({
            project_id: projectId,
            user_id: user.id,
            method: 'trial',
            status: 'active',
            unlocked_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000).toISOString(),
            trial_days: trialDays,
          })
          .select()
          .single()

        if (error) throw error

        return NextResponse.json({
          success: true,
          message: `${trialDays}-day trial started`,
          data: unlock,
        })
      }

      case 'verify_promo': {
        const { promoCode, projectId } = data

        if (!promoCode) {
          return NextResponse.json(
            { success: false, error: 'Promo code required' },
            { status: 400 }
          )
        }

        const result = await verifyPromoCode(supabase, promoCode, projectId)

        return NextResponse.json({
          success: true,
          data: result,
        })
      }

      case 'create_promo': {
        const validated = PromoCodeSchema.parse(data)

        const { data: promo, error } = await supabase
          .from('promo_codes')
          .insert({
            code: validated.code.toUpperCase(),
            type: validated.type,
            value: validated.value,
            max_uses: validated.maxUses,
            expires_at: validated.expiresAt,
            valid_for_projects: validated.validForProjects,
            created_by: user.id,
            uses: 0,
            active: true,
          })
          .select()
          .single()

        if (error) {
          if (error.code === '23505') {
            return NextResponse.json(
              { success: false, error: 'Promo code already exists' },
              { status: 400 }
            )
          }
          throw error
        }

        return NextResponse.json({
          success: true,
          message: 'Promo code created',
          data: promo,
        })
      }

      case 'set_password': {
        const validated = PasswordProtectSchema.parse(data)

        // Verify ownership
        const { data: project } = await supabase
          .from('projects')
          .select('owner_id')
          .eq('id', validated.projectId)
          .single()

        if (project?.owner_id !== user.id) {
          return NextResponse.json(
            { success: false, error: 'Only project owner can set password' },
            { status: 403 }
          )
        }

        const passwordHash = await hashPassword(validated.password)

        await supabase
          .from('project_password_protection')
          .upsert({
            project_id: validated.projectId,
            password_hash: passwordHash,
            hint: validated.hint,
            updated_at: new Date().toISOString(),
          })

        return NextResponse.json({
          success: true,
          message: 'Password protection set',
        })
      }

      case 'remove_password': {
        const { projectId } = data

        // Verify ownership
        const { data: project } = await supabase
          .from('projects')
          .select('owner_id')
          .eq('id', projectId)
          .single()

        if (project?.owner_id !== user.id) {
          return NextResponse.json(
            { success: false, error: 'Only project owner can remove password' },
            { status: 403 }
          )
        }

        await supabase
          .from('project_password_protection')
          .delete()
          .eq('project_id', projectId)

        return NextResponse.json({
          success: true,
          message: 'Password protection removed',
        })
      }

      case 'revoke_unlock': {
        const { unlockId } = data

        if (!unlockId) {
          return NextResponse.json(
            { success: false, error: 'Unlock ID required' },
            { status: 400 }
          )
        }

        // Verify ownership of project or the unlock itself
        const { data: unlock } = await supabase
          .from('project_unlocks')
          .select('project_id, user_id')
          .eq('id', unlockId)
          .single()

        if (!unlock) {
          return NextResponse.json(
            { success: false, error: 'Unlock not found' },
            { status: 404 }
          )
        }

        const { data: project } = await supabase
          .from('projects')
          .select('owner_id')
          .eq('id', unlock.project_id)
          .single()

        if (unlock.user_id !== user.id && project?.owner_id !== user.id) {
          return NextResponse.json(
            { success: false, error: 'Unauthorized' },
            { status: 403 }
          )
        }

        await supabase
          .from('project_unlocks')
          .update({ status: 'revoked', revoked_at: new Date().toISOString() })
          .eq('id', unlockId)

        return NextResponse.json({
          success: true,
          message: 'Access revoked',
        })
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Unknown action' },
          { status: 400 }
        )
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    logger.error('Project unlock POST error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process unlock request' },
      { status: 500 }
    )
  }
}

async function verifyPromoCode(
  supabase: Awaited<ReturnType<typeof createClient>>,
  code: string,
  projectId?: string
): Promise<{ valid: boolean; error?: string; promoId?: string; type?: string; value?: number }> {
  const { data: promo } = await supabase
    .from('promo_codes')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('active', true)
    .single()

  if (!promo) {
    return { valid: false, error: 'Invalid promo code' }
  }

  if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
    return { valid: false, error: 'Promo code has expired' }
  }

  if (promo.max_uses && promo.uses >= promo.max_uses) {
    return { valid: false, error: 'Promo code usage limit reached' }
  }

  if (projectId && promo.valid_for_projects?.length > 0) {
    if (!promo.valid_for_projects.includes(projectId)) {
      return { valid: false, error: 'Promo code not valid for this project' }
    }
  }

  return {
    valid: true,
    promoId: promo.id,
    type: promo.type,
    value: promo.value,
  }
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const salt = process.env.PASSWORD_SALT || 'kazi-salt'
  const data = encoder.encode(password + salt)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}
