// =====================================================
// PHASE 5.3: NATIVE MOBILE APPS FOUNDATION
// React hook for mobile app functionality
// Competes with: Fiverr, Upwork, FreshBooks mobile apps
// =====================================================

import { useState, useEffect, useCallback, useRef } from 'react';

// Types
interface Device {
  id: string;
  deviceId: string;
  deviceToken?: string;
  deviceType: 'ios' | 'android' | 'web';
  deviceName?: string;
  deviceModel?: string;
  osVersion?: string;
  appVersion?: string;
  pushEnabled: boolean;
  pushCategories: string[];
  biometricEnabled: boolean;
  pinEnabled: boolean;
  lastActiveAt: string;
  isActive: boolean;
  isTrusted: boolean;
}

interface PushNotification {
  id: string;
  title: string;
  body: string;
  subtitle?: string;
  category: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
  actionType?: string;
  actionData?: Record<string, unknown>;
  deepLink?: string;
  status: 'pending' | 'sent' | 'delivered' | 'opened' | 'failed';
  createdAt: string;
}

interface SyncQueueItem {
  id: string;
  operationType: 'create' | 'update' | 'delete';
  resourceType: string;
  resourceId?: string;
  payload: Record<string, unknown>;
  status: 'pending' | 'syncing' | 'synced' | 'conflict' | 'failed';
  priority: number;
  queuedAt: string;
  syncedAt?: string;
  retryCount: number;
  lastError?: string;
}

interface MobileDashboard {
  tasks: {
    total: number;
    dueToday: number;
    overdue: number;
    completedToday: number;
  };
  projects: {
    total: number;
    active: number;
  };
  invoices: {
    total: number;
    pending: number;
    overdue: number;
    totalOutstanding: number;
  };
  messages: {
    unread: number;
  };
  notifications: {
    unread: number;
  };
  timeTracking: {
    todayMinutes: number;
    activeTimer: boolean;
  };
}

interface AnalyticsEvent {
  eventName: string;
  eventCategory: 'navigation' | 'interaction' | 'error' | 'performance' | 'business';
  screenName?: string;
  properties?: Record<string, unknown>;
  durationMs?: number;
}

interface FeatureFlag {
  key: string;
  name: string;
  description?: string;
  enabled: boolean;
  variants?: Record<string, unknown>[];
  currentVariant?: string;
}

interface DeepLinkRoute {
  pathPattern: string;
  screenName: string;
  requiresAuth: boolean;
  params?: Record<string, string>;
}

interface MobileConfig {
  appName: string;
  bundleId: { ios: string; android: string };
  urlScheme: string;
  apiBaseUrl: string;
  features: Record<string, boolean>;
  theme: {
    primaryColor: string;
    accentColor: string;
    darkMode?: {
      primaryColor: string;
      accentColor: string;
    };
  };
  minAppVersion: string;
  sessionTimeoutMinutes: number;
}

interface UseMobileResult {
  // State
  currentDevice: Device | null;
  devices: Device[];
  notifications: PushNotification[];
  syncQueue: SyncQueueItem[];
  dashboard: MobileDashboard | null;
  featureFlags: Map<string, FeatureFlag>;
  config: MobileConfig | null;
  isOnline: boolean;
  isSyncing: boolean;
  isLoading: boolean;
  error: string | null;

  // Device management
  registerDevice: (deviceInfo: Partial<Device>) => Promise<Device>;
  updateDevice: (deviceId: string, updates: Partial<Device>) => Promise<Device>;
  removeDevice: (deviceId: string) => Promise<void>;
  fetchDevices: () => Promise<void>;
  trustDevice: (deviceId: string) => Promise<void>;

  // Push notifications
  updatePushToken: (token: string) => Promise<void>;
  updatePushSettings: (categories: string[]) => Promise<void>;
  fetchNotifications: () => Promise<void>;
  markNotificationOpened: (notificationId: string) => Promise<void>;

  // Offline sync
  queueOfflineChange: (item: Omit<SyncQueueItem, 'id' | 'status' | 'queuedAt' | 'retryCount'>) => Promise<void>;
  syncNow: () => Promise<void>;
  clearSyncQueue: () => Promise<void>;
  resolveConflict: (queueId: string, resolution: 'client_wins' | 'server_wins') => Promise<void>;

