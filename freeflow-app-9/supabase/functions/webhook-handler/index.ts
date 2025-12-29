import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8'
import { corsHeaders, handleCors } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
const githubWebhookSecret = Deno.env.get('GITHUB_WEBHOOK_SECRET')

interface WebhookPayload {
  source: 'stripe' | 'github' | 'slack' | 'zapier' | 'custom'
  event: string
  data: Record<string, unknown>
  signature?: string
}

serve(async (req: Request) => {
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const url = new URL(req.url)
    const source = url.searchParams.get('source') || 'custom'

    // Get raw body for signature verification
    const rawBody = await req.text()
    let payload: Record<string, unknown>

    try {
      payload = JSON.parse(rawBody)
    } catch {
      payload = { raw: rawBody }
    }

    // Verify webhook signature based on source
    const signature = req.headers.get('stripe-signature') ||
                     req.headers.get('x-hub-signature-256') ||
                     req.headers.get('x-webhook-signature')

    let result: unknown

    switch (source) {
      case 'stripe':
        result = await handleStripeWebhook(supabase, payload, signature, rawBody)
        break

      case 'github':
        result = await handleGithubWebhook(supabase, payload, signature, rawBody)
        break

      case 'slack':
        result = await handleSlackWebhook(supabase, payload)
        break

      case 'zapier':
        result = await handleZapierWebhook(supabase, payload)
        break

      default:
        result = await handleCustomWebhook(supabase, payload, source)
    }

    // Log webhook event
    await supabase.from('webhook_logs').insert({
      source,
      event_type: payload.type || payload.event || 'unknown',
      payload,
      status: 'processed',
      processed_at: new Date().toISOString()
    })

    return new Response(JSON.stringify({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Webhook Handler Error:', error)

    // Log failed webhook
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    await supabase.from('webhook_logs').insert({
      source: 'unknown',
      event_type: 'error',
      payload: { error: error.message },
      status: 'failed',
      processed_at: new Date().toISOString()
    })

    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function handleStripeWebhook(
  supabase: ReturnType<typeof createClient>,
  payload: Record<string, unknown>,
  signature: string | null,
  rawBody: string
) {
  // Verify Stripe signature
  if (stripeWebhookSecret && signature) {
    const isValid = await verifyStripeSignature(rawBody, signature, stripeWebhookSecret)
    if (!isValid) {
      throw new Error('Invalid Stripe webhook signature')
    }
  }

  const event = payload as { type: string; data: { object: Record<string, unknown> } }

  switch (event.type) {
    case 'payment_intent.succeeded':
      return await processPaymentSuccess(supabase, event.data.object)

    case 'payment_intent.payment_failed':
      return await processPaymentFailure(supabase, event.data.object)

    case 'invoice.paid':
      return await processInvoicePaid(supabase, event.data.object)

    case 'invoice.payment_failed':
      return await processInvoicePaymentFailed(supabase, event.data.object)

    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      return await processSubscriptionUpdate(supabase, event.data.object)

    case 'customer.subscription.deleted':
      return await processSubscriptionCancelled(supabase, event.data.object)

    case 'checkout.session.completed':
      return await processCheckoutCompleted(supabase, event.data.object)

    default:
      console.log(`Unhandled Stripe event: ${event.type}`)
      return { event_type: event.type, status: 'logged' }
  }
}

async function handleGithubWebhook(
  supabase: ReturnType<typeof createClient>,
  payload: Record<string, unknown>,
  signature: string | null,
  rawBody: string
) {
  // Verify GitHub signature
  if (githubWebhookSecret && signature) {
    const isValid = await verifyGithubSignature(rawBody, signature, githubWebhookSecret)
    if (!isValid) {
      throw new Error('Invalid GitHub webhook signature')
    }
  }

  const action = payload.action as string
  const repository = payload.repository as Record<string, unknown>

  switch (action) {
    case 'opened':
      if (payload.pull_request) {
        return await processPullRequestOpened(supabase, payload)
      }
      if (payload.issue) {
        return await processIssueOpened(supabase, payload)
      }
      break

    case 'closed':
      if (payload.pull_request) {
        return await processPullRequestClosed(supabase, payload)
      }
      break

    case 'push':
      return await processGithubPush(supabase, payload)

    case 'deployment':
    case 'deployment_status':
      return await processDeploymentEvent(supabase, payload)
  }

  return {
    action,
    repository: repository?.full_name,
    status: 'logged'
  }
}

async function handleSlackWebhook(supabase: ReturnType<typeof createClient>, payload: Record<string, unknown>) {
  // Handle Slack URL verification challenge
  if (payload.type === 'url_verification') {
    return { challenge: payload.challenge }
  }

  const event = payload.event as Record<string, unknown>

  switch (event?.type) {
    case 'message':
      return await processSlackMessage(supabase, event)

    case 'app_mention':
      return await processSlackMention(supabase, event)

    case 'reaction_added':
      return await processSlackReaction(supabase, event)

    default:
      return { event_type: event?.type, status: 'logged' }
  }
}

async function handleZapierWebhook(supabase: ReturnType<typeof createClient>, payload: Record<string, unknown>) {
  // Process Zapier automation triggers
  const action = payload.action as string

  switch (action) {
    case 'create_project':
      return await zapierCreateProject(supabase, payload)

    case 'create_task':
      return await zapierCreateTask(supabase, payload)

    case 'send_notification':
      return await zapierSendNotification(supabase, payload)

    case 'update_status':
      return await zapierUpdateStatus(supabase, payload)

    default:
      return { action, status: 'logged' }
  }
}

async function handleCustomWebhook(
  supabase: ReturnType<typeof createClient>,
  payload: Record<string, unknown>,
  source: string
) {
  // Store custom webhook for manual processing
  const { data, error } = await supabase
    .from('custom_webhooks')
    .insert({
      source,
      payload,
      processed: false,
      created_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error

  return { webhook_id: data?.id, source, status: 'queued' }
}

// Stripe handlers
async function processPaymentSuccess(supabase: ReturnType<typeof createClient>, paymentIntent: Record<string, unknown>) {
  const { data: payment, error } = await supabase
    .from('payments')
    .update({
      status: 'succeeded',
      paid_at: new Date().toISOString(),
      stripe_payment_intent_id: paymentIntent.id
    })
    .eq('stripe_payment_intent_id', paymentIntent.id)
    .select()
    .single()

  if (error) throw error

  // Update related invoice if exists
  if (payment?.invoice_id) {
    await supabase
      .from('invoices')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', payment.invoice_id)
  }

  return { payment_id: paymentIntent.id, status: 'succeeded' }
}

async function processPaymentFailure(supabase: ReturnType<typeof createClient>, paymentIntent: Record<string, unknown>) {
  await supabase
    .from('payments')
    .update({
      status: 'failed',
      failure_reason: (paymentIntent.last_payment_error as Record<string, unknown>)?.message
    })
    .eq('stripe_payment_intent_id', paymentIntent.id)

  return { payment_id: paymentIntent.id, status: 'failed' }
}

async function processInvoicePaid(supabase: ReturnType<typeof createClient>, invoice: Record<string, unknown>) {
  await supabase
    .from('invoices')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString(),
      stripe_invoice_id: invoice.id
    })
    .eq('stripe_invoice_id', invoice.id)

  return { invoice_id: invoice.id, status: 'paid' }
}

async function processInvoicePaymentFailed(supabase: ReturnType<typeof createClient>, invoice: Record<string, unknown>) {
  await supabase
    .from('invoices')
    .update({ status: 'payment_failed' })
    .eq('stripe_invoice_id', invoice.id)

  return { invoice_id: invoice.id, status: 'payment_failed' }
}

async function processSubscriptionUpdate(supabase: ReturnType<typeof createClient>, subscription: Record<string, unknown>) {
  await supabase
    .from('subscriptions')
    .upsert({
      stripe_subscription_id: subscription.id,
      status: subscription.status,
      current_period_start: new Date((subscription.current_period_start as number) * 1000).toISOString(),
      current_period_end: new Date((subscription.current_period_end as number) * 1000).toISOString(),
      updated_at: new Date().toISOString()
    }, { onConflict: 'stripe_subscription_id' })

  return { subscription_id: subscription.id, status: subscription.status }
}

async function processSubscriptionCancelled(supabase: ReturnType<typeof createClient>, subscription: Record<string, unknown>) {
  await supabase
    .from('subscriptions')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id)

  return { subscription_id: subscription.id, status: 'cancelled' }
}

async function processCheckoutCompleted(supabase: ReturnType<typeof createClient>, session: Record<string, unknown>) {
  // Handle checkout completion
  const metadata = session.metadata as Record<string, unknown>

  if (metadata?.project_id) {
    // Update project payment status
    await supabase
      .from('projects')
      .update({ payment_status: 'paid' })
      .eq('id', metadata.project_id)
  }

  return { session_id: session.id, status: 'completed' }
}

// GitHub handlers
async function processPullRequestOpened(supabase: ReturnType<typeof createClient>, payload: Record<string, unknown>) {
  const pr = payload.pull_request as Record<string, unknown>

  await supabase.from('github_events').insert({
    type: 'pull_request_opened',
    repository: (payload.repository as Record<string, unknown>)?.full_name,
    data: { pr_number: pr.number, title: pr.title, author: (pr.user as Record<string, unknown>)?.login },
    created_at: new Date().toISOString()
  })

  return { pr_number: pr.number, status: 'opened' }
}

async function processPullRequestClosed(supabase: ReturnType<typeof createClient>, payload: Record<string, unknown>) {
  const pr = payload.pull_request as Record<string, unknown>

  await supabase.from('github_events').insert({
    type: pr.merged ? 'pull_request_merged' : 'pull_request_closed',
    repository: (payload.repository as Record<string, unknown>)?.full_name,
    data: { pr_number: pr.number, merged: pr.merged },
    created_at: new Date().toISOString()
  })

  return { pr_number: pr.number, merged: pr.merged }
}

async function processIssueOpened(supabase: ReturnType<typeof createClient>, payload: Record<string, unknown>) {
  const issue = payload.issue as Record<string, unknown>

  await supabase.from('github_events').insert({
    type: 'issue_opened',
    repository: (payload.repository as Record<string, unknown>)?.full_name,
    data: { issue_number: issue.number, title: issue.title },
    created_at: new Date().toISOString()
  })

  return { issue_number: issue.number, status: 'opened' }
}

async function processGithubPush(supabase: ReturnType<typeof createClient>, payload: Record<string, unknown>) {
  const commits = payload.commits as Record<string, unknown>[]

  await supabase.from('github_events').insert({
    type: 'push',
    repository: (payload.repository as Record<string, unknown>)?.full_name,
    data: {
      ref: payload.ref,
      commits_count: commits?.length || 0,
      pusher: (payload.pusher as Record<string, unknown>)?.name
    },
    created_at: new Date().toISOString()
  })

  return { commits: commits?.length, status: 'pushed' }
}

async function processDeploymentEvent(supabase: ReturnType<typeof createClient>, payload: Record<string, unknown>) {
  await supabase.from('github_events').insert({
    type: payload.action as string,
    repository: (payload.repository as Record<string, unknown>)?.full_name,
    data: payload.deployment || payload.deployment_status,
    created_at: new Date().toISOString()
  })

  return { action: payload.action, status: 'logged' }
}

// Slack handlers
async function processSlackMessage(supabase: ReturnType<typeof createClient>, event: Record<string, unknown>) {
  await supabase.from('slack_events').insert({
    type: 'message',
    channel: event.channel,
    user: event.user,
    text: event.text,
    created_at: new Date().toISOString()
  })

  return { type: 'message', status: 'logged' }
}

async function processSlackMention(supabase: ReturnType<typeof createClient>, event: Record<string, unknown>) {
  await supabase.from('slack_events').insert({
    type: 'app_mention',
    channel: event.channel,
    user: event.user,
    text: event.text,
    created_at: new Date().toISOString()
  })

  return { type: 'app_mention', status: 'logged' }
}

async function processSlackReaction(supabase: ReturnType<typeof createClient>, event: Record<string, unknown>) {
  await supabase.from('slack_events').insert({
    type: 'reaction',
    reaction: event.reaction,
    user: event.user,
    created_at: new Date().toISOString()
  })

  return { type: 'reaction', reaction: event.reaction }
}

// Zapier handlers
async function zapierCreateProject(supabase: ReturnType<typeof createClient>, payload: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('projects')
    .insert({
      name: payload.project_name,
      description: payload.description,
      user_id: payload.user_id,
      status: 'active',
      created_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  return { project_id: data?.id, status: 'created' }
}

async function zapierCreateTask(supabase: ReturnType<typeof createClient>, payload: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      title: payload.task_title,
      description: payload.task_description,
      project_id: payload.project_id,
      user_id: payload.user_id,
      status: 'pending',
      created_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  return { task_id: data?.id, status: 'created' }
}

async function zapierSendNotification(supabase: ReturnType<typeof createClient>, payload: Record<string, unknown>) {
  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: payload.user_id,
      title: payload.title,
      message: payload.message,
      type: 'zapier',
      created_at: new Date().toISOString()
    })

  if (error) throw error
  return { status: 'notification_sent' }
}

async function zapierUpdateStatus(supabase: ReturnType<typeof createClient>, payload: Record<string, unknown>) {
  const table = payload.entity_type as string
  const { error } = await supabase
    .from(table)
    .update({ status: payload.new_status, updated_at: new Date().toISOString() })
    .eq('id', payload.entity_id)

  if (error) throw error
  return { entity_id: payload.entity_id, new_status: payload.new_status }
}

// Signature verification helpers
async function verifyStripeSignature(payload: string, signature: string, secret: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )

    const signedPayload = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
    const computedSignature = Array.from(new Uint8Array(signedPayload))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    const signatureParts = signature.split(',')
    const providedSignature = signatureParts.find(p => p.startsWith('v1='))?.slice(3)

    return computedSignature === providedSignature
  } catch {
    return false
  }
}

async function verifyGithubSignature(payload: string, signature: string, secret: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )

    const signedPayload = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
    const computedSignature = 'sha256=' + Array.from(new Uint8Array(signedPayload))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    return computedSignature === signature
  } catch {
    return false
  }
}
