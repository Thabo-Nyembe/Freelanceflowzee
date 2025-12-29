import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8'
import { corsHeaders, handleCors } from '../_shared/cors.ts'

interface NotificationPayload {
  type: 'email' | 'push' | 'in_app' | 'sms'
  userId?: string
  email?: string
  title: string
  message: string
  data?: Record<string, unknown>
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  templateId?: string
  variables?: Record<string, string>
}

interface BatchNotificationPayload {
  notifications: NotificationPayload[]
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const resendApiKey = Deno.env.get('RESEND_API_KEY')

serve(async (req: Request) => {
  // Handle CORS
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body = await req.json()
    const { action, ...payload } = body

    let result: unknown

    switch (action) {
      case 'send_single':
        result = await sendSingleNotification(supabase, payload as NotificationPayload)
        break

      case 'send_batch':
        result = await sendBatchNotifications(supabase, payload as BatchNotificationPayload)
        break

      case 'send_to_project_team':
        result = await sendToProjectTeam(supabase, payload)
        break

      case 'send_reminder':
        result = await sendReminder(supabase, payload)
        break

      case 'get_notification_preferences':
        result = await getNotificationPreferences(supabase, payload.userId)
        break

      case 'update_notification_preferences':
        result = await updateNotificationPreferences(supabase, payload.userId, payload.preferences)
        break

      default:
        throw new Error(`Unknown action: ${action}`)
    }

    return new Response(JSON.stringify({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Notification Error:', error)
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

async function sendSingleNotification(supabase: ReturnType<typeof createClient>, notification: NotificationPayload) {
  const results: Record<string, unknown> = {}

  // Store notification in database for in_app type
  if (notification.type === 'in_app' || notification.type === 'push') {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: notification.userId,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        priority: notification.priority || 'normal',
        data: notification.data,
        read: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    results.in_app = { success: true, id: data?.id }
  }

  // Send email
  if (notification.type === 'email' && notification.email && resendApiKey) {
    try {
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'FreeFlow <notifications@freeflow.dev>',
          to: notification.email,
          subject: notification.title,
          html: generateEmailHtml(notification.title, notification.message, notification.variables)
        })
      })

      const emailResult = await emailResponse.json()
      results.email = { success: emailResponse.ok, data: emailResult }
    } catch (emailError) {
      results.email = { success: false, error: emailError.message }
    }
  }

  // Log notification
  await supabase.from('notification_logs').insert({
    user_id: notification.userId,
    type: notification.type,
    title: notification.title,
    status: 'sent',
    metadata: results,
    created_at: new Date().toISOString()
  })

  return { notification_sent: true, results }
}

async function sendBatchNotifications(supabase: ReturnType<typeof createClient>, payload: BatchNotificationPayload) {
  const results = []

  for (const notification of payload.notifications) {
    try {
      const result = await sendSingleNotification(supabase, notification)
      results.push({ success: true, ...result })
    } catch (error) {
      results.push({ success: false, error: error.message })
    }
  }

  return {
    total: payload.notifications.length,
    successful: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    results
  }
}

async function sendToProjectTeam(supabase: ReturnType<typeof createClient>, payload: { projectId: string; title: string; message: string }) {
  // Get project team members
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('user_id, collaborators')
    .eq('id', payload.projectId)
    .single()

  if (projectError) throw projectError

  const teamMembers = [project.user_id, ...(project.collaborators || [])]

  const notifications: NotificationPayload[] = teamMembers.map(userId => ({
    type: 'in_app' as const,
    userId,
    title: payload.title,
    message: payload.message,
    data: { projectId: payload.projectId }
  }))

  return sendBatchNotifications(supabase, { notifications })
}

async function sendReminder(supabase: ReturnType<typeof createClient>, payload: {
  userId: string
  reminderType: 'deadline' | 'meeting' | 'invoice' | 'feedback'
  data: Record<string, unknown>
}) {
  const reminderTemplates = {
    deadline: {
      title: 'Project Deadline Approaching',
      message: `Your project "${payload.data.projectName}" deadline is in ${payload.data.daysRemaining} days.`
    },
    meeting: {
      title: 'Upcoming Meeting',
      message: `You have a meeting "${payload.data.meetingTitle}" scheduled for ${payload.data.meetingTime}.`
    },
    invoice: {
      title: 'Invoice Payment Reminder',
      message: `Invoice #${payload.data.invoiceNumber} for $${payload.data.amount} is due in ${payload.data.daysUntilDue} days.`
    },
    feedback: {
      title: 'Feedback Requested',
      message: `${payload.data.clientName} has requested feedback on "${payload.data.itemName}".`
    }
  }

  const template = reminderTemplates[payload.reminderType]

  return sendSingleNotification(supabase, {
    type: 'in_app',
    userId: payload.userId,
    title: template.title,
    message: template.message,
    data: payload.data,
    priority: 'high'
  })
}

async function getNotificationPreferences(supabase: ReturnType<typeof createClient>, userId: string) {
  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw error

  // Return default preferences if none exist
  return data || {
    email_enabled: true,
    push_enabled: true,
    in_app_enabled: true,
    email_frequency: 'immediate',
    notification_types: {
      project_updates: true,
      deadlines: true,
      payments: true,
      messages: true,
      marketing: false
    }
  }
}

async function updateNotificationPreferences(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  preferences: Record<string, unknown>
) {
  const { data, error } = await supabase
    .from('notification_preferences')
    .upsert({
      user_id: userId,
      ...preferences,
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  return data
}

function generateEmailHtml(title: string, message: string, variables?: Record<string, string>): string {
  let processedMessage = message
  if (variables) {
    Object.entries(variables).forEach(([key, value]) => {
      processedMessage = processedMessage.replace(new RegExp(`{{${key}}}`, 'g'), value)
    })
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${title}</h1>
        </div>
        <div class="content">
          <p>${processedMessage}</p>
          <a href="https://freeflow.dev/dashboard" class="button">View Dashboard</a>
        </div>
        <div class="footer">
          <p>FreeFlow - Empowering Freelancers Worldwide</p>
          <p>You received this email because you have notifications enabled.</p>
        </div>
      </div>
    </body>
    </html>
  `
}
