export type FeedbackTargetType = 
  | "video"
  | "image"
  | "audio"
  | "code"
  | "text"
  | "document";

export interface Feedback {
  id: number;
  user_id: string;
  document_id: number;
  target_type: FeedbackTargetType;
  target_id: string;
  comment: string;
  context_data?: {
    timestamp?: string;
    selection?: string;
    region?: { x: number; y: number; width: number; height: number };
    code_selection?: { start_line: number; end_line: number };
  };
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
}

export type SuggestionStatus = "pending" | "accepted" | "rejected";

export type SuggestionData = 
  | { type: "insertion"; position: number; text: string }
  | { type: "deletion"; start: number; end: a; text: string }
  | { type: "replacement"; start: number; end: number; new_text: string; old_text: string };

export interface Suggestion {
  id: number;
  user_id: string;
  document_id: number;
  target_id: string;
  status: SuggestionStatus;
  suggestion_data: SuggestionData;
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
}

export interface CollaborationUser {
  id: string
  name: string
  email: string
  avatar?: string
  color: string
  cursor?: {
    x: number
    y: number
    timestamp: number
  }
  selection?: {
    start: number
    end: number
    blockId: string
    timestamp: number
  }
  lastActive: string
  status: 'online' | 'away' | 'offline'
}

export interface CollaborationEvent {
  id: string
  type: 'cursor' | 'selection' | 'edit' | 'comment' | 'reaction' | 'presence'
  userId: string
  timestamp: string
  data: any
}

export interface CollaborationComment {
  id: string
  userId: string
  blockId: string
  content: string
  createdAt: string
  updatedAt: string
  resolved: boolean
  resolvedBy?: string
  resolvedAt?: string
  replies: CollaborationComment[]
  reactions: {
    [key: string]: string[] // emoji -> userIds
  }
}

export interface CollaborationState {
  users: CollaborationUser[]
  comments: CollaborationComment[]
  events: CollaborationEvent[]
  isConnected: boolean
  isReconnecting: boolean
  lastSynced: string | null
}

export interface CollaborationOptions {
  projectId: string
  userId: string
  userName: string
  userEmail: string
  userAvatar?: string
  onUserJoin?: (user: CollaborationUser) => void
  onUserLeave?: (user: CollaborationUser) => void
  onCursorMove?: (user: CollaborationUser) => void
  onSelectionChange?: (user: CollaborationUser) => void
  onComment?: (comment: CollaborationComment) => void
  onCommentResolved?: (comment: CollaborationComment) => void
  onReaction?: (commentId: string, emoji: string, userId: string) => void
  onConnectionStateChange?: (isConnected: boolean) => void
  onError?: (error: Error) => void
}

export interface CollaborationMessage {
  type: 'cursor' | 'selection' | 'edit' | 'comment' | 'reaction' | 'presence'
  userId: string
  data: any
}

export interface CollaborationApi {
  connect: () => Promise<void>
  disconnect: () => void
  sendMessage: (message: CollaborationMessage) => void
  updateCursor: (x: number, y: number) => void
  updateSelection: (start: number, end: number, blockId: string) => void
  addComment: (blockId: string, content: string) => Promise<CollaborationComment>
  resolveComment: (commentId: string) => Promise<void>
  addReaction: (commentId: string, emoji: string) => Promise<void>
  removeReaction: (commentId: string, emoji: string) => Promise<void>
  getUsers: () => CollaborationUser[]
  getComments: () => CollaborationComment[]
  getEvents: () => CollaborationEvent[]
  isConnected: () => boolean
  getLastSynced: () => string | null
} 