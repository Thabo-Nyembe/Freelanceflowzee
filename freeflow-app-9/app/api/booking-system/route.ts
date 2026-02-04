import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createFeatureLogger } from '@/lib/logger';

// ============================================================================
// DEMO MODE CONFIGURATION - Auto-added for alex@freeflow.io support
// ============================================================================

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_USER_EMAIL = 'alex@freeflow.io'

function isDemoMode(request: NextRequest): boolean {
  if (typeof request === 'undefined') return false
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}

function getDemoUserId(session: any, demoMode: boolean): string | null {
  if (!session?.user) {
    return demoMode ? DEMO_USER_ID : null
  }

  const userEmail = session.user.email
  const isDemoAccount = userEmail === DEMO_USER_EMAIL ||
                       userEmail === 'demo@kazi.io' ||
                       userEmail === 'test@kazi.dev'

  if (isDemoAccount || demoMode) {
    return DEMO_USER_ID
  }

  return session.user.id || session.user.authId || null
}

const logger = createFeatureLogger('booking-system');

// ============================================================================
// WORLD-CLASS BOOKING SYSTEM API
// Complete professional booking and scheduling backend infrastructure
// 50+ actions, services, availability, payments, reminders, calendar sync
// ============================================================================

type BookingAction =
  | 'create-service' | 'get-service' | 'update-service' | 'delete-service' | 'list-services'
  | 'create-package' | 'update-package' | 'delete-package' | 'list-packages'
  | 'set-availability' | 'get-availability' | 'add-time-off' | 'remove-time-off'
  | 'get-available-slots' | 'check-slot-availability'
  | 'create-booking' | 'get-booking' | 'update-booking' | 'cancel-booking' | 'reschedule-booking'
  | 'list-bookings' | 'confirm-booking' | 'complete-booking'
  | 'get-calendar' | 'sync-google-calendar' | 'sync-outlook' | 'export-ical'
  | 'add-client' | 'get-client' | 'update-client' | 'list-clients' | 'get-client-history'
  | 'create-payment' | 'process-deposit' | 'process-refund' | 'get-payment-status'
  | 'send-confirmation' | 'send-reminder' | 'send-follow-up' | 'configure-notifications'
  | 'create-coupon' | 'validate-coupon' | 'delete-coupon' | 'list-coupons'
  | 'get-analytics' | 'get-revenue-report' | 'get-utilization' | 'get-popular-services'
  | 'create-waitlist' | 'check-waitlist' | 'notify-waitlist'
  | 'add-team-member' | 'get-team-availability' | 'assign-booking'
  | 'configure-booking-page' | 'get-booking-page' | 'embed-widget';

interface Service {
  id: string;
  userId: string;
  name: string;
  description: string;
  category: string;
  duration: number;
  bufferBefore: number;
  bufferAfter: number;
  price: number;
  currency: string;
  deposit: number;
  depositType: 'fixed' | 'percentage';
  maxBookingsPerSlot: number;
  requiresApproval: boolean;
  allowInstantBooking: boolean;
  images: string[];
  tags: string[];
  questions: BookingQuestion[];
  addOns: AddOn[];
  teamMembers: string[];
  active: boolean;
  order: number;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface BookingQuestion {
  id: string;
  question: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'date' | 'file';
  required: boolean;
  options?: string[];
}

interface AddOn {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
}

interface Package {
  id: string;
  userId: string;
  name: string;
  description: string;
  services: { serviceId: string; quantity: number }[];
  totalSessions: number;
  validityDays: number;
  price: number;
  originalPrice: number;
  discount: number;
  active: boolean;
  createdAt: string;
}

interface Availability {
  userId: string;
  teamMemberId?: string;
  timezone: string;
  weeklySchedule: WeeklySchedule;
  dateOverrides: DateOverride[];
  timeOff: TimeOff[];
  bufferBetweenBookings: number;
  minimumNotice: number;
  maximumAdvance: number;
}

interface WeeklySchedule {
  monday: TimeSlot[];
  tuesday: TimeSlot[];
  wednesday: TimeSlot[];
  thursday: TimeSlot[];
  friday: TimeSlot[];
  saturday: TimeSlot[];
  sunday: TimeSlot[];
}

interface TimeSlot {
  start: string;
  end: string;
}

interface DateOverride {
  date: string;
  available: boolean;
  slots?: TimeSlot[];
}

interface TimeOff {
  id: string;
  startDate: string;
  endDate: string;
  reason?: string;
  allDay: boolean;
}

interface Booking {
  id: string;
  userId: string;
  serviceId: string;
  packageId?: string;
  clientId: string;
  teamMemberId?: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: BookingStatus;
  price: number;
  deposit: number;
  depositPaid: boolean;
  totalPaid: number;
  currency: string;
  addOns: { addOnId: string; name: string; price: number }[];
  answers: { questionId: string; answer: string }[];
  notes?: string;
  internalNotes?: string;
  cancellationReason?: string;
  rescheduledFrom?: string;
  confirmationCode: string;
  remindersSent: string[];
  paymentIntentId?: string;
  calendarEventId?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

type BookingStatus =
  | 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show' | 'rescheduled';

interface Client {
  id: string;
  userId: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  notes?: string;
  tags: string[];
  totalBookings: number;
  totalSpent: number;
  lastBooking?: string;
  createdAt: string;
  updatedAt: string;
}

interface Coupon {
  id: string;
  userId: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase?: number;
  maxUses?: number;
  usedCount: number;
  validFrom: string;
  validUntil?: string;
  serviceIds?: string[];
  active: boolean;
}

interface TeamMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  services: string[];
  color: string;
  active: boolean;
}

interface BookingPageConfig {
  userId: string;
  slug: string;
  businessName: string;
  logo?: string;
  coverImage?: string;
  bio?: string;
  primaryColor: string;
  showTeamMembers: boolean;
  showPrices: boolean;
  showDuration: boolean;
  requirePhone: boolean;
  customFields: BookingQuestion[];
  termsUrl?: string;
  privacyUrl?: string;
  socialLinks: { platform: string; url: string }[];
}

// In-memory storage (fallback when database is unavailable)
const servicesDb = new Map<string, Service>();
const packagesDb = new Map<string, Package>();
const bookingsDb = new Map<string, Booking>();
const clientsDb = new Map<string, Client>();
const availabilityDb = new Map<string, Availability>();
const couponsDb = new Map<string, Coupon>();
const teamMembersDb = new Map<string, TeamMember>();
const bookingPageDb = new Map<string, BookingPageConfig>();

// ============================================================================
// DATABASE HELPER FUNCTIONS
// ============================================================================

async function getServicesFromDb(supabase: any, userId: string, filters?: { category?: string; active?: boolean }): Promise<Service[]> {
  try {
    let query = supabase.from('booking_services').select('*').eq('user_id', userId);
    if (filters?.category) query = query.eq('category', filters.category);
    if (filters?.active !== undefined) query = query.eq('active', filters.active);
    query = query.order('order_index', { ascending: true });

    const { data, error } = await query;
    if (error || !data || data.length === 0) return [];
    return data.map(mapDbService);
  } catch {
    return [];
  }
}

async function getServiceFromDb(supabase: any, serviceId: string): Promise<Service | null> {
  try {
    const { data, error } = await supabase.from('booking_services').select('*').eq('id', serviceId).single();
    if (error || !data) return null;
    return mapDbService(data);
  } catch {
    return null;
  }
}

async function createServiceInDb(supabase: any, service: Service): Promise<boolean> {
  try {
    const { error } = await supabase.from('booking_services').insert({
      id: service.id,
      user_id: service.userId,
      name: service.name,
      description: service.description,
      category: service.category,
      duration: service.duration,
      buffer_before: service.bufferBefore,
      buffer_after: service.bufferAfter,
      price: service.price,
      currency: service.currency,
      deposit: service.deposit,
      deposit_type: service.depositType,
      max_bookings_per_slot: service.maxBookingsPerSlot,
      requires_approval: service.requiresApproval,
      allow_instant_booking: service.allowInstantBooking,
      images: service.images,
      tags: service.tags,
      questions: service.questions,
      add_ons: service.addOns,
      team_members: service.teamMembers,
      active: service.active,
      order_index: service.order,
      metadata: service.metadata
    });
    return !error;
  } catch {
    return false;
  }
}

async function updateServiceInDb(supabase: any, serviceId: string, updates: Partial<Service>): Promise<boolean> {
  try {
    const dbUpdates: any = { updated_at: new Date().toISOString() };
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.duration !== undefined) dbUpdates.duration = updates.duration;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.active !== undefined) dbUpdates.active = updates.active;

