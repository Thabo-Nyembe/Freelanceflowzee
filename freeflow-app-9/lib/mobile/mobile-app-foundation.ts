// lib/mobile/mobile-app-foundation.ts
// Native Mobile Apps Foundation - Competing with mobile apps from Fiverr, Upwork, FreshBooks
// Provides foundation for React Native/Expo app with shared business logic

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export type Platform = 'ios' | 'android' | 'web';
export type BiometricType = 'fingerprint' | 'faceId' | 'iris' | 'none';
export type ConnectionStatus = 'online' | 'offline' | 'metered';

export interface DeviceInfo {
  platform: Platform;
  osVersion: string;
  deviceId: string;
  deviceModel: string;
  appVersion: string;
  buildNumber: string;
  isTablet: boolean;
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
  locale: string;
  timezone: string;
  hasBiometrics: boolean;
  biometricType: BiometricType;
  hasNotifications: boolean;
  notificationToken?: string;
}

export interface PushNotificationPayload {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  imageUrl?: string;
  sound?: string;
  badge?: number;
  channelId?: string;
  priority?: 'default' | 'high' | 'max';
  action?: string;
  actionUrl?: string;
  scheduledAt?: Date;
  expiresAt?: Date;
}

export type NotificationType =
  | 'message'
  | 'payment'
  | 'project_update'
  | 'task_assigned'
  | 'invoice_sent'
  | 'invoice_paid'
  | 'deadline_reminder'
  | 'new_client'
  | 'proposal_accepted'
  | 'review_received'
  | 'system';

export interface AppState {
  isAuthenticated: boolean;
  user: MobileUser | null;
  deviceInfo: DeviceInfo | null;
  connectionStatus: ConnectionStatus;
  lastSync: Date | null;
  pendingActions: OfflineAction[];
  preferences: UserPreferences;
}

export interface MobileUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: string;
  plan: 'free' | 'starter' | 'professional' | 'enterprise';
  biometricEnabled: boolean;
  pinEnabled: boolean;
  lastLoginAt: Date;
  lastActivityAt: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: NotificationPreferences;
  biometricAuth: boolean;
  pinAuth: boolean;
  autoSync: boolean;
  offlineMode: boolean;
  hapticFeedback: boolean;
  defaultCurrency: string;
  language: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
}

export interface NotificationPreferences {
  enabled: boolean;
  messages: boolean;
  payments: boolean;
  projectUpdates: boolean;
  taskReminders: boolean;
  invoices: boolean;
  marketing: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // HH:MM
  quietHoursEnd: string; // HH:MM
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export interface OfflineAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: string;
  data: Record<string, unknown>;
  timestamp: Date;
  retryCount: number;
  lastError?: string;
}

export interface SyncResult {
  success: boolean;
  syncedAt: Date;
  itemsSynced: number;
  itemsFailed: number;
  errors: SyncError[];
  conflictsResolved: number;
}

export interface SyncError {
  actionId: string;
  entity: string;
  message: string;
  code: string;
}

export interface DeepLink {
  scheme: string;
  host: string;
  path: string;
  params: Record<string, string>;
}

export interface AppRoute {
  name: string;
  path: string;
  component: string;
  auth: boolean;
  params?: string[];
  deepLinkPattern?: string;
}

// =============================================================================
// MOBILE APP CONFIGURATION
// =============================================================================

