/**
 * Tasks Screen
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

interface Task {
  id: string
  title: string
  project: string
  priority: 'high' | 'medium' | 'low'
  completed: boolean
  dueDate: string
}

const mockTasks: Task[] = [
  { id: '1', title: 'Review wireframes', project: 'Website Redesign', priority: 'high', completed: false, dueDate: '2024-02-01' },
  { id: '2', title: 'Update homepage design', project: 'Website Redesign', priority: 'high', completed: false, dueDate: '2024-02-02' },
  { id: '3', title: 'Client meeting prep', project: 'Mobile App MVP', priority: 'medium', completed: false, dueDate: '2024-02-03' },
  { id: '4', title: 'Send invoice', project: 'Brand Identity', priority: 'low', completed: true, dueDate: '2024-01-30' },
  { id: '5', title: 'API integration', project: 'Mobile App MVP', priority: 'high', completed: false, dueDate: '2024-02-05' },
]

export function TasksScreen() {
  const { colors } = useTheme()
  const [refreshing, setRefreshing] = useState(false)
  const [tasks, setTasks] = useState(mockTasks)

  const onRefresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1000)
  }

  const toggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      )
    )
  }

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return '#ef4444'
      case 'medium': return '#f59e0b'
      case 'low': return '#10b981'
    }
  }

  const renderTask = ({ item }: { item: Task }) => (
    <TouchableOpacity
      style={[styles.taskCard, { backgroundColor: colors.surface }]}
      onPress={() => toggleTask(item.id)}
    >
      <TouchableOpacity
        style={[
          styles.checkbox,
          { borderColor: colors.border },
          item.completed && { backgroundColor: colors.primary, borderColor: colors.primary },
        ]}
        onPress={() => toggleTask(item.id)}
      >
        {item.completed && (
          <Ionicons name="checkmark" size={16} color="#ffffff" />
        )}
      </TouchableOpacity>

      <View style={styles.taskContent}>
        <Text
          style={[
            styles.taskTitle,
            { color: colors.text },
            item.completed && styles.completedText,
          ]}
        >
          {item.title}
        </Text>
        <View style={styles.taskMeta}>
          <Text style={[styles.taskProject, { color: colors.mutedForeground }]}>
            {item.project}
          </Text>
          <View style={styles.taskInfo}>
            <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(item.priority) }]} />
            <Text style={[styles.taskDate, { color: colors.mutedForeground }]}>
              {item.dueDate}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )

  const pendingTasks = tasks.filter((t) => !t.completed)
  const completedTasks = tasks.filter((t) => t.completed)

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={[...pendingTasks, ...completedTasks]}
        renderItem={renderTask}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <View>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                {pendingTasks.length} Tasks
              </Text>
              <Text style={[styles.headerSubtitle, { color: colors.mutedForeground }]}>
                {completedTasks.length} completed
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.primary }]}
            >
              <Ionicons name="add" size={24} color="#ffffff" />
            </TouchableOpacity>
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
  listContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 6,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  taskMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskProject: {
    fontSize: 13,
  },
  taskInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  taskDate: {
    fontSize: 12,
  },
})
