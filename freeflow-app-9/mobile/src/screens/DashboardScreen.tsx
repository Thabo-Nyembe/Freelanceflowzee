/**
 * Dashboard Screen
 *
 * Main overview screen with stats and quick actions
 */

import React from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'

import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'

export function DashboardScreen() {
  const navigation = useNavigation<any>()
  const { colors } = useTheme()
  const { user } = useAuth()
  const [refreshing, setRefreshing] = React.useState(false)

  const onRefresh = React.useCallback(() => {
    setRefreshing(true)
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 1000)
  }, [])

  const stats = [
    { label: 'Active Projects', value: '12', icon: 'folder', color: '#6366f1' },
    { label: 'Pending Tasks', value: '8', icon: 'checkmark-circle', color: '#f59e0b' },
    { label: 'Messages', value: '3', icon: 'chatbubbles', color: '#10b981' },
    { label: 'Revenue', value: '$24.5K', icon: 'cash', color: '#ec4899' },
  ]

  const quickActions = [
    { label: 'New Project', icon: 'add-circle', route: 'Projects' },
    { label: 'Add Task', icon: 'checkbox', route: 'Tasks' },
    { label: 'AI Assistant', icon: 'sparkles', route: 'AIAssistant' },
    { label: 'Settings', icon: 'settings', route: 'Settings' },
  ]

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
            Welcome back,
          </Text>
          <Text style={[styles.userName, { color: colors.text }]}>
            {user?.user_metadata?.name || 'Freelancer'}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.notificationButton, { backgroundColor: colors.surface }]}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Ionicons name="notifications-outline" size={24} color={colors.text} />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <View
            key={index}
            style={[styles.statCard, { backgroundColor: colors.surface }]}
          >
            <View style={[styles.statIconContainer, { backgroundColor: `${stat.color}20` }]}>
              <Ionicons name={stat.icon as any} size={20} color={stat.color} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {stat.value}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
              {stat.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Quick Actions
        </Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.actionCard, { backgroundColor: colors.surface }]}
              onPress={() => navigation.navigate(action.route)}
            >
              <Ionicons name={action.icon as any} size={28} color={colors.primary} />
              <Text style={[styles.actionLabel, { color: colors.text }]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Recent Activity
        </Text>
        <View style={[styles.activityCard, { backgroundColor: colors.surface }]}>
          {[
            { text: 'Invoice #1234 was paid', time: '2 hours ago', icon: 'checkmark-circle' },
            { text: 'New message from Client A', time: '4 hours ago', icon: 'chatbubble' },
            { text: 'Project "Website" updated', time: 'Yesterday', icon: 'folder' },
          ].map((activity, index) => (
            <View
              key={index}
              style={[
                styles.activityItem,
                index !== 2 && { borderBottomColor: colors.border, borderBottomWidth: 1 },
              ]}
            >
              <View style={[styles.activityIcon, { backgroundColor: `${colors.primary}20` }]}>
                <Ionicons name={activity.icon as any} size={16} color={colors.primary} />
              </View>
              <View style={styles.activityContent}>
                <Text style={[styles.activityText, { color: colors.text }]}>
                  {activity.text}
                </Text>
                <Text style={[styles.activityTime, { color: colors.mutedForeground }]}>
                  {activity.time}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  greeting: {
    fontSize: 14,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  notificationButton: {
    padding: 12,
    borderRadius: 12,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    gap: 10,
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
    marginBottom: 4,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '48%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  activityCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
  },
  activityTime: {
    fontSize: 12,
    marginTop: 2,
  },
})