export const mobileAppConfig = {
  name: 'FreeFlow',
  bundleId: {
    ios: 'com.freeflow.app',
    android: 'com.freeflow.app',
  },
  version: '1.0.0',
  buildNumber: 1,

  // Deep linking
  deepLink: {
    scheme: 'freeflow',
    hosts: ['app.freeflow.io', 'freeflow.io'],
  },

  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://app.freeflow.io',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
  },

  // Push Notifications
  notifications: {
    ios: {
      permissions: ['alert', 'badge', 'sound'],
      categories: [
        {
          id: 'MESSAGE',
          actions: [
            { id: 'reply', title: 'Reply', input: true },
            { id: 'mark_read', title: 'Mark as Read' },
          ],
        },
        {
          id: 'PAYMENT',
          actions: [
            { id: 'view', title: 'View Details' },
            { id: 'confirm', title: 'Confirm Receipt' },
          ],
        },
        {
          id: 'TASK',
          actions: [
            { id: 'complete', title: 'Mark Complete' },
            { id: 'snooze', title: 'Snooze 1 Hour' },
          ],
        },
      ],
    },
    android: {
      channelId: 'freeflow_default',
      channels: [
        {
          id: 'freeflow_messages',
          name: 'Messages',
          importance: 4, // HIGH
          sound: 'default',
          vibration: true,
        },
        {
          id: 'freeflow_payments',
          name: 'Payments',
          importance: 4,
          sound: 'payment',
          vibration: true,
        },
        {
          id: 'freeflow_tasks',
          name: 'Tasks & Reminders',
          importance: 3, // DEFAULT
          sound: 'default',
          vibration: true,
        },
        {
          id: 'freeflow_system',
          name: 'System',
          importance: 2, // LOW
          sound: 'none',
          vibration: false,
        },
      ],
    },
  },

  // Offline Configuration
  offline: {
    maxQueueSize: 100,
    syncInterval: 30000, // 30 seconds
    maxRetries: 5,
    conflictResolution: 'server_wins' as const,
  },

  // Security
  security: {
    biometricPrompt: {
      title: 'Authenticate',
      subtitle: 'Use biometrics to access FreeFlow',
      cancel: 'Use Password',
    },
    sessionTimeout: 3600000, // 1 hour
    pinLength: 6,
    maxPinAttempts: 5,
  },

  // Analytics
  analytics: {
    enabled: true,
    providers: ['mixpanel', 'firebase'],
    events: [
      'app_open',
      'app_background',
      'login',
      'logout',
      'screen_view',
      'action_performed',
      'error',
      'purchase',
    ],
  },
};

// =============================================================================
// NAVIGATION ROUTES
// =============================================================================

export const mobileRoutes: AppRoute[] = [
  // Auth
  { name: 'Login', path: '/auth/login', component: 'LoginScreen', auth: false },
  { name: 'Register', path: '/auth/register', component: 'RegisterScreen', auth: false },
  { name: 'ForgotPassword', path: '/auth/forgot-password', component: 'ForgotPasswordScreen', auth: false },
  { name: 'Biometric', path: '/auth/biometric', component: 'BiometricScreen', auth: false },
  { name: 'Pin', path: '/auth/pin', component: 'PinScreen', auth: false },

  // Main Tabs
  { name: 'Dashboard', path: '/dashboard', component: 'DashboardScreen', auth: true, deepLinkPattern: 'freeflow://dashboard' },
  { name: 'Projects', path: '/projects', component: 'ProjectsScreen', auth: true, deepLinkPattern: 'freeflow://projects' },
  { name: 'Messages', path: '/messages', component: 'MessagesScreen', auth: true, deepLinkPattern: 'freeflow://messages' },
  { name: 'Invoices', path: '/invoices', component: 'InvoicesScreen', auth: true, deepLinkPattern: 'freeflow://invoices' },
  { name: 'Profile', path: '/profile', component: 'ProfileScreen', auth: true },

  // Projects
  { name: 'ProjectDetail', path: '/projects/:id', component: 'ProjectDetailScreen', auth: true, params: ['id'], deepLinkPattern: 'freeflow://project/:id' },
  { name: 'CreateProject', path: '/projects/create', component: 'CreateProjectScreen', auth: true },
  { name: 'ProjectTasks', path: '/projects/:id/tasks', component: 'ProjectTasksScreen', auth: true, params: ['id'] },
  { name: 'ProjectFiles', path: '/projects/:id/files', component: 'ProjectFilesScreen', auth: true, params: ['id'] },

  // Tasks
  { name: 'Tasks', path: '/tasks', component: 'TasksScreen', auth: true, deepLinkPattern: 'freeflow://tasks' },
  { name: 'TaskDetail', path: '/tasks/:id', component: 'TaskDetailScreen', auth: true, params: ['id'], deepLinkPattern: 'freeflow://task/:id' },
  { name: 'CreateTask', path: '/tasks/create', component: 'CreateTaskScreen', auth: true },

  // Messages
  { name: 'Conversation', path: '/messages/:id', component: 'ConversationScreen', auth: true, params: ['id'], deepLinkPattern: 'freeflow://conversation/:id' },
  { name: 'NewMessage', path: '/messages/new', component: 'NewMessageScreen', auth: true },

  // Invoices
  { name: 'InvoiceDetail', path: '/invoices/:id', component: 'InvoiceDetailScreen', auth: true, params: ['id'], deepLinkPattern: 'freeflow://invoice/:id' },
  { name: 'CreateInvoice', path: '/invoices/create', component: 'CreateInvoiceScreen', auth: true },
  { name: 'InvoicePreview', path: '/invoices/:id/preview', component: 'InvoicePreviewScreen', auth: true, params: ['id'] },

  // Clients
  { name: 'Clients', path: '/clients', component: 'ClientsScreen', auth: true, deepLinkPattern: 'freeflow://clients' },
  { name: 'ClientDetail', path: '/clients/:id', component: 'ClientDetailScreen', auth: true, params: ['id'], deepLinkPattern: 'freeflow://client/:id' },
  { name: 'AddClient', path: '/clients/add', component: 'AddClientScreen', auth: true },

  // Calendar
  { name: 'Calendar', path: '/calendar', component: 'CalendarScreen', auth: true, deepLinkPattern: 'freeflow://calendar' },
  { name: 'EventDetail', path: '/calendar/:id', component: 'EventDetailScreen', auth: true, params: ['id'] },
  { name: 'CreateEvent', path: '/calendar/create', component: 'CreateEventScreen', auth: true },

  // Time Tracking
  { name: 'TimeTracking', path: '/time-tracking', component: 'TimeTrackingScreen', auth: true, deepLinkPattern: 'freeflow://time' },
  { name: 'TimeEntry', path: '/time-tracking/:id', component: 'TimeEntryScreen', auth: true, params: ['id'] },

  // Payments
  { name: 'Payments', path: '/payments', component: 'PaymentsScreen', auth: true, deepLinkPattern: 'freeflow://payments' },
  { name: 'PaymentDetail', path: '/payments/:id', component: 'PaymentDetailScreen', auth: true, params: ['id'], deepLinkPattern: 'freeflow://payment/:id' },

  // Notifications
  { name: 'Notifications', path: '/notifications', component: 'NotificationsScreen', auth: true },

  // Settings
  { name: 'Settings', path: '/settings', component: 'SettingsScreen', auth: true },
  { name: 'NotificationSettings', path: '/settings/notifications', component: 'NotificationSettingsScreen', auth: true },
  { name: 'SecuritySettings', path: '/settings/security', component: 'SecuritySettingsScreen', auth: true },
  { name: 'ProfileSettings', path: '/settings/profile', component: 'ProfileSettingsScreen', auth: true },
  { name: 'BillingSettings', path: '/settings/billing', component: 'BillingSettingsScreen', auth: true },
];