  // Dashboard
  fetchDashboard: () => Promise<void>;
  refreshDashboard: () => Promise<void>;

  // Analytics
  trackEvent: (event: AnalyticsEvent) => Promise<void>;
  trackScreenView: (screenName: string, previousScreen?: string) => Promise<void>;
  trackError: (error: Error, context?: Record<string, unknown>) => Promise<void>;

  // Feature flags
  isFeatureEnabled: (flagKey: string) => boolean;
  getFeatureVariant: (flagKey: string) => string | null;
  fetchFeatureFlags: () => Promise<void>;

  // Deep linking
  parseDeepLink: (url: string) => DeepLinkRoute | null;
  getDeepLinkUrl: (screenName: string, params?: Record<string, string>) => string;

  // Biometrics
  enableBiometric: () => Promise<void>;
  disableBiometric: () => Promise<void>;
  authenticateWithBiometric: () => Promise<boolean>;

  // PIN
  enablePin: (pin: string) => Promise<void>;
  disablePin: () => Promise<void>;
  verifyPin: (pin: string) => Promise<boolean>;

  // Session
  refreshSession: () => Promise<void>;
  terminateSession: () => Promise<void>;
  terminateAllSessions: () => Promise<void>;

  // Config
  fetchConfig: () => Promise<void>;
}

