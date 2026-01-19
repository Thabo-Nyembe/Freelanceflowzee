/**
 * Notifications Screen
 */

import React, { useState } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import { useTheme } from '../contexts/ThemeContext'

interface Notification {
  id: string
  type: 'payment' | 'message' | 'task' | 'project' | 'system'
  title: string
  body: string
  time: string
  read: boolean
}

const mockNotifications: Notification[] = [
  { id: '1', type: 'payment', title: 'Payment Received', body: 'Invoice #1234 has been paid ($2,500)', time: '2m ago', read: false },
  { id: '2', type: 'message', title: 'New Message', body: 'Sarah Johnson sent you a message', time: '1h ago', read: false },
  { id: '3', type: 'task', title: 'Task Due Soon', body: 'Review wireframes is due tomorrow', time: '3h ago', read: false },
  { id: '4', type: 'project', title: 'Project Update', body: 'Website Redesign milestone completed', time: 'Yesterday', read: true },
  { id: '5', type: 'system', title: 'Weekly Report', body: 'Your weekly summary is ready to view', time: '2 days ago', read: true },
]

export function NotificationsScreen() {
  const { colors } = useTheme()
  const [refreshing, setRefreshing] = useState(false)
  const [notifications, setNotifications] = useState(mockNotifications)

  const onRefresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1000)
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'payment': return { name: 'cash-outline', color: '#10b981' }
      case 'message': return { name: 'chatbubble-outline', color: '#6366f1' }
      case 'task': return { name: 'checkmark-circle-outline', color: '#f59e0b' }
      case 'project': return { name: 'folder-outline', color: '#8b5cf6' }
      case 'system': return { name: 'information-circle-outline', color: '#64748b' }
    }
  }

  const renderNotification = ({ item }: { item: Notification }) => {
    const icon = getNotificationIcon(item.type)

    return (
      <TouchableOpacity
        style={[
          styles.notificationCard,
          { backgroundColor: colors.surface },
          !item.read && { borderLeftWidth: 3, borderLeftColor: colors.primary },
        ]}
        onPress={() => markAsRead(item.id)}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${icon.color}20` }]}>
          <Ionicons name={icon.name as any} size={20} color={icon.color} />
        </View>

        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }, !item.read && styles.unreadTitle]}>
            {item.title}
          </Text>
          <Text style={[styles.body, { color: colors.mutedForeground }]}>
            {item.body}
          </Text>
          <Text style={[styles.time, { color: colors.mutedForeground }]}>
            {item.time}
          </Text>
        </View>

        {!item.read && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
      </TouchableOpacity>
    )
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header Actions */}
      {unreadCount > 0 && (
        <View style={styles.headerActions}>
          <Text style={[styles.unreadCount, { color: colors.text }]}>
            {unreadCount} unread
          </Text>
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={[styles.markAllRead, { color: colors.primary }]}>
              Mark all as read
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No notifications yet
            </Text>
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  unreadCount: {
    fontSize: 14,
    fontWeight: '500',
  },
  markAllRead: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    marginBottom: 4,
  },
  unreadTitle: {
    fontWeight: '600',
  },
  body: {
    fontSize: 14,
    marginBottom: 4,
    lineHeight: 20,
  },
  time: {
    fontSize: 12,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
  },
})