// =============================================================================
// MOBILE API SERVICE
// =============================================================================

export class MobileApiService {
  private baseUrl: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor(baseUrl: string = mobileAppConfig.api.baseUrl) {
    this.baseUrl = baseUrl;
  }

  setTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
  }

  private async request<T>(
    method: string,
    endpoint: string,
    data?: unknown,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });

    if (response.status === 401 && this.refreshToken) {
      // Try to refresh token
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${this.accessToken}`;
        const retryResponse = await fetch(url, {
          method,
          headers,
          body: data ? JSON.stringify(data) : undefined,
          ...options,
        });
        return retryResponse.json();
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `HTTP error ${response.status}`);
    }

    return response.json();
  }

  private async refreshAccessToken(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (response.ok) {
        const { accessToken, refreshToken } = await response.json();
        this.setTokens(accessToken, refreshToken);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<{ user: MobileUser; accessToken: string; refreshToken: string }> {
    return this.request('POST', '/api/auth/mobile/login', { email, password });
  }

  async register(data: { name: string; email: string; password: string }): Promise<{ user: MobileUser; accessToken: string; refreshToken: string }> {
    return this.request('POST', '/api/auth/mobile/register', data);
  }

  async logout(): Promise<void> {
    await this.request('POST', '/api/auth/mobile/logout');
    this.clearTokens();
  }

  async verifyBiometric(biometricToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    return this.request('POST', '/api/auth/mobile/biometric', { biometricToken });
  }

  async verifyPin(pin: string): Promise<{ accessToken: string; refreshToken: string }> {
    return this.request('POST', '/api/auth/mobile/pin', { pin });
  }

  // Device registration
  async registerDevice(deviceInfo: DeviceInfo): Promise<{ deviceId: string }> {
    return this.request('POST', '/api/mobile/devices', deviceInfo);
  }

  async updatePushToken(deviceId: string, pushToken: string): Promise<void> {
    return this.request('PUT', `/api/mobile/devices/${deviceId}/push-token`, { pushToken });
  }

  // Dashboard
  async getDashboard(): Promise<Record<string, unknown>> {
    return this.request('GET', '/api/mobile/dashboard');
  }

  // Projects
  async getProjects(params?: { status?: string; limit?: number; offset?: number }): Promise<Record<string, unknown>[]> {
    const query = new URLSearchParams(params as Record<string, string>);
    return this.request('GET', `/api/mobile/projects?${query}`);
  }

  async getProject(id: string): Promise<Record<string, unknown>> {
    return this.request('GET', `/api/mobile/projects/${id}`);
  }

  async createProject(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.request('POST', '/api/mobile/projects', data);
  }

  async updateProject(id: string, data: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.request('PUT', `/api/mobile/projects/${id}`, data);
  }

  // Tasks
  async getTasks(params?: { projectId?: string; status?: string; limit?: number }): Promise<Record<string, unknown>[]> {
    const query = new URLSearchParams(params as Record<string, string>);
    return this.request('GET', `/api/mobile/tasks?${query}`);
  }

  async createTask(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.request('POST', '/api/mobile/tasks', data);
  }

  async updateTask(id: string, data: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.request('PUT', `/api/mobile/tasks/${id}`, data);
  }

  async completeTask(id: string): Promise<Record<string, unknown>> {
    return this.request('POST', `/api/mobile/tasks/${id}/complete`);
  }

  // Messages
  async getConversations(limit?: number): Promise<Record<string, unknown>[]> {
    return this.request('GET', `/api/mobile/messages?limit=${limit || 20}`);
  }

  async getMessages(conversationId: string, limit?: number, before?: string): Promise<Record<string, unknown>[]> {
    const params = new URLSearchParams({ limit: String(limit || 50) });
    if (before) params.set('before', before);
    return this.request('GET', `/api/mobile/messages/${conversationId}?${params}`);
  }

  async sendMessage(conversationId: string, content: string, attachments?: string[]): Promise<Record<string, unknown>> {
    return this.request('POST', `/api/mobile/messages/${conversationId}`, { content, attachments });
  }

  async markConversationRead(conversationId: string): Promise<void> {
    return this.request('POST', `/api/mobile/messages/${conversationId}/read`);
  }

  // Invoices
  async getInvoices(params?: { status?: string; limit?: number }): Promise<Record<string, unknown>[]> {
    const query = new URLSearchParams(params as Record<string, string>);
    return this.request('GET', `/api/mobile/invoices?${query}`);
  }

  async getInvoice(id: string): Promise<Record<string, unknown>> {
    return this.request('GET', `/api/mobile/invoices/${id}`);
  }

  async createInvoice(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.request('POST', '/api/mobile/invoices', data);
  }

  async sendInvoice(id: string): Promise<void> {
    return this.request('POST', `/api/mobile/invoices/${id}/send`);
  }

  // Clients
  async getClients(limit?: number): Promise<Record<string, unknown>[]> {
    return this.request('GET', `/api/mobile/clients?limit=${limit || 50}`);
  }

  async getClient(id: string): Promise<Record<string, unknown>> {
    return this.request('GET', `/api/mobile/clients/${id}`);
  }

  async createClient(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.request('POST', '/api/mobile/clients', data);
  }

  // Time Tracking
  async getTimeEntries(params?: { projectId?: string; startDate?: string; endDate?: string }): Promise<Record<string, unknown>[]> {
    const query = new URLSearchParams(params as Record<string, string>);
    return this.request('GET', `/api/mobile/time-entries?${query}`);
  }

  async startTimer(projectId: string, taskId?: string, description?: string): Promise<Record<string, unknown>> {
    return this.request('POST', '/api/mobile/time-entries/start', { projectId, taskId, description });
  }

  async stopTimer(entryId: string): Promise<Record<string, unknown>> {
    return this.request('POST', `/api/mobile/time-entries/${entryId}/stop`);
  }

  // Notifications
  async getNotifications(limit?: number, unreadOnly?: boolean): Promise<Record<string, unknown>[]> {
    const params = new URLSearchParams({ limit: String(limit || 50) });
    if (unreadOnly) params.set('unreadOnly', 'true');
    return this.request('GET', `/api/mobile/notifications?${params}`);
  }

  async markNotificationRead(id: string): Promise<void> {
    return this.request('POST', `/api/mobile/notifications/${id}/read`);
  }

  async markAllNotificationsRead(): Promise<void> {
    return this.request('POST', '/api/mobile/notifications/read-all');
  }

  // Sync
  async sync(actions: OfflineAction[]): Promise<SyncResult> {
    return this.request('POST', '/api/mobile/sync', { actions });
  }

  async getChanges(since: Date): Promise<{ changes: Record<string, unknown>[]; serverTime: Date }> {
    return this.request('GET', `/api/mobile/sync/changes?since=${since.toISOString()}`);
  }
}

// =============================================================================
// OFFLINE SYNC SERVICE
// =============================================================================

export class OfflineSyncService {
  private queue: OfflineAction[] = [];
  private isOnline: boolean = true;
  private syncInProgress: boolean = false;
  private api: MobileApiService;

  constructor(api: MobileApiService) {
    this.api = api;
  }

  setOnlineStatus(online: boolean): void {
    this.isOnline = online;
    if (online && this.queue.length > 0) {
      this.processQueue();
    }
  }

  addToQueue(action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>): void {
    const offlineAction: OfflineAction = {
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      retryCount: 0,
      ...action,
    };

    this.queue.push(offlineAction);

    // Try to sync immediately if online
    if (this.isOnline) {
      this.processQueue();
    }
  }

  getQueue(): OfflineAction[] {
    return [...this.queue];
  }

  clearQueue(): void {
    this.queue = [];
  }

  async processQueue(): Promise<SyncResult> {
    if (this.syncInProgress || !this.isOnline || this.queue.length === 0) {
      return {
        success: true,
        syncedAt: new Date(),
        itemsSynced: 0,
        itemsFailed: 0,
        errors: [],
        conflictsResolved: 0,
      };
    }

    this.syncInProgress = true;

    try {
      const result = await this.api.sync(this.queue);

      // Remove successfully synced items
      if (result.success) {
        const failedIds = new Set(result.errors.map(e => e.actionId));
        this.queue = this.queue.filter(action => failedIds.has(action.id));

        // Increment retry count for failed items
        this.queue = this.queue.map(action => ({
          ...action,
          retryCount: action.retryCount + 1,
          lastError: result.errors.find(e => e.actionId === action.id)?.message,
        }));

        // Remove items that exceeded max retries
        this.queue = this.queue.filter(
          action => action.retryCount < mobileAppConfig.offline.maxRetries
        );
      }

      return result;
    } catch (error) {
      return {
        success: false,
        syncedAt: new Date(),
        itemsSynced: 0,
        itemsFailed: this.queue.length,
        errors: [
          {
            actionId: 'all',
            entity: 'sync',
            message: error instanceof Error ? error.message : 'Sync failed',
            code: 'SYNC_ERROR',
          },
        ],
        conflictsResolved: 0,
      };
    } finally {
      this.syncInProgress = false;
    }
  }
}

// =============================================================================
// PUSH NOTIFICATION SERVICE
// =============================================================================

export class PushNotificationService {
  private token: string | null = null;
  private handlers: Map<NotificationType, (payload: PushNotificationPayload) => void> = new Map();

  setToken(token: string): void {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  onNotification(type: NotificationType, handler: (payload: PushNotificationPayload) => void): void {
    this.handlers.set(type, handler);
  }

  handleNotification(payload: PushNotificationPayload): void {
    const handler = this.handlers.get(payload.type);
    if (handler) {
      handler(payload);
    }
  }

  // Create notification channel configurations for Android
  getAndroidChannels() {
    return mobileAppConfig.notifications.android.channels;
  }

  // Create notification category configurations for iOS
  getIosCategories() {
    return mobileAppConfig.notifications.ios.categories;
  }

  // Schedule local notification
  scheduleNotification(notification: Omit<PushNotificationPayload, 'id'>, scheduledTime: Date): string {
    const id = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    // Implementation would use native notification scheduling
    console.log('Scheduling notification:', { id, notification, scheduledTime });
    return id;
  }

  // Cancel scheduled notification
  cancelNotification(notificationId: string): void {
    // Implementation would cancel native scheduled notification
    console.log('Cancelling notification:', notificationId);
  }
}

// =============================================================================
// DEEP LINKING SERVICE
// =============================================================================

export class DeepLinkService {
  private routes: Map<string, AppRoute> = new Map();

  constructor() {
    // Build route map for quick lookup
    mobileRoutes.forEach(route => {
      if (route.deepLinkPattern) {
        this.routes.set(route.deepLinkPattern, route);
      }
      this.routes.set(route.path, route);
    });
  }

  parseDeepLink(url: string): DeepLink | null {
    try {
      const parsed = new URL(url);
      return {
        scheme: parsed.protocol.replace(':', ''),
        host: parsed.host,
        path: parsed.pathname,
        params: Object.fromEntries(parsed.searchParams),
      };
    } catch {
      // Try parsing custom scheme
      const match = url.match(/^(\w+):\/\/([^/]+)?(.*)$/);
      if (match) {
        const [, scheme, host, pathWithQuery] = match;
        const [path, query] = (pathWithQuery || '').split('?');
        const params: Record<string, string> = {};
        if (query) {
          query.split('&').forEach(pair => {
            const [key, value] = pair.split('=');
            params[decodeURIComponent(key)] = decodeURIComponent(value || '');
          });
        }
        return { scheme, host: host || '', path: path || '/', params };
      }
      return null;
    }
  }

  matchRoute(deepLink: DeepLink): { route: AppRoute; params: Record<string, string> } | null {
    const path = deepLink.path;

    for (const [pattern, route] of this.routes.entries()) {
      const params = this.matchPattern(pattern, path);
      if (params !== null) {
        return { route, params: { ...deepLink.params, ...params } };
      }
    }

    return null;
  }

  private matchPattern(pattern: string, path: string): Record<string, string> | null {
    // Convert pattern like /project/:id to regex
    const paramNames: string[] = [];
    const regexPattern = pattern.replace(/:(\w+)/g, (_, name) => {
      paramNames.push(name);
      return '([^/]+)';
    });

    const regex = new RegExp(`^${regexPattern}$`);
    const match = path.match(regex);

    if (match) {
      const params: Record<string, string> = {};
      paramNames.forEach((name, index) => {
        params[name] = match[index + 1];
      });
      return params;
    }

    return null;
  }

  generateDeepLink(routeName: string, params?: Record<string, string>): string {
    const route = mobileRoutes.find(r => r.name === routeName);
    if (!route) return '';

    let path = route.deepLinkPattern || route.path;
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        path = path.replace(`:${key}`, value);
      });
    }

    return `${mobileAppConfig.deepLink.scheme}://${path}`;
  }
}