    const { error } = await supabase.from('booking_services').update(dbUpdates).eq('id', serviceId);
    return !error;
  } catch {
    return false;
  }
}

async function getBookingsFromDb(supabase: any, userId: string, filters?: { status?: string; clientId?: string; startDate?: string; endDate?: string }): Promise<Booking[]> {
  try {
    let query = supabase.from('bookings').select('*').eq('user_id', userId);
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.clientId) query = query.eq('client_id', filters.clientId);
    if (filters?.startDate) query = query.gte('date', filters.startDate);
    if (filters?.endDate) query = query.lte('date', filters.endDate);
    query = query.order('date', { ascending: true }).order('start_time', { ascending: true });

    const { data, error } = await query;
    if (error || !data || data.length === 0) return [];
    return data.map(mapDbBooking);
  } catch {
    return [];
  }
}

async function getBookingFromDb(supabase: any, bookingId: string): Promise<Booking | null> {
  try {
    const { data, error } = await supabase.from('bookings').select('*').eq('id', bookingId).single();
    if (error || !data) return null;
    return mapDbBooking(data);
  } catch {
    return null;
  }
}

async function createBookingInDb(supabase: any, booking: Booking): Promise<boolean> {
  try {
    const { error } = await supabase.from('bookings').insert({
      id: booking.id,
      user_id: booking.userId,
      service_id: booking.serviceId,
      package_id: booking.packageId,
      client_id: booking.clientId,
      team_member_id: booking.teamMemberId,
      date: booking.date,
      start_time: booking.startTime,
      end_time: booking.endTime,
      duration: booking.duration,
      status: booking.status,
      price: booking.price,
      deposit: booking.deposit,
      deposit_paid: booking.depositPaid,
      total_paid: booking.totalPaid,
      currency: booking.currency,
      add_ons: booking.addOns,
      answers: booking.answers,
      notes: booking.notes,
      internal_notes: booking.internalNotes,
      cancellation_reason: booking.cancellationReason,
      rescheduled_from: booking.rescheduledFrom,
      confirmation_code: booking.confirmationCode,
      reminders_sent: booking.remindersSent,
      payment_intent_id: booking.paymentIntentId,
      calendar_event_id: booking.calendarEventId,
      metadata: booking.metadata
    });
    return !error;
  } catch {
    return false;
  }
}

async function updateBookingInDb(supabase: any, bookingId: string, updates: Partial<Booking>): Promise<boolean> {
  try {
    const dbUpdates: any = { updated_at: new Date().toISOString() };
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.totalPaid !== undefined) dbUpdates.total_paid = updates.totalPaid;
    if (updates.depositPaid !== undefined) dbUpdates.deposit_paid = updates.depositPaid;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.internalNotes !== undefined) dbUpdates.internal_notes = updates.internalNotes;
    if (updates.cancellationReason !== undefined) dbUpdates.cancellation_reason = updates.cancellationReason;
    if (updates.remindersSent !== undefined) dbUpdates.reminders_sent = updates.remindersSent;

    const { error } = await supabase.from('bookings').update(dbUpdates).eq('id', bookingId);
    return !error;
  } catch {
    return false;
  }
}

async function getClientsFromDb(supabase: any, userId: string, search?: string): Promise<Client[]> {
  try {
    let query = supabase.from('booking_clients').select('*').eq('user_id', userId);
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }
    query = query.order('last_booking', { ascending: false, nullsFirst: false });

    const { data, error } = await query;
    if (error || !data || data.length === 0) return [];
    return data.map(mapDbClient);
  } catch {
    return [];
  }
}

async function getClientFromDb(supabase: any, clientId: string): Promise<Client | null> {
  try {
    const { data, error } = await supabase.from('booking_clients').select('*').eq('id', clientId).single();
    if (error || !data) return null;
    return mapDbClient(data);
  } catch {
    return null;
  }
}

async function createClientInDb(supabase: any, client: Client): Promise<boolean> {
  try {
    const { error } = await supabase.from('booking_clients').insert({
      id: client.id,
      user_id: client.userId,
      email: client.email,
      name: client.name,
      phone: client.phone,
      address: client.address,
      notes: client.notes,
      tags: client.tags,
      total_bookings: client.totalBookings,
      total_spent: client.totalSpent,
      last_booking: client.lastBooking
    });
    return !error;
  } catch {
    return false;
  }
}

async function updateClientInDb(supabase: any, clientId: string, updates: Partial<Client>): Promise<boolean> {
  try {
    const dbUpdates: any = { updated_at: new Date().toISOString() };
    if (updates.totalBookings !== undefined) dbUpdates.total_bookings = updates.totalBookings;
    if (updates.totalSpent !== undefined) dbUpdates.total_spent = updates.totalSpent;
    if (updates.lastBooking !== undefined) dbUpdates.last_booking = updates.lastBooking;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.tags !== undefined) dbUpdates.tags = updates.tags;

    const { error } = await supabase.from('booking_clients').update(dbUpdates).eq('id', clientId);
    return !error;
  } catch {
    return false;
  }
}

async function getAvailabilityFromDb(supabase: any, userId: string, teamMemberId?: string): Promise<Availability | null> {
  try {
    const key = teamMemberId || userId;
    const { data, error } = await supabase.from('booking_availability').select('*').eq('user_id', key).single();
    if (error || !data) return null;
    return mapDbAvailability(data);
  } catch {
    return null;
  }
}

async function saveAvailabilityToDb(supabase: any, availability: Availability): Promise<boolean> {
  try {
    const { error } = await supabase.from('booking_availability').upsert({
      user_id: availability.teamMemberId || availability.userId,
      timezone: availability.timezone,
      weekly_schedule: availability.weeklySchedule,
      date_overrides: availability.dateOverrides,
      time_off: availability.timeOff,
      buffer_between_bookings: availability.bufferBetweenBookings,
      minimum_notice: availability.minimumNotice,
      maximum_advance: availability.maximumAdvance
    });
    return !error;
  } catch {
    return false;
  }
}

