// app/api/mobile/route.ts
// Mobile API Routes - Optimized endpoints for native mobile apps
// Competing with: Fiverr, Upwork, FreshBooks mobile apps

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createFeatureLogger } from '@/lib/logger';

const logger = createFeatureLogger('mobile-api');

// Demo user for unauthenticated access
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const DeviceRegistrationSchema = z.object({
  platform: z.enum(['ios', 'android', 'web']),
  osVersion: z.string(),
  deviceModel: z.string(),
  appVersion: z.string(),
  buildNumber: z.string(),
  isTablet: z.boolean().default(false),
  screenWidth: z.number(),
  screenHeight: z.number(),
  pixelRatio: z.number(),
  locale: z.string(),
  timezone: z.string(),
  hasBiometrics: z.boolean().default(false),
  biometricType: z.enum(['fingerprint', 'faceId', 'iris', 'none']).default('none'),
  hasNotifications: z.boolean().default(false),
  notificationToken: z.string().optional(),
});

const SyncSchema = z.object({
  actions: z.array(
    z.object({
      id: z.string(),
      type: z.enum(['create', 'update', 'delete']),
      entity: z.string(),
      data: z.record(z.unknown()),
      timestamp: z.string(),
      retryCount: z.number(),
    })
  ),
});

// =============================================================================
// GET - Fetch mobile data
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || DEMO_USER_ID;

    const { searchParams } = new URL(request.url);
    const resource = searchParams.get('resource') || 'dashboard';

    switch (resource) {
      case 'dashboard': {
        // Optimized dashboard data for mobile
        const [projectsResult, tasksResult, invoicesResult, messagesResult] = await Promise.all([
          // Active projects count and recent
          supabase
            .from('projects')
            .select('id, title, status, client_id, budget, created_at')
            .eq('user_id', userId)
            .eq('status', 'active')
            .order('updated_at', { ascending: false })
            .limit(5),

          // Pending tasks count and upcoming
          supabase
            .from('tasks')
            .select('id, title, status, priority, due_date, project_id')
            .eq('assignee_id', userId)
            .in('status', ['pending', 'in_progress'])
            .order('due_date', { ascending: true })
            .limit(5),

          // Unpaid invoices
          supabase
            .from('invoices')
            .select('id, invoice_number, status, total_amount, due_date, client_id')
            .eq('user_id', userId)
            .in('status', ['pending', 'overdue'])
            .order('due_date', { ascending: true })
            .limit(5),

          // Unread messages count
          supabase
            .from('messages')
            .select('id', { count: 'exact' })
            .eq('recipient_id', userId)
            .eq('is_read', false),
        ]);

        // Get summary counts
        const [totalProjects, totalClients, totalRevenue] = await Promise.all([
          supabase
            .from('projects')
            .select('id', { count: 'exact' })
            .eq('user_id', userId),
          supabase
            .from('clients')
            .select('id', { count: 'exact' })
            .eq('user_id', userId),
          supabase
            .from('invoices')
            .select('total_amount')
            .eq('user_id', userId)
            .eq('status', 'paid'),
        ]);

        const revenue = (totalRevenue.data || []).reduce(
          (sum, inv) => sum + (inv.total_amount || 0),
          0
        );

        return NextResponse.json({
          data: {
            summary: {
              activeProjects: projectsResult.data?.length || 0,
              pendingTasks: tasksResult.data?.length || 0,
              unpaidInvoices: invoicesResult.data?.length || 0,
              unreadMessages: messagesResult.count || 0,
              totalProjects: totalProjects.count || 0,
              totalClients: totalClients.count || 0,
              totalRevenue: revenue,
            },
            recentProjects: projectsResult.data || [],
            upcomingTasks: tasksResult.data || [],
            pendingInvoices: invoicesResult.data || [],
          },
        });
      }

      case 'projects': {
        const status = searchParams.get('status');
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = parseInt(searchParams.get('offset') || '0');

        let query = supabase
          .from('projects')
          .select(`
            id, title, description, status, budget,
            start_date, end_date, created_at, updated_at,
            clients(id, name, email, avatar_url)
          `)
          .eq('user_id', userId)
          .order('updated_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (status && status !== 'all') {
          query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data });
      }

      case 'tasks': {
        const projectId = searchParams.get('projectId');
        const status = searchParams.get('status');
        const limit = parseInt(searchParams.get('limit') || '50');

        let query = supabase
          .from('tasks')
          .select(`
            id, title, description, status, priority,
            due_date, estimated_hours, actual_hours,
            project_id, created_at,
            projects(id, title)
          `)
          .eq('assignee_id', userId)
          .order('due_date', { ascending: true })
          .limit(limit);

        if (projectId) {
          query = query.eq('project_id', projectId);
        }
        if (status && status !== 'all') {
          query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data });
      }

      case 'invoices': {
        const status = searchParams.get('status');
        const limit = parseInt(searchParams.get('limit') || '20');

        let query = supabase
          .from('invoices')
          .select(`
            id, invoice_number, status, total_amount,
            subtotal, tax_amount, due_date, paid_date,
            client_id, created_at,
            clients(id, name, email)
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (status && status !== 'all') {
          query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data });
      }

      case 'clients': {
        const limit = parseInt(searchParams.get('limit') || '50');

        const { data, error } = await supabase
          .from('clients')
          .select(`
            id, name, email, phone, company,
            avatar_url, created_at,
            projects(id, title, status)
          `)
          .eq('user_id', userId)
          .order('name')
          .limit(limit);

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data });
      }

      case 'messages': {
        const conversationId = searchParams.get('conversationId');
        const limit = parseInt(searchParams.get('limit') || '50');
        const before = searchParams.get('before');

        if (conversationId) {
          // Get messages in a conversation
          let query = supabase
            .from('messages')
            .select(`
              id, content, sender_id, created_at, is_read,
              attachments,
              sender:users!sender_id(id, name, avatar_url)
            `)
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: false })
            .limit(limit);

          if (before) {
            query = query.lt('created_at', before);
          }

          const { data, error } = await query;

          if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
          }

          return NextResponse.json({ data: (data || []).reverse() });
        } else {
          // Get conversations list
          const { data, error } = await supabase
            .from('conversations')
            .select(`
              id, title, last_message, last_message_at,
              participants:conversation_participants(
                user:users(id, name, avatar_url)
              ),
              unread_count
            `)
            .contains('participant_ids', [userId])
            .order('last_message_at', { ascending: false })
            .limit(limit);

          if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
          }

          return NextResponse.json({ data });
        }
      }

      case 'notifications': {
        const limit = parseInt(searchParams.get('limit') || '50');
        const unreadOnly = searchParams.get('unreadOnly') === 'true';

        let query = supabase
          .from('notifications')
          .select('id, type, title, message, data, is_read, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (unreadOnly) {
          query = query.eq('is_read', false);
        }

        const { data, error } = await query;

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data });
      }

      case 'time-entries': {
        const projectId = searchParams.get('projectId');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const limit = parseInt(searchParams.get('limit') || '50');

        let query = supabase
          .from('time_entries')
          .select(`
            id, description, start_time, end_time,
            duration, is_billable, hourly_rate,
            project_id, task_id,
            projects(id, title),
            tasks(id, title)
          `)
          .eq('user_id', userId)
          .order('start_time', { ascending: false })
          .limit(limit);

        if (projectId) {
          query = query.eq('project_id', projectId);
        }
        if (startDate) {
          query = query.gte('start_time', startDate);
        }
        if (endDate) {
          query = query.lte('start_time', endDate);
        }

        const { data, error } = await query;

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data });
      }

      case 'calendar': {
        const startDate = searchParams.get('startDate') || new Date().toISOString().split('T')[0];
        const endDate = searchParams.get('endDate') || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        // Get events and task deadlines
        const [eventsResult, tasksResult] = await Promise.all([
          supabase
            .from('calendar_events')
            .select('id, title, description, start_time, end_time, all_day, color, location')
            .eq('user_id', userId)
            .gte('start_time', startDate)
            .lte('start_time', endDate)
            .order('start_time'),

          supabase
            .from('tasks')
            .select('id, title, due_date, priority, status, project_id')
            .eq('assignee_id', userId)
            .neq('status', 'completed')
            .gte('due_date', startDate)
            .lte('due_date', endDate)
            .order('due_date'),
        ]);

        return NextResponse.json({
          data: {
            events: eventsResult.data || [],
            taskDeadlines: tasksResult.data || [],
          },
        });
      }

      case 'sync': {
        // Get changes since last sync
        const since = searchParams.get('since');
        if (!since) {
          return NextResponse.json({ error: 'since parameter required' }, { status: 400 });
        }

        const sinceDate = new Date(since);

        // Get all changes across relevant tables
        const [projects, tasks, invoices, clients, messages] = await Promise.all([
          supabase
            .from('projects')
            .select('*')
            .eq('user_id', userId)
            .gt('updated_at', sinceDate.toISOString()),
          supabase
            .from('tasks')
            .select('*')
            .eq('assignee_id', userId)
            .gt('updated_at', sinceDate.toISOString()),
          supabase
            .from('invoices')
            .select('*')
            .eq('user_id', userId)
            .gt('updated_at', sinceDate.toISOString()),
          supabase
            .from('clients')
            .select('*')
            .eq('user_id', userId)
            .gt('updated_at', sinceDate.toISOString()),
          supabase
            .from('messages')
            .select('*')
            .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
            .gt('created_at', sinceDate.toISOString()),
        ]);

        const changes = [
          ...(projects.data || []).map(p => ({ entity: 'projects', data: p })),
          ...(tasks.data || []).map(t => ({ entity: 'tasks', data: t })),
          ...(invoices.data || []).map(i => ({ entity: 'invoices', data: i })),
          ...(clients.data || []).map(c => ({ entity: 'clients', data: c })),
          ...(messages.data || []).map(m => ({ entity: 'messages', data: m })),
        ];

        return NextResponse.json({
          data: {
            changes,
            serverTime: new Date().toISOString(),
          },
        });
      }

      default:
        return NextResponse.json({ error: 'Unknown resource' }, { status: 400 });
    }
  } catch (error) {
    logger.error('Error in GET /api/mobile', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// =============================================================================
// POST - Create data and actions
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || DEMO_USER_ID;

    const body = await request.json();
    const action = body.action;

    switch (action) {
      case 'register-device': {
        const validation = DeviceRegistrationSchema.safeParse(body.deviceInfo);
        if (!validation.success) {
          return NextResponse.json(
            { error: 'Validation failed', details: validation.error.errors },
            { status: 400 }
          );
        }

        const deviceInfo = validation.data;

        // Upsert device registration
        const { data, error } = await supabase
          .from('user_devices')
          .upsert({
            user_id: userId,
            device_id: `${deviceInfo.platform}_${deviceInfo.deviceModel}_${Date.now()}`,
            platform: deviceInfo.platform,
            os_version: deviceInfo.osVersion,
            device_model: deviceInfo.deviceModel,
            app_version: deviceInfo.appVersion,
            build_number: deviceInfo.buildNumber,
            push_token: deviceInfo.notificationToken,
            locale: deviceInfo.locale,
            timezone: deviceInfo.timezone,
            has_biometrics: deviceInfo.hasBiometrics,
            biometric_type: deviceInfo.biometricType,
            is_active: true,
            last_active_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: { deviceId: data.device_id } });
      }

      case 'update-push-token': {
        const { deviceId, pushToken } = body;

        if (!deviceId || !pushToken) {
          return NextResponse.json({ error: 'deviceId and pushToken required' }, { status: 400 });
        }

        const { error } = await supabase
          .from('user_devices')
          .update({ push_token: pushToken, updated_at: new Date().toISOString() })
          .eq('device_id', deviceId)
          .eq('user_id', userId);

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
      }

      case 'sync': {
        const validation = SyncSchema.safeParse(body);
        if (!validation.success) {
          return NextResponse.json(
            { error: 'Validation failed', details: validation.error.errors },
            { status: 400 }
          );
        }

        const { actions } = validation.data;
        const results = {
          success: true,
          syncedAt: new Date(),
          itemsSynced: 0,
          itemsFailed: 0,
          errors: [] as { actionId: string; entity: string; message: string; code: string }[],
          conflictsResolved: 0,
        };

        for (const action of actions) {
          try {
            let error = null;

            switch (action.type) {
              case 'create':
                const { error: createError } = await supabase
                  .from(action.entity)
                  .insert({ ...action.data, user_id: userId });
                error = createError;
                break;

              case 'update':
                const { error: updateError } = await supabase
                  .from(action.entity)
                  .update(action.data)
                  .eq('id', action.data.id)
                  .eq('user_id', userId);
                error = updateError;
                break;

              case 'delete':
                const { error: deleteError } = await supabase
                  .from(action.entity)
                  .delete()
                  .eq('id', action.data.id)
                  .eq('user_id', userId);
                error = deleteError;
                break;
            }

            if (error) {
              results.itemsFailed++;
              results.errors.push({
                actionId: action.id,
                entity: action.entity,
                message: error.message,
                code: error.code || 'UNKNOWN',
              });
            } else {
              results.itemsSynced++;
            }
          } catch (err) {
            results.itemsFailed++;
            results.errors.push({
              actionId: action.id,
              entity: action.entity,
              message: err instanceof Error ? err.message : 'Unknown error',
              code: 'EXCEPTION',
            });
          }
        }

        results.success = results.itemsFailed === 0;

        return NextResponse.json({ data: results });
      }

      case 'create-project': {
        const { title, description, clientId, budget, startDate, endDate } = body;

        if (!title) {
          return NextResponse.json({ error: 'Title required' }, { status: 400 });
        }

        const { data, error } = await supabase
          .from('projects')
          .insert({
            user_id: userId,
            title,
            description,
            client_id: clientId,
            budget,
            start_date: startDate,
            end_date: endDate,
            status: 'active',
          })
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data });
      }

      case 'create-task': {
        const { title, description, projectId, priority, dueDate, estimatedHours } = body;

        if (!title) {
          return NextResponse.json({ error: 'Title required' }, { status: 400 });
        }

        const { data, error } = await supabase
          .from('tasks')
          .insert({
            title,
            description,
            project_id: projectId,
            assignee_id: userId,
            priority: priority || 'medium',
            due_date: dueDate,
            estimated_hours: estimatedHours,
            status: 'pending',
          })
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data });
      }

      case 'complete-task': {
        const { taskId } = body;

        if (!taskId) {
          return NextResponse.json({ error: 'Task ID required' }, { status: 400 });
        }

        const { data, error } = await supabase
          .from('tasks')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
          })
          .eq('id', taskId)
          .eq('assignee_id', userId)
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data });
      }

      case 'send-message': {
        const { conversationId, content, attachments } = body;

        if (!conversationId || !content) {
          return NextResponse.json({ error: 'conversationId and content required' }, { status: 400 });
        }

        const { data, error } = await supabase
          .from('messages')
          .insert({
            conversation_id: conversationId,
            sender_id: userId,
            content,
            attachments: attachments || [],
          })
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Update conversation last message
        await supabase
          .from('conversations')
          .update({
            last_message: content.substring(0, 100),
            last_message_at: new Date().toISOString(),
          })
          .eq('id', conversationId);

        return NextResponse.json({ data });
      }

      case 'mark-read': {
        const { conversationId, notificationId } = body;

        if (conversationId) {
          // Mark all messages in conversation as read
          const { error } = await supabase
            .from('messages')
            .update({ is_read: true })
            .eq('conversation_id', conversationId)
            .eq('recipient_id', userId);

          if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
          }
        }

        if (notificationId) {
          // Mark notification as read
          const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notificationId)
            .eq('user_id', userId);

          if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
          }
        }

        return NextResponse.json({ success: true });
      }

      case 'start-timer': {
        const { projectId, taskId, description } = body;

        if (!projectId) {
          return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
        }

        // Check for existing running timer
        const { data: existing } = await supabase
          .from('time_entries')
          .select('id')
          .eq('user_id', userId)
          .is('end_time', null)
          .single();

        if (existing) {
          return NextResponse.json(
            { error: 'A timer is already running. Stop it first.' },
            { status: 400 }
          );
        }

        const { data, error } = await supabase
          .from('time_entries')
          .insert({
            user_id: userId,
            project_id: projectId,
            task_id: taskId,
            description,
            start_time: new Date().toISOString(),
            is_billable: true,
          })
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data });
      }

      case 'stop-timer': {
        const { entryId } = body;

        // Find running timer
        let query = supabase
          .from('time_entries')
          .select('*')
          .eq('user_id', userId)
          .is('end_time', null);

        if (entryId) {
          query = query.eq('id', entryId);
        }

        const { data: entry, error: findError } = await query.single();

        if (findError || !entry) {
          return NextResponse.json({ error: 'No running timer found' }, { status: 404 });
        }

        const endTime = new Date();
        const startTime = new Date(entry.start_time);
        const duration = Math.round((endTime.getTime() - startTime.getTime()) / 1000); // seconds

        const { data, error } = await supabase
          .from('time_entries')
          .update({
            end_time: endTime.toISOString(),
            duration,
          })
          .eq('id', entry.id)
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data });
      }

      case 'create-invoice': {
        const { clientId, items, dueDate, notes } = body;

        if (!clientId || !items || items.length === 0) {
          return NextResponse.json({ error: 'Client and items required' }, { status: 400 });
        }

        const subtotal = items.reduce((sum: number, item: { quantity: number; rate: number }) => sum + (item.quantity * item.rate), 0);
        const taxRate = 0; // Can be made configurable
        const taxAmount = subtotal * taxRate;
        const totalAmount = subtotal + taxAmount;

        // Generate invoice number
        const { count } = await supabase
          .from('invoices')
          .select('id', { count: 'exact' })
          .eq('user_id', userId);

        const invoiceNumber = `INV-${String((count || 0) + 1).padStart(5, '0')}`;

        const { data, error } = await supabase
          .from('invoices')
          .insert({
            user_id: userId,
            client_id: clientId,
            invoice_number: invoiceNumber,
            items,
            subtotal,
            tax_rate: taxRate,
            tax_amount: taxAmount,
            total_amount: totalAmount,
            due_date: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            notes,
            status: 'draft',
          })
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data });
      }

      case 'send-invoice': {
        const { invoiceId } = body;

        if (!invoiceId) {
          return NextResponse.json({ error: 'Invoice ID required' }, { status: 400 });
        }

        const { data, error } = await supabase
          .from('invoices')
          .update({
            status: 'pending',
            sent_at: new Date().toISOString(),
          })
          .eq('id', invoiceId)
          .eq('user_id', userId)
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // TODO: Send email notification to client

        return NextResponse.json({ data });
      }

      case 'create-client': {
        const { name, email, phone, company, address } = body;

        if (!name || !email) {
          return NextResponse.json({ error: 'Name and email required' }, { status: 400 });
        }

        const { data, error } = await supabase
          .from('clients')
          .insert({
            user_id: userId,
            name,
            email,
            phone,
            company,
            address,
          })
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data });
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    logger.error('Error in POST /api/mobile', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// =============================================================================
// PUT - Update data
// =============================================================================

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || DEMO_USER_ID;

    const body = await request.json();
    const { resource, id, ...updateData } = body;

    if (!resource || !id) {
      return NextResponse.json({ error: 'Resource and ID required' }, { status: 400 });
    }

    // Map resource to table and validate ownership field
    const resourceMap: Record<string, { table: string; ownerField: string }> = {
      project: { table: 'projects', ownerField: 'user_id' },
      task: { table: 'tasks', ownerField: 'assignee_id' },
      invoice: { table: 'invoices', ownerField: 'user_id' },
      client: { table: 'clients', ownerField: 'user_id' },
      event: { table: 'calendar_events', ownerField: 'user_id' },
      'time-entry': { table: 'time_entries', ownerField: 'user_id' },
    };

    const config = resourceMap[resource];
    if (!config) {
      return NextResponse.json({ error: 'Invalid resource type' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from(config.table)
      .update(updateData)
      .eq('id', id)
      .eq(config.ownerField, userId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    logger.error('Error in PUT /api/mobile', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// =============================================================================
// DELETE - Delete data
// =============================================================================

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || DEMO_USER_ID;

    const { searchParams } = new URL(request.url);
    const resource = searchParams.get('resource');
    const id = searchParams.get('id');

    if (!resource || !id) {
      return NextResponse.json({ error: 'Resource and ID required' }, { status: 400 });
    }

    // Map resource to table
    const resourceMap: Record<string, { table: string; ownerField: string }> = {
      project: { table: 'projects', ownerField: 'user_id' },
      task: { table: 'tasks', ownerField: 'assignee_id' },
      invoice: { table: 'invoices', ownerField: 'user_id' },
      client: { table: 'clients', ownerField: 'user_id' },
      event: { table: 'calendar_events', ownerField: 'user_id' },
      'time-entry': { table: 'time_entries', ownerField: 'user_id' },
      notification: { table: 'notifications', ownerField: 'user_id' },
    };

    const config = resourceMap[resource];
    if (!config) {
      return NextResponse.json({ error: 'Invalid resource type' }, { status: 400 });
    }

    const { error } = await supabase
      .from(config.table)
      .delete()
      .eq('id', id)
      .eq(config.ownerField, userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error in DELETE /api/mobile', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
