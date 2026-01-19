/**
 * Loading Screen
 */

import React from 'react'
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native'
import { useTheme } from '../contexts/ThemeContext'

export function LoadingScreen() {
  const { colors } = useTheme()

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.logo, { color: colors.primary }]}>FreeFlow</Text>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[styles.text, { color: colors.mutedForeground }]}>
        Loading...
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  text: {
    marginTop: 16,
    fontSize: 14,
  },
})
