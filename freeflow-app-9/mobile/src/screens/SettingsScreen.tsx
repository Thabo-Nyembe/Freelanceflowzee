/**
 * Settings Screen
 */

import React from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import { useTheme } from '../contexts/ThemeContext'

export function SettingsScreen() {
  const { colors, theme, setTheme, isDark } = useTheme()

  const settingsSections = [
    {
      title: 'Appearance',
      items: [
        {
          icon: 'moon-outline',
          label: 'Dark Mode',
          type: 'switch',
          value: isDark,
          onToggle: () => setTheme(isDark ? 'light' : 'dark'),
        },
        {
          icon: 'phone-portrait-outline',
          label: 'System Theme',
          type: 'switch',
          value: theme === 'system',
          onToggle: () => setTheme(theme === 'system' ? (isDark ? 'dark' : 'light') : 'system'),
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        { icon: 'notifications-outline', label: 'Push Notifications', type: 'switch', value: true },
        { icon: 'mail-outline', label: 'Email Notifications', type: 'switch', value: true },
        { icon: 'chatbubble-outline', label: 'Message Alerts', type: 'switch', value: true },
      ],
    },
    {
      title: 'Privacy',
      items: [
        { icon: 'finger-print-outline', label: 'Biometric Login', type: 'switch', value: false },
        { icon: 'eye-off-outline', label: 'Hide Balance', type: 'switch', value: false },
      ],
    },
    {
      title: 'About',
      items: [
        { icon: 'document-text-outline', label: 'Terms of Service', type: 'link' },
        { icon: 'shield-outline', label: 'Privacy Policy', type: 'link' },
        { icon: 'information-circle-outline', label: 'App Version', type: 'info', value: '1.0.0' },
      ],
    },
  ]

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {settingsSections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
            {section.title}
          </Text>
          <View style={[styles.sectionContent, { backgroundColor: colors.surface }]}>
            {section.items.map((item, itemIndex) => (
              <View
                key={itemIndex}
                style={[
                  styles.settingItem,
                  itemIndex !== section.items.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                <View style={styles.settingLeft}>
                  <Ionicons name={item.icon as any} size={20} color={colors.primary} />
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    {item.label}
                  </Text>
                </View>
                {item.type === 'switch' && (
                  <Switch
                    value={item.value as boolean}
                    onValueChange={item.onToggle}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor="#ffffff"
                  />
                )}
                {item.type === 'link' && (
                  <TouchableOpacity>
                    <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
                  </TouchableOpacity>
                )}
                {item.type === 'info' && (
                  <Text style={[styles.infoValue, { color: colors.mutedForeground }]}>
                    {item.value}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionContent: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 15,
  },
  infoValue: {
    fontSize: 15,
  },
})
