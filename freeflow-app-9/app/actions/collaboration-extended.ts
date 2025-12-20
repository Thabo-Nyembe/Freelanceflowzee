'use server'

/**
 * Extended Collaboration Server Actions - Covers all 24 Collaboration-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getCollaborationAnalytics(teamId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('collaboration_analytics').select('*').eq('team_id', teamId)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function getCollaborationCanvasBoards(userId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('collaboration_canvas_boards').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function createCollaborationCanvasBoard(userId: string, input: { name: string; description?: string }) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('collaboration_canvas_boards').insert({ ...input, user_id: userId }).select().single()
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

export async function getCollaborationCanvasCollaborators(boardId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('collaboration_canvas_collaborators').select('*').eq('board_id', boardId)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function addCollaborationCanvasCollaborator(boardId: string, userId: string, role = 'viewer') {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('collaboration_canvas_collaborators').insert({ board_id: boardId, user_id: userId, role }).select().single()
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

export async function getCollaborationCanvasExports(boardId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('collaboration_canvas_exports').select('*').eq('board_id', boardId)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function getCollaborationChannelMembers(channelId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('collaboration_channel_members').select('*').eq('channel_id', channelId)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function addCollaborationChannelMember(channelId: string, userId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('collaboration_channel_members').insert({ channel_id: channelId, user_id: userId }).select().single()
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

export async function getCollaborationChannels(teamId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('collaboration_channels').select('*').eq('team_id', teamId).order('name', { ascending: true })
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function createCollaborationChannel(teamId: string, input: { name: string; description?: string; is_private?: boolean }) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('collaboration_channels').insert({ ...input, team_id: teamId }).select().single()
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

export async function getCollaborationEvents(teamId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('collaboration_events').select('*').eq('team_id', teamId).order('created_at', { ascending: false })
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function getCollaborationFeedback(projectId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('collaboration_feedback').select('*').eq('project_id', projectId).order('created_at', { ascending: false })
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function createCollaborationFeedback(projectId: string, userId: string, content: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('collaboration_feedback').insert({ project_id: projectId, user_id: userId, content }).select().single()
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

export async function getCollaborationFeedbackReplies(feedbackId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('collaboration_feedback_replies').select('*').eq('feedback_id', feedbackId).order('created_at', { ascending: true })
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function getCollaborationFeedbackVotes(feedbackId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('collaboration_feedback_votes').select('*').eq('feedback_id', feedbackId)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function getCollaborationFileShares(fileId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('collaboration_file_shares').select('*').eq('file_id', fileId)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function createCollaborationFileShare(fileId: string, userId: string, sharedWithId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('collaboration_file_shares').insert({ file_id: fileId, user_id: userId, shared_with_id: sharedWithId }).select().single()
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

export async function getCollaborationInvites(teamId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('collaboration_invites').select('*').eq('team_id', teamId).eq('status', 'pending')
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function createCollaborationInvite(teamId: string, email: string, role = 'member') {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('collaboration_invites').insert({ team_id: teamId, email, role, status: 'pending' }).select().single()
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

export async function getCollaborationMedia(projectId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('collaboration_media').select('*').eq('project_id', projectId)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function getCollaborationMediaShares(mediaId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('collaboration_media_shares').select('*').eq('media_id', mediaId)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function getCollaborationMeetingParticipants(meetingId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('collaboration_meeting_participants').select('*').eq('meeting_id', meetingId)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function getCollaborationMeetingRecordings(meetingId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('collaboration_meeting_recordings').select('*').eq('meeting_id', meetingId)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function getCollaborationMeetings(teamId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('collaboration_meetings').select('*').eq('team_id', teamId).order('scheduled_at', { ascending: true })
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function createCollaborationMeeting(teamId: string, userId: string, input: { title: string; scheduled_at: string; duration?: number }) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('collaboration_meetings').insert({ ...input, team_id: teamId, host_id: userId }).select().single()
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

export async function getCollaborationMessages(channelId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('collaboration_messages').select('*').eq('channel_id', channelId).order('created_at', { ascending: true })
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function createCollaborationMessage(channelId: string, userId: string, content: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('collaboration_messages').insert({ channel_id: channelId, user_id: userId, content }).select().single()
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

export async function getCollaborationSessions(projectId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('collaboration_sessions').select('*').eq('project_id', projectId)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function getCollaborationTeamMembers(teamId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('collaboration_team_members').select('*').eq('team_id', teamId)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function getCollaborationTeamMetrics(teamId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('collaboration_team_metrics').select('*').eq('team_id', teamId).single()
    if (error && error.code !== 'PGRST116') throw error
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

export async function getCollaborationTeams(userId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('collaboration_teams').select('*').eq('owner_id', userId)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function createCollaborationTeam(userId: string, input: { name: string; description?: string }) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('collaboration_teams').insert({ ...input, owner_id: userId }).select().single()
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed' }
  }
}

export async function getCollaborationWorkspaceFiles(workspaceId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('collaboration_workspace_files').select('*').eq('workspace_id', workspaceId)
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}

export async function getCollaborationWorkspaceFolders(workspaceId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('collaboration_workspace_folders').select('*').eq('workspace_id', workspaceId).order('name', { ascending: true })
    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] }
  }
}