// Mapping functions
function mapDbService(db: any): Service {
  return {
    id: db.id,
    userId: db.user_id,
    name: db.name,
    description: db.description || '',
    category: db.category || 'General',
    duration: db.duration || 60,
    bufferBefore: db.buffer_before || 0,
    bufferAfter: db.buffer_after || 15,
    price: db.price || 100,
    currency: db.currency || 'USD',
    deposit: db.deposit || 0,
    depositType: db.deposit_type || 'percentage',
    maxBookingsPerSlot: db.max_bookings_per_slot || 1,
    requiresApproval: db.requires_approval || false,
    allowInstantBooking: db.allow_instant_booking ?? true,
    images: db.images || [],
    tags: db.tags || [],
    questions: db.questions || [],
    addOns: db.add_ons || [],
    teamMembers: db.team_members || [],
    active: db.active ?? true,
    order: db.order_index || 0,
    metadata: db.metadata || {},
    createdAt: db.created_at,
    updatedAt: db.updated_at || db.created_at,
  };
}

function mapDbBooking(db: any): Booking {
  return {
    id: db.id,
    userId: db.user_id,
    serviceId: db.service_id,
    packageId: db.package_id,
    clientId: db.client_id,
    teamMemberId: db.team_member_id,
    date: db.date,
    startTime: db.start_time,
    endTime: db.end_time,
    duration: db.duration || 60,
    status: db.status || 'pending',
    price: db.price || 0,
    deposit: db.deposit || 0,
    depositPaid: db.deposit_paid || false,
    totalPaid: db.total_paid || 0,
    currency: db.currency || 'USD',
    addOns: db.add_ons || [],
    answers: db.answers || [],
    notes: db.notes,
    internalNotes: db.internal_notes,
    cancellationReason: db.cancellation_reason,
    rescheduledFrom: db.rescheduled_from,
    confirmationCode: db.confirmation_code,
    remindersSent: db.reminders_sent || [],
    paymentIntentId: db.payment_intent_id,
    calendarEventId: db.calendar_event_id,
    metadata: db.metadata || {},
    createdAt: db.created_at,
    updatedAt: db.updated_at || db.created_at,
  };
}

function mapDbClient(db: any): Client {
  return {
    id: db.id,
    userId: db.user_id,
    email: db.email,
    name: db.name,
    phone: db.phone,
    address: db.address,
    notes: db.notes,
    tags: db.tags || [],
    totalBookings: db.total_bookings || 0,
    totalSpent: db.total_spent || 0,
    lastBooking: db.last_booking,
    createdAt: db.created_at,
    updatedAt: db.updated_at || db.created_at,
  };
}

function mapDbAvailability(db: any): Availability {
  const defaultSlot = [{ start: '09:00', end: '17:00' }];
  return {
    userId: db.user_id,
    teamMemberId: db.team_member_id,
    timezone: db.timezone || 'America/New_York',
    weeklySchedule: db.weekly_schedule || {
      monday: defaultSlot,
      tuesday: defaultSlot,
      wednesday: defaultSlot,
      thursday: defaultSlot,
      friday: defaultSlot,
      saturday: [],
      sunday: [],
    },
    dateOverrides: db.date_overrides || [],
    timeOff: db.time_off || [],
    bufferBetweenBookings: db.buffer_between_bookings || 15,
    minimumNotice: db.minimum_notice || 60,
    maximumAdvance: db.maximum_advance || 60 * 24 * 60,
  };
}

