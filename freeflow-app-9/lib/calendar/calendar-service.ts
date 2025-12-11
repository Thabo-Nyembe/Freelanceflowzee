// =====================================================
// KAZI Calendar & Scheduling Service
// World-class event management, booking & availability
// =====================================================

import { createClient } from '@/lib/supabase/client';

// =====================================================
// Types
// =====================================================

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  all_day: boolean;
  location?: string;
  location_type: 'in_person' | 'video_call' | 'phone' | 'other';
  video_url?: string;
  color?: string;
  status: 'confirmed' | 'tentative' | 'cancelled';
  visibility: 'public' | 'private' | 'busy';
  recurrence_rule?: string;
  recurrence_end?: string;
  parent_event_id?: string;
  client_id?: string;
  project_id?: string;
  booking_id?: string;
  attendees: EventAttendee[];
  reminders: EventReminder[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface EventAttendee {
  email: string;
  name?: string;
  user_id?: string;
  status: 'pending' | 'accepted' | 'declined' | 'tentative';
  is_organizer: boolean;
  is_optional: boolean;
  responded_at?: string;
}

export interface EventReminder {
  type: 'email' | 'push' | 'sms';
  minutes_before: number;
  sent_at?: string;
}

export interface BookingType {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  description?: string;
  duration_minutes: number;
  buffer_before: number;
  buffer_after: number;
  color?: string;
  price?: number;
  currency: string;
  location_type: 'in_person' | 'video_call' | 'phone' | 'custom';
  location_details?: string;
  custom_questions: BookingQuestion[];
  confirmation_message?: string;
  cancellation_policy?: string;
  requires_approval: boolean;
  max_bookings_per_day?: number;
  min_notice_hours: number;
  max_advance_days: number;
  is_active: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface BookingQuestion {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'phone' | 'email';
  label: string;
  required: boolean;
  options?: string[];
}

export interface Booking {
  id: string;
  booking_type_id: string;
  user_id: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  location?: string;
  video_url?: string;
  answers: Record<string, any>;
  notes?: string;
  internal_notes?: string;
  payment_status?: 'pending' | 'paid' | 'refunded';
  payment_amount?: number;
  cancelled_by?: string;
  cancellation_reason?: string;
  cancelled_at?: string;
  reminder_sent_at?: string;
  confirmation_sent_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Availability {
  id: string;
  user_id: string;
  name: string;
  is_default: boolean;
  timezone: string;
  schedule: WeeklySchedule;
  date_overrides: DateOverride[];
  created_at: string;
  updated_at: string;
}

export interface WeeklySchedule {
  monday: TimeSlot[];
  tuesday: TimeSlot[];
  wednesday: TimeSlot[];
  thursday: TimeSlot[];
  friday: TimeSlot[];
  saturday: TimeSlot[];
  sunday: TimeSlot[];
}

export interface TimeSlot {
  start: string; // HH:mm
  end: string; // HH:mm
}

export interface DateOverride {
  date: string; // YYYY-MM-DD
  available: boolean;
  slots?: TimeSlot[];
  reason?: string;
}

export interface CalendarSync {
  id: string;
  user_id: string;
  provider: 'google' | 'outlook' | 'apple' | 'caldav';
  calendar_id: string;
  calendar_name?: string;
  sync_direction: 'import' | 'export' | 'both';
  is_active: boolean;
  last_synced_at?: string;
  sync_token?: string;
  credentials: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreateEventInput {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  all_day?: boolean;
  location?: string;
  location_type?: string;
  video_url?: string;
  color?: string;
  visibility?: string;
  recurrence_rule?: string;
  recurrence_end?: string;
  client_id?: string;
  project_id?: string;
  attendees?: Partial<EventAttendee>[];
  reminders?: EventReminder[];
}

export interface CreateBookingTypeInput {
  name: string;
  slug?: string;
  description?: string;
  duration_minutes: number;
  buffer_before?: number;
  buffer_after?: number;
  color?: string;
  price?: number;
  currency?: string;
  location_type?: string;
  location_details?: string;
  custom_questions?: BookingQuestion[];
  confirmation_message?: string;
  cancellation_policy?: string;
  requires_approval?: boolean;
  max_bookings_per_day?: number;
  min_notice_hours?: number;
  max_advance_days?: number;
  is_public?: boolean;
}

export interface CreateBookingInput {
  booking_type_id: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  start_time: string;
  answers?: Record<string, any>;
  notes?: string;
}

export interface AvailabilitySlot {
  start: string;
  end: string;
}

// =====================================================
// Calendar Service Class
// =====================================================

class CalendarService {
  private static instance: CalendarService;
  private supabase = createClient();

  private constructor() {}

  public static getInstance(): CalendarService {
    if (!CalendarService.instance) {
      CalendarService.instance = new CalendarService();
    }
    return CalendarService.instance;
  }

  // =====================================================
  // Event Operations
  // =====================================================

  async createEvent(userId: string, input: CreateEventInput): Promise<CalendarEvent> {
    const { data, error } = await this.supabase
      .from('calendar_events')
      .insert({
        user_id: userId,
        title: input.title,
        description: input.description,
        start_time: input.start_time,
        end_time: input.end_time,
        all_day: input.all_day || false,
        location: input.location,
        location_type: input.location_type || 'other',
        video_url: input.video_url,
        color: input.color,
        visibility: input.visibility || 'private',
        recurrence_rule: input.recurrence_rule,
        recurrence_end: input.recurrence_end,
        client_id: input.client_id,
        project_id: input.project_id,
        attendees: input.attendees || [],
        reminders: input.reminders || [],
        status: 'confirmed',
        metadata: {},
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create event: ${error.message}`);

    // Handle recurring events
    if (input.recurrence_rule) {
      await this.generateRecurringInstances(data.id, userId, input);
    }

    return data;
  }

  async getEvent(eventId: string): Promise<CalendarEvent | null> {
    const { data, error } = await this.supabase
      .from('calendar_events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error) return null;
    return data;
  }

  async getEvents(userId: string, params: {
    start_date?: string;
    end_date?: string;
    status?: string;
    client_id?: string;
    project_id?: string;
  } = {}): Promise<CalendarEvent[]> {
    let query = this.supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', userId)
      .order('start_time', { ascending: true });

    if (params.start_date) {
      query = query.gte('start_time', params.start_date);
    }

    if (params.end_date) {
      query = query.lte('end_time', params.end_date);
    }

    if (params.status) {
      query = query.eq('status', params.status);
    }

    if (params.client_id) {
      query = query.eq('client_id', params.client_id);
    }

    if (params.project_id) {
      query = query.eq('project_id', params.project_id);
    }

    const { data, error } = await query;

    if (error) throw new Error(`Failed to get events: ${error.message}`);
    return data || [];
  }

  async updateEvent(eventId: string, userId: string, updates: Partial<CreateEventInput>): Promise<CalendarEvent> {
    const { data, error } = await this.supabase
      .from('calendar_events')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', eventId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update event: ${error.message}`);
    return data;
  }

  async deleteEvent(eventId: string, userId: string, deleteRecurring: boolean = false): Promise<void> {
    if (deleteRecurring) {
      const event = await this.getEvent(eventId);
      if (event?.parent_event_id) {
        // Delete all instances of recurring event
        await this.supabase
          .from('calendar_events')
          .delete()
          .or(`id.eq.${event.parent_event_id},parent_event_id.eq.${event.parent_event_id}`);
      } else if (event?.recurrence_rule) {
        // This is the parent, delete all children
        await this.supabase
          .from('calendar_events')
          .delete()
          .or(`id.eq.${eventId},parent_event_id.eq.${eventId}`);
      }
    } else {
      const { error } = await this.supabase
        .from('calendar_events')
        .delete()
        .eq('id', eventId)
        .eq('user_id', userId);

      if (error) throw new Error(`Failed to delete event: ${error.message}`);
    }
  }

  async updateAttendeeStatus(eventId: string, email: string, status: string): Promise<CalendarEvent> {
    const event = await this.getEvent(eventId);
    if (!event) throw new Error('Event not found');

    const attendees = event.attendees.map(a =>
      a.email === email
        ? { ...a, status, responded_at: new Date().toISOString() }
        : a
    );

    const { data, error } = await this.supabase
      .from('calendar_events')
      .update({ attendees, updated_at: new Date().toISOString() })
      .eq('id', eventId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update attendee: ${error.message}`);
    return data;
  }

  private async generateRecurringInstances(
    parentId: string,
    userId: string,
    input: CreateEventInput
  ): Promise<void> {
    // Simple recurring event generation (would use rrule library in production)
    const rule = input.recurrence_rule;
    const endDate = input.recurrence_end ? new Date(input.recurrence_end) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    const start = new Date(input.start_time);
    const end = new Date(input.end_time);
    const duration = end.getTime() - start.getTime();

    const instances: any[] = [];
    let current = new Date(start);
    current.setDate(current.getDate() + 7); // Start from next occurrence

    let count = 0;
    const maxInstances = 52; // Limit to 52 instances

    while (current <= endDate && count < maxInstances) {
      instances.push({
        user_id: userId,
        parent_event_id: parentId,
        title: input.title,
        description: input.description,
        start_time: current.toISOString(),
        end_time: new Date(current.getTime() + duration).toISOString(),
        all_day: input.all_day || false,
        location: input.location,
        location_type: input.location_type || 'other',
        video_url: input.video_url,
        color: input.color,
        visibility: input.visibility || 'private',
        client_id: input.client_id,
        project_id: input.project_id,
        attendees: input.attendees || [],
        reminders: input.reminders || [],
        status: 'confirmed',
        metadata: {},
      });

      // Move to next occurrence based on rule
      if (rule?.includes('WEEKLY')) {
        current.setDate(current.getDate() + 7);
      } else if (rule?.includes('DAILY')) {
        current.setDate(current.getDate() + 1);
      } else if (rule?.includes('MONTHLY')) {
        current.setMonth(current.getMonth() + 1);
      } else {
        current.setDate(current.getDate() + 7); // Default to weekly
      }
      count++;
    }

    if (instances.length > 0) {
      await this.supabase.from('calendar_events').insert(instances);
    }
  }

  // =====================================================
  // Booking Type Operations
  // =====================================================

  async createBookingType(userId: string, input: CreateBookingTypeInput): Promise<BookingType> {
    const slug = input.slug || this.generateSlug(input.name);

    const { data, error } = await this.supabase
      .from('booking_types')
      .insert({
        user_id: userId,
        name: input.name,
        slug,
        description: input.description,
        duration_minutes: input.duration_minutes,
        buffer_before: input.buffer_before || 0,
        buffer_after: input.buffer_after || 0,
        color: input.color,
        price: input.price,
        currency: input.currency || 'USD',
        location_type: input.location_type || 'video_call',
        location_details: input.location_details,
        custom_questions: input.custom_questions || [],
        confirmation_message: input.confirmation_message,
        cancellation_policy: input.cancellation_policy,
        requires_approval: input.requires_approval || false,
        max_bookings_per_day: input.max_bookings_per_day,
        min_notice_hours: input.min_notice_hours || 24,
        max_advance_days: input.max_advance_days || 60,
        is_active: true,
        is_public: input.is_public ?? true,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create booking type: ${error.message}`);
    return data;
  }

  async getBookingTypes(userId: string): Promise<BookingType[]> {
    const { data, error } = await this.supabase
      .from('booking_types')
      .select('*')
      .eq('user_id', userId)
      .order('name');

    if (error) throw new Error(`Failed to get booking types: ${error.message}`);
    return data || [];
  }

  async getBookingType(bookingTypeId: string): Promise<BookingType | null> {
    const { data, error } = await this.supabase
      .from('booking_types')
      .select('*')
      .eq('id', bookingTypeId)
      .single();

    if (error) return null;
    return data;
  }

  async getBookingTypeBySlug(userId: string, slug: string): Promise<BookingType | null> {
    const { data, error } = await this.supabase
      .from('booking_types')
      .select('*')
      .eq('user_id', userId)
      .eq('slug', slug)
      .single();

    if (error) return null;
    return data;
  }

  async updateBookingType(bookingTypeId: string, userId: string, updates: Partial<CreateBookingTypeInput>): Promise<BookingType> {
    const { data, error } = await this.supabase
      .from('booking_types')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingTypeId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update booking type: ${error.message}`);
    return data;
  }

  async deleteBookingType(bookingTypeId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('booking_types')
      .delete()
      .eq('id', bookingTypeId)
      .eq('user_id', userId);

    if (error) throw new Error(`Failed to delete booking type: ${error.message}`);
  }

  // =====================================================
  // Booking Operations
  // =====================================================

  async createBooking(input: CreateBookingInput): Promise<Booking> {
    const bookingType = await this.getBookingType(input.booking_type_id);
    if (!bookingType) throw new Error('Booking type not found');

    // Calculate end time
    const startTime = new Date(input.start_time);
    const endTime = new Date(startTime.getTime() + bookingType.duration_minutes * 60 * 1000);

    // Check availability
    const isAvailable = await this.checkSlotAvailability(
      bookingType.user_id,
      input.start_time,
      endTime.toISOString(),
      bookingType.id
    );

    if (!isAvailable) {
      throw new Error('Selected time slot is not available');
    }

    // Check max bookings per day
    if (bookingType.max_bookings_per_day) {
      const dayStart = new Date(startTime);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const { count } = await this.supabase
        .from('bookings')
        .select('id', { count: 'exact' })
        .eq('booking_type_id', input.booking_type_id)
        .gte('start_time', dayStart.toISOString())
        .lt('start_time', dayEnd.toISOString())
        .not('status', 'eq', 'cancelled');

      if (count && count >= bookingType.max_bookings_per_day) {
        throw new Error('Maximum bookings for this day reached');
      }
    }

    const { data, error } = await this.supabase
      .from('bookings')
      .insert({
        booking_type_id: input.booking_type_id,
        user_id: bookingType.user_id,
        client_name: input.client_name,
        client_email: input.client_email,
        client_phone: input.client_phone,
        start_time: input.start_time,
        end_time: endTime.toISOString(),
        status: bookingType.requires_approval ? 'pending' : 'confirmed',
        location: bookingType.location_details,
        answers: input.answers || {},
        notes: input.notes,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create booking: ${error.message}`);

    // Create calendar event for confirmed bookings
    if (!bookingType.requires_approval) {
      await this.createEvent(bookingType.user_id, {
        title: `Booking: ${bookingType.name} with ${input.client_name}`,
        description: `Client: ${input.client_name}\nEmail: ${input.client_email}${input.client_phone ? `\nPhone: ${input.client_phone}` : ''}`,
        start_time: input.start_time,
        end_time: endTime.toISOString(),
        location_type: bookingType.location_type,
        attendees: [{ email: input.client_email, name: input.client_name, status: 'pending', is_organizer: false, is_optional: false }],
      });
    }

    return data;
  }

  async getBookings(userId: string, params: {
    booking_type_id?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
    client_email?: string;
  } = {}): Promise<Booking[]> {
    let query = this.supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .order('start_time', { ascending: true });

    if (params.booking_type_id) {
      query = query.eq('booking_type_id', params.booking_type_id);
    }

    if (params.status) {
      query = query.eq('status', params.status);
    }

    if (params.start_date) {
      query = query.gte('start_time', params.start_date);
    }

    if (params.end_date) {
      query = query.lte('start_time', params.end_date);
    }

    if (params.client_email) {
      query = query.eq('client_email', params.client_email);
    }

    const { data, error } = await query;

    if (error) throw new Error(`Failed to get bookings: ${error.message}`);
    return data || [];
  }

  async getBooking(bookingId: string): Promise<Booking | null> {
    const { data, error } = await this.supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (error) return null;
    return data;
  }

  async updateBookingStatus(bookingId: string, userId: string, status: string, notes?: string): Promise<Booking> {
    const updates: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'cancelled') {
      updates.cancelled_by = userId;
      updates.cancelled_at = new Date().toISOString();
      if (notes) updates.cancellation_reason = notes;
    }

    if (notes && status !== 'cancelled') {
      updates.internal_notes = notes;
    }

    const { data, error } = await this.supabase
      .from('bookings')
      .update(updates)
      .eq('id', bookingId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update booking: ${error.message}`);
    return data;
  }

  async rescheduleBooking(bookingId: string, userId: string, newStartTime: string): Promise<Booking> {
    const booking = await this.getBooking(bookingId);
    if (!booking) throw new Error('Booking not found');

    const bookingType = await this.getBookingType(booking.booking_type_id);
    if (!bookingType) throw new Error('Booking type not found');

    const newEndTime = new Date(new Date(newStartTime).getTime() + bookingType.duration_minutes * 60 * 1000);

    // Check availability
    const isAvailable = await this.checkSlotAvailability(
      userId,
      newStartTime,
      newEndTime.toISOString(),
      bookingType.id,
      bookingId // Exclude current booking
    );

    if (!isAvailable) {
      throw new Error('Selected time slot is not available');
    }

    const { data, error } = await this.supabase
      .from('bookings')
      .update({
        start_time: newStartTime,
        end_time: newEndTime.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new Error(`Failed to reschedule booking: ${error.message}`);
    return data;
  }

  // =====================================================
  // Availability Operations
  // =====================================================

  async createAvailability(userId: string, input: {
    name: string;
    timezone: string;
    schedule: WeeklySchedule;
    is_default?: boolean;
  }): Promise<Availability> {
    // If setting as default, unset other defaults
    if (input.is_default) {
      await this.supabase
        .from('availability_schedules')
        .update({ is_default: false })
        .eq('user_id', userId);
    }

    const { data, error } = await this.supabase
      .from('availability_schedules')
      .insert({
        user_id: userId,
        name: input.name,
        timezone: input.timezone,
        schedule: input.schedule,
        date_overrides: [],
        is_default: input.is_default || false,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create availability: ${error.message}`);
    return data;
  }

  async getAvailabilities(userId: string): Promise<Availability[]> {
    const { data, error } = await this.supabase
      .from('availability_schedules')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false });

    if (error) throw new Error(`Failed to get availabilities: ${error.message}`);
    return data || [];
  }

  async getDefaultAvailability(userId: string): Promise<Availability | null> {
    const { data, error } = await this.supabase
      .from('availability_schedules')
      .select('*')
      .eq('user_id', userId)
      .eq('is_default', true)
      .single();

    if (error) return null;
    return data;
  }

  async updateAvailability(availabilityId: string, userId: string, updates: Partial<{
    name: string;
    timezone: string;
    schedule: WeeklySchedule;
    date_overrides: DateOverride[];
    is_default: boolean;
  }>): Promise<Availability> {
    if (updates.is_default) {
      await this.supabase
        .from('availability_schedules')
        .update({ is_default: false })
        .eq('user_id', userId);
    }

    const { data, error } = await this.supabase
      .from('availability_schedules')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', availabilityId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update availability: ${error.message}`);
    return data;
  }

  async addDateOverride(availabilityId: string, userId: string, override: DateOverride): Promise<Availability> {
    const availability = await this.supabase
      .from('availability_schedules')
      .select('date_overrides')
      .eq('id', availabilityId)
      .single();

    if (!availability.data) throw new Error('Availability not found');

    const overrides = [...(availability.data.date_overrides || [])];
    const existingIndex = overrides.findIndex(o => o.date === override.date);

    if (existingIndex >= 0) {
      overrides[existingIndex] = override;
    } else {
      overrides.push(override);
    }

    return this.updateAvailability(availabilityId, userId, { date_overrides: overrides });
  }

  async getAvailableSlots(userId: string, bookingTypeId: string, date: string): Promise<AvailabilitySlot[]> {
    const bookingType = await this.getBookingType(bookingTypeId);
    if (!bookingType) throw new Error('Booking type not found');

    const availability = await this.getDefaultAvailability(userId);
    if (!availability) return [];

    const targetDate = new Date(date);
    const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][targetDate.getDay()] as keyof WeeklySchedule;

    // Check for date override
    const override = availability.date_overrides.find(o => o.date === date);
    if (override && !override.available) {
      return []; // Day is blocked
    }

    // Get schedule for the day
    const daySchedule = override?.slots || availability.schedule[dayName] || [];
    if (daySchedule.length === 0) return [];

    // Get existing events and bookings for the day
    const dayStart = new Date(targetDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const [events, bookings] = await Promise.all([
      this.getEvents(userId, {
        start_date: dayStart.toISOString(),
        end_date: dayEnd.toISOString(),
        status: 'confirmed',
      }),
      this.getBookings(userId, {
        start_date: dayStart.toISOString(),
        end_date: dayEnd.toISOString(),
        status: 'confirmed',
      }),
    ]);

    // Calculate blocked times
    const blockedTimes = [
      ...events.map(e => ({ start: new Date(e.start_time), end: new Date(e.end_time) })),
      ...bookings.map(b => ({
        start: new Date(new Date(b.start_time).getTime() - bookingType.buffer_before * 60 * 1000),
        end: new Date(new Date(b.end_time).getTime() + bookingType.buffer_after * 60 * 1000),
      })),
    ];

    // Generate available slots
    const slots: AvailabilitySlot[] = [];
    const slotDuration = bookingType.duration_minutes;
    const now = new Date();

    for (const schedule of daySchedule) {
      const [startHour, startMin] = schedule.start.split(':').map(Number);
      const [endHour, endMin] = schedule.end.split(':').map(Number);

      const scheduleStart = new Date(targetDate);
      scheduleStart.setHours(startHour, startMin, 0, 0);

      const scheduleEnd = new Date(targetDate);
      scheduleEnd.setHours(endHour, endMin, 0, 0);

      let current = new Date(scheduleStart);

      while (current.getTime() + slotDuration * 60 * 1000 <= scheduleEnd.getTime()) {
        const slotEnd = new Date(current.getTime() + slotDuration * 60 * 1000);

        // Check if slot is in the past
        if (current > now) {
          // Check minimum notice
          const minNotice = new Date(now.getTime() + bookingType.min_notice_hours * 60 * 60 * 1000);
          if (current >= minNotice) {
            // Check if slot conflicts with blocked times
            const hasConflict = blockedTimes.some(blocked =>
              (current >= blocked.start && current < blocked.end) ||
              (slotEnd > blocked.start && slotEnd <= blocked.end) ||
              (current <= blocked.start && slotEnd >= blocked.end)
            );

            if (!hasConflict) {
              slots.push({
                start: current.toISOString(),
                end: slotEnd.toISOString(),
              });
            }
          }
        }

        // Move to next slot
        current = new Date(current.getTime() + slotDuration * 60 * 1000);
      }
    }

    return slots;
  }

  async checkSlotAvailability(
    userId: string,
    startTime: string,
    endTime: string,
    bookingTypeId: string,
    excludeBookingId?: string
  ): Promise<boolean> {
    // Check for conflicting events
    const { data: events } = await this.supabase
      .from('calendar_events')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'confirmed')
      .or(`start_time.lt.${endTime},end_time.gt.${startTime}`)
      .limit(1);

    if (events && events.length > 0) return false;

    // Check for conflicting bookings
    let bookingQuery = this.supabase
      .from('bookings')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'confirmed')
      .or(`start_time.lt.${endTime},end_time.gt.${startTime}`)
      .limit(1);

    if (excludeBookingId) {
      bookingQuery = bookingQuery.neq('id', excludeBookingId);
    }

    const { data: bookings } = await bookingQuery;

    return !bookings || bookings.length === 0;
  }

  // =====================================================
  // Calendar Sync Operations
  // =====================================================

  async createCalendarSync(userId: string, input: {
    provider: string;
    calendar_id: string;
    calendar_name?: string;
    sync_direction?: string;
    credentials: Record<string, any>;
  }): Promise<CalendarSync> {
    const { data, error } = await this.supabase
      .from('calendar_syncs')
      .insert({
        user_id: userId,
        provider: input.provider,
        calendar_id: input.calendar_id,
        calendar_name: input.calendar_name,
        sync_direction: input.sync_direction || 'both',
        is_active: true,
        credentials: input.credentials,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create calendar sync: ${error.message}`);
    return data;
  }

  async getCalendarSyncs(userId: string): Promise<CalendarSync[]> {
    const { data, error } = await this.supabase
      .from('calendar_syncs')
      .select('*')
      .eq('user_id', userId);

    if (error) throw new Error(`Failed to get calendar syncs: ${error.message}`);
    return data || [];
  }

  async deleteCalendarSync(syncId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('calendar_syncs')
      .delete()
      .eq('id', syncId)
      .eq('user_id', userId);

    if (error) throw new Error(`Failed to delete calendar sync: ${error.message}`);
  }

  // =====================================================
  // Helpers
  // =====================================================

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  async getUpcomingEvents(userId: string, days: number = 7): Promise<CalendarEvent[]> {
    const now = new Date();
    const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    return this.getEvents(userId, {
      start_date: now.toISOString(),
      end_date: future.toISOString(),
      status: 'confirmed',
    });
  }

  async getUpcomingBookings(userId: string, days: number = 7): Promise<Booking[]> {
    const now = new Date();
    const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    return this.getBookings(userId, {
      start_date: now.toISOString(),
      end_date: future.toISOString(),
      status: 'confirmed',
    });
  }
}

// Export singleton instance
export const calendarService = CalendarService.getInstance();

// Export convenience functions
export const createEvent = (userId: string, input: CreateEventInput) =>
  calendarService.createEvent(userId, input);

export const createBookingType = (userId: string, input: CreateBookingTypeInput) =>
  calendarService.createBookingType(userId, input);

export const createBooking = (input: CreateBookingInput) =>
  calendarService.createBooking(input);

export const getAvailableSlots = (userId: string, bookingTypeId: string, date: string) =>
  calendarService.getAvailableSlots(userId, bookingTypeId, date);
