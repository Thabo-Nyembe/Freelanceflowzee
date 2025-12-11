/**
 * KAZI Team Collaboration System - Database Queries
 * World-class backend infrastructure for team management and collaboration
 */

import { supabase } from './supabase'

// =====================================================
// TYPES
// =====================================================

export interface Team {
  id: string
  owner_id: string
  name: string
  description?: string
  slug: string
  avatar_url?: string
  cover_url?: string
  team_type: 'internal' | 'client' | 'contractor' | 'mixed'
  status: 'active' | 'inactive' | 'archived'
  settings: TeamSettings
  metadata: Record<string, any>
  member_count: number
  created_at: string
  updated_at: string
}

export interface TeamSettings {
  allow_member_invite: boolean
  require_approval: boolean
  default_role: string
  notifications_enabled: boolean
  branding?: {
    primary_color: string
    logo_url?: string
  }
}

export interface TeamMember {
  id: string
  team_id: string
  user_id: string
  role: 'owner' | 'admin' | 'manager' | 'member' | 'guest'
  title?: string
  department?: string
  permissions: string[]
  status: 'active' | 'invited' | 'inactive' | 'removed'
  joined_at?: string
  invited_by?: string
  invite_token?: string
  invite_expires_at?: string
  last_active_at?: string
  settings: Record<string, any>
  created_at: string
  updated_at: string
  // Joined data
  user?: {
    id: string
    email: string
    full_name: string
    avatar_url?: string
  }
}

export interface TeamProject {
  id: string
  team_id: string
  project_id: string
  added_by: string
  access_level: 'view' | 'edit' | 'admin'
  created_at: string
  // Joined data
  project?: {
    id: string
    name: string
    status: string
    client_id?: string
  }
}

export interface TeamInvite {
  id: string
  team_id: string
  email: string
  role: string
  invited_by: string
  token: string
  status: 'pending' | 'accepted' | 'expired' | 'revoked'
  expires_at: string
  accepted_at?: string
  created_at: string
}

export interface TeamActivity {
  id: string
  team_id: string
  user_id: string
  action: string
  entity_type: string
  entity_id?: string
  details: Record<string, any>
  created_at: string
}

export interface TeamMessage {
  id: string
  team_id: string
  channel_id?: string
  user_id: string
  content: string
  message_type: 'text' | 'file' | 'system' | 'announcement'
  attachments: Record<string, any>[]
  mentions: string[]
  reactions: Record<string, string[]>
  is_pinned: boolean
  is_edited: boolean
  parent_id?: string
  created_at: string
  updated_at: string
  // Joined data
  user?: {
    id: string
    full_name: string
    avatar_url?: string
  }
}

export interface TeamChannel {
  id: string
  team_id: string
  name: string
  description?: string
  channel_type: 'general' | 'project' | 'announcement' | 'private'
  is_private: boolean
  members: string[]
  created_by: string
  created_at: string
  updated_at: string
}

// =====================================================
// TEAM OPERATIONS
// =====================================================

export async function getTeams(userId: string): Promise<Team[]> {
  try {
    // Get teams where user is owner
    const { data: ownedTeams, error: ownedError } = await supabase
      .from('teams')
      .select('*')
      .eq('owner_id', userId)
      .neq('status', 'archived')

    if (ownedError) throw ownedError

    // Get teams where user is a member
    const { data: memberTeams, error: memberError } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', userId)
      .eq('status', 'active')

    if (memberError) throw memberError

    const memberTeamIds = memberTeams?.map(m => m.team_id) || []

    let joinedTeams: Team[] = []
    if (memberTeamIds.length > 0) {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .in('id', memberTeamIds)
        .neq('status', 'archived')
        .neq('owner_id', userId)

      if (!error && data) {
        joinedTeams = data
      }
    }

    // Combine and deduplicate
    const allTeams = [...(ownedTeams || []), ...joinedTeams]
    return allTeams.sort((a, b) => a.name.localeCompare(b.name))
  } catch (error) {
    console.error('Error fetching teams:', error)
    return []
  }
}

