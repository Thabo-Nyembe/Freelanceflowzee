/**
 * Auth Navigator
 *
 * Authentication flow navigation
 */

import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { useTheme } from '../contexts/ThemeContext'
import { LoginScreen } from '../screens/LoginScreen'
import { SignUpScreen } from '../screens/SignUpScreen'
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen'

const Stack = createNativeStackNavigator()

export function AuthNavigator() {
  const { colors } = useTheme()

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  )
}