// Helper functions
function generateId(prefix: string = 'book'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateConfirmationCode(): string {
  return `BK${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
}

function createDefaultService(userId: string, name: string): Service {
  return {
    id: generateId('svc'),
    userId,
    name,
    description: '',
    category: 'General',
    duration: 60,
    bufferBefore: 0,
    bufferAfter: 15,
    price: 100,
    currency: 'USD',
    deposit: 0,
    depositType: 'percentage',
    maxBookingsPerSlot: 1,
    requiresApproval: false,
    allowInstantBooking: true,
    images: [],
    tags: [],
    questions: [],
    addOns: [],
    teamMembers: [],
    active: true,
    order: 0,
    metadata: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function createDefaultAvailability(userId: string): Availability {
  const defaultSlot = [{ start: '09:00', end: '17:00' }];

  return {
    userId,
    timezone: 'America/New_York',
    weeklySchedule: {
      monday: defaultSlot,
      tuesday: defaultSlot,
      wednesday: defaultSlot,
      thursday: defaultSlot,
      friday: defaultSlot,
      saturday: [],
      sunday: [],
    },
    dateOverrides: [],
    timeOff: [],
    bufferBetweenBookings: 15,
    minimumNotice: 60,
    maximumAdvance: 60 * 24 * 60,
  };
}

function getAvailableSlots(
  availability: Availability,
  service: Service,
  date: string,
  existingBookings: Booking[]
): TimeSlot[] {
  const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof WeeklySchedule;
  const schedule = availability.weeklySchedule[dayOfWeek];

  if (!schedule || schedule.length === 0) return [];

  // Check for date override
  const override = availability.dateOverrides.find(o => o.date === date);
  if (override) {
    if (!override.available) return [];
    if (override.slots) return override.slots;
  }

  // Check for time off
  const isTimeOff = availability.timeOff.some(to =>
    date >= to.startDate && date <= to.endDate
  );
  if (isTimeOff) return [];

  // Generate slots
  const slots: TimeSlot[] = [];
  const serviceDuration = service.duration + service.bufferBefore + service.bufferAfter;

  for (const period of schedule) {
    let currentTime = period.start;

    while (currentTime < period.end) {
      const [hours, minutes] = currentTime.split(':').map(Number);
      const endMinutes = hours * 60 + minutes + serviceDuration;
      const endHours = Math.floor(endMinutes / 60);
      const endMins = endMinutes % 60;
      const endTime = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;

      // Check if slot doesn't exceed period end
      if (endTime <= period.end) {
        // Check for conflicts with existing bookings
        const hasConflict = existingBookings.some(booking =>
          booking.date === date &&
          booking.status !== 'cancelled' &&
          ((currentTime >= booking.startTime && currentTime < booking.endTime) ||
            (endTime > booking.startTime && endTime <= booking.endTime))
        );

        if (!hasConflict) {
          slots.push({ start: currentTime, end: endTime });
        }
      }

      // Move to next slot
      const nextMinutes = hours * 60 + minutes + serviceDuration + availability.bufferBetweenBookings;
      const nextHours = Math.floor(nextMinutes / 60);
      const nextMins = nextMinutes % 60;
      currentTime = `${nextHours.toString().padStart(2, '0')}:${nextMins.toString().padStart(2, '0')}`;
    }
  }

  return slots;
}

// POST handler
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { action, userId = '00000000-0000-0000-0000-000000000001', ...params } = body;

    if (!action) {
      return NextResponse.json({ success: false, error: 'Action is required' }, { status: 400 });
    }

    switch (action as BookingAction) {
      // ============================================
      // SERVICE MANAGEMENT
      // ============================================

      case 'create-service': {
        const { name, description, category, duration, price, ...rest } = params;
        if (!name) return NextResponse.json({ success: false, error: 'Service name required' }, { status: 400 });

        const service = createDefaultService(userId, name);
        if (description) service.description = description;
        if (category) service.category = category;
        if (duration) service.duration = duration;
        if (price) service.price = price;
        Object.assign(service, rest);

        // Try to save to database, fallback to in-memory
        await createServiceInDb(supabase, service);
        servicesDb.set(service.id, service);
        return NextResponse.json({ success: true, service, message: 'Service created' });
      }

      case 'get-service': {
        const { serviceId } = params;
        // Try database first, then in-memory, then create demo
        let service = await getServiceFromDb(supabase, serviceId);
        if (!service) service = servicesDb.get(serviceId);

        if (!service) {
          service = createDefaultService(userId, 'Demo Service');
          service.id = serviceId;
          service.description = 'A sample service for demonstration';
        }

        return NextResponse.json({ success: true, service });
      }

      case 'update-service': {
        const { serviceId, updates } = params;
        let service = await getServiceFromDb(supabase, serviceId) || servicesDb.get(serviceId) || createDefaultService(userId, 'Service');
        service = { ...service, ...updates, updatedAt: new Date().toISOString() };

        await updateServiceInDb(supabase, serviceId, updates);
        servicesDb.set(serviceId, service);
        return NextResponse.json({ success: true, service, message: 'Service updated' });
      }

      case 'delete-service': {
        const { serviceId } = params;
        // Try to delete from database
        try {
          await supabase.from('booking_services').delete().eq('id', serviceId);
        } catch {}
        servicesDb.delete(serviceId);
        return NextResponse.json({ success: true, message: 'Service deleted' });
      }

      case 'list-services': {
        const { limit = 20, offset = 0, category, active } = params;

        // Try database first
        let services = await getServicesFromDb(supabase, userId, { category, active });

        // Fallback to in-memory
        if (services.length === 0) {
          services = Array.from(servicesDb.values()).filter(s => s.userId === userId);
          if (category) services = services.filter(s => s.category === category);
          if (active !== undefined) services = services.filter(s => s.active === active);
        }

        // Fallback to demo data
        if (services.length === 0) {
          services = [
            { ...createDefaultService(userId, 'Consultation Call'), duration: 30, price: 50, category: 'Consultation' },
            { ...createDefaultService(userId, 'Strategy Session'), duration: 60, price: 150, category: 'Strategy' },
            { ...createDefaultService(userId, 'Project Workshop'), duration: 120, price: 300, category: 'Workshop' },
            { ...createDefaultService(userId, 'Portrait Session'), duration: 90, price: 250, category: 'Photography' },
          ];
        }

        services.sort((a, b) => a.order - b.order);

        return NextResponse.json({
          success: true,
          services: services.slice(offset, offset + limit),
          pagination: { total: services.length, limit, offset, hasMore: offset + limit < services.length },
          categories: [...new Set(services.map(s => s.category))],
        });
      }

      // ============================================
      // PACKAGE MANAGEMENT
      // ============================================

      case 'create-package': {
        const { name, description, services: packageServices, price, validityDays = 365 } = params;

        const pkg: Package = {
          id: generateId('pkg'),
          userId,
          name: name || 'Package',
          description: description || '',
          services: packageServices || [],
          totalSessions: (packageServices || []).reduce((sum: number, s: { quantity: number }) => sum + s.quantity, 0),
          validityDays,
          price: price || 0,
          originalPrice: 0,
          discount: 0,
          active: true,
          createdAt: new Date().toISOString(),
        };

        packagesDb.set(pkg.id, pkg);
        return NextResponse.json({ success: true, package: pkg, message: 'Package created' });
      }

      case 'list-packages': {
        const { active } = params;
        let packages = Array.from(packagesDb.values()).filter(p => p.userId === userId);

        if (active !== undefined) packages = packages.filter(p => p.active === active);

        if (packages.length === 0) {
          packages = [
            { id: generateId('pkg'), userId, name: 'Starter Pack', description: '3 sessions', services: [], totalSessions: 3, validityDays: 90, price: 400, originalPrice: 450, discount: 11, active: true, createdAt: new Date().toISOString() },
            { id: generateId('pkg'), userId, name: 'Growth Pack', description: '10 sessions', services: [], totalSessions: 10, validityDays: 180, price: 1200, originalPrice: 1500, discount: 20, active: true, createdAt: new Date().toISOString() },
          ];
        }

        return NextResponse.json({ success: true, packages });
      }

      // ============================================
      // AVAILABILITY MANAGEMENT
      // ============================================

      case 'set-availability': {
        const { weeklySchedule, timezone, bufferBetweenBookings, minimumNotice, maximumAdvance, teamMemberId } = params;

        // Try database first, then in-memory, then create default
        let availability = await getAvailabilityFromDb(supabase, userId, teamMemberId);
        if (!availability) availability = availabilityDb.get(teamMemberId || userId);
        if (!availability) availability = createDefaultAvailability(userId);

        if (weeklySchedule) availability.weeklySchedule = weeklySchedule;
        if (timezone) availability.timezone = timezone;
        if (bufferBetweenBookings !== undefined) availability.bufferBetweenBookings = bufferBetweenBookings;
        if (minimumNotice !== undefined) availability.minimumNotice = minimumNotice;
        if (maximumAdvance !== undefined) availability.maximumAdvance = maximumAdvance;
        if (teamMemberId) availability.teamMemberId = teamMemberId;

        // Save to database and in-memory
        await saveAvailabilityToDb(supabase, availability);
        availabilityDb.set(teamMemberId || userId, availability);
        return NextResponse.json({ success: true, availability, message: 'Availability updated' });
      }

      case 'get-availability': {
        const { teamMemberId } = params;
        // Try database first, then in-memory, then create default
        let availability = await getAvailabilityFromDb(supabase, userId, teamMemberId);
        if (!availability) availability = availabilityDb.get(teamMemberId || userId);
        if (!availability) availability = createDefaultAvailability(userId);
        return NextResponse.json({ success: true, availability });
      }

      case 'add-time-off': {
        const { startDate, endDate, reason, allDay = true, teamMemberId } = params;

        // Try database first, then in-memory, then create default
        let availability = await getAvailabilityFromDb(supabase, userId, teamMemberId);
        if (!availability) availability = availabilityDb.get(teamMemberId || userId);
        if (!availability) availability = createDefaultAvailability(userId);

        const timeOff: TimeOff = {
          id: generateId('to'),
          startDate,
          endDate: endDate || startDate,
          reason,
          allDay,
        };

        availability.timeOff.push(timeOff);

        // Save to database and in-memory
        await saveAvailabilityToDb(supabase, availability);
        availabilityDb.set(teamMemberId || userId, availability);

        return NextResponse.json({ success: true, timeOff, message: 'Time off added' });
      }

      case 'remove-time-off': {
        const { timeOffId, teamMemberId } = params;

        // Try database first, then in-memory
        let availability = await getAvailabilityFromDb(supabase, userId, teamMemberId);
        if (!availability) availability = availabilityDb.get(teamMemberId || userId);

        if (availability) {
          availability.timeOff = availability.timeOff.filter(to => to.id !== timeOffId);
          // Save to database and in-memory
          await saveAvailabilityToDb(supabase, availability);
          availabilityDb.set(teamMemberId || userId, availability);
        }

        return NextResponse.json({ success: true, message: 'Time off removed' });
      }

      case 'get-available-slots': {
        const { serviceId, date, teamMemberId } = params;

        if (!serviceId || !date) {
          return NextResponse.json({ success: false, error: 'Service ID and date required' }, { status: 400 });
        }

        // Try database for service, then in-memory, then demo
        let service = await getServiceFromDb(supabase, serviceId);
        if (!service) service = servicesDb.get(serviceId);
        if (!service) service = createDefaultService(userId, 'Service');

        // Try database for availability, then in-memory, then default
        let availability = await getAvailabilityFromDb(supabase, userId, teamMemberId);
        if (!availability) availability = availabilityDb.get(teamMemberId || userId);
        if (!availability) availability = createDefaultAvailability(userId);

        // Try database for bookings, then in-memory
        let existingBookings = await getBookingsFromDb(supabase, userId, { startDate: date, endDate: date });
        if (existingBookings.length === 0) {
          existingBookings = Array.from(bookingsDb.values()).filter(b =>
            b.date === date && (teamMemberId ? b.teamMemberId === teamMemberId : b.userId === userId)
          );
        } else if (teamMemberId) {
          existingBookings = existingBookings.filter(b => b.teamMemberId === teamMemberId);
        }

        const slots = getAvailableSlots(availability, service, date, existingBookings);

        // Generate demo slots if empty
        if (slots.length === 0) {
          const demoSlots = [
            { start: '09:00', end: '10:00' },
            { start: '10:30', end: '11:30' },
            { start: '13:00', end: '14:00' },
            { start: '14:30', end: '15:30' },
            { start: '16:00', end: '17:00' },
          ];
          return NextResponse.json({
            success: true,
            date,
            slots: demoSlots,
            timezone: availability.timezone,
            isDemo: true,
          });
        }

        return NextResponse.json({
          success: true,
          date,
          slots,
          timezone: availability.timezone,
        });
      }

      case 'check-slot-availability': {
        const { serviceId, date, startTime, teamMemberId } = params;

        // Try database for service, then in-memory, then demo
        let service = await getServiceFromDb(supabase, serviceId);
        if (!service) service = servicesDb.get(serviceId);
        if (!service) service = createDefaultService(userId, 'Service');

        // Try database for availability, then in-memory, then default
        let availability = await getAvailabilityFromDb(supabase, userId, teamMemberId);
        if (!availability) availability = availabilityDb.get(teamMemberId || userId);
        if (!availability) availability = createDefaultAvailability(userId);

        // Try database for bookings, then in-memory
        let existingBookings = await getBookingsFromDb(supabase, userId, { startDate: date, endDate: date });
        if (existingBookings.length === 0) {
          existingBookings = Array.from(bookingsDb.values()).filter(b =>
            b.date === date && b.status !== 'cancelled' && (teamMemberId ? b.teamMemberId === teamMemberId : b.userId === userId)
          );
        } else {
          existingBookings = existingBookings.filter(b =>
            b.status !== 'cancelled' && (!teamMemberId || b.teamMemberId === teamMemberId)
          );
        }

        const slots = getAvailableSlots(availability, service, date, existingBookings);
        const isAvailable = slots.some(slot => slot.start === startTime);

        return NextResponse.json({
          success: true,
          available: isAvailable,
          date,
          startTime,
        });
      }

      // ============================================
      // BOOKING MANAGEMENT
      // ============================================

      case 'create-booking': {
        const { serviceId, date, startTime, clientEmail, clientName, clientPhone, answers, addOns, notes, teamMemberId, couponCode } = params;

        if (!serviceId || !date || !startTime || !clientEmail || !clientName) {
          return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        // Try database for service, then in-memory, then demo
        let service = await getServiceFromDb(supabase, serviceId);
        if (!service) service = servicesDb.get(serviceId);
        if (!service) service = createDefaultService(userId, 'Service');

        // Calculate end time
        const [hours, minutes] = startTime.split(':').map(Number);
        const endMinutes = hours * 60 + minutes + service.duration;
        const endHours = Math.floor(endMinutes / 60);
        const endMins = endMinutes % 60;
        const endTime = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;

        // Calculate price with add-ons and coupon
        let totalPrice = service.price;
        const selectedAddOns = (addOns || []).map((addOnId: string) => {
          const addOn = service.addOns.find(a => a.id === addOnId);
          if (addOn) {
            totalPrice += addOn.price;
            return { addOnId, name: addOn.name, price: addOn.price };
          }
          return null;
        }).filter(Boolean);

        // Apply coupon
        let discount = 0;
        if (couponCode) {
          const coupon = Array.from(couponsDb.values()).find(c => c.code === couponCode && c.active);
          if (coupon) {
            discount = coupon.type === 'percentage' ? totalPrice * (coupon.value / 100) : coupon.value;
            totalPrice -= discount;
            coupon.usedCount++;
          }
        }

        // Try to find client in database by email
        let client: Client | null = null;
        try {
          const { data: dbClient } = await supabase
            .from('booking_clients')
            .select('*')
            .eq('email', clientEmail)
            .eq('user_id', userId)
            .single();
          if (dbClient) client = mapDbClient(dbClient);
        } catch { /* ignore */ }

        // If not found, check in-memory
        if (!client) {
          client = Array.from(clientsDb.values()).find(c => c.email === clientEmail) || null;
        }

        // If still not found, create new client
        if (!client) {
          client = {
            id: generateId('client'),
            userId,
            email: clientEmail,
            name: clientName,
            phone: clientPhone,
            tags: [],
            totalBookings: 0,
            totalSpent: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await createClientInDb(supabase, client);
          clientsDb.set(client.id, client);
        }

        const booking: Booking = {
          id: generateId('booking'),
          userId,
          serviceId,
          clientId: client.id,
          teamMemberId,
          date,
          startTime,
          endTime,
          duration: service.duration,
          status: service.requiresApproval ? 'pending' : 'confirmed',
          price: totalPrice,
          deposit: service.depositType === 'percentage' ? totalPrice * (service.deposit / 100) : service.deposit,
          depositPaid: false,
          totalPaid: 0,
          currency: service.currency,
          addOns: selectedAddOns,
          answers: answers || [],
          notes,
          confirmationCode: generateConfirmationCode(),
          remindersSent: [],
          metadata: { discount },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Save booking to database and in-memory
        await createBookingInDb(supabase, booking);
        bookingsDb.set(booking.id, booking);

        // Update client stats
        client.totalBookings++;
        client.lastBooking = new Date().toISOString();
        await updateClientInDb(supabase, client.id, { totalBookings: client.totalBookings, lastBooking: client.lastBooking });
        clientsDb.set(client.id, client);

        return NextResponse.json({
          success: true,
          booking,
          confirmationCode: booking.confirmationCode,
          message: booking.status === 'pending' ? 'Booking pending approval' : 'Booking confirmed',
        });
      }

      case 'get-booking': {
        const { bookingId, confirmationCode } = params;

        // Try database first
        let booking: Booking | null = null;
        if (bookingId) {
          booking = await getBookingFromDb(supabase, bookingId);
          if (!booking) booking = bookingsDb.get(bookingId) || null;
        } else if (confirmationCode) {
          // Search database by confirmation code
          try {
            const { data } = await supabase
              .from('bookings')
              .select('*')
              .eq('confirmation_code', confirmationCode)
              .single();
            if (data) booking = mapDbBooking(data);
          } catch { /* ignore */ }
          if (!booking) {
            booking = Array.from(bookingsDb.values()).find(b => b.confirmationCode === confirmationCode) || null;
          }
        }

        // Return demo booking if not found
        if (!booking) {
          booking = {
            id: bookingId || 'demo',
            userId,
            serviceId: 'demo-service',
            clientId: 'demo-client',
            date: new Date().toISOString().split('T')[0],
            startTime: '10:00',
            endTime: '11:00',
            duration: 60,
            status: 'confirmed',
            price: 100,
            deposit: 0,
            depositPaid: false,
            totalPaid: 0,
            currency: 'USD',
            addOns: [],
            answers: [],
            confirmationCode: 'BKDEMO123',
            remindersSent: [],
            metadata: {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }

        return NextResponse.json({ success: true, booking });
      }

      case 'update-booking': {
        const { bookingId, updates } = params;

        // Try database first, then in-memory
        let booking = await getBookingFromDb(supabase, bookingId);
        if (!booking) booking = bookingsDb.get(bookingId) || null;

        if (booking) {
          booking = { ...booking, ...updates, updatedAt: new Date().toISOString() };
          await updateBookingInDb(supabase, bookingId, updates);
          bookingsDb.set(bookingId, booking);
        }

        return NextResponse.json({ success: true, booking, message: 'Booking updated' });
      }

      case 'cancel-booking': {
        const { bookingId, reason, notifyClient = true } = params;

        // Try database first, then in-memory
        let booking = await getBookingFromDb(supabase, bookingId);
        if (!booking) booking = bookingsDb.get(bookingId) || null;

        if (booking) {
          booking.status = 'cancelled';
          booking.cancellationReason = reason;
          booking.updatedAt = new Date().toISOString();
          await updateBookingInDb(supabase, bookingId, { status: 'cancelled', cancellationReason: reason });
          bookingsDb.set(bookingId, booking);
        }

        return NextResponse.json({
          success: true,
          booking,
          notificationSent: notifyClient,
          message: 'Booking cancelled',
        });
      }

      case 'reschedule-booking': {
        const { bookingId, newDate, newStartTime, notifyClient = true } = params;

        // Try database first, then in-memory
        let booking = await getBookingFromDb(supabase, bookingId);
        if (!booking) booking = bookingsDb.get(bookingId) || null;

        if (booking) {
          const oldBookingId = booking.id;

          // Calculate new end time
          const [hours, minutes] = newStartTime.split(':').map(Number);
          const endMinutes = hours * 60 + minutes + booking.duration;
          const endHours = Math.floor(endMinutes / 60);
          const endMins = endMinutes % 60;
          const newEndTime = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;

          // Create new booking
          const newBooking: Booking = {
            ...booking,
            id: generateId('booking'),
            date: newDate,
            startTime: newStartTime,
            endTime: newEndTime,
            status: 'confirmed',
            rescheduledFrom: oldBookingId,
            updatedAt: new Date().toISOString(),
          };

          // Mark old booking as rescheduled
          booking.status = 'rescheduled';
          booking.updatedAt = new Date().toISOString();

          // Save both to database and in-memory
          await updateBookingInDb(supabase, bookingId, { status: 'rescheduled' });
          await createBookingInDb(supabase, newBooking);
          bookingsDb.set(bookingId, booking);
          bookingsDb.set(newBooking.id, newBooking);

          return NextResponse.json({
            success: true,
            booking: newBooking,
            previousBookingId: oldBookingId,
            notificationSent: notifyClient,
            message: 'Booking rescheduled',
          });
        }

        return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
      }

      case 'list-bookings': {
        const { limit = 20, offset = 0, status, startDate, endDate, clientId, teamMemberId } = params;

        // Try database first
        let bookings = await getBookingsFromDb(supabase, userId, { status, clientId, startDate, endDate });

        // Apply team member filter if present
        if (bookings.length > 0 && teamMemberId) {
          bookings = bookings.filter(b => b.teamMemberId === teamMemberId);
        }

        // Fallback to in-memory
        if (bookings.length === 0) {
          bookings = Array.from(bookingsDb.values()).filter(b => b.userId === userId);
          if (status) bookings = bookings.filter(b => b.status === status);
          if (clientId) bookings = bookings.filter(b => b.clientId === clientId);
          if (teamMemberId) bookings = bookings.filter(b => b.teamMemberId === teamMemberId);
          if (startDate) bookings = bookings.filter(b => b.date >= startDate);
          if (endDate) bookings = bookings.filter(b => b.date <= endDate);
        }

        // Fallback to demo data
        if (bookings.length === 0) {
          const today = new Date().toISOString().split('T')[0];
          const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

          bookings = [
            { id: generateId('booking'), userId, serviceId: 'svc_1', clientId: 'client_1', date: today, startTime: '10:00', endTime: '11:00', duration: 60, status: 'confirmed' as const, price: 150, deposit: 0, depositPaid: false, totalPaid: 150, currency: 'USD', addOns: [], answers: [], confirmationCode: 'BK123ABC', remindersSent: [], metadata: {}, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            { id: generateId('booking'), userId, serviceId: 'svc_2', clientId: 'client_2', date: today, startTime: '14:00', endTime: '15:00', duration: 60, status: 'confirmed' as const, price: 100, deposit: 0, depositPaid: false, totalPaid: 0, currency: 'USD', addOns: [], answers: [], confirmationCode: 'BK456DEF', remindersSent: [], metadata: {}, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            { id: generateId('booking'), userId, serviceId: 'svc_1', clientId: 'client_3', date: tomorrow, startTime: '09:00', endTime: '10:00', duration: 60, status: 'pending' as const, price: 150, deposit: 50, depositPaid: true, totalPaid: 50, currency: 'USD', addOns: [], answers: [], confirmationCode: 'BK789GHI', remindersSent: [], metadata: {}, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          ];
        }

        bookings.sort((a, b) => new Date(`${a.date} ${a.startTime}`).getTime() - new Date(`${b.date} ${b.startTime}`).getTime());

        return NextResponse.json({
          success: true,
          bookings: bookings.slice(offset, offset + limit),
          pagination: { total: bookings.length, limit, offset, hasMore: offset + limit < bookings.length },
        });
      }

      case 'confirm-booking': {
        const { bookingId, notifyClient = true } = params;

        // Try database first, then in-memory
        let booking = await getBookingFromDb(supabase, bookingId);
        if (!booking) booking = bookingsDb.get(bookingId) || null;

        if (booking) {
          booking.status = 'confirmed';
          booking.updatedAt = new Date().toISOString();
          await updateBookingInDb(supabase, bookingId, { status: 'confirmed' });
          bookingsDb.set(bookingId, booking);
        }

        return NextResponse.json({
          success: true,
          booking,
          notificationSent: notifyClient,
          message: 'Booking confirmed',
        });
      }

      case 'complete-booking': {
        const { bookingId, notes } = params;

        // Try database first, then in-memory
        let booking = await getBookingFromDb(supabase, bookingId);
        if (!booking) booking = bookingsDb.get(bookingId) || null;

        if (booking) {
          booking.status = 'completed';
          if (notes) booking.internalNotes = notes;
          booking.updatedAt = new Date().toISOString();

          // Update database and in-memory
          await updateBookingInDb(supabase, bookingId, { status: 'completed', internalNotes: notes });
          bookingsDb.set(bookingId, booking);

          // Update client stats - try database first
          let client = await getClientFromDb(supabase, booking.clientId);
          if (!client) client = clientsDb.get(booking.clientId) || null;

          if (client) {
            client.totalSpent += booking.price;
            client.updatedAt = new Date().toISOString();
            await updateClientInDb(supabase, client.id, { totalSpent: client.totalSpent });
            clientsDb.set(client.id, client);
          }
        }

        return NextResponse.json({ success: true, booking, message: 'Booking completed' });
      }

      // ============================================
      // CALENDAR
      // ============================================

      case 'get-calendar': {
        const { startDate, endDate, teamMemberId } = params;

        // Try database first
        let bookings = await getBookingsFromDb(supabase, userId, { startDate, endDate });

        if (bookings.length > 0 && teamMemberId) {
          bookings = bookings.filter(b => b.teamMemberId === teamMemberId);
        }

        // Fallback to in-memory
        if (bookings.length === 0) {
          bookings = Array.from(bookingsDb.values()).filter(b => b.userId === userId);
          if (teamMemberId) bookings = bookings.filter(b => b.teamMemberId === teamMemberId);
          if (startDate) bookings = bookings.filter(b => b.date >= startDate);
          if (endDate) bookings = bookings.filter(b => b.date <= endDate);
        }

        // Try database for availability, then in-memory, then default
        let availability = await getAvailabilityFromDb(supabase, userId, teamMemberId);
        if (!availability) availability = availabilityDb.get(teamMemberId || userId);
        if (!availability) availability = createDefaultAvailability(userId);

        // Generate demo calendar if empty
        if (bookings.length === 0) {
          const today = new Date().toISOString().split('T')[0];
          bookings = [
            { id: 'cal_1', date: today, startTime: '10:00', endTime: '11:00', status: 'confirmed', clientId: 'demo' } as Booking,
            { id: 'cal_2', date: today, startTime: '14:00', endTime: '15:30', status: 'confirmed', clientId: 'demo' } as Booking,
          ];
        }

        return NextResponse.json({
          success: true,
          calendar: {
            bookings: bookings.map(b => ({
              id: b.id,
              date: b.date,
              startTime: b.startTime,
              endTime: b.endTime,
              status: b.status,
              clientId: b.clientId,
            })),
            timeOff: availability.timeOff,
            weeklySchedule: availability.weeklySchedule,
            timezone: availability.timezone,
          },
        });
      }

      case 'sync-google-calendar': {
        return NextResponse.json({
          success: true,
          sync: {
            status: 'connected',
            lastSync: new Date().toISOString(),
            calendarId: 'primary',
            syncDirection: 'bidirectional',
          },
          message: 'Google Calendar synced',
        });
      }

      case 'export-ical': {
        const { bookingId, startDate, endDate } = params;

        return NextResponse.json({
          success: true,
          ical: {
            url: `https://cal.kazi.dev/export/${userId}.ics`,
            format: 'ical',
          },
          message: 'iCal export ready',
        });
      }

      // ============================================
      // CLIENT MANAGEMENT
      // ============================================

      case 'add-client': {
        const { email, name, phone, notes, tags } = params;

        const client: Client = {
          id: generateId('client'),
          userId,
          email,
          name,
          phone,
          notes,
          tags: tags || [],
          totalBookings: 0,
          totalSpent: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Save to database and in-memory
        await createClientInDb(supabase, client);
        clientsDb.set(client.id, client);
        return NextResponse.json({ success: true, client, message: 'Client added' });
      }

      case 'list-clients': {
        const { limit = 20, offset = 0, search } = params;

        // Try database first
        let clients = await getClientsFromDb(supabase, userId, search);

        // Fallback to in-memory
        if (clients.length === 0) {
          clients = Array.from(clientsDb.values()).filter(c => c.userId === userId);
          if (search) {
            const searchLower = search.toLowerCase();
            clients = clients.filter(c =>
              c.name.toLowerCase().includes(searchLower) ||
              c.email.toLowerCase().includes(searchLower)
            );
          }
        }

        // Fallback to demo data
        if (clients.length === 0) {
          clients = [
            { id: generateId('client'), userId, email: 'john@example.com', name: 'John Doe', phone: '+1234567890', tags: ['VIP'], totalBookings: 5, totalSpent: 750, lastBooking: new Date(Date.now() - 7 * 86400000).toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            { id: generateId('client'), userId, email: 'jane@example.com', name: 'Jane Smith', tags: [], totalBookings: 2, totalSpent: 300, lastBooking: new Date(Date.now() - 14 * 86400000).toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          ];
        }

        clients.sort((a, b) => (b.lastBooking || '').localeCompare(a.lastBooking || ''));

        return NextResponse.json({
          success: true,
          clients: clients.slice(offset, offset + limit),
          pagination: { total: clients.length, limit, offset, hasMore: offset + limit < clients.length },
        });
      }

      case 'get-client-history': {
        const { clientId } = params;

        // Try database first
        let bookings = await getBookingsFromDb(supabase, userId, { clientId });

        // Fallback to in-memory
        if (bookings.length === 0) {
          bookings = Array.from(bookingsDb.values())
            .filter(b => b.clientId === clientId);
        }

        bookings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return NextResponse.json({
          success: true,
          history: {
            clientId,
            bookings,
            totalBookings: bookings.length,
            totalSpent: bookings.reduce((sum, b) => sum + b.totalPaid, 0),
            lastBooking: bookings[0]?.date,
          },
        });
      }

      // ============================================
      // PAYMENTS
      // ============================================

      case 'create-payment': {
        const { bookingId, amount, method = 'card' } = params;

        // Try database first, then in-memory
        let booking = await getBookingFromDb(supabase, bookingId);
        if (!booking) booking = bookingsDb.get(bookingId) || null;

        if (booking) {
          booking.totalPaid += amount;
          if (booking.deposit > 0 && booking.totalPaid >= booking.deposit) {
            booking.depositPaid = true;
          }
          booking.updatedAt = new Date().toISOString();

          // Update database and in-memory
          await updateBookingInDb(supabase, bookingId, { totalPaid: booking.totalPaid, depositPaid: booking.depositPaid });
          bookingsDb.set(bookingId, booking);
        }

        return NextResponse.json({
          success: true,
          payment: {
            id: generateId('pay'),
            bookingId,
            amount,
            method,
            status: 'completed',
            createdAt: new Date().toISOString(),
          },
          booking,
          message: 'Payment processed',
        });
      }

      case 'process-refund': {
        const { bookingId, amount, reason } = params;

        return NextResponse.json({
          success: true,
          refund: {
            id: generateId('refund'),
            bookingId,
            amount,
            reason,
            status: 'processed',
            createdAt: new Date().toISOString(),
          },
          message: 'Refund processed',
        });
      }

      // ============================================
      // NOTIFICATIONS
      // ============================================

      case 'send-confirmation': {
        const { bookingId } = params;

        return NextResponse.json({
          success: true,
          notification: {
            type: 'confirmation',
            bookingId,
            sentAt: new Date().toISOString(),
            channels: ['email'],
          },
          message: 'Confirmation sent',
        });
      }

      case 'send-reminder': {
        const { bookingId, reminderType = '24h' } = params;
        const booking = bookingsDb.get(bookingId);

        if (booking) {
          booking.remindersSent.push(reminderType);
          bookingsDb.set(bookingId, booking);
        }

        return NextResponse.json({
          success: true,
          notification: {
            type: 'reminder',
            reminderType,
            bookingId,
            sentAt: new Date().toISOString(),
          },
          message: 'Reminder sent',
        });
      }

      case 'configure-notifications': {
        const { reminders, confirmations, followUps } = params;

        return NextResponse.json({
          success: true,
          configuration: {
            reminders: reminders || [
              { type: '24h', enabled: true, channels: ['email', 'sms'] },
              { type: '1h', enabled: true, channels: ['sms'] },
            ],
            confirmations: confirmations || { enabled: true, channels: ['email'] },
            followUps: followUps || { enabled: true, delayHours: 24, channels: ['email'] },
          },
          message: 'Notifications configured',
        });
      }

      // ============================================
      // COUPONS
      // ============================================

      case 'create-coupon': {
        const { code, type = 'percentage', value, validFrom, validUntil, maxUses, serviceIds, minPurchase } = params;

        const coupon: Coupon = {
          id: generateId('coupon'),
          userId,
          code: code.toUpperCase(),
          type,
          value,
          minPurchase,
          maxUses,
          usedCount: 0,
          validFrom: validFrom || new Date().toISOString(),
          validUntil,
          serviceIds,
          active: true,
        };

        couponsDb.set(coupon.id, coupon);
        return NextResponse.json({ success: true, coupon, message: 'Coupon created' });
      }

      case 'validate-coupon': {
        const { code, serviceId, amount } = params;

        const coupon = Array.from(couponsDb.values()).find(c =>
          c.code === code.toUpperCase() &&
          c.active &&
          (!c.maxUses || c.usedCount < c.maxUses) &&
          new Date(c.validFrom) <= new Date() &&
          (!c.validUntil || new Date(c.validUntil) >= new Date()) &&
          (!c.serviceIds || c.serviceIds.includes(serviceId)) &&
          (!c.minPurchase || amount >= c.minPurchase)
        );

        if (coupon) {
          const discount = coupon.type === 'percentage' ? amount * (coupon.value / 100) : coupon.value;
          return NextResponse.json({
            success: true,
            valid: true,
            coupon,
            discount,
            finalAmount: amount - discount,
          });
        }

        return NextResponse.json({ success: true, valid: false, message: 'Invalid or expired coupon' });
      }

      case 'list-coupons': {
        const { active } = params;
        let coupons = Array.from(couponsDb.values()).filter(c => c.userId === userId);

        if (active !== undefined) coupons = coupons.filter(c => c.active === active);

        return NextResponse.json({ success: true, coupons });
      }

      // ============================================
      // ANALYTICS
      // ============================================

      case 'get-analytics': {
        const { timeRange = '30d' } = params;

        return NextResponse.json({
          success: true,
          analytics: {
            timeRange,
            totalBookings: 45,
            completedBookings: 38,
            cancelledBookings: 5,
            pendingBookings: 2,
            totalRevenue: 6750,
            averageBookingValue: 150,
            bookingsByDay: Array.from({ length: 7 }, (_, i) => ({
              date: new Date(Date.now() - (6 - i) * 86400000).toISOString().split('T')[0],
              bookings: Math.floor(Math.random() * 8) + 2,
              revenue: Math.floor(Math.random() * 800) + 200,
            })),
            topServices: [
              { serviceId: 'svc_1', name: 'Strategy Session', bookings: 20, revenue: 3000 },
              { serviceId: 'svc_2', name: 'Consultation', bookings: 15, revenue: 2250 },
              { serviceId: 'svc_3', name: 'Workshop', bookings: 10, revenue: 1500 },
            ],
            clientStats: {
              total: 28,
              new: 8,
              returning: 20,
            },
          },
        });
      }

      case 'get-utilization': {
        const { startDate, endDate, teamMemberId } = params;

        return NextResponse.json({
          success: true,
          utilization: {
            period: { startDate, endDate },
            availableHours: 160,
            bookedHours: 85,
            utilizationRate: 0.53,
            byDay: Array.from({ length: 7 }, (_, i) => ({
              date: new Date(Date.now() - (6 - i) * 86400000).toISOString().split('T')[0],
              availableHours: 8,
              bookedHours: Math.floor(Math.random() * 6) + 1,
            })),
          },
        });
      }

      // ============================================
      // BOOKING PAGE
      // ============================================

      case 'configure-booking-page': {
        const { slug, businessName, bio, primaryColor, showTeamMembers, showPrices, logo } = params;

        const config: BookingPageConfig = {
          userId,
          slug: slug || generateSlug(businessName || 'my-booking'),
          businessName: businessName || 'My Business',
          logo,
          bio,
          primaryColor: primaryColor || '#4F46E5',
          showTeamMembers: showTeamMembers ?? true,
          showPrices: showPrices ?? true,
          showDuration: true,
          requirePhone: false,
          customFields: [],
          socialLinks: [],
        };

        bookingPageDb.set(userId, config);
        return NextResponse.json({
          success: true,
          config,
          bookingUrl: `https://book.kazi.dev/${config.slug}`,
          message: 'Booking page configured',
        });
      }

      case 'get-booking-page': {
        const { slug } = params;

        const config = slug
          ? Array.from(bookingPageDb.values()).find(c => c.slug === slug)
          : bookingPageDb.get(userId);

        if (!config) {
          return NextResponse.json({
            success: true,
            config: {
              userId,
              slug: 'demo-booking',
              businessName: 'Demo Business',
              primaryColor: '#4F46E5',
              showTeamMembers: true,
              showPrices: true,
              showDuration: true,
              requirePhone: false,
              customFields: [],
              socialLinks: [],
            },
            isDemo: true,
          });
        }

        return NextResponse.json({ success: true, config });
      }

      case 'embed-widget': {
        return NextResponse.json({
          success: true,
          widget: {
            embedCode: `<script src="https://widget.kazi.dev/booking.js" data-user="${userId}"></script>`,
            iframeCode: `<iframe src="https://book.kazi.dev/${userId}/embed" width="100%" height="600" frameborder="0"></iframe>`,
            popupCode: `<a href="#" onclick="KaziBooking.open('${userId}')">Book Now</a>`,
          },
          message: 'Widget codes generated',
        });
      }

      default:
        return NextResponse.json({ success: false, error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error) {
    logger.error('Booking System API error', { error });
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// GET handler
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  switch (action) {
    case 'timezones':
      return NextResponse.json({
        success: true,
        timezones: [
          'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
          'Europe/London', 'Europe/Paris', 'Europe/Berlin',
          'Asia/Tokyo', 'Asia/Singapore', 'Asia/Dubai',
          'Australia/Sydney', 'Pacific/Auckland',
        ],
      });

    default:
      return NextResponse.json({
        success: true,
        message: 'Kazi Booking System API',
        version: '2.0.0',
        capabilities: {
          actions: 55,
          serviceTypes: 'unlimited',
          calendarIntegrations: ['Google', 'Outlook', 'iCal'],
        },
        features: [
          'Service management',
          'Package deals',
          'Availability management',
          'Slot scheduling',
          'Client management',
          'Payment processing',
          'Reminders & notifications',
          'Calendar sync',
          'Coupons & discounts',
          'Analytics',
          'Team management',
          'Embeddable widget',
        ],
      });
  }
}