export function useMobile(): UseMobileResult {
  // State
  const [currentDevice, setCurrentDevice] = useState<Device | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>([]);
  const [dashboard, setDashboard] = useState<MobileDashboard | null>(null);
  const [featureFlags, setFeatureFlags] = useState<Map<string, FeatureFlag>>(new Map());
  const [config, setConfig] = useState<MobileConfig | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionCheckRef = useRef<NodeJS.Timeout | null>(null);

  // API helpers
  const fetchApi = useCallback(async (
    endpoint: string,
    options: RequestInit = {}
  ) => {
    const response = await fetch(`/api/mobile${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    return response.json();
  }, []);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Trigger sync when coming back online
      syncNow();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Periodic sync
  useEffect(() => {
    if (isOnline && !isSyncing && syncQueue.some(item => item.status === 'pending')) {
      syncIntervalRef.current = setInterval(() => {
        syncNow();
      }, 30000); // Sync every 30 seconds
    }

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [isOnline, isSyncing, syncQueue]);

  // =====================================================
  // DEVICE MANAGEMENT
  // =====================================================

  const registerDevice = useCallback(async (deviceInfo: Partial<Device>): Promise<Device> => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchApi('?action=register-device', {
        method: 'POST',
        body: JSON.stringify(deviceInfo),
      });

      setCurrentDevice(data.device);
      return data.device;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to register device';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchApi]);

  const updateDevice = useCallback(async (
    deviceId: string,
    updates: Partial<Device>
  ): Promise<Device> => {
    setError(null);

    try {
      const data = await fetchApi(`?deviceId=${deviceId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      // Update local state
      setDevices(prev => prev.map(d => d.id === deviceId ? data.device : d));
      if (currentDevice?.id === deviceId) {
        setCurrentDevice(data.device);
      }

      return data.device;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update device';
      setError(message);
      throw err;
    }
  }, [fetchApi, currentDevice]);

  const removeDevice = useCallback(async (deviceId: string): Promise<void> => {
    setError(null);

    try {
      await fetchApi(`?deviceId=${deviceId}`, {
        method: 'DELETE',
      });

      setDevices(prev => prev.filter(d => d.id !== deviceId));
      if (currentDevice?.id === deviceId) {
        setCurrentDevice(null);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove device';
      setError(message);
      throw err;
    }
  }, [fetchApi, currentDevice]);

  const fetchDevices = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchApi('?resource=devices');
      setDevices(data.devices);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch devices';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [fetchApi]);

  const trustDevice = useCallback(async (deviceId: string): Promise<void> => {
    await updateDevice(deviceId, { isTrusted: true } as Partial<Device>);
  }, [updateDevice]);

  // =====================================================
  // PUSH NOTIFICATIONS
  // =====================================================

  const updatePushToken = useCallback(async (token: string): Promise<void> => {
    setError(null);

    try {
      await fetchApi('?action=update-push-token', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });

      if (currentDevice) {
        setCurrentDevice({ ...currentDevice, deviceToken: token });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update push token';
      setError(message);
      throw err;
    }
  }, [fetchApi, currentDevice]);

  const updatePushSettings = useCallback(async (categories: string[]): Promise<void> => {
    if (!currentDevice) return;

    await updateDevice(currentDevice.id, {
      pushCategories: categories,
    } as Partial<Device>);
  }, [updateDevice, currentDevice]);

  const fetchNotifications = useCallback(async (): Promise<void> => {
    setError(null);

    try {
      const data = await fetchApi('?resource=notifications');
      setNotifications(data.notifications);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch notifications';
      setError(message);
    }
  }, [fetchApi]);

  const markNotificationOpened = useCallback(async (notificationId: string): Promise<void> => {
    setError(null);

    try {
      await fetchApi('?action=mark-read', {
        method: 'POST',
        body: JSON.stringify({ notificationId }),
      });

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, status: 'opened' as const } : n)
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to mark notification';
      setError(message);
    }
  }, [fetchApi]);

  // =====================================================
  // OFFLINE SYNC
  // =====================================================

  const queueOfflineChange = useCallback(async (
    item: Omit<SyncQueueItem, 'id' | 'status' | 'queuedAt' | 'retryCount'>
  ): Promise<void> => {
    const queueItem: SyncQueueItem = {
      ...item,
      id: crypto.randomUUID(),
      status: 'pending',
      queuedAt: new Date().toISOString(),
      retryCount: 0,
    };

    setSyncQueue(prev => [...prev, queueItem]);

    // Try to sync immediately if online
    if (isOnline) {
      syncNow();
    }
  }, [isOnline]);

  const syncNow = useCallback(async (): Promise<void> => {
    if (isSyncing || !isOnline) return;

    const pendingItems = syncQueue.filter(item => item.status === 'pending');
    if (pendingItems.length === 0) return;

    setIsSyncing(true);
    setError(null);

    try {
      const data = await fetchApi('?action=sync', {
        method: 'POST',
        body: JSON.stringify({ items: pendingItems }),
      });

      // Update sync queue with results
      setSyncQueue(prev => prev.map(item => {
        const result = data.results?.find((r: { id: string }) => r.id === item.id);
        if (result) {
          return {
            ...item,
            status: result.success ? 'synced' : (result.conflict ? 'conflict' : 'failed'),
            syncedAt: result.success ? new Date().toISOString() : undefined,
            lastError: result.error,
          };
        }
        return item;
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sync failed';
      setError(message);
    } finally {
      setIsSyncing(false);
    }
  }, [fetchApi, isSyncing, isOnline, syncQueue]);

  const clearSyncQueue = useCallback(async (): Promise<void> => {
    setSyncQueue(prev => prev.filter(item => item.status !== 'synced'));
  }, []);

  const resolveConflict = useCallback(async (
    queueId: string,
    resolution: 'client_wins' | 'server_wins'
  ): Promise<void> => {
    setError(null);

    try {
      await fetchApi('?action=resolve-conflict', {
        method: 'POST',
        body: JSON.stringify({ queueId, resolution }),
      });

      setSyncQueue(prev => prev.filter(item => item.id !== queueId));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to resolve conflict';
      setError(message);
      throw err;
    }
  }, [fetchApi]);

  // =====================================================
  // DASHBOARD
  // =====================================================

  const fetchDashboard = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchApi('?resource=dashboard');
      setDashboard(data.dashboard);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch dashboard';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [fetchApi]);

  const refreshDashboard = useCallback(async (): Promise<void> => {
    await fetchDashboard();
  }, [fetchDashboard]);

  // =====================================================
  // ANALYTICS
  // =====================================================

  const trackEvent = useCallback(async (event: AnalyticsEvent): Promise<void> => {
    try {
      await fetchApi('?action=track-event', {
        method: 'POST',
        body: JSON.stringify({
          ...event,
          deviceId: currentDevice?.id,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch {
      // Silently fail analytics - don't interrupt user experience
      console.warn('Failed to track event:', event.eventName);
    }
  }, [fetchApi, currentDevice]);

  const trackScreenView = useCallback(async (
    screenName: string,
    previousScreen?: string
  ): Promise<void> => {
    await trackEvent({
      eventName: 'screen_view',
      eventCategory: 'navigation',
      screenName,
      properties: { previousScreen },
    });
  }, [trackEvent]);

  const trackError = useCallback(async (
    err: Error,
    context?: Record<string, unknown>
  ): Promise<void> => {
    await trackEvent({
      eventName: 'error',
      eventCategory: 'error',
      properties: {
        message: err.message,
        stack: err.stack,
        ...context,
      },
    });
  }, [trackEvent]);

  // =====================================================
  // FEATURE FLAGS
  // =====================================================

  const fetchFeatureFlags = useCallback(async (): Promise<void> => {
    try {
      const data = await fetchApi('?resource=feature-flags');
      const flagsMap = new Map<string, FeatureFlag>();
      data.flags.forEach((flag: FeatureFlag) => {
        flagsMap.set(flag.key, flag);
      });
      setFeatureFlags(flagsMap);
    } catch {
      // Use defaults on error
      console.warn('Failed to fetch feature flags, using defaults');
    }
  }, [fetchApi]);

  const isFeatureEnabled = useCallback((flagKey: string): boolean => {
    const flag = featureFlags.get(flagKey);
    return flag?.enabled ?? false;
  }, [featureFlags]);

  const getFeatureVariant = useCallback((flagKey: string): string | null => {
    const flag = featureFlags.get(flagKey);
    return flag?.currentVariant ?? null;
  }, [featureFlags]);

  // =====================================================
  // DEEP LINKING
  // =====================================================

  const parseDeepLink = useCallback((url: string): DeepLinkRoute | null => {
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname;

      // Match against known routes
      const routes: DeepLinkRoute[] = [
        { pathPattern: '/dashboard', screenName: 'Dashboard', requiresAuth: true },
        { pathPattern: '/task/:id', screenName: 'TaskDetail', requiresAuth: true },
        { pathPattern: '/project/:id', screenName: 'ProjectDetail', requiresAuth: true },
        { pathPattern: '/invoice/:id', screenName: 'InvoiceDetail', requiresAuth: true },
        { pathPattern: '/chat/:id', screenName: 'ChatRoom', requiresAuth: true },
        { pathPattern: '/calendar', screenName: 'Calendar', requiresAuth: true },
        { pathPattern: '/settings', screenName: 'Settings', requiresAuth: true },
      ];

      for (const route of routes) {
        const pattern = route.pathPattern.replace(/:(\w+)/g, '([^/]+)');
        const regex = new RegExp(`^${pattern}$`);
        const match = path.match(regex);

        if (match) {
          const paramNames = route.pathPattern.match(/:(\w+)/g)?.map(p => p.slice(1)) || [];
          const params: Record<string, string> = {};
          paramNames.forEach((name, index) => {
            params[name] = match[index + 1];
          });

          return { ...route, params };
        }
      }

      return null;
    } catch {
      return null;
    }
  }, []);

  const getDeepLinkUrl = useCallback((
    screenName: string,
    params?: Record<string, string>
  ): string => {
    const scheme = config?.urlScheme || 'freeflow';
    let path = '';

    switch (screenName) {
      case 'TaskDetail':
        path = `/task/${params?.id || ''}`;
        break;
      case 'ProjectDetail':
        path = `/project/${params?.id || ''}`;
        break;
      case 'InvoiceDetail':
        path = `/invoice/${params?.id || ''}`;
        break;
      case 'ChatRoom':
        path = `/chat/${params?.id || ''}`;
        break;
      default:
        path = `/${screenName.toLowerCase()}`;
    }

    return `${scheme}://${path}`;
  }, [config]);

  // =====================================================
  // BIOMETRICS
  // =====================================================

  const enableBiometric = useCallback(async (): Promise<void> => {
    if (!currentDevice) throw new Error('No device registered');

    await updateDevice(currentDevice.id, { biometricEnabled: true } as Partial<Device>);
  }, [updateDevice, currentDevice]);

  const disableBiometric = useCallback(async (): Promise<void> => {
    if (!currentDevice) throw new Error('No device registered');

    await updateDevice(currentDevice.id, { biometricEnabled: false } as Partial<Device>);
  }, [updateDevice, currentDevice]);

  const authenticateWithBiometric = useCallback(async (): Promise<boolean> => {
    // In a real React Native app, this would use expo-local-authentication
    // For web/preview, we'll simulate success
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), 500);
    });
  }, []);

  // =====================================================
  // PIN
  // =====================================================

  const enablePin = useCallback(async (pin: string): Promise<void> => {
    if (!currentDevice) throw new Error('No device registered');

    await fetchApi('?action=set-pin', {
      method: 'POST',
      body: JSON.stringify({ pin }),
    });

    setCurrentDevice({ ...currentDevice, pinEnabled: true });
  }, [fetchApi, currentDevice]);

  const disablePin = useCallback(async (): Promise<void> => {
    if (!currentDevice) throw new Error('No device registered');

    await updateDevice(currentDevice.id, { pinEnabled: false } as Partial<Device>);
  }, [updateDevice, currentDevice]);

  const verifyPin = useCallback(async (pin: string): Promise<boolean> => {
    try {
      const data = await fetchApi('?action=verify-pin', {
        method: 'POST',
        body: JSON.stringify({ pin }),
      });
      return data.valid;
    } catch {
      return false;
    }
  }, [fetchApi]);

  // =====================================================
  // SESSION
  // =====================================================

  const refreshSession = useCallback(async (): Promise<void> => {
    try {
      await fetchApi('?action=refresh-session', {
        method: 'POST',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to refresh session';
      setError(message);
      throw err;
    }
  }, [fetchApi]);

  const terminateSession = useCallback(async (): Promise<void> => {
    try {
      await fetchApi('?action=terminate-session', {
        method: 'POST',
      });
      setCurrentDevice(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to terminate session';
      setError(message);
      throw err;
    }
  }, [fetchApi]);

  const terminateAllSessions = useCallback(async (): Promise<void> => {
    try {
      await fetchApi('?action=terminate-all-sessions', {
        method: 'POST',
      });
      setDevices([]);
      setCurrentDevice(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to terminate sessions';
      setError(message);
      throw err;
    }
  }, [fetchApi]);

  // =====================================================
  // CONFIG
  // =====================================================

  const fetchConfig = useCallback(async (): Promise<void> => {
    try {
      const data = await fetchApi('?resource=config');
      setConfig(data.config);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch config';
      setError(message);
    }
  }, [fetchApi]);

  // Initialize
  useEffect(() => {
    fetchConfig();
    fetchFeatureFlags();
  }, [fetchConfig, fetchFeatureFlags]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
      if (sessionCheckRef.current) {
        clearInterval(sessionCheckRef.current);
      }
    };
  }, []);

  return {
    // State
    currentDevice,
    devices,
    notifications,
    syncQueue,
    dashboard,
    featureFlags,
    config,
    isOnline,
    isSyncing,
    isLoading,
    error,

    // Device management
    registerDevice,
    updateDevice,
    removeDevice,
    fetchDevices,
    trustDevice,

    // Push notifications
    updatePushToken,
    updatePushSettings,
    fetchNotifications,
    markNotificationOpened,

    // Offline sync
    queueOfflineChange,
    syncNow,
    clearSyncQueue,
    resolveConflict,

    // Dashboard
    fetchDashboard,
    refreshDashboard,

    // Analytics
    trackEvent,
    trackScreenView,
    trackError,

    // Feature flags
    isFeatureEnabled,
    getFeatureVariant,
    fetchFeatureFlags,

    // Deep linking
    parseDeepLink,
    getDeepLinkUrl,

    // Biometrics
    enableBiometric,
    disableBiometric,
    authenticateWithBiometric,

    // PIN
    enablePin,
    disablePin,
    verifyPin,

    // Session
    refreshSession,
    terminateSession,
    terminateAllSessions,

    // Config
    fetchConfig,
  };
}

export default useMobile;
