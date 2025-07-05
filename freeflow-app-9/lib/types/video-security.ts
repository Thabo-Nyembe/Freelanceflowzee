export type PermissionLevel = 'view' | 'comment' | 'edit';

export interface VideoPermission {
  id: string;
  video_id: string;
  user_id: string;
  permission_level: PermissionLevel;
  created_at: string;
  updated_at: string;
  // Optional: join user data for display
  user?: {
    email?: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export interface SecureShareToken {
  id: string;
  token: string;
  video_id: string;
  created_by: string;
  expires_at?: string;
  is_active: boolean;
  usage_count: number;
  max_usage?: number;
  created_at: string;
}

export interface GrantPermissionInput {
  video_id: string;
  email: string; // Invite by email
  permission_level: PermissionLevel;
}

export interface UpdatePermissionInput {
  permission_id: string;
  permission_level: PermissionLevel;
}

export interface CreateShareTokenInput {
  video_id: string;
  expires_at?: string; // e.g., '7d' for 7 days, or ISO string
  max_usage?: number;
} 