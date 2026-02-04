/**
 * Messaging Channels API
 *
 * Industry-leading channel management with:
 * - Direct messages (DMs) and group channels
 * - Public, private, and archived channels
 * - Channel permissions and roles
 * - Channel search and filtering
 * - Member management with invitations
 * - Channel analytics and insights
 * - Slack/Discord-like functionality
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createFeatureLogger } from '@/lib/logger'

// ============================================================================
// DEMO MODE CONFIGURATION - Auto-added for alex@freeflow.io support
// ============================================================================

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_USER_EMAIL = 'alex@freeflow.io'

function isDemoMode(request: NextRequest): boolean {
  if (typeof request === 'undefined') return false
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}

function getDemoUserId(session: any, demoMode: boolean): string | null {
  if (!session?.user) {
    return demoMode ? DEMO_USER_ID : null
  }

  const userEmail = session.user.email
  const isDemoAccount = userEmail === DEMO_USER_EMAIL ||
                       userEmail === 'demo@kazi.io' ||
                       userEmail === 'test@kazi.dev'

  if (isDemoAccount || demoMode) {
    return DEMO_USER_ID
  }

  return session.user.id || session.user.authId || null
}

const logger = createFeatureLogger('messaging-channels')

// ============================================================================
// Types
// ============================================================================

export interface Channel {
  id: string
  name: string
  slug: string
  description?: string
  type: 'direct' | 'group' | 'public' | 'private'
  topic?: string
  icon?: string
  color?: string
  createdBy: string
  createdAt: string
  updatedAt: string
  lastMessageAt?: string
  lastMessagePreview?: string
  memberCount: number
  messageCount: number
  unreadCount?: number
  isArchived: boolean
  isPinned: boolean
  isMuted: boolean
  settings: ChannelSettings
  members?: ChannelMember[]
}

export interface ChannelSettings {
  allowThreads: boolean
  allowReactions: boolean
  allowFiles: boolean
  allowLinks: boolean
  allowGiphy: boolean
  allowMentions: boolean
  retentionDays?: number
  slowModeSeconds?: number
  notificationPreference: 'all' | 'mentions' | 'none'
  autoDeleteMessages: boolean
  isReadOnly: boolean
}

export interface ChannelMember {
  id: string
  channelId: string
  userId: string
  role: 'owner' | 'admin' | 'moderator' | 'member'
  nickname?: string
  joinedAt: string
  lastReadAt?: string
  lastTypingAt?: string
  isMuted: boolean
  notificationPreference: 'all' | 'mentions' | 'none'
  user?: {
    id: string
    name: string
    email: string
    avatar?: string
    status?: 'online' | 'away' | 'busy' | 'offline'
  }
}

export interface ChannelInvite {
  id: string
  channelId: string
  code: string
  invitedBy: string
  maxUses?: number
  usedCount: number
  expiresAt?: string
  createdAt: string
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_CHANNEL_SETTINGS: ChannelSettings = {
  allowThreads: true,
  allowReactions: true,
  allowFiles: true,
  allowLinks: true,
  allowGiphy: true,
  allowMentions: true,
  notificationPreference: 'all',
  autoDeleteMessages: false,
  isReadOnly: false,
}

// ============================================================================
// Utilities
// ============================================================================

function generateId(): string {
  return `ch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80)
}

function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// In-memory storage (use database in production)
const channels: Map<string, Channel> = new Map()
const channelMembers: Map<string, ChannelMember[]> = new Map()
const channelInvites: Map<string, ChannelInvite[]> = new Map()

// ============================================================================
// POST - Create channel or perform actions
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action = 'create', ...params } = body

    switch (action) {
      case 'create':
        return handleCreateChannel(params, user.id)
      case 'update':
        return handleUpdateChannel(params, user.id)
      case 'archive':
        return handleArchiveChannel(params, user.id)
      case 'unarchive':
        return handleUnarchiveChannel(params, user.id)
      case 'delete':
        return handleDeleteChannel(params, user.id)
      case 'join':
        return handleJoinChannel(params, user.id)
      case 'leave':
        return handleLeaveChannel(params, user.id)
      case 'invite':
        return handleInviteMember(params, user.id)
      case 'kick':
        return handleKickMember(params, user.id)
      case 'update-member':
        return handleUpdateMember(params, user.id)
      case 'create-invite':
        return handleCreateInvite(params, user.id)
      case 'use-invite':
        return handleUseInvite(params, user.id)
      case 'pin':
        return handlePinChannel(params, user.id)
      case 'mute':
        return handleMuteChannel(params, user.id)
      case 'mark-read':
        return handleMarkRead(params, user.id)
      case 'create-dm':
        return handleCreateDirectMessage(params, user.id)
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logger.error('Channel error', { error })
    return NextResponse.json(
      { error: 'Failed to process channel request' },
      { status: 500 }
    )
  }
}

// Create channel
async function handleCreateChannel(params: {
  name: string
  type?: 'group' | 'public' | 'private'
  description?: string
  topic?: string
  icon?: string
  color?: string
  settings?: Partial<ChannelSettings>
  memberIds?: string[]
}, userId: string): Promise<NextResponse> {
  const { name, type = 'public', description, topic, icon, color, settings, memberIds = [] } = params

  if (!name || name.length < 2 || name.length > 80) {
    return NextResponse.json({ error: 'Channel name must be 2-80 characters' }, { status: 400 })
  }

  const slug = generateSlug(name)

  // Check for duplicate slug
  const existingChannel = Array.from(channels.values()).find(c => c.slug === slug)
  if (existingChannel) {
    return NextResponse.json({ error: 'Channel with this name already exists' }, { status: 400 })
  }

  const channel: Channel = {
    id: generateId(),
    name,
    slug,
    description,
    type,
    topic,
    icon,
    color,
    createdBy: userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    memberCount: 1 + memberIds.length,
    messageCount: 0,
    unreadCount: 0,
    isArchived: false,
    isPinned: false,
    isMuted: false,
    settings: { ...DEFAULT_CHANNEL_SETTINGS, ...settings },
  }

  channels.set(channel.id, channel)

  // Add creator as owner
  const ownerMember: ChannelMember = {
    id: `cm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    channelId: channel.id,
    userId,
    role: 'owner',
    joinedAt: new Date().toISOString(),
    isMuted: false,
    notificationPreference: 'all',
  }

  const members = [ownerMember]

  // Add initial members
  for (const memberId of memberIds) {
    if (memberId !== userId) {
      members.push({
        id: `cm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        channelId: channel.id,
        userId: memberId,
        role: 'member',
        joinedAt: new Date().toISOString(),
        isMuted: false,
        notificationPreference: 'all',
      })
    }
  }

  channelMembers.set(channel.id, members)

  return NextResponse.json({
    success: true,
    channel,
    members,
  })
}

// Update channel
async function handleUpdateChannel(params: {
  channelId: string
  updates: Partial<Channel>
}, userId: string): Promise<NextResponse> {
  const { channelId, updates } = params

  const channel = channels.get(channelId)
  if (!channel) {
    return NextResponse.json({ error: 'Channel not found' }, { status: 404 })
  }

  // Check permissions
  const members = channelMembers.get(channelId) || []
  const member = members.find(m => m.userId === userId)
  if (!member || !['owner', 'admin'].includes(member.role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  // Update channel
  const updatedChannel: Channel = {
    ...channel,
    ...updates,
    id: channel.id,
    createdBy: channel.createdBy,
    createdAt: channel.createdAt,
    updatedAt: new Date().toISOString(),
  }

  if (updates.name && updates.name !== channel.name) {
    updatedChannel.slug = generateSlug(updates.name)
  }

  channels.set(channelId, updatedChannel)

  return NextResponse.json({
    success: true,
    channel: updatedChannel,
  })
}

// Archive channel
async function handleArchiveChannel(params: {
  channelId: string
}, userId: string): Promise<NextResponse> {
  const { channelId } = params

  const channel = channels.get(channelId)
  if (!channel) {
    return NextResponse.json({ error: 'Channel not found' }, { status: 404 })
  }

  // Check permissions
  const members = channelMembers.get(channelId) || []
  const member = members.find(m => m.userId === userId)
  if (!member || !['owner', 'admin'].includes(member.role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  channel.isArchived = true
  channel.updatedAt = new Date().toISOString()
  channels.set(channelId, channel)

  return NextResponse.json({
    success: true,
    channel,
  })
}

// Unarchive channel
async function handleUnarchiveChannel(params: {
  channelId: string
}, userId: string): Promise<NextResponse> {
  const { channelId } = params

  const channel = channels.get(channelId)
  if (!channel) {
    return NextResponse.json({ error: 'Channel not found' }, { status: 404 })
  }

  // Check permissions
  const members = channelMembers.get(channelId) || []
  const member = members.find(m => m.userId === userId)
  if (!member || !['owner', 'admin'].includes(member.role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  channel.isArchived = false
  channel.updatedAt = new Date().toISOString()
  channels.set(channelId, channel)

  return NextResponse.json({
    success: true,
    channel,
  })
}

// Delete channel
async function handleDeleteChannel(params: {
  channelId: string
}, userId: string): Promise<NextResponse> {
  const { channelId } = params

  const channel = channels.get(channelId)
  if (!channel) {
    return NextResponse.json({ error: 'Channel not found' }, { status: 404 })
  }

  // Only owner can delete
  if (channel.createdBy !== userId) {
    return NextResponse.json({ error: 'Only channel owner can delete' }, { status: 403 })
  }

  channels.delete(channelId)
  channelMembers.delete(channelId)
  channelInvites.delete(channelId)

  return NextResponse.json({
    success: true,
    message: 'Channel deleted',
  })
}

// Join channel
async function handleJoinChannel(params: {
  channelId: string
}, userId: string): Promise<NextResponse> {
  const { channelId } = params

  const channel = channels.get(channelId)
  if (!channel) {
    return NextResponse.json({ error: 'Channel not found' }, { status: 404 })
  }

  if (channel.type === 'private') {
    return NextResponse.json({ error: 'Cannot join private channel directly' }, { status: 403 })
  }

  const members = channelMembers.get(channelId) || []
  const existingMember = members.find(m => m.userId === userId)
  if (existingMember) {
    return NextResponse.json({ error: 'Already a member' }, { status: 400 })
  }

  const newMember: ChannelMember = {
    id: `cm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    channelId,
    userId,
    role: 'member',
    joinedAt: new Date().toISOString(),
    isMuted: false,
    notificationPreference: 'all',
  }

  members.push(newMember)
  channelMembers.set(channelId, members)

  channel.memberCount = members.length
  channels.set(channelId, channel)

  return NextResponse.json({
    success: true,
    member: newMember,
  })
}

// Leave channel
async function handleLeaveChannel(params: {
  channelId: string
}, userId: string): Promise<NextResponse> {
  const { channelId } = params

  const channel = channels.get(channelId)
  if (!channel) {
    return NextResponse.json({ error: 'Channel not found' }, { status: 404 })
  }

  const members = channelMembers.get(channelId) || []
  const memberIndex = members.findIndex(m => m.userId === userId)
  if (memberIndex === -1) {
    return NextResponse.json({ error: 'Not a member' }, { status: 400 })
  }

  // Owner cannot leave without transferring ownership
  if (members[memberIndex].role === 'owner' && members.length > 1) {
    return NextResponse.json({ error: 'Transfer ownership before leaving' }, { status: 400 })
  }

  members.splice(memberIndex, 1)
  channelMembers.set(channelId, members)

  channel.memberCount = members.length
  channels.set(channelId, channel)

  // Delete channel if no members
  if (members.length === 0) {
    channels.delete(channelId)
    channelMembers.delete(channelId)
  }

  return NextResponse.json({
    success: true,
    message: 'Left channel',
  })
}

// Invite member
async function handleInviteMember(params: {
  channelId: string
  userId: string
  role?: 'admin' | 'moderator' | 'member'
}, inviterId: string): Promise<NextResponse> {
  const { channelId, userId, role = 'member' } = params

  const channel = channels.get(channelId)
  if (!channel) {
    return NextResponse.json({ error: 'Channel not found' }, { status: 404 })
  }

  // Check inviter permissions
  const members = channelMembers.get(channelId) || []
  const inviter = members.find(m => m.userId === inviterId)
  if (!inviter || !['owner', 'admin', 'moderator'].includes(inviter.role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  // Check if already a member
  if (members.find(m => m.userId === userId)) {
    return NextResponse.json({ error: 'User is already a member' }, { status: 400 })
  }

  const newMember: ChannelMember = {
    id: `cm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    channelId,
    userId,
    role,
    joinedAt: new Date().toISOString(),
    isMuted: false,
    notificationPreference: 'all',
  }

  members.push(newMember)
  channelMembers.set(channelId, members)

  channel.memberCount = members.length
  channels.set(channelId, channel)

  return NextResponse.json({
    success: true,
    member: newMember,
  })
}

// Kick member
async function handleKickMember(params: {
  channelId: string
  userId: string
}, kickerId: string): Promise<NextResponse> {
  const { channelId, userId } = params

  const channel = channels.get(channelId)
  if (!channel) {
    return NextResponse.json({ error: 'Channel not found' }, { status: 404 })
  }

  const members = channelMembers.get(channelId) || []
  const kicker = members.find(m => m.userId === kickerId)
  const target = members.find(m => m.userId === userId)

  if (!kicker || !['owner', 'admin', 'moderator'].includes(kicker.role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  if (!target) {
    return NextResponse.json({ error: 'User is not a member' }, { status: 404 })
  }

  // Cannot kick owner or higher role
  const roleHierarchy = { owner: 4, admin: 3, moderator: 2, member: 1 }
  if (roleHierarchy[target.role] >= roleHierarchy[kicker.role]) {
    return NextResponse.json({ error: 'Cannot kick user with equal or higher role' }, { status: 403 })
  }

  const updatedMembers = members.filter(m => m.userId !== userId)
  channelMembers.set(channelId, updatedMembers)

  channel.memberCount = updatedMembers.length
  channels.set(channelId, channel)

  return NextResponse.json({
    success: true,
    message: 'Member removed',
  })
}

// Update member role/settings
async function handleUpdateMember(params: {
  channelId: string
  userId: string
  updates: Partial<ChannelMember>
}, updaterId: string): Promise<NextResponse> {
  const { channelId, userId, updates } = params

  const channel = channels.get(channelId)
  if (!channel) {
    return NextResponse.json({ error: 'Channel not found' }, { status: 404 })
  }

  const members = channelMembers.get(channelId) || []
  const updater = members.find(m => m.userId === updaterId)
  const targetIndex = members.findIndex(m => m.userId === userId)

  if (!updater || !['owner', 'admin'].includes(updater.role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  if (targetIndex === -1) {
    return NextResponse.json({ error: 'User is not a member' }, { status: 404 })
  }

  // Update member
  members[targetIndex] = {
    ...members[targetIndex],
    ...updates,
    id: members[targetIndex].id,
    channelId,
    userId,
    joinedAt: members[targetIndex].joinedAt,
  }

  channelMembers.set(channelId, members)

  return NextResponse.json({
    success: true,
    member: members[targetIndex],
  })
}

// Create invite link
async function handleCreateInvite(params: {
  channelId: string
  maxUses?: number
  expiresInHours?: number
}, userId: string): Promise<NextResponse> {
  const { channelId, maxUses, expiresInHours } = params

  const channel = channels.get(channelId)
  if (!channel) {
    return NextResponse.json({ error: 'Channel not found' }, { status: 404 })
  }

  const members = channelMembers.get(channelId) || []
  const member = members.find(m => m.userId === userId)
  if (!member || !['owner', 'admin', 'moderator'].includes(member.role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  const invite: ChannelInvite = {
    id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    channelId,
    code: generateInviteCode(),
    invitedBy: userId,
    maxUses,
    usedCount: 0,
    expiresAt: expiresInHours
      ? new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString()
      : undefined,
    createdAt: new Date().toISOString(),
  }

  const invites = channelInvites.get(channelId) || []
  invites.push(invite)
  channelInvites.set(channelId, invites)

  return NextResponse.json({
    success: true,
    invite,
    link: `/invite/${invite.code}`,
  })
}

// Use invite link
async function handleUseInvite(params: {
  code: string
}, userId: string): Promise<NextResponse> {
  const { code } = params

  // Find invite
  let invite: ChannelInvite | undefined
  let channelId: string | undefined

  for (const [chId, invites] of channelInvites.entries()) {
    invite = invites.find(i => i.code === code)
    if (invite) {
      channelId = chId
      break
    }
  }

  if (!invite || !channelId) {
    return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 })
  }

  // Check expiration
  if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
    return NextResponse.json({ error: 'Invite has expired' }, { status: 400 })
  }

  // Check max uses
  if (invite.maxUses && invite.usedCount >= invite.maxUses) {
    return NextResponse.json({ error: 'Invite has reached max uses' }, { status: 400 })
  }

  // Check if already a member
  const members = channelMembers.get(channelId) || []
  if (members.find(m => m.userId === userId)) {
    return NextResponse.json({ error: 'Already a member' }, { status: 400 })
  }

  // Add member
  const newMember: ChannelMember = {
    id: `cm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    channelId,
    userId,
    role: 'member',
    joinedAt: new Date().toISOString(),
    isMuted: false,
    notificationPreference: 'all',
  }

  members.push(newMember)
  channelMembers.set(channelId, members)

  // Update invite usage
  invite.usedCount++

  // Update channel member count
  const channel = channels.get(channelId)!
  channel.memberCount = members.length
  channels.set(channelId, channel)

  return NextResponse.json({
    success: true,
    channel,
    member: newMember,
  })
}

// Pin/unpin channel
async function handlePinChannel(params: {
  channelId: string
  isPinned: boolean
}, userId: string): Promise<NextResponse> {
  const { channelId, isPinned } = params

  const channel = channels.get(channelId)
  if (!channel) {
    return NextResponse.json({ error: 'Channel not found' }, { status: 404 })
  }

  // Check membership
  const members = channelMembers.get(channelId) || []
  if (!members.find(m => m.userId === userId)) {
    return NextResponse.json({ error: 'Not a member' }, { status: 403 })
  }

  // This would normally be stored per-user, simplified here
  channel.isPinned = isPinned
  channels.set(channelId, channel)

  return NextResponse.json({
    success: true,
    isPinned,
  })
}

// Mute/unmute channel
async function handleMuteChannel(params: {
  channelId: string
  isMuted: boolean
  muteDuration?: number // minutes
}, userId: string): Promise<NextResponse> {
  const { channelId, isMuted } = params

  const channel = channels.get(channelId)
  if (!channel) {
    return NextResponse.json({ error: 'Channel not found' }, { status: 404 })
  }

  const members = channelMembers.get(channelId) || []
  const memberIndex = members.findIndex(m => m.userId === userId)
  if (memberIndex === -1) {
    return NextResponse.json({ error: 'Not a member' }, { status: 403 })
  }

  members[memberIndex].isMuted = isMuted
  channelMembers.set(channelId, members)

  return NextResponse.json({
    success: true,
    isMuted,
  })
}

// Mark channel as read
async function handleMarkRead(params: {
  channelId: string
  messageId?: string
}, userId: string): Promise<NextResponse> {
  const { channelId } = params

  const channel = channels.get(channelId)
  if (!channel) {
    return NextResponse.json({ error: 'Channel not found' }, { status: 404 })
  }

  const members = channelMembers.get(channelId) || []
  const memberIndex = members.findIndex(m => m.userId === userId)
  if (memberIndex === -1) {
    return NextResponse.json({ error: 'Not a member' }, { status: 403 })
  }

  members[memberIndex].lastReadAt = new Date().toISOString()
  channelMembers.set(channelId, members)

  return NextResponse.json({
    success: true,
    lastReadAt: members[memberIndex].lastReadAt,
  })
}

// Create direct message channel
async function handleCreateDirectMessage(params: {
  userIds: string[]
}, userId: string): Promise<NextResponse> {
  const { userIds } = params

  if (!userIds || userIds.length === 0) {
    return NextResponse.json({ error: 'User IDs required' }, { status: 400 })
  }

  const allUserIds = [...new Set([userId, ...userIds])].sort()

  // Check for existing DM channel with same members
  for (const [, channel] of channels) {
    if (channel.type === 'direct') {
      const members = channelMembers.get(channel.id) || []
      const memberIds = members.map(m => m.userId).sort()
      if (JSON.stringify(memberIds) === JSON.stringify(allUserIds)) {
        return NextResponse.json({
          success: true,
          channel,
          existing: true,
        })
      }
    }
  }

  // Create new DM channel
  const channel: Channel = {
    id: generateId(),
    name: `DM-${allUserIds.join('-').substring(0, 20)}`,
    slug: `dm-${Date.now()}`,
    type: 'direct',
    createdBy: userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    memberCount: allUserIds.length,
    messageCount: 0,
    unreadCount: 0,
    isArchived: false,
    isPinned: false,
    isMuted: false,
    settings: DEFAULT_CHANNEL_SETTINGS,
  }

  channels.set(channel.id, channel)

  // Add all members
  const members: ChannelMember[] = allUserIds.map((uid, index) => ({
    id: `cm_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
    channelId: channel.id,
    userId: uid,
    role: 'member' as const,
    joinedAt: new Date().toISOString(),
    isMuted: false,
    notificationPreference: 'all' as const,
  }))

  channelMembers.set(channel.id, members)

  return NextResponse.json({
    success: true,
    channel,
    members,
    existing: false,
  })
}

// ============================================================================
// GET - Get channels or channel details
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const channelId = searchParams.get('channelId')
    const type = searchParams.get('type') as Channel['type'] | null
    const search = searchParams.get('search')
    const includeArchived = searchParams.get('includeArchived') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get single channel
    if (channelId) {
      const channel = channels.get(channelId)
      if (!channel) {
        return NextResponse.json({ error: 'Channel not found' }, { status: 404 })
      }

      const members = channelMembers.get(channelId) || []
      const isMember = members.some(m => m.userId === user.id)

      if (!isMember && channel.type !== 'public') {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }

      return NextResponse.json({
        success: true,
        channel: {
          ...channel,
          members: isMember ? members : undefined,
        },
      })
    }

    // List user's channels
    let userChannels: Channel[] = []

    for (const [chId, channel] of channels) {
      const members = channelMembers.get(chId) || []
      const isMember = members.some(m => m.userId === user.id)

      // Include if member or public channel
      if (isMember || channel.type === 'public') {
        // Apply filters
        if (type && channel.type !== type) continue
        if (!includeArchived && channel.isArchived) continue
        if (search && !channel.name.toLowerCase().includes(search.toLowerCase())) continue

        userChannels.push({
          ...channel,
          unreadCount: isMember ? (channel.unreadCount || 0) : undefined,
        })
      }
    }

    // Sort by last message or creation date
    userChannels.sort((a, b) => {
      const aTime = a.lastMessageAt || a.createdAt
      const bTime = b.lastMessageAt || b.createdAt
      return new Date(bTime).getTime() - new Date(aTime).getTime()
    })

    // Apply pagination
    const total = userChannels.length
    userChannels = userChannels.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      channels: userChannels,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  } catch (error) {
    logger.error('Error fetching channels', { error })
    return NextResponse.json(
      { error: 'Failed to fetch channels' },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE - Delete channel
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const channelId = searchParams.get('channelId')

    if (!channelId) {
      return NextResponse.json({ error: 'Channel ID required' }, { status: 400 })
    }

    return handleDeleteChannel({ channelId }, user.id)
  } catch (error) {
    logger.error('Error deleting channel', { error })
    return NextResponse.json(
      { error: 'Failed to delete channel' },
      { status: 500 }
    )
  }
}
