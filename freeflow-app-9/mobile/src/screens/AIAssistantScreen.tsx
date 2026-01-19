/**
 * AI Assistant Screen
 *
 * Voice-enabled AI chat interface
 */

import React, { useState, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'

import { useTheme } from '../contexts/ThemeContext'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export function AIAssistantScreen() {
  const { colors } = useTheme()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your FreeFlow AI assistant. I can help you manage projects, track tasks, analyze finances, and much more. How can I help you today?',
      timestamp: new Date(),
    },
  ])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const flatListRef = useRef<FlatList>(null)

  const sendMessage = async () => {
    if (!inputText.trim()) return

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputText('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        'I can help you with that! Let me analyze your request...',
        'Based on your projects, I recommend prioritizing the tasks due this week.',
        'Your revenue this month is up 15% compared to last month. Great progress!',
        'I\'ve scheduled that reminder for you. Is there anything else you need?',
        'I found 3 tasks that match your criteria. Would you like me to show them?',
      ]

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsTyping(false)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    }, 1500)
  }

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.role === 'user' ? styles.userMessage : styles.assistantMessage,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          item.role === 'user'
            ? { backgroundColor: colors.primary }
            : { backgroundColor: colors.surface },
        ]}
      >
        <Text
          style={[
            styles.messageText,
            { color: item.role === 'user' ? '#ffffff' : colors.text },
          ]}
        >
          {item.content}
        </Text>
      </View>
    </View>
  )

  const quickActions = [
    { icon: 'folder', label: 'Projects' },
    { icon: 'checkmark-circle', label: 'Tasks' },
    { icon: 'cash', label: 'Finances' },
    { icon: 'calendar', label: 'Schedule' },
  ]

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
      keyboardVerticalOffset={90}
    >
      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        ListFooterComponent={
          isTyping ? (
            <View style={[styles.typingIndicator, { backgroundColor: colors.surface }]}>
              <Text style={[styles.typingText, { color: colors.mutedForeground }]}>
                AI is thinking...
              </Text>
            </View>
          ) : null
        }
      />

      {/* Quick Actions */}
      {messages.length <= 1 && (
        <View style={styles.quickActions}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.quickAction, { backgroundColor: colors.surface }]}
              onPress={() => setInputText(`Show me my ${action.label.toLowerCase()}`)}
            >
              <Ionicons name={action.icon as any} size={20} color={colors.primary} />
              <Text style={[styles.quickActionText, { color: colors.text }]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Input */}
      <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TouchableOpacity style={styles.voiceButton}>
          <Ionicons name="mic-outline" size={24} color={colors.primary} />
        </TouchableOpacity>

        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Ask me anything..."
          placeholderTextColor={colors.mutedForeground}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            { backgroundColor: inputText.trim() ? colors.primary : colors.muted },
          ]}
          onPress={sendMessage}
          disabled={!inputText.trim()}
        >
          <Ionicons
            name="send"
            size={18}
            color={inputText.trim() ? '#ffffff' : colors.mutedForeground}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    marginBottom: 12,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  assistantMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 14,
    borderRadius: 18,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
  },
  typingIndicator: {
    alignSelf: 'flex-start',
    padding: 12,
    borderRadius: 18,
    marginBottom: 12,
  },
  typingText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 16,
    paddingTop: 0,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    borderTopWidth: 1,
    gap: 8,
  },
  voiceButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    fontSize: 15,
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
