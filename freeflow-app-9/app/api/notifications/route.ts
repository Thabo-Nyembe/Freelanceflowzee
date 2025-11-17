import { NextRequest, NextResponse } from 'next/server';

/**
 * Notifications API Route
 * Handles notification operations: mark as read, archive, delete, preferences
 */

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'payment' | 'project' | 'message' | 'system';
  read: boolean;
  timestamp: Date;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  avatar?: string;
  archived?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'mark-read':
        return await handleMarkAsRead(data);
      case 'mark-all-read':
        return await handleMarkAllRead(data);
      case 'archive':
        return await handleArchive(data);
      case 'delete':
        return await handleDelete(data);
      case 'bulk-action':
        return await handleBulkAction(data);
      case 'update-preferences':
        return await handleUpdatePreferences(data);
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Notifications API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Mock notification retrieval
    let notifications = getMockNotifications();

    // Apply filters
    if (filter === 'unread') {
      notifications = notifications.filter(n => !n.read);
    } else if (filter === 'read') {
      notifications = notifications.filter(n => n.read);
    } else if (filter === 'archived') {
      notifications = notifications.filter(n => n.archived);
    }

    if (type) {
      notifications = notifications.filter(n => n.type === type);
    }

    notifications = notifications.slice(0, limit);

    const unreadCount = notifications.filter(n => !n.read && !n.archived).length;

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
      total: notifications.length,
    });
  } catch (error: any) {
    console.error('Notifications GET Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Mark notification as read
 */
async function handleMarkAsRead(data: {
  notificationId: string;
}): Promise<NextResponse> {
  return NextResponse.json({
    success: true,
    action: 'mark-read',
    notificationId: data.notificationId,
    read: true,
    message: 'Notification marked as read',
  });
}

/**
 * Mark all notifications as read
 */
async function handleMarkAllRead(data: {
  filter?: string;
}): Promise<NextResponse> {
  const count = Math.floor(Math.random() * 20) + 5; // Mock count

  return NextResponse.json({
    success: true,
    action: 'mark-all-read',
    count,
    message: `${count} notifications marked as read`,
    achievement: count >= 20 ? {
      message: '📬 Inbox Zero Hero! All caught up!',
      badge: 'Organized',
      points: 10,
    } : undefined,
  });
}

/**
 * Archive notification
 */
async function handleArchive(data: {
  notificationIds: string[];
}): Promise<NextResponse> {
  const count = data.notificationIds.length;

  return NextResponse.json({
    success: true,
    action: 'archive',
    count,
    message: `${count} notification(s) archived`,
    undoAvailable: true,
    undoExpires: '30 seconds',
  });
}

/**
 * Delete notification
 */
async function handleDelete(data: {
  notificationIds: string[];
  permanent?: boolean;
}): Promise<NextResponse> {
  const count = data.notificationIds.length;
  const action = data.permanent ? 'permanently deleted' : 'deleted';

  return NextResponse.json({
    success: true,
    action: 'delete',
    count,
    permanent: data.permanent || false,
    message: `${count} notification(s) ${action}`,
    undoAvailable: !data.permanent,
    undoExpires: !data.permanent ? '30 seconds' : undefined,
  });
}

/**
 * Bulk action on multiple notifications
 */
async function handleBulkAction(data: {
  notificationIds: string[];
  bulkAction: 'read' | 'unread' | 'archive' | 'delete';
}): Promise<NextResponse> {
  const count = data.notificationIds.length;

  let message = '';
  switch (data.bulkAction) {
    case 'read':
      message = `${count} notifications marked as read`;
      break;
    case 'unread':
      message = `${count} notifications marked as unread`;
      break;
    case 'archive':
      message = `${count} notifications archived`;
      break;
    case 'delete':
      message = `${count} notifications deleted`;
      break;
  }

  return NextResponse.json({
    success: true,
    action: 'bulk-action',
    bulkAction: data.bulkAction,
    count,
    message,
    achievement: count >= 10 ? {
      message: '⚡ Bulk Action Master! Efficiency at its finest!',
      badge: 'Productivity Pro',
      points: 15,
    } : undefined,
  });
}

/**
 * Update notification preferences
 */
async function handleUpdatePreferences(data: {
  soundEnabled?: boolean;
  showPreviews?: boolean;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  categories?: string[];
}): Promise<NextResponse> {
  return NextResponse.json({
    success: true,
    action: 'update-preferences',
    preferences: data,
    message: 'Notification preferences updated',
    nextSteps: [
      'Changes take effect immediately',
      'You can always update preferences later',
      'Check your email for confirmation',
    ],
  });
}

/**
 * Get mock notifications
 */
function getMockNotifications(): Notification[] {
  const now = new Date();

  return [
    {
      id: 'notif-1',
      title: 'New Project Assigned',
      message: 'You have been assigned to the "Mobile App Redesign" project',
      type: 'project',
      read: false,
      timestamp: new Date(now.getTime() - 300000), // 5 min ago
      category: 'Projects',
      priority: 'high',
      actionUrl: '/dashboard/projects-hub',
      archived: false,
    },
    {
      id: 'notif-2',
      title: 'Payment Received',
      message: 'You received $2,500 from Acme Corp for Invoice #INV-2024-001',
      type: 'payment',
      read: false,
      timestamp: new Date(now.getTime() - 3600000), // 1 hour ago
      category: 'Payments',
      priority: 'medium',
      actionUrl: '/dashboard/financial',
      archived: false,
    },
    {
      id: 'notif-3',
      title: 'New Message',
      message: 'Sarah Johnson sent you a message: "Can we schedule a call?"',
      type: 'message',
      read: true,
      timestamp: new Date(now.getTime() - 7200000), // 2 hours ago
      category: 'Messages',
      priority: 'medium',
      actionUrl: '/dashboard/messages',
      archived: false,
    },
    {
      id: 'notif-4',
      title: 'Project Deadline Approaching',
      message: 'Website Redesign project is due in 2 days',
      type: 'warning',
      read: false,
      timestamp: new Date(now.getTime() - 14400000), // 4 hours ago
      category: 'Projects',
      priority: 'urgent',
      actionUrl: '/dashboard/projects-hub',
      archived: false,
    },
    {
      id: 'notif-5',
      title: 'Task Completed',
      message: 'Design mockups task has been marked as complete',
      type: 'success',
      read: true,
      timestamp: new Date(now.getTime() - 86400000), // 1 day ago
      category: 'Tasks',
      priority: 'low',
      actionUrl: '/dashboard/my-day',
      archived: false,
    },
    {
      id: 'notif-6',
      title: 'System Update',
      message: 'KAZI platform has been updated to v2.5 with new features',
      type: 'system',
      read: false,
      timestamp: new Date(now.getTime() - 172800000), // 2 days ago
      category: 'System',
      priority: 'low',
      archived: false,
    },
    {
      id: 'notif-7',
      title: 'New Booking Request',
      message: 'Client requested a consultation call for next Tuesday',
      type: 'info',
      read: false,
      timestamp: new Date(now.getTime() - 259200000), // 3 days ago
      category: 'Bookings',
      priority: 'high',
      actionUrl: '/dashboard/bookings',
      archived: false,
    },
    {
      id: 'notif-8',
      title: 'File Shared',
      message: 'John Doe shared "Project Brief.pdf" with you',
      type: 'info',
      read: true,
      timestamp: new Date(now.getTime() - 345600000), // 4 days ago
      category: 'Files',
      priority: 'low',
      actionUrl: '/dashboard/files-hub',
      archived: false,
    },
  ];
}