// =============================================================================
// BIOMETRIC AUTH SERVICE
// =============================================================================

export class BiometricAuthService {
  private enabled: boolean = false;
  private biometricType: BiometricType = 'none';

  async checkAvailability(): Promise<{ available: boolean; biometricType: BiometricType }> {
    // In a real implementation, this would use native biometric APIs
    // For now, return simulated values
    return {
      available: true,
      biometricType: 'fingerprint',
    };
  }

  async authenticate(promptConfig?: Partial<typeof mobileAppConfig.security.biometricPrompt>): Promise<boolean> {
    const config = { ...mobileAppConfig.security.biometricPrompt, ...promptConfig };

    // In a real implementation, this would trigger native biometric prompt
    console.log('Biometric authentication requested:', config);

    // Simulated success
    return true;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  getBiometricType(): BiometricType {
    return this.biometricType;
  }
}

// =============================================================================
// ANALYTICS SERVICE
// =============================================================================

export class MobileAnalyticsService {
  private userId: string | null = null;
  private sessionId: string;
  private deviceInfo: DeviceInfo | null = null;

  constructor() {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  setUser(userId: string): void {
    this.userId = userId;
  }

  setDeviceInfo(info: DeviceInfo): void {
    this.deviceInfo = info;
  }

  track(event: string, properties?: Record<string, unknown>): void {
    if (!mobileAppConfig.analytics.enabled) return;

    const eventData = {
      event,
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      properties: {
        ...properties,
        platform: this.deviceInfo?.platform,
        appVersion: this.deviceInfo?.appVersion,
        osVersion: this.deviceInfo?.osVersion,
      },
    };

    // In a real implementation, send to analytics providers
    console.log('Analytics event:', eventData);
  }

  screenView(screenName: string, properties?: Record<string, unknown>): void {
    this.track('screen_view', { screenName, ...properties });
  }

  error(error: Error, context?: Record<string, unknown>): void {
    this.track('error', {
      errorMessage: error.message,
      errorStack: error.stack,
      ...context,
    });
  }

  startSession(): void {
    this.track('session_start');
  }

  endSession(): void {
    this.track('session_end');
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export const mobileApi = new MobileApiService();
export const offlineSync = new OfflineSyncService(mobileApi);
export const pushNotifications = new PushNotificationService();
export const deepLinks = new DeepLinkService();
export const biometricAuth = new BiometricAuthService();
export const mobileAnalytics = new MobileAnalyticsService();
