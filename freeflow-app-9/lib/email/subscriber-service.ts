// =====================================================
// KAZI Email Subscriber Management Service
// Subscriber lists, segments & management
// =====================================================

import { createClient } from '@/lib/supabase/client';

// =====================================================
// Types
// =====================================================

export interface Subscriber {
  id: string;
  user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  status: 'active' | 'unsubscribed' | 'bounced' | 'complained' | 'pending';
  source: string;
  source_details?: Record<string, any>;
  tags: string[];
  custom_fields: Record<string, any>;
  list_ids: string[];
  engagement_score: number;
  last_email_sent_at?: string;
  last_email_opened_at?: string;
  last_email_clicked_at?: string;
  total_emails_sent: number;
  total_emails_opened: number;
  total_emails_clicked: number;
  ip_address?: string;
  location?: SubscriberLocation;
  preferences: SubscriberPreferences;
  subscribed_at: string;
  unsubscribed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SubscriberLocation {
  country?: string;
  region?: string;
  city?: string;
  timezone?: string;
}

export interface SubscriberPreferences {
  email_frequency?: 'all' | 'weekly' | 'monthly';
  preferred_format?: 'html' | 'text';
  categories?: string[];
}

export interface EmailList {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  type: 'manual' | 'dynamic';
  status: 'active' | 'archived';
  subscriber_count: number;
  double_optin: boolean;
  welcome_email_id?: string;
  tags: string[];
  settings: ListSettings;
  created_at: string;
  updated_at: string;
}

export interface ListSettings {
  default_from_name?: string;
  default_from_email?: string;
  default_reply_to?: string;
  footer_text?: string;
  unsubscribe_page_url?: string;
}

export interface Segment {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  type: 'static' | 'dynamic';
  conditions: SegmentCondition[];
  condition_operator: 'and' | 'or';
  subscriber_count: number;
  last_calculated_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SegmentCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty' | 'in_list' | 'not_in_list';
  value: any;
}

export interface ImportJob {
  id: string;
  user_id: string;
  list_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  file_name: string;
  file_url?: string;
  total_rows: number;
  processed_rows: number;
  imported_count: number;
  skipped_count: number;
  error_count: number;
  errors: ImportError[];
  field_mapping: Record<string, string>;
  options: ImportOptions;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface ImportError {
  row: number;
  email?: string;
  error: string;
}

export interface ImportOptions {
  update_existing: boolean;
  skip_duplicates: boolean;
  add_tags?: string[];
  trigger_welcome_email: boolean;
}

export interface CreateSubscriberInput {
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  source?: string;
  source_details?: Record<string, any>;
  tags?: string[];
  custom_fields?: Record<string, any>;
  list_ids?: string[];
  ip_address?: string;
}

export interface CreateListInput {
  name: string;
  description?: string;
  double_optin?: boolean;
  welcome_email_id?: string;
  tags?: string[];
  settings?: ListSettings;
}

export interface CreateSegmentInput {
  name: string;
  description?: string;
  type?: 'static' | 'dynamic';
  conditions: SegmentCondition[];
  condition_operator?: 'and' | 'or';
}

// =====================================================
// Subscriber Service Class
// =====================================================

class SubscriberService {
  private static instance: SubscriberService;
  private supabase = createClient();

  private constructor() {}

  public static getInstance(): SubscriberService {
    if (!SubscriberService.instance) {
      SubscriberService.instance = new SubscriberService();
    }
    return SubscriberService.instance;
  }

  // =====================================================
  // Subscriber Operations
  // =====================================================

