/**
 * Collaboration Queries
 *
 * Supabase queries for collaboration features including:
 * - Channels (chat rooms)
 * - Messages
 * - Teams
 * - Workspace files
 * - Meetings
 */

import { createClient } from '@/lib/supabase/client'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('CollaborationQueries')

// =====================================================
// TYPES
// =====================================================

export type ChannelType = 'public' | 'private' | 'direct'
export type MessageType = 'text' | 'file' | 'system' | 'call'
export type ChannelRole = 'owner' | 'admin' | 'member'
export type TeamType = 'project' | 'department' | 'cross-functional'
export type TeamMemberRole = 'owner' | 'lead' | 'member' | 'contributor'
export type MemberStatus = 'active' | 'inactive' | 'busy' | 'away'
export type FileVisibility = 'private' | 'team' | 'public'
export type MeetingStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled'

export interface Channel {
  id: string
  user_id: string
  name: string
  description?: string
  type: ChannelType
  created_by?: string
  is_archived: boolean
  member_count: number
  message_count: number
  last_activity_at?: string
  settings: Record<string, any>
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  channel_id: string
  user_id: string
  content: string
  message_type: MessageType
  attachments: any[]
  reactions: Record<string, any>
  is_pinned: boolean
  is_edited: boolean
  edited_at?: string
  thread_count: number
  parent_message_id?: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface ChannelMember {
  id: string
  channel_id: string
  user_id: string
  role: ChannelRole
  is_muted: boolean
  last_read_at: string
  settings: Record<string, any>
  joined_at: string
}

export interface Team {
  id: string
  user_id: string
  name: string
  description?: string
  avatar_url?: string
  team_type: TeamType
  owner_id?: string
  status: 'active' | 'archived'
  is_favorite: boolean
  member_count: number
  settings: Record<string, any>
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface TeamMember {
  id: string
  team_id: string
  user_id: string
  role: TeamMemberRole
  status: MemberStatus
  performance_score: number
  tasks_completed: number
  last_active_at: string
  metadata: Record<string, any>
  joined_at: string
}

export interface WorkspaceFolder {
  id: string
  user_id: string
  name: string
  description?: string
  parent_folder_id?: string
  created_by?: string
  is_favorite: boolean
  color?: string
  icon?: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface WorkspaceFile {
  id: string
  user_id: string
  name: string
  description?: string
  file_url: string
  file_type: string
  file_size: number
  folder_id?: string
  uploaded_by?: string
  visibility: FileVisibility
  is_favorite: boolean
  tags: string[]
  version: number
  parent_file_id?: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface FileShare {
  id: string
  file_id: string
  shared_with_user_id?: string
  shared_with_team_id?: string
  shared_by: string
  can_edit: boolean
  can_download: boolean
  can_share: boolean
  expires_at?: string
  metadata: Record<string, any>
  shared_at: string
}

export interface Meeting {
  id: string
  user_id: string
  title: string
  description?: string
  meeting_url?: string
  scheduled_start: string
  scheduled_end: string
  actual_start?: string
  actual_end?: string
  status: MeetingStatus
  host_id: string
  is_recurring: boolean
  recurrence_pattern?: string
  max_participants?: number
  is_recorded: boolean
  recording_url?: string
  agenda: any[]
  notes?: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface MeetingParticipant {
  id: string
  meeting_id: string
  user_id: string
  status: 'invited' | 'accepted' | 'declined' | 'tentative' | 'attended'
  is_required: boolean
  joined_at?: string
  left_at?: string
  duration_minutes?: number
  metadata: Record<string, any>
  invited_at: string
}

// =====================================================
// CHANNELS CRUD
// =====================================================

/**
 * Get all channels for a user
 */
export async function getChannels(
  userId: string,
  filters?: {
    type?: ChannelType
    is_archived?: boolean
    search?: string
  }
): Promise<{ data: Channel[] | null; error: any }> {
  try {
    logger.info('Getting channels from Supabase', { userId, filters })

    const supabase = createClient()
    let query = supabase
      .from('collaboration_channels')
      .select('*')
      .eq('user_id', userId)
      .order('last_activity_at', { ascending: false, nullsFirst: false })

    if (filters?.type) {
      query = query.eq('type', filters.type)
    }

    if (filters?.is_archived !== undefined) {
      query = query.eq('is_archived', filters.is_archived)
    }

    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`)
    }

    const { data, error } = await query

    if (error) {
      logger.error('Failed to get channels', { error, userId })
      return { data: null, error }
    }

    logger.info('Channels retrieved successfully', {
      count: data?.length || 0,
      userId
    })

    return { data, error: null }
  } catch (error) {
    logger.error('Exception getting channels', { error, userId })
    return { data: null, error }
  }
}

/**
 * Create a new channel
 */
export async function createChannel(
  userId: string,
  channel: {
    name: string
    description?: string
    type: ChannelType
  }
): Promise<{ data: Channel | null; error: any }> {
  try {
    logger.info('Creating channel in Supabase', { userId, channel_name: channel.name })

    const supabase = createClient()
    const { data, error } = await supabase
      .from('collaboration_channels')
      .insert({
        user_id: userId,
        name: channel.name,
        description: channel.description,
        type: channel.type,
        created_by: userId,
        is_archived: false,
        member_count: 0,
        message_count: 0
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create channel', { error, userId })
      return { data: null, error }
    }

    logger.info('Channel created successfully', {
      channelId: data.id,
      channel_name: channel.name
    })

    return { data, error: null }
  } catch (error) {
    logger.error('Exception creating channel', { error, userId })
    return { data: null, error }
  }
}

/**
 * Update a channel
 */
export async function updateChannel(
  channelId: string,
  userId: string,
  updates: Partial<Channel>
): Promise<{ data: Channel | null; error: any }> {
  try {
    logger.info('Updating channel in Supabase', { channelId, userId })

    const supabase = createClient()
    const { data, error } = await supabase
      .from('collaboration_channels')
      .update(updates)
      .eq('id', channelId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update channel', { error, channelId })
      return { data: null, error }
    }

    logger.info('Channel updated successfully', { channelId })

    return { data, error: null }
  } catch (error) {
    logger.error('Exception updating channel', { error, channelId })
    return { data: null, error }
  }
}

/**
 * Delete a channel
 */
export async function deleteChannel(
  channelId: string,
  userId: string
): Promise<{ success: boolean; error: any }> {
  try {
    logger.info('Deleting channel from Supabase', { channelId, userId })

    const supabase = createClient()
    const { error } = await supabase
      .from('collaboration_channels')
      .delete()
      .eq('id', channelId)
      .eq('user_id', userId)

    if (error) {
      logger.error('Failed to delete channel', { error, channelId })
      return { success: false, error }
    }

    logger.info('Channel deleted successfully', { channelId })

    return { success: true, error: null }
  } catch (error) {
    logger.error('Exception deleting channel', { error, channelId })
    return { success: false, error }
  }
}

// =====================================================
// MESSAGES CRUD
// =====================================================

/**
 * Get messages for a channel
 */
export async function getMessages(
  channelId: string,
  options?: {
    limit?: number
    offset?: number
    parent_message_id?: string
  }
): Promise<{ data: Message[] | null; error: any }> {
  try {
    logger.info('Getting messages from Supabase', { channelId, options })

    const supabase = createClient()
    let query = supabase
      .from('collaboration_messages')
      .select('*')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: false })

    if (options?.parent_message_id) {
      query = query.eq('parent_message_id', options.parent_message_id)
    } else {
      query = query.is('parent_message_id', null)
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 50) - 1)
    }

    const { data, error } = await query

    if (error) {
      logger.error('Failed to get messages', { error, channelId })
      return { data: null, error }
    }

    logger.info('Messages retrieved successfully', {
      count: data?.length || 0,
      channelId
    })

    return { data, error: null }
  } catch (error) {
    logger.error('Exception getting messages', { error, channelId })
    return { data: null, error }
  }
}

/**
 * Send a message
 */
export async function sendMessage(
  channelId: string,
  userId: string,
  message: {
    content: string
    message_type?: MessageType
    attachments?: any[]
    parent_message_id?: string
  }
): Promise<{ data: Message | null; error: any }> {
  try {
    logger.info('Sending message to Supabase', { channelId, userId })

    const supabase = createClient()
    const { data, error } = await supabase
      .from('collaboration_messages')
      .insert({
        channel_id: channelId,
        user_id: userId,
        content: message.content,
        message_type: message.message_type || 'text',
        attachments: message.attachments || [],
        parent_message_id: message.parent_message_id
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to send message', { error, channelId })
      return { data: null, error }
    }

    logger.info('Message sent successfully', {
      messageId: data.id,
      channelId
    })

    return { data, error: null }
  } catch (error) {
    logger.error('Exception sending message', { error, channelId })
    return { data: null, error }
  }
}

/**
 * Delete a message
 */
export async function deleteMessage(
  messageId: string,
  userId: string
): Promise<{ success: boolean; error: any }> {
  try {
    logger.info('Deleting message from Supabase', { messageId, userId })

    const supabase = createClient()
    const { error } = await supabase
      .from('collaboration_messages')
      .delete()
      .eq('id', messageId)
      .eq('user_id', userId)

    if (error) {
      logger.error('Failed to delete message', { error, messageId })
      return { success: false, error }
    }

    logger.info('Message deleted successfully', { messageId })

    return { success: true, error: null }
  } catch (error) {
    logger.error('Exception deleting message', { error, messageId })
    return { success: false, error }
  }
}

// =====================================================
// TEAMS CRUD
// =====================================================

/**
 * Get all teams for a user
 */
export async function getTeams(
  userId: string,
  filters?: {
    team_type?: TeamType
    status?: 'active' | 'archived'
    is_favorite?: boolean
  }
): Promise<{ data: Team[] | null; error: any }> {
  try {
    logger.info('Getting teams from Supabase', { userId, filters })

    const supabase = createClient()
    let query = supabase
      .from('collaboration_teams')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (filters?.team_type) {
      query = query.eq('team_type', filters.team_type)
    }

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.is_favorite !== undefined) {
      query = query.eq('is_favorite', filters.is_favorite)
    }

    const { data, error } = await query

    if (error) {
      logger.error('Failed to get teams', { error, userId })
      return { data: null, error }
    }

    logger.info('Teams retrieved successfully', {
      count: data?.length || 0,
      userId
    })

    return { data, error: null }
  } catch (error) {
    logger.error('Exception getting teams', { error, userId })
    return { data: null, error }
  }
}

/**
 * Create a new team
 */
export async function createTeam(
  userId: string,
  team: {
    name: string
    description?: string
    team_type: TeamType
    avatar_url?: string
  }
): Promise<{ data: Team | null; error: any }> {
  try {
    logger.info('Creating team in Supabase', { userId, team_name: team.name })

    const supabase = createClient()
    const { data, error } = await supabase
      .from('collaboration_teams')
      .insert({
        user_id: userId,
        name: team.name,
        description: team.description,
        team_type: team.team_type,
        avatar_url: team.avatar_url,
        owner_id: userId,
        status: 'active',
        member_count: 0
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create team', { error, userId })
      return { data: null, error }
    }

    logger.info('Team created successfully', {
      teamId: data.id,
      team_name: team.name
    })

    return { data, error: null }
  } catch (error) {
    logger.error('Exception creating team', { error, userId })
    return { data: null, error }
  }
}

/**
 * Update a team
 */
export async function updateTeam(
  teamId: string,
  userId: string,
  updates: Partial<Team>
): Promise<{ data: Team | null; error: any }> {
  try {
    logger.info('Updating team in Supabase', { teamId, userId })

    const supabase = createClient()
    const { data, error } = await supabase
      .from('collaboration_teams')
      .update(updates)
      .eq('id', teamId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update team', { error, teamId })
      return { data: null, error }
    }

    logger.info('Team updated successfully', { teamId })

    return { data, error: null }
  } catch (error) {
    logger.error('Exception updating team', { error, teamId })
    return { data: null, error }
  }
}

/**
 * Delete a team
 */
export async function deleteTeam(
  teamId: string,
  userId: string
): Promise<{ success: boolean; error: any }> {
  try {
    logger.info('Deleting team from Supabase', { teamId, userId })

    const supabase = createClient()
    const { error } = await supabase
      .from('collaboration_teams')
      .delete()
      .eq('id', teamId)
      .eq('user_id', userId)

    if (error) {
      logger.error('Failed to delete team', { error, teamId })
      return { success: false, error }
    }

    logger.info('Team deleted successfully', { teamId })

    return { success: true, error: null }
  } catch (error) {
    logger.error('Exception deleting team', { error, teamId })
    return { success: false, error }
  }
}

// =====================================================
// WORKSPACE FILES CRUD
// =====================================================

/**
 * Get workspace files
 */
export async function getWorkspaceFiles(
  userId: string,
  filters?: {
    folder_id?: string
    visibility?: FileVisibility
    search?: string
  }
): Promise<{ data: WorkspaceFile[] | null; error: any }> {
  try {
    logger.info('Getting workspace files from Supabase', { userId, filters })

    const supabase = createClient()
    let query = supabase
      .from('collaboration_workspace_files')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (filters?.folder_id) {
      query = query.eq('folder_id', filters.folder_id)
    }

    if (filters?.visibility) {
      query = query.eq('visibility', filters.visibility)
    }

    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`)
    }

    const { data, error } = await query

    if (error) {
      logger.error('Failed to get workspace files', { error, userId })
      return { data: null, error }
    }

    logger.info('Workspace files retrieved successfully', {
      count: data?.length || 0,
      userId
    })

    return { data, error: null }
  } catch (error) {
    logger.error('Exception getting workspace files', { error, userId })
    return { data: null, error }
  }
}

/**
 * Upload a workspace file
 */
export async function uploadWorkspaceFile(
  userId: string,
  file: {
    name: string
    description?: string
    file_url: string
    file_type: string
    file_size: number
    folder_id?: string
    visibility?: FileVisibility
    tags?: string[]
  }
): Promise<{ data: WorkspaceFile | null; error: any }> {
  try {
    logger.info('Uploading workspace file to Supabase', { userId, file_name: file.name })

    const supabase = createClient()
    const { data, error } = await supabase
      .from('collaboration_workspace_files')
      .insert({
        user_id: userId,
        name: file.name,
        description: file.description,
        file_url: file.file_url,
        file_type: file.file_type,
        file_size: file.file_size,
        folder_id: file.folder_id,
        uploaded_by: userId,
        visibility: file.visibility || 'private',
        tags: file.tags || [],
        version: 1
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to upload workspace file', { error, userId })
      return { data: null, error }
    }

    logger.info('Workspace file uploaded successfully', {
      fileId: data.id,
      file_name: file.name
    })

    return { data, error: null }
  } catch (error) {
    logger.error('Exception uploading workspace file', { error, userId })
    return { data: null, error }
  }
}

/**
 * Delete a workspace file
 */
export async function deleteWorkspaceFile(
  fileId: string,
  userId: string
): Promise<{ success: boolean; error: any }> {
  try {
    logger.info('Deleting workspace file from Supabase', { fileId, userId })

    const supabase = createClient()
    const { error } = await supabase
      .from('collaboration_workspace_files')
      .delete()
      .eq('id', fileId)
      .eq('user_id', userId)

    if (error) {
      logger.error('Failed to delete workspace file', { error, fileId })
      return { success: false, error }
    }

    logger.info('Workspace file deleted successfully', { fileId })

    return { success: true, error: null }
  } catch (error) {
    logger.error('Exception deleting workspace file', { error, fileId })
    return { success: false, error }
  }
}

// =====================================================
// MEETINGS CRUD
// =====================================================

/**
 * Get meetings
 */
export async function getMeetings(
  userId: string,
  filters?: {
    status?: MeetingStatus
    date_range?: { start: string; end: string }
  }
): Promise<{ data: Meeting[] | null; error: any }> {
  try {
    logger.info('Getting meetings from Supabase', { userId, filters })

    const supabase = createClient()
    let query = supabase
      .from('collaboration_meetings')
      .select('*')
      .eq('user_id', userId)
      .order('scheduled_start', { ascending: true })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.date_range) {
      query = query
        .gte('scheduled_start', filters.date_range.start)
        .lte('scheduled_start', filters.date_range.end)
    }

    const { data, error } = await query

    if (error) {
      logger.error('Failed to get meetings', { error, userId })
      return { data: null, error }
    }

    logger.info('Meetings retrieved successfully', {
      count: data?.length || 0,
      userId
    })

    return { data, error: null }
  } catch (error) {
    logger.error('Exception getting meetings', { error, userId })
    return { data: null, error }
  }
}

/**
 * Create a meeting
 */
export async function createMeeting(
  userId: string,
  meeting: {
    title: string
    description?: string
    scheduled_start: string
    scheduled_end: string
    meeting_url?: string
    is_recurring?: boolean
    max_participants?: number
  }
): Promise<{ data: Meeting | null; error: any }> {
  try {
    logger.info('Creating meeting in Supabase', { userId, meeting_title: meeting.title })

    const supabase = createClient()
    const { data, error } = await supabase
      .from('collaboration_meetings')
      .insert({
        user_id: userId,
        title: meeting.title,
        description: meeting.description,
        scheduled_start: meeting.scheduled_start,
        scheduled_end: meeting.scheduled_end,
        meeting_url: meeting.meeting_url,
        host_id: userId,
        status: 'scheduled',
        is_recurring: meeting.is_recurring || false,
        max_participants: meeting.max_participants,
        agenda: []
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create meeting', { error, userId })
      return { data: null, error }
    }

    logger.info('Meeting created successfully', {
      meetingId: data.id,
      meeting_title: meeting.title
    })

    return { data, error: null }
  } catch (error) {
    logger.error('Exception creating meeting', { error, userId })
    return { data: null, error }
  }
}

/**
 * Update a meeting
 */
export async function updateMeeting(
  meetingId: string,
  userId: string,
  updates: Partial<Meeting>
): Promise<{ data: Meeting | null; error: any }> {
  try {
    logger.info('Updating meeting in Supabase', { meetingId, userId })

    const supabase = createClient()
    const { data, error } = await supabase
      .from('collaboration_meetings')
      .update(updates)
      .eq('id', meetingId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update meeting', { error, meetingId })
      return { data: null, error }
    }

    logger.info('Meeting updated successfully', { meetingId })

    return { data, error: null }
  } catch (error) {
    logger.error('Exception updating meeting', { error, meetingId })
    return { data: null, error }
  }
}

/**
 * Delete a meeting
 */
export async function deleteMeeting(
  meetingId: string,
  userId: string
): Promise<{ success: boolean; error: any }> {
  try {
    logger.info('Deleting meeting from Supabase', { meetingId, userId })

    const supabase = createClient()
    const { error } = await supabase
      .from('collaboration_meetings')
      .delete()
      .eq('id', meetingId)
      .eq('user_id', userId)

    if (error) {
      logger.error('Failed to delete meeting', { error, meetingId })
      return { success: false, error }
    }

    logger.info('Meeting deleted successfully', { meetingId })

    return { success: true, error: null }
  } catch (error) {
    logger.error('Exception deleting meeting', { error, meetingId })
    return { success: false, error }
  }
}