export async function getTeamById(teamId: string): Promise<Team | null> {
  try {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching team:', error)
    return null
  }
}

export async function getTeamBySlug(slug: string): Promise<Team | null> {
  try {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching team by slug:', error)
    return null
  }
}

export async function createTeam(team: Partial<Team>, ownerId: string): Promise<Team | null> {
  try {
    const slug = generateSlug(team.name || 'team')

    const { data, error } = await supabase
      .from('teams')
      .insert({
        owner_id: ownerId,
        name: team.name,
        description: team.description,
        slug,
        avatar_url: team.avatar_url,
        cover_url: team.cover_url,
        team_type: team.team_type || 'internal',
        status: 'active',
        settings: team.settings || {
          allow_member_invite: true,
          require_approval: false,
          default_role: 'member',
          notifications_enabled: true
        },
        metadata: team.metadata || {},
        member_count: 1
      })
      .select()
      .single()

    if (error) throw error

    // Add owner as team member
    if (data) {
      await supabase
        .from('team_members')
        .insert({
          team_id: data.id,
          user_id: ownerId,
          role: 'owner',
          permissions: ['*'],
          status: 'active',
          joined_at: new Date().toISOString()
        })

      await logTeamActivity(data.id, ownerId, 'team_created', 'team', data.id, { name: team.name })
    }

    return data
  } catch (error) {
    console.error('Error creating team:', error)
    return null
  }
}

export async function updateTeam(teamId: string, updates: Partial<Team>): Promise<Team | null> {
  try {
    const { data, error } = await supabase
      .from('teams')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', teamId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating team:', error)
    return null
  }
}

export async function deleteTeam(teamId: string, permanent: boolean = false): Promise<boolean> {
  try {
    if (permanent) {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId)

      if (error) throw error
    } else {
      const { error } = await supabase
        .from('teams')
        .update({ status: 'archived', updated_at: new Date().toISOString() })
        .eq('id', teamId)

      if (error) throw error
    }
    return true
  } catch (error) {
    console.error('Error deleting team:', error)
    return false
  }
}

// =====================================================
// TEAM MEMBER OPERATIONS
// =====================================================

export async function getTeamMembers(teamId: string): Promise<TeamMember[]> {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .select(`
        *,
        user:user_id (
          id,
          email,
          full_name,
          avatar_url
        )
      `)
      .eq('team_id', teamId)
      .neq('status', 'removed')
      .order('role', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching team members:', error)
    return []
  }
}

export async function getTeamMember(teamId: string, userId: string): Promise<TeamMember | null> {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .select(`
        *,
        user:user_id (
          id,
          email,
          full_name,
          avatar_url
        )
      `)
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching team member:', error)
    return null
  }
}

export async function addTeamMember(
  teamId: string,
  userId: string,
  role: TeamMember['role'],
  invitedBy: string,
  options: {
    title?: string
    department?: string
    permissions?: string[]
  } = {}
): Promise<TeamMember | null> {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .insert({
        team_id: teamId,
        user_id: userId,
        role,
        title: options.title,
        department: options.department,
        permissions: options.permissions || getDefaultPermissions(role),
        status: 'active',
        joined_at: new Date().toISOString(),
        invited_by: invitedBy,
        settings: {}
      })
      .select()
      .single()

    if (error) throw error

    // Update team member count
    await updateTeamMemberCount(teamId)

    await logTeamActivity(teamId, invitedBy, 'member_added', 'member', userId, { role })

    return data
  } catch (error) {
    console.error('Error adding team member:', error)
    return null
  }
}

export async function updateTeamMember(
  teamId: string,
  userId: string,
  updates: Partial<TeamMember>
): Promise<TeamMember | null> {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating team member:', error)
    return null
  }
}

export async function removeTeamMember(teamId: string, userId: string, removedBy: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('team_members')
      .update({
        status: 'removed',
        updated_at: new Date().toISOString()
      })
      .eq('team_id', teamId)
      .eq('user_id', userId)

    if (error) throw error

    await updateTeamMemberCount(teamId)
    await logTeamActivity(teamId, removedBy, 'member_removed', 'member', userId, {})

    return true
  } catch (error) {
    console.error('Error removing team member:', error)
    return false
  }
}