  async createSubscriber(userId: string, input: CreateSubscriberInput): Promise<Subscriber> {
    // Check if subscriber already exists
    const existing = await this.getSubscriberByEmail(userId, input.email);
    if (existing) {
      throw new Error('Subscriber with this email already exists');
    }

    const { data, error } = await this.supabase
      .from('email_subscribers')
      .insert({
        user_id: userId,
        email: input.email.toLowerCase().trim(),
        first_name: input.first_name,
        last_name: input.last_name,
        phone: input.phone,
        status: 'active',
        source: input.source || 'api',
        source_details: input.source_details || {},
        tags: input.tags || [],
        custom_fields: input.custom_fields || {},
        list_ids: input.list_ids || [],
        engagement_score: 50,
        total_emails_sent: 0,
        total_emails_opened: 0,
        total_emails_clicked: 0,
        ip_address: input.ip_address,
        preferences: {},
        subscribed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create subscriber: ${error.message}`);

    // Update list subscriber counts
    if (input.list_ids && input.list_ids.length > 0) {
      await this.updateListCounts(input.list_ids);
    }

    return data;
  }

  async getSubscriber(subscriberId: string): Promise<Subscriber | null> {
    const { data, error } = await this.supabase
      .from('email_subscribers')
      .select('*')
      .eq('id', subscriberId)
      .single();

    if (error) return null;
    return data;
  }

  async getSubscriberByEmail(userId: string, email: string): Promise<Subscriber | null> {
    const { data, error } = await this.supabase
      .from('email_subscribers')
      .select('*')
      .eq('user_id', userId)
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error) return null;
    return data;
  }

  async getSubscribers(userId: string, params: {
    list_id?: string;
    status?: string;
    tags?: string[];
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  } = {}): Promise<{ subscribers: Subscriber[]; total: number }> {
    let query = this.supabase
      .from('email_subscribers')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    if (params.list_id) {
      query = query.contains('list_ids', [params.list_id]);
    }

    if (params.status) {
      query = query.eq('status', params.status);
    }

    if (params.tags && params.tags.length > 0) {
      query = query.overlaps('tags', params.tags);
    }

    if (params.search) {
      query = query.or(`email.ilike.%${params.search}%,first_name.ilike.%${params.search}%,last_name.ilike.%${params.search}%`);
    }

    const sortBy = params.sort_by || 'created_at';
    const sortOrder = params.sort_order === 'asc';
    query = query.order(sortBy, { ascending: sortOrder });

    if (params.limit) {
      query = query.limit(params.limit);
    }

    if (params.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 50) - 1);
    }

    const { data, error, count } = await query;

    if (error) throw new Error(`Failed to get subscribers: ${error.message}`);
    return { subscribers: data || [], total: count || 0 };
  }

  async updateSubscriber(subscriberId: string, updates: Partial<Subscriber>): Promise<Subscriber> {
    const { data, error } = await this.supabase
      .from('email_subscribers')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscriberId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update subscriber: ${error.message}`);
    return data;
  }

  async unsubscribe(subscriberId: string, reason?: string): Promise<Subscriber> {
    return this.updateSubscriber(subscriberId, {
      status: 'unsubscribed',
      unsubscribed_at: new Date().toISOString(),
    });
  }

  async resubscribe(subscriberId: string): Promise<Subscriber> {
    return this.updateSubscriber(subscriberId, {
      status: 'active',
      unsubscribed_at: undefined,
    });
  }

  async deleteSubscriber(subscriberId: string): Promise<void> {
    const subscriber = await this.getSubscriber(subscriberId);

    const { error } = await this.supabase
      .from('email_subscribers')
      .delete()
      .eq('id', subscriberId);

    if (error) throw new Error(`Failed to delete subscriber: ${error.message}`);

    // Update list counts
    if (subscriber?.list_ids && subscriber.list_ids.length > 0) {
      await this.updateListCounts(subscriber.list_ids);
    }
  }

  async addToLists(subscriberId: string, listIds: string[]): Promise<Subscriber> {
    const subscriber = await this.getSubscriber(subscriberId);
    if (!subscriber) throw new Error('Subscriber not found');

    const newListIds = [...new Set([...subscriber.list_ids, ...listIds])];

    const updated = await this.updateSubscriber(subscriberId, { list_ids: newListIds });
    await this.updateListCounts(listIds);

    return updated;
  }

  async removeFromLists(subscriberId: string, listIds: string[]): Promise<Subscriber> {
    const subscriber = await this.getSubscriber(subscriberId);
    if (!subscriber) throw new Error('Subscriber not found');

    const newListIds = subscriber.list_ids.filter(id => !listIds.includes(id));

    const updated = await this.updateSubscriber(subscriberId, { list_ids: newListIds });
    await this.updateListCounts(listIds);

    return updated;
  }

  async addTags(subscriberId: string, tags: string[]): Promise<Subscriber> {
    const subscriber = await this.getSubscriber(subscriberId);
    if (!subscriber) throw new Error('Subscriber not found');

    const newTags = [...new Set([...subscriber.tags, ...tags])];
    return this.updateSubscriber(subscriberId, { tags: newTags });
  }

  async removeTags(subscriberId: string, tags: string[]): Promise<Subscriber> {
    const subscriber = await this.getSubscriber(subscriberId);
    if (!subscriber) throw new Error('Subscriber not found');

    const newTags = subscriber.tags.filter(t => !tags.includes(t));
    return this.updateSubscriber(subscriberId, { tags: newTags });
  }

  async updateEngagementScore(subscriberId: string): Promise<number> {
    const subscriber = await this.getSubscriber(subscriberId);
    if (!subscriber) throw new Error('Subscriber not found');

    // Calculate engagement score based on email activity
    let score = 50; // Base score

    // Open rate contribution
    if (subscriber.total_emails_sent > 0) {
      const openRate = subscriber.total_emails_opened / subscriber.total_emails_sent;
      score += Math.round(openRate * 30);
    }

    // Click rate contribution
    if (subscriber.total_emails_opened > 0) {
      const clickRate = subscriber.total_emails_clicked / subscriber.total_emails_opened;
      score += Math.round(clickRate * 20);
    }

    // Recency bonus
    if (subscriber.last_email_opened_at) {
      const daysSinceOpen = Math.floor(
        (Date.now() - new Date(subscriber.last_email_opened_at).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceOpen < 7) score += 10;
      else if (daysSinceOpen < 30) score += 5;
      else if (daysSinceOpen > 90) score -= 10;
    }

    score = Math.max(0, Math.min(100, score)); // Clamp to 0-100

    await this.updateSubscriber(subscriberId, { engagement_score: score });
    return score;
  }

  // =====================================================
  // List Operations
  // =====================================================

  async createList(userId: string, input: CreateListInput): Promise<EmailList> {
    const { data, error } = await this.supabase
      .from('email_lists')
      .insert({
        user_id: userId,
        name: input.name,
        description: input.description,
        type: 'manual',
        status: 'active',
        subscriber_count: 0,
        double_optin: input.double_optin || false,
        welcome_email_id: input.welcome_email_id,
        tags: input.tags || [],
        settings: input.settings || {},
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create list: ${error.message}`);
    return data;
  }

  async getList(listId: string): Promise<EmailList | null> {
    const { data, error } = await this.supabase
      .from('email_lists')
      .select('*')
      .eq('id', listId)
      .single();

    if (error) return null;
    return data;
  }

  async getLists(userId: string, status?: string): Promise<EmailList[]> {
    let query = this.supabase
      .from('email_lists')
      .select('*')
      .eq('user_id', userId)
      .order('name');

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw new Error(`Failed to get lists: ${error.message}`);
    return data || [];
  }

  async updateList(listId: string, updates: Partial<CreateListInput>): Promise<EmailList> {
    const { data, error } = await this.supabase
      .from('email_lists')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', listId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update list: ${error.message}`);
    return data;
  }

  async deleteList(listId: string): Promise<void> {
    const { error } = await this.supabase
      .from('email_lists')
      .update({ status: 'archived' })
      .eq('id', listId);

    if (error) throw new Error(`Failed to delete list: ${error.message}`);
  }

  async updateListCounts(listIds: string[]): Promise<void> {
    for (const listId of listIds) {
      const { count } = await this.supabase
        .from('email_subscribers')
        .select('id', { count: 'exact' })
        .contains('list_ids', [listId])
        .eq('status', 'active');

      await this.supabase
        .from('email_lists')
        .update({
          subscriber_count: count || 0,
          updated_at: new Date().toISOString(),
        })
        .eq('id', listId);
    }
  }

  // =====================================================
  // Segment Operations
  // =====================================================

  async createSegment(userId: string, input: CreateSegmentInput): Promise<Segment> {
    const { data, error } = await this.supabase
      .from('email_segments')
      .insert({
        user_id: userId,
        name: input.name,
        description: input.description,
        type: input.type || 'dynamic',
        conditions: input.conditions,
        condition_operator: input.condition_operator || 'and',
        subscriber_count: 0,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create segment: ${error.message}`);

    // Calculate initial count
    await this.calculateSegmentCount(data.id);

    return this.getSegment(data.id) as Promise<Segment>;
  }

  async getSegment(segmentId: string): Promise<Segment | null> {
    const { data, error } = await this.supabase
      .from('email_segments')
      .select('*')
      .eq('id', segmentId)
      .single();

    if (error) return null;
    return data;
  }

  async getSegments(userId: string): Promise<Segment[]> {
    const { data, error } = await this.supabase
      .from('email_segments')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('name');

    if (error) throw new Error(`Failed to get segments: ${error.message}`);
    return data || [];
  }

  async updateSegment(segmentId: string, updates: Partial<CreateSegmentInput>): Promise<Segment> {
    const { data, error } = await this.supabase
      .from('email_segments')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', segmentId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update segment: ${error.message}`);

    // Recalculate count if conditions changed
    if (updates.conditions) {
      await this.calculateSegmentCount(segmentId);
    }

    return data;
  }

  async deleteSegment(segmentId: string): Promise<void> {
    const { error } = await this.supabase
      .from('email_segments')
      .update({ is_active: false })
      .eq('id', segmentId);

    if (error) throw new Error(`Failed to delete segment: ${error.message}`);
  }

  async calculateSegmentCount(segmentId: string): Promise<number> {
    const segment = await this.getSegment(segmentId);
    if (!segment) throw new Error('Segment not found');

    // Get matching subscribers
    const subscribers = await this.getSegmentSubscribers(segment);

    await this.supabase
      .from('email_segments')
      .update({
        subscriber_count: subscribers.length,
        last_calculated_at: new Date().toISOString(),
      })
      .eq('id', segmentId);

    return subscribers.length;
  }

  async getSegmentSubscribers(segment: Segment): Promise<Subscriber[]> {
    // Build query based on conditions
    const { user_id, conditions, condition_operator } = segment;

    // Get all subscribers first (in production, this would be optimized)
    const { data: allSubscribers } = await this.supabase
      .from('email_subscribers')
      .select('*')
      .eq('user_id', user_id)
      .eq('status', 'active');

    if (!allSubscribers) return [];

    // Filter by conditions
    return allSubscribers.filter(subscriber => {
      const results = conditions.map(condition =>
        this.evaluateCondition(subscriber, condition)
      );

      if (condition_operator === 'and') {
        return results.every(r => r);
      } else {
        return results.some(r => r);
      }
    });
  }

  private evaluateCondition(subscriber: Subscriber, condition: SegmentCondition): boolean {
    let value: any;

    // Get the value to compare
    if (condition.field.startsWith('custom_fields.')) {
      const fieldName = condition.field.replace('custom_fields.', '');
      value = subscriber.custom_fields?.[fieldName];
    } else {
      value = (subscriber as any)[condition.field];
    }

    // Evaluate based on operator
    switch (condition.operator) {
      case 'equals':
        return value === condition.value;
      case 'not_equals':
        return value !== condition.value;
      case 'contains':
        return String(value).toLowerCase().includes(String(condition.value).toLowerCase());
      case 'not_contains':
        return !String(value).toLowerCase().includes(String(condition.value).toLowerCase());
      case 'greater_than':
        return Number(value) > Number(condition.value);
      case 'less_than':
        return Number(value) < Number(condition.value);
      case 'is_empty':
        return value === null || value === undefined || value === '';
      case 'is_not_empty':
        return value !== null && value !== undefined && value !== '';
      case 'in_list':
        return Array.isArray(condition.value) && condition.value.includes(value);
      case 'not_in_list':
        return Array.isArray(condition.value) && !condition.value.includes(value);
      default:
        return false;
    }
  }

  // =====================================================
  // Import Operations
  // =====================================================

  async createImportJob(userId: string, input: {
    list_id: string;
    file_name: string;
    file_url?: string;
    total_rows: number;
    field_mapping: Record<string, string>;
    options: ImportOptions;
  }): Promise<ImportJob> {
    const { data, error } = await this.supabase
      .from('email_import_jobs')
      .insert({
        user_id: userId,
        list_id: input.list_id,
        status: 'pending',
        file_name: input.file_name,
        file_url: input.file_url,
        total_rows: input.total_rows,
        processed_rows: 0,
        imported_count: 0,
        skipped_count: 0,
        error_count: 0,
        errors: [],
        field_mapping: input.field_mapping,
        options: input.options,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create import job: ${error.message}`);
    return data;
  }

  async processImportRow(
    userId: string,
    jobId: string,
    listId: string,
    rowData: Record<string, any>,
    fieldMapping: Record<string, string>,
    options: ImportOptions,
    rowNumber: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Map fields
      const email = rowData[fieldMapping['email']]?.toLowerCase().trim();
      if (!email || !this.isValidEmail(email)) {
        return { success: false, error: 'Invalid email address' };
      }

      // Check for existing subscriber
      const existing = await this.getSubscriberByEmail(userId, email);

      if (existing) {
        if (options.skip_duplicates) {
          return { success: false, error: 'Duplicate email' };
        }

        if (options.update_existing) {
          // Update existing subscriber
          const updates: Partial<Subscriber> = {};

          if (fieldMapping['first_name'] && rowData[fieldMapping['first_name']]) {
            updates.first_name = rowData[fieldMapping['first_name']];
          }
          if (fieldMapping['last_name'] && rowData[fieldMapping['last_name']]) {
            updates.last_name = rowData[fieldMapping['last_name']];
          }
          if (fieldMapping['phone'] && rowData[fieldMapping['phone']]) {
            updates.phone = rowData[fieldMapping['phone']];
          }

          // Add to list if not already
          if (!existing.list_ids.includes(listId)) {
            updates.list_ids = [...existing.list_ids, listId];
          }

          // Add tags
          if (options.add_tags && options.add_tags.length > 0) {
            updates.tags = [...new Set([...existing.tags, ...options.add_tags])];
          }

          await this.updateSubscriber(existing.id, updates);
          return { success: true };
        }

        return { success: false, error: 'Duplicate email' };
      }

      // Create new subscriber
      const subscriberData: CreateSubscriberInput = {
        email,
        source: 'import',
        source_details: { job_id: jobId, row: rowNumber },
        list_ids: [listId],
        tags: options.add_tags || [],
      };

      if (fieldMapping['first_name'] && rowData[fieldMapping['first_name']]) {
        subscriberData.first_name = rowData[fieldMapping['first_name']];
      }
      if (fieldMapping['last_name'] && rowData[fieldMapping['last_name']]) {
        subscriberData.last_name = rowData[fieldMapping['last_name']];
      }
      if (fieldMapping['phone'] && rowData[fieldMapping['phone']]) {
        subscriberData.phone = rowData[fieldMapping['phone']];
      }

      await this.createSubscriber(userId, subscriberData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async updateImportJobProgress(jobId: string, updates: {
    processed_rows: number;
    imported_count: number;
    skipped_count: number;
    error_count: number;
    errors?: ImportError[];
    status?: string;
    started_at?: string;
    completed_at?: string;
  }): Promise<void> {
    await this.supabase
      .from('email_import_jobs')
      .update(updates)
      .eq('id', jobId);
  }

  async getImportJobs(userId: string): Promise<ImportJob[]> {
    const { data, error } = await this.supabase
      .from('email_import_jobs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw new Error(`Failed to get import jobs: ${error.message}`);
    return data || [];
  }

  // =====================================================
  // Bulk Operations
  // =====================================================

  async bulkUpdateStatus(subscriberIds: string[], status: string): Promise<void> {
    const updates: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'unsubscribed') {
      updates.unsubscribed_at = new Date().toISOString();
    }

    const { error } = await this.supabase
      .from('email_subscribers')
      .update(updates)
      .in('id', subscriberIds);

    if (error) throw new Error(`Failed to bulk update status: ${error.message}`);
  }

  async bulkAddToList(subscriberIds: string[], listId: string): Promise<void> {
    const { data: subscribers } = await this.supabase
      .from('email_subscribers')
      .select('id, list_ids')
      .in('id', subscriberIds);

    if (!subscribers) return;

    for (const subscriber of subscribers) {
      if (!subscriber.list_ids.includes(listId)) {
        await this.supabase
          .from('email_subscribers')
          .update({
            list_ids: [...subscriber.list_ids, listId],
            updated_at: new Date().toISOString(),
          })
          .eq('id', subscriber.id);
      }
    }

    await this.updateListCounts([listId]);
  }

  async bulkRemoveFromList(subscriberIds: string[], listId: string): Promise<void> {
    const { data: subscribers } = await this.supabase
      .from('email_subscribers')
      .select('id, list_ids')
      .in('id', subscriberIds);

    if (!subscribers) return;

    for (const subscriber of subscribers) {
      const newListIds = subscriber.list_ids.filter((id: string) => id !== listId);
      await this.supabase
        .from('email_subscribers')
        .update({
          list_ids: newListIds,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscriber.id);
    }

    await this.updateListCounts([listId]);
  }

  async bulkAddTags(subscriberIds: string[], tags: string[]): Promise<void> {
    const { data: subscribers } = await this.supabase
      .from('email_subscribers')
      .select('id, tags')
      .in('id', subscriberIds);

    if (!subscribers) return;

    for (const subscriber of subscribers) {
      const newTags = [...new Set([...subscriber.tags, ...tags])];
      await this.supabase
        .from('email_subscribers')
        .update({
          tags: newTags,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscriber.id);
    }
  }

  async bulkDelete(subscriberIds: string[]): Promise<void> {
    const { error } = await this.supabase
      .from('email_subscribers')
      .delete()
      .in('id', subscriberIds);

    if (error) throw new Error(`Failed to bulk delete: ${error.message}`);
  }

  // =====================================================
  // Stats
  // =====================================================

  async getSubscriberStats(userId: string): Promise<{
    total: number;
    active: number;
    unsubscribed: number;
    bounced: number;
    new_this_month: number;
    growth_rate: number;
  }> {
    const { data: subscribers } = await this.supabase
      .from('email_subscribers')
      .select('status, created_at')
      .eq('user_id', userId);

    if (!subscribers) {
      return {
        total: 0,
        active: 0,
        unsubscribed: 0,
        bounced: 0,
        new_this_month: 0,
        growth_rate: 0,
      };
    }

    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const total = subscribers.length;
    const active = subscribers.filter(s => s.status === 'active').length;
    const unsubscribed = subscribers.filter(s => s.status === 'unsubscribed').length;
    const bounced = subscribers.filter(s => s.status === 'bounced').length;
    const newThisMonth = subscribers.filter(s => new Date(s.created_at) >= thisMonth).length;
    const newLastMonth = subscribers.filter(s =>
      new Date(s.created_at) >= lastMonth && new Date(s.created_at) < thisMonth
    ).length;

    const growthRate = newLastMonth > 0
      ? Math.round(((newThisMonth - newLastMonth) / newLastMonth) * 100)
      : 0;

    return {
      total,
      active,
      unsubscribed,
      bounced,
      new_this_month: newThisMonth,
      growth_rate: growthRate,
    };
  }

  // =====================================================
  // Helpers
  // =====================================================

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Export singleton instance
export const subscriberService = SubscriberService.getInstance();

// Export convenience functions
export const createSubscriber = (userId: string, input: CreateSubscriberInput) =>
  subscriberService.createSubscriber(userId, input);

export const createList = (userId: string, input: CreateListInput) =>
  subscriberService.createList(userId, input);

export const createSegment = (userId: string, input: CreateSegmentInput) =>
  subscriberService.createSegment(userId, input);
