'use client'

/**
 * Extended Collaboration Hooks - Covers all 24 Collaboration-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useCollaborationAnalytics(teamId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetch = useCallback(async () => {
    if (!teamId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('collaboration_analytics').select('*').eq('team_id', teamId)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [teamId, supabase])

  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCollaborationCanvasBoards(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('collaboration_canvas_boards').select('*').eq('user_id', userId).order('created_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, supabase])

  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCollaborationCanvasCollaborators(boardId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetch = useCallback(async () => {
    if (!boardId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('collaboration_canvas_collaborators').select('*').eq('board_id', boardId)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [boardId, supabase])

  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCollaborationCanvasExports(boardId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetch = useCallback(async () => {
    if (!boardId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('collaboration_canvas_exports').select('*').eq('board_id', boardId)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [boardId, supabase])

  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCollaborationChannelMembers(channelId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetch = useCallback(async () => {
    if (!channelId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('collaboration_channel_members').select('*').eq('channel_id', channelId)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [channelId, supabase])

  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCollaborationChannels(teamId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetch = useCallback(async () => {
    if (!teamId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('collaboration_channels').select('*').eq('team_id', teamId).order('name', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [teamId, supabase])

  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCollaborationEvents(teamId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetch = useCallback(async () => {
    if (!teamId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('collaboration_events').select('*').eq('team_id', teamId).order('created_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [teamId, supabase])

  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCollaborationFeedback(projectId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetch = useCallback(async () => {
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('collaboration_feedback').select('*').eq('project_id', projectId).order('created_at', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [projectId, supabase])

  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCollaborationFeedbackReplies(feedbackId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetch = useCallback(async () => {
    if (!feedbackId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('collaboration_feedback_replies').select('*').eq('feedback_id', feedbackId).order('created_at', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [feedbackId, supabase])

  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCollaborationFeedbackVotes(feedbackId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetch = useCallback(async () => {
    if (!feedbackId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('collaboration_feedback_votes').select('*').eq('feedback_id', feedbackId)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [feedbackId, supabase])

  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCollaborationFileShares(fileId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetch = useCallback(async () => {
    if (!fileId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('collaboration_file_shares').select('*').eq('file_id', fileId)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [fileId, supabase])

  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCollaborationInvites(teamId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetch = useCallback(async () => {
    if (!teamId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('collaboration_invites').select('*').eq('team_id', teamId).eq('status', 'pending')
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [teamId, supabase])

  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCollaborationMedia(projectId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetch = useCallback(async () => {
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('collaboration_media').select('*').eq('project_id', projectId)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [projectId, supabase])

  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCollaborationMediaShares(mediaId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetch = useCallback(async () => {
    if (!mediaId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('collaboration_media_shares').select('*').eq('media_id', mediaId)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [mediaId, supabase])

  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCollaborationMeetingParticipants(meetingId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetch = useCallback(async () => {
    if (!meetingId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('collaboration_meeting_participants').select('*').eq('meeting_id', meetingId)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [meetingId, supabase])

  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCollaborationMeetingRecordings(meetingId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetch = useCallback(async () => {
    if (!meetingId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('collaboration_meeting_recordings').select('*').eq('meeting_id', meetingId)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [meetingId, supabase])

  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCollaborationMeetings(teamId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetch = useCallback(async () => {
    if (!teamId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('collaboration_meetings').select('*').eq('team_id', teamId).order('scheduled_at', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [teamId, supabase])

  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCollaborationMessages(channelId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetch = useCallback(async () => {
    if (!channelId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('collaboration_messages').select('*').eq('channel_id', channelId).order('created_at', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [channelId, supabase])

  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCollaborationSessions(projectId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetch = useCallback(async () => {
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('collaboration_sessions').select('*').eq('project_id', projectId)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [projectId, supabase])

  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCollaborationTeamMembers(teamId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetch = useCallback(async () => {
    if (!teamId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('collaboration_team_members').select('*').eq('team_id', teamId)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [teamId, supabase])

  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCollaborationTeamMetrics(teamId?: string) {
  const [data, setData] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetch = useCallback(async () => {
    if (!teamId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('collaboration_team_metrics').select('*').eq('team_id', teamId).single()
      setData(result)
    } finally { setIsLoading(false) }
  }, [teamId, supabase])

  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCollaborationTeams(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('collaboration_teams').select('*').eq('owner_id', userId)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, supabase])

  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCollaborationWorkspaceFiles(workspaceId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetch = useCallback(async () => {
    if (!workspaceId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('collaboration_workspace_files').select('*').eq('workspace_id', workspaceId)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [workspaceId, supabase])

  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useCollaborationWorkspaceFolders(workspaceId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetch = useCallback(async () => {
    if (!workspaceId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('collaboration_workspace_folders').select('*').eq('workspace_id', workspaceId).order('name', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [workspaceId, supabase])

  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