export async function changeTeamMemberRole(
  teamId: string,
  userId: string,
  newRole: TeamMember['role'],
  changedBy: string
): Promise<boolean> {
  try {
    const { data: oldMember } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .single()

    const { error } = await supabase
      .from('team_members')
      .update({
        role: newRole,
        permissions: getDefaultPermissions(newRole),
        updated_at: new Date().toISOString()
      })
      .eq('team_id', teamId)
      .eq('user_id', userId)

    if (error) throw error

    await logTeamActivity(teamId, changedBy, 'role_changed', 'member', userId, {
      old_role: oldMember?.role,
      new_role: newRole
    })

    return true
  } catch (error) {
    console.error('Error changing team member role:', error)
    return false
  }
}

// =====================================================
// TEAM INVITES
// =====================================================

export async function inviteToTeam(
  teamId: string,
  email: string,
  role: string,
  invitedBy: string
): Promise<TeamInvite | null> {
  try {
    const token = generateInviteToken()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

    const { data, error } = await supabase
      .from('team_invites')
      .insert({
        team_id: teamId,
        email,
        role,
        invited_by: invitedBy,
        token,
        status: 'pending',
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single()

    if (error) throw error

    await logTeamActivity(teamId, invitedBy, 'invite_sent', 'invite', data.id, { email, role })

    // TODO: Send invite email here

    return data
  } catch (error) {
    console.error('Error inviting to team:', error)
    return null
  }
}

export async function getTeamInvites(teamId: string): Promise<TeamInvite[]> {
  try {
    const { data, error } = await supabase
      .from('team_invites')
      .select('*')
      .eq('team_id', teamId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching team invites:', error)
    return []
  }
}

export async function acceptTeamInvite(token: string, userId: string): Promise<{ success: boolean; teamId?: string }> {
  try {
    const { data: invite, error: inviteError } = await supabase
      .from('team_invites')
      .select('*')
      .eq('token', token)
      .eq('status', 'pending')
      .single()

    if (inviteError || !invite) {
      return { success: false }
    }

    // Check if expired
    if (new Date(invite.expires_at) < new Date()) {
      await supabase
        .from('team_invites')
        .update({ status: 'expired' })
        .eq('id', invite.id)
      return { success: false }
    }

    // Add as team member
    await addTeamMember(invite.team_id, userId, invite.role as TeamMember['role'], invite.invited_by)

    // Update invite status
    await supabase
      .from('team_invites')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('id', invite.id)

    return { success: true, teamId: invite.team_id }
  } catch (error) {
    console.error('Error accepting team invite:', error)
    return { success: false }
  }
}

export async function revokeTeamInvite(inviteId: string, revokedBy: string): Promise<boolean> {
  try {
    const { data: invite } = await supabase
      .from('team_invites')
      .select('team_id')
      .eq('id', inviteId)
      .single()

    const { error } = await supabase
      .from('team_invites')
      .update({ status: 'revoked' })
      .eq('id', inviteId)

    if (error) throw error

    if (invite) {
      await logTeamActivity(invite.team_id, revokedBy, 'invite_revoked', 'invite', inviteId, {})
    }

    return true
  } catch (error) {
    console.error('Error revoking team invite:', error)
    return false
  }
}

// =====================================================
// TEAM PROJECTS
// =====================================================

export async function getTeamProjects(teamId: string): Promise<TeamProject[]> {
  try {
    const { data, error } = await supabase
      .from('team_projects')
      .select(`
        *,
        project:project_id (
          id,
          name,
          status,
          client_id
        )
      `)
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching team projects:', error)
    return []
  }
}

export async function addProjectToTeam(
  teamId: string,
  projectId: string,
  addedBy: string,
  accessLevel: TeamProject['access_level'] = 'edit'
): Promise<TeamProject | null> {
  try {
    const { data, error } = await supabase
      .from('team_projects')
      .insert({
        team_id: teamId,
        project_id: projectId,
        added_by: addedBy,
        access_level: accessLevel
      })
      .select()
      .single()

    if (error) throw error

    await logTeamActivity(teamId, addedBy, 'project_added', 'project', projectId, { access_level: accessLevel })

    return data
  } catch (error) {
    console.error('Error adding project to team:', error)
    return null
  }
}

export async function removeProjectFromTeam(teamId: string, projectId: string, removedBy: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('team_projects')
      .delete()
      .eq('team_id', teamId)
      .eq('project_id', projectId)

    if (error) throw error

    await logTeamActivity(teamId, removedBy, 'project_removed', 'project', projectId, {})

    return true
  } catch (error) {
    console.error('Error removing project from team:', error)
    return false
  }
}

export async function updateProjectAccess(
  teamId: string,
  projectId: string,
  accessLevel: TeamProject['access_level']
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('team_projects')
      .update({ access_level: accessLevel })
      .eq('team_id', teamId)
      .eq('project_id', projectId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error updating project access:', error)
    return false
  }
}

// =====================================================
// TEAM CHANNELS & MESSAGING
// =====================================================

export async function getTeamChannels(teamId: string, userId: string): Promise<TeamChannel[]> {
  try {
    const { data, error } = await supabase
      .from('team_channels')
      .select('*')
      .eq('team_id', teamId)
      .or(`is_private.eq.false,members.cs.{${userId}}`)
      .order('name', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching team channels:', error)
    return []
  }
}

export async function createTeamChannel(channel: Partial<TeamChannel>): Promise<TeamChannel | null> {
  try {
    const { data, error } = await supabase
      .from('team_channels')
      .insert({
        team_id: channel.team_id,
        name: channel.name,
        description: channel.description,
        channel_type: channel.channel_type || 'general',
        is_private: channel.is_private || false,
        members: channel.members || [],
        created_by: channel.created_by
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating team channel:', error)
    return null
  }
}

export async function getChannelMessages(
  channelId: string,
  options: { limit?: number; before?: string } = {}
): Promise<TeamMessage[]> {
  try {
    let query = supabase
      .from('team_messages')
      .select(`
        *,
        user:user_id (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('channel_id', channelId)
      .order('created_at', { ascending: false })
      .limit(options.limit || 50)

    if (options.before) {
      query = query.lt('created_at', options.before)
    }

    const { data, error } = await query

    if (error) throw error
    return (data || []).reverse()
  } catch (error) {
    console.error('Error fetching channel messages:', error)
    return []
  }
}

export async function sendTeamMessage(message: Partial<TeamMessage>): Promise<TeamMessage | null> {
  try {
    const { data, error } = await supabase
      .from('team_messages')
      .insert({
        team_id: message.team_id,
        channel_id: message.channel_id,
        user_id: message.user_id,
        content: message.content,
        message_type: message.message_type || 'text',
        attachments: message.attachments || [],
        mentions: message.mentions || [],
        reactions: {},
        is_pinned: false,
        is_edited: false,
        parent_id: message.parent_id
      })
      .select(`
        *,
        user:user_id (
          id,
          full_name,
          avatar_url
        )
      `)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error sending team message:', error)
    return null
  }
}

export async function addMessageReaction(messageId: string, userId: string, emoji: string): Promise<boolean> {
  try {
    const { data: message } = await supabase
      .from('team_messages')
      .select('reactions')
      .eq('id', messageId)
      .single()

    if (!message) return false

    const reactions = message.reactions || {}
    if (!reactions[emoji]) {
      reactions[emoji] = []
    }

    if (!reactions[emoji].includes(userId)) {
      reactions[emoji].push(userId)
    }

    const { error } = await supabase
      .from('team_messages')
      .update({ reactions })
      .eq('id', messageId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error adding reaction:', error)
    return false
  }
}

export async function removeMessageReaction(messageId: string, userId: string, emoji: string): Promise<boolean> {
  try {
    const { data: message } = await supabase
      .from('team_messages')
      .select('reactions')
      .eq('id', messageId)
      .single()

    if (!message) return false

    const reactions = message.reactions || {}
    if (reactions[emoji]) {
      reactions[emoji] = reactions[emoji].filter((id: string) => id !== userId)
      if (reactions[emoji].length === 0) {
        delete reactions[emoji]
      }
    }

    const { error } = await supabase
      .from('team_messages')
      .update({ reactions })
      .eq('id', messageId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error removing reaction:', error)
    return false
  }
}

// =====================================================
// TEAM ACTIVITY
// =====================================================

export async function getTeamActivity(teamId: string, limit: number = 50): Promise<TeamActivity[]> {
  try {
    const { data, error } = await supabase
      .from('team_activity')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching team activity:', error)
    return []
  }
}

export async function logTeamActivity(
  teamId: string,
  userId: string,
  action: string,
  entityType: string,
  entityId?: string,
  details: Record<string, any> = {}
): Promise<void> {
  try {
    await supabase
      .from('team_activity')
      .insert({
        team_id: teamId,
        user_id: userId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        details
      })
  } catch (error) {
    console.error('Error logging team activity:', error)
  }
}

// =====================================================
// TEAM STATS
// =====================================================

export async function getTeamStats(teamId: string): Promise<{
  memberCount: number
  activeMembers: number
  projectCount: number
  messageCount: number
  recentActivity: TeamActivity[]
}> {
  try {
    // Member count
    const { count: memberCount } = await supabase
      .from('team_members')
      .select('id', { count: 'exact' })
      .eq('team_id', teamId)
      .eq('status', 'active')

    // Active members (active in last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { count: activeMembers } = await supabase
      .from('team_members')
      .select('id', { count: 'exact' })
      .eq('team_id', teamId)
      .eq('status', 'active')
      .gte('last_active_at', sevenDaysAgo.toISOString())

    // Project count
    const { count: projectCount } = await supabase
      .from('team_projects')
      .select('id', { count: 'exact' })
      .eq('team_id', teamId)

    // Message count (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { count: messageCount } = await supabase
      .from('team_messages')
      .select('id', { count: 'exact' })
      .eq('team_id', teamId)
      .gte('created_at', thirtyDaysAgo.toISOString())

    // Recent activity
    const recentActivity = await getTeamActivity(teamId, 10)

    return {
      memberCount: memberCount || 0,
      activeMembers: activeMembers || 0,
      projectCount: projectCount || 0,
      messageCount: messageCount || 0,
      recentActivity
    }
  } catch (error) {
    console.error('Error getting team stats:', error)
    return {
      memberCount: 0,
      activeMembers: 0,
      projectCount: 0,
      messageCount: 0,
      recentActivity: []
    }
  }
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

async function updateTeamMemberCount(teamId: string): Promise<void> {
  try {
    const { count } = await supabase
      .from('team_members')
      .select('id', { count: 'exact' })
      .eq('team_id', teamId)
      .eq('status', 'active')

    await supabase
      .from('teams')
      .update({ member_count: count || 0, updated_at: new Date().toISOString() })
      .eq('id', teamId)
  } catch (error) {
    console.error('Error updating team member count:', error)
  }
}

function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  const random = Math.random().toString(36).substring(2, 8)
  return `${base}-${random}`
}

function generateInviteToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 48; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

function getDefaultPermissions(role: TeamMember['role']): string[] {
  switch (role) {
    case 'owner':
      return ['*']
    case 'admin':
      return ['team:read', 'team:write', 'members:read', 'members:write', 'projects:read', 'projects:write', 'messages:read', 'messages:write']
    case 'manager':
      return ['team:read', 'members:read', 'members:write', 'projects:read', 'projects:write', 'messages:read', 'messages:write']
    case 'member':
      return ['team:read', 'members:read', 'projects:read', 'messages:read', 'messages:write']
    case 'guest':
      return ['team:read', 'projects:read', 'messages:read']
    default:
      return ['team:read']
  }
}

export function hasPermission(member: TeamMember, permission: string): boolean {
  if (member.permissions.includes('*')) return true
  return member.permissions.includes(permission)
}
