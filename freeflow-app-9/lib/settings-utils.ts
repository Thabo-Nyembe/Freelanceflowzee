// Shared types and utilities for Settings pages

export interface UserProfile {
  firstName: string
  lastName: string
  email: string
  phone: string
  bio: string
  location: string
  website: string
  company: string
  position: string
  avatar: string
}

export interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  smsNotifications: boolean
  projectUpdates: boolean
  clientMessages: boolean
  paymentAlerts: boolean
  marketingEmails: boolean
  weeklyDigest: boolean
}

export interface SecuritySettings {
  twoFactorAuth: boolean
  loginAlerts: boolean
  sessionTimeout: string
  passwordRequired: boolean
  biometricAuth: boolean
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
  dateFormat: string
  currency: string
  compactMode: boolean
  animations: boolean
}

// Mock data
export const defaultProfile: UserProfile = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1 (555) 123-4567',
  bio: 'Freelance designer and developer with 5+ years of experience creating digital experiences.',
  location: 'San Francisco, CA',
  website: 'https://johndoe.com',
  company: 'FreeFlow Creative',
  position: 'Senior Designer',
  avatar: ''
}

export const defaultNotifications: NotificationSettings = {
  emailNotifications: true,
  pushNotifications: true,
  smsNotifications: false,
  projectUpdates: true,
  clientMessages: true,
  paymentAlerts: true,
  marketingEmails: false,
  weeklyDigest: true
}

export const defaultSecurity: SecuritySettings = {
  twoFactorAuth: true,
  loginAlerts: true,
  sessionTimeout: '24h',
  passwordRequired: true,
  biometricAuth: false
}

export const defaultAppearance: AppearanceSettings = {
  theme: 'system',
  language: 'en',
  timezone: 'America/Los_Angeles',
  dateFormat: 'MM/DD/YYYY',
  currency: 'USD',
  compactMode: false,
  animations: true
}
