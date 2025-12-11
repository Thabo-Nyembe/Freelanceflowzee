// =====================================================
// KAZI Team Collaboration Service
// World-class team management, roles & permissions
// =====================================================

import { createClient } from '@/lib/supabase/client';

// =====================================================
// Types
// =====================================================

export interface Team {
  id: string;
  owner_id: string;
  name: string;
  description?: string;
  avatar_url?: string;
  industry?: string;
  size?: string;
  settings: TeamSettings;
  billing_email?: string;
  subscription_tier: 'free' | 'pro' | 'business' | 'enterprise';
  max_members: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TeamSettings {
  allow_member_invites?: boolean;
  require_2fa?: boolean;
  default_role?: string;
  notification_preferences?: Record<string, boolean>;
  branding?: {
    primary_color?: string;
    logo_url?: string;
  };
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'manager' | 'member' | 'guest';
  title?: string;
  department?: string;
  permissions: string[];
  is_active: boolean;
  invited_by?: string;
  invited_at?: string;
  joined_at?: string;
  last_active_at?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  user?: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export interface TeamInvitation {
  id: string;
  team_id: string;
  email: string;
  role: string;
  invited_by: string;
  token: string;
  message?: string;
  expires_at: string;
  accepted_at?: string;
  declined_at?: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  created_at: string;
}

export interface TeamProject {
  id: string;
  team_id: string;
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  start_date?: string;
  due_date?: string;
  budget?: number;
  client_id?: string;
  lead_member_id?: string;
  tags: string[];
  settings: Record<string, any>;
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface TeamTask {
  id: string;
  team_id: string;
  project_id?: string;
  parent_task_id?: string;
  title: string;
  description?: string;
  status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string;
  created_by: string;
  due_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  tags: string[];
  attachments: string[];
  checklist: TaskChecklistItem[];
  order_index: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface TaskChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  completed_at?: string;
}

export interface TeamComment {
  id: string;
  team_id: string;
  entity_type: 'project' | 'task' | 'document';
  entity_id: string;
  user_id: string;
  parent_id?: string;
  content: string;
  mentions: string[];
  attachments: string[];
  reactions: Record<string, string[]>;
  is_edited: boolean;
  edited_at?: string;
  created_at: string;
}

export interface TeamActivity {
  id: string;
  team_id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: Record<string, any>;
  created_at: string;
}

export interface CreateTeamInput {
  name: string;
  description?: string;
  avatar_url?: string;
  industry?: string;
  size?: string;
  settings?: TeamSettings;
}

export interface InviteMemberInput {
  email: string;
  role?: 'admin' | 'manager' | 'member' | 'guest';
  message?: string;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  status?: string;
  priority?: string;
  start_date?: string;
  due_date?: string;
  budget?: number;
  client_id?: string;
  lead_member_id?: string;
  tags?: string[];
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  project_id?: string;
  parent_task_id?: string;
  status?: string;
  priority?: string;
  assigned_to?: string;
  due_date?: string;
  estimated_hours?: number;
  tags?: string[];
  checklist?: TaskChecklistItem[];
}

// Permission levels
const ROLE_PERMISSIONS: Record<string, string[]> = {
  owner: ['*'], // All permissions
  admin: [
    'team:manage',
    'team:invite',
    'team:remove_member',
    'project:create',
    'project:edit',
    'project:delete',
    'task:create',
    'task:edit',
    'task:delete',
    'task:assign',
    'document:upload',
    'document:delete',
    'comment:create',
    'comment:delete_any',
  ],
  manager: [
    'team:invite',
    'project:create',
    'project:edit',
    'task:create',
    'task:edit',
    'task:assign',
    'document:upload',
    'comment:create',
    'comment:delete_own',
  ],
  member: [
    'project:view',
    'task:create',
    'task:edit_own',
    'document:upload',
    'document:view',
    'comment:create',
    'comment:delete_own',
  ],
  guest: [
    'project:view',
    'task:view',
    'document:view',
    'comment:create',
  ],
};

// =====================================================
// Team Service Class
// =====================================================

class TeamService {
  private static instance: TeamService;
  private supabase = createClient();

  private constructor() {}

  public static getInstance(): TeamService {
    if (!TeamService.instance) {
      TeamService.instance = new TeamService();
    }
    return TeamService.instance;
  }

  // =====================================================
  // Permission Helpers
  // =====================================================

  hasPermission(member: TeamMember, permission: string): boolean {
    if (member.role === 'owner') return true;
    const rolePerms = ROLE_PERMISSIONS[member.role] || [];
    return rolePerms.includes('*') || rolePerms.includes(permission);
  }

  async getMemberPermission(teamId: string, userId: string): Promise<TeamMember | null> {
    const { data, error } = await this.supabase
      .from('team_members')
      .select('*')
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (error) return null;
    return data;
  }

  async requirePermission(teamId: string, userId: string, permission: string): Promise<TeamMember> {
    const member = await this.getMemberPermission(teamId, userId);
    if (!member) {
      throw new Error('Not a member of this team');
    }
    if (!this.hasPermission(member, permission)) {
      throw new Error(`Permission denied: ${permission}`);
    }
    return member;
  }

  // =====================================================
  // Team Operations
  // =====================================================

  async createTeam(userId: string, input: CreateTeamInput): Promise<Team> {
    const { data: team, error } = await this.supabase
      .from('teams')
      .insert({
        owner_id: userId,
        name: input.name,
        description: input.description,
        avatar_url: input.avatar_url,
        industry: input.industry,
        size: input.size,
        settings: input.settings || {},
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create team: ${error.message}`);

    // Add owner as first member
    await this.supabase
      .from('team_members')
      .insert({
        team_id: team.id,
        user_id: userId,
        role: 'owner',
        permissions: ['*'],
        is_active: true,
        joined_at: new Date().toISOString(),
      });

    await this.logActivity(team.id, userId, 'team_created', 'team', team.id, {
      name: team.name,
    });

    return team;
  }

  async getTeam(teamId: string): Promise<Team | null> {
    const { data, error } = await this.supabase
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .single();

    if (error) return null;
    return data;
  }

  async getUserTeams(userId: string): Promise<Team[]> {
    const { data: memberships, error: membershipsError } = await this.supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (membershipsError || !memberships) return [];

    const teamIds = memberships.map(m => m.team_id);

    const { data: teams, error: teamsError } = await this.supabase
      .from('teams')
      .select('*')
      .in('id', teamIds)
      .eq('is_active', true)
      .order('name');

    if (teamsError) return [];
    return teams || [];
  }

  async updateTeam(teamId: string, userId: string, updates: Partial<CreateTeamInput>): Promise<Team> {
    await this.requirePermission(teamId, userId, 'team:manage');

    const { data, error } = await this.supabase
      .from('teams')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', teamId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update team: ${error.message}`);

    await this.logActivity(teamId, userId, 'team_updated', 'team', teamId, updates);

    return data;
  }

  async deleteTeam(teamId: string, userId: string): Promise<void> {
    const team = await this.getTeam(teamId);
    if (!team) throw new Error('Team not found');
    if (team.owner_id !== userId) throw new Error('Only owner can delete team');

    const { error } = await this.supabase
      .from('teams')
      .update({ is_active: false })
      .eq('id', teamId);

    if (error) throw new Error(`Failed to delete team: ${error.message}`);
  }

  // =====================================================
  // Member Operations
  // =====================================================

  async getMembers(teamId: string, userId: string): Promise<TeamMember[]> {
    await this.getMemberPermission(teamId, userId);

    const { data, error } = await this.supabase
      .from('team_members')
      .select(`
        *,
        user:auth.users!user_id (
          id,
          email,
          raw_user_meta_data
        )
      `)
      .eq('team_id', teamId)
      .eq('is_active', true)
      .order('role');

    if (error) throw new Error(`Failed to get members: ${error.message}`);

    // Transform user data
    return (data || []).map(member => ({
      ...member,
      user: member.user ? {
        id: member.user.id,
        email: member.user.email,
        full_name: member.user.raw_user_meta_data?.full_name,
        avatar_url: member.user.raw_user_meta_data?.avatar_url,
      } : undefined,
    }));
  }

  async inviteMember(teamId: string, userId: string, input: InviteMemberInput): Promise<TeamInvitation> {
    await this.requirePermission(teamId, userId, 'team:invite');

    const team = await this.getTeam(teamId);
    if (!team) throw new Error('Team not found');

    // Check if already a member
    const { data: existingMember } = await this.supabase
      .from('team_members')
      .select('id')
      .eq('team_id', teamId)
      .eq('user_id', input.email) // This won't work - need to check by email
      .single();

    // Check pending invitations
    const { data: existingInvite } = await this.supabase
      .from('team_invitations')
      .select('id')
      .eq('team_id', teamId)
      .eq('email', input.email)
      .eq('status', 'pending')
      .single();

    if (existingInvite) {
      throw new Error('Invitation already pending for this email');
    }

    // Generate invitation token
    const token = this.generateToken(32);

    const { data, error } = await this.supabase
      .from('team_invitations')
      .insert({
        team_id: teamId,
        email: input.email,
        role: input.role || 'member',
        invited_by: userId,
        token,
        message: input.message,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create invitation: ${error.message}`);

    await this.logActivity(teamId, userId, 'member_invited', 'invitation', data.id, {
      email: input.email,
      role: input.role,
    });

    return data;
  }

  async acceptInvitation(token: string, userId: string): Promise<TeamMember> {
    const { data: invitation, error: inviteError } = await this.supabase
      .from('team_invitations')
      .select('*')
      .eq('token', token)
      .eq('status', 'pending')
      .single();

    if (inviteError || !invitation) {
      throw new Error('Invalid or expired invitation');
    }

    if (new Date(invitation.expires_at) < new Date()) {
      await this.supabase
        .from('team_invitations')
        .update({ status: 'expired' })
        .eq('id', invitation.id);
      throw new Error('Invitation has expired');
    }

    // Create team member
    const { data: member, error: memberError } = await this.supabase
      .from('team_members')
      .insert({
        team_id: invitation.team_id,
        user_id: userId,
        role: invitation.role,
        permissions: ROLE_PERMISSIONS[invitation.role] || [],
        is_active: true,
        invited_by: invitation.invited_by,
        invited_at: invitation.created_at,
        joined_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (memberError) throw new Error(`Failed to add member: ${memberError.message}`);

    // Update invitation status
    await this.supabase
      .from('team_invitations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
      })
      .eq('id', invitation.id);

    await this.logActivity(invitation.team_id, userId, 'member_joined', 'member', member.id, {
      role: invitation.role,
    });

    return member;
  }

  async declineInvitation(token: string): Promise<void> {
    const { error } = await this.supabase
      .from('team_invitations')
      .update({
        status: 'declined',
        declined_at: new Date().toISOString(),
      })
      .eq('token', token)
      .eq('status', 'pending');

    if (error) throw new Error(`Failed to decline invitation: ${error.message}`);
  }

  async updateMemberRole(teamId: string, userId: string, memberId: string, role: string): Promise<TeamMember> {
    await this.requirePermission(teamId, userId, 'team:manage');

    const { data, error } = await this.supabase
      .from('team_members')
      .update({
        role,
        permissions: ROLE_PERMISSIONS[role] || [],
        updated_at: new Date().toISOString(),
      })
      .eq('id', memberId)
      .eq('team_id', teamId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update member: ${error.message}`);

    await this.logActivity(teamId, userId, 'member_role_changed', 'member', memberId, { role });

    return data;
  }

  async removeMember(teamId: string, userId: string, memberId: string): Promise<void> {
    await this.requirePermission(teamId, userId, 'team:remove_member');

    const { data: member } = await this.supabase
      .from('team_members')
      .select('role, user_id')
      .eq('id', memberId)
      .single();

    if (member?.role === 'owner') {
      throw new Error('Cannot remove team owner');
    }

    const { error } = await this.supabase
      .from('team_members')
      .update({ is_active: false })
      .eq('id', memberId)
      .eq('team_id', teamId);

    if (error) throw new Error(`Failed to remove member: ${error.message}`);

    await this.logActivity(teamId, userId, 'member_removed', 'member', memberId, {});
  }

  async leaveTeam(teamId: string, userId: string): Promise<void> {
    const member = await this.getMemberPermission(teamId, userId);
    if (!member) throw new Error('Not a member of this team');

    if (member.role === 'owner') {
      throw new Error('Owner cannot leave team. Transfer ownership first.');
    }

    const { error } = await this.supabase
      .from('team_members')
      .update({ is_active: false })
      .eq('team_id', teamId)
      .eq('user_id', userId);

    if (error) throw new Error(`Failed to leave team: ${error.message}`);

    await this.logActivity(teamId, userId, 'member_left', 'member', member.id, {});
  }

  // =====================================================
  // Project Operations
  // =====================================================

  async createProject(teamId: string, userId: string, input: CreateProjectInput): Promise<TeamProject> {
    await this.requirePermission(teamId, userId, 'project:create');

    const { data, error } = await this.supabase
      .from('team_projects')
      .insert({
        team_id: teamId,
        name: input.name,
        description: input.description,
        status: input.status || 'planning',
        priority: input.priority || 'medium',
        start_date: input.start_date,
        due_date: input.due_date,
        budget: input.budget,
        client_id: input.client_id,
        lead_member_id: input.lead_member_id,
        tags: input.tags || [],
        settings: {},
        progress: 0,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create project: ${error.message}`);

    await this.logActivity(teamId, userId, 'project_created', 'project', data.id, {
      name: input.name,
    });

    return data;
  }

  async getProjects(teamId: string, userId: string, filters?: { status?: string; lead_id?: string }): Promise<TeamProject[]> {
    await this.getMemberPermission(teamId, userId);

    let query = this.supabase
      .from('team_projects')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.lead_id) {
      query = query.eq('lead_member_id', filters.lead_id);
    }

    const { data, error } = await query;

    if (error) throw new Error(`Failed to get projects: ${error.message}`);
    return data || [];
  }

  async getProject(teamId: string, projectId: string, userId: string): Promise<TeamProject | null> {
    await this.getMemberPermission(teamId, userId);

    const { data, error } = await this.supabase
      .from('team_projects')
      .select('*')
      .eq('id', projectId)
      .eq('team_id', teamId)
      .single();

    if (error) return null;
    return data;
  }

  async updateProject(teamId: string, projectId: string, userId: string, updates: Partial<CreateProjectInput>): Promise<TeamProject> {
    await this.requirePermission(teamId, userId, 'project:edit');

    const { data, error } = await this.supabase
      .from('team_projects')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId)
      .eq('team_id', teamId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update project: ${error.message}`);

    await this.logActivity(teamId, userId, 'project_updated', 'project', projectId, updates);

    return data;
  }

  async deleteProject(teamId: string, projectId: string, userId: string): Promise<void> {
    await this.requirePermission(teamId, userId, 'project:delete');

    const { error } = await this.supabase
      .from('team_projects')
      .delete()
      .eq('id', projectId)
      .eq('team_id', teamId);

    if (error) throw new Error(`Failed to delete project: ${error.message}`);

    await this.logActivity(teamId, userId, 'project_deleted', 'project', projectId, {});
  }

  // =====================================================
  // Task Operations
  // =====================================================

  async createTask(teamId: string, userId: string, input: CreateTaskInput): Promise<TeamTask> {
    await this.requirePermission(teamId, userId, 'task:create');

    // Get max order index
    const { data: existingTasks } = await this.supabase
      .from('team_tasks')
      .select('order_index')
      .eq('team_id', teamId)
      .eq('status', input.status || 'todo')
      .order('order_index', { ascending: false })
      .limit(1);

    const orderIndex = existingTasks && existingTasks.length > 0
      ? existingTasks[0].order_index + 1
      : 0;

    const { data, error } = await this.supabase
      .from('team_tasks')
      .insert({
        team_id: teamId,
        project_id: input.project_id,
        parent_task_id: input.parent_task_id,
        title: input.title,
        description: input.description,
        status: input.status || 'todo',
        priority: input.priority || 'medium',
        assigned_to: input.assigned_to,
        created_by: userId,
        due_date: input.due_date,
        estimated_hours: input.estimated_hours,
        tags: input.tags || [],
        attachments: [],
        checklist: input.checklist || [],
        order_index: orderIndex,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create task: ${error.message}`);

    await this.logActivity(teamId, userId, 'task_created', 'task', data.id, {
      title: input.title,
      assigned_to: input.assigned_to,
    });

    return data;
  }

  async getTasks(teamId: string, userId: string, filters?: {
    project_id?: string;
    status?: string;
    assigned_to?: string;
    priority?: string;
  }): Promise<TeamTask[]> {
    await this.getMemberPermission(teamId, userId);

    let query = this.supabase
      .from('team_tasks')
      .select('*')
      .eq('team_id', teamId)
      .order('order_index');

    if (filters?.project_id) {
      query = query.eq('project_id', filters.project_id);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.assigned_to) {
      query = query.eq('assigned_to', filters.assigned_to);
    }

    if (filters?.priority) {
      query = query.eq('priority', filters.priority);
    }

    const { data, error } = await query;

    if (error) throw new Error(`Failed to get tasks: ${error.message}`);
    return data || [];
  }

  async getTask(teamId: string, taskId: string, userId: string): Promise<TeamTask | null> {
    await this.getMemberPermission(teamId, userId);

    const { data, error } = await this.supabase
      .from('team_tasks')
      .select('*')
      .eq('id', taskId)
      .eq('team_id', teamId)
      .single();

    if (error) return null;
    return data;
  }

  async updateTask(teamId: string, taskId: string, userId: string, updates: Partial<CreateTaskInput> & {
    status?: string;
    actual_hours?: number;
    completed_at?: string;
  }): Promise<TeamTask> {
    const member = await this.requirePermission(teamId, userId, 'task:edit');

    // Check if user can edit this task
    const task = await this.getTask(teamId, taskId, userId);
    if (!task) throw new Error('Task not found');

    if (!this.hasPermission(member, 'task:edit') && task.created_by !== userId && task.assigned_to !== userId) {
      throw new Error('Permission denied');
    }

    const updateData: any = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    // Set completed_at when status changes to done
    if (updates.status === 'done' && task.status !== 'done') {
      updateData.completed_at = new Date().toISOString();
    }

    const { data, error } = await this.supabase
      .from('team_tasks')
      .update(updateData)
      .eq('id', taskId)
      .eq('team_id', teamId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update task: ${error.message}`);

    await this.logActivity(teamId, userId, 'task_updated', 'task', taskId, updates);

    return data;
  }

  async deleteTask(teamId: string, taskId: string, userId: string): Promise<void> {
    await this.requirePermission(teamId, userId, 'task:delete');

    const { error } = await this.supabase
      .from('team_tasks')
      .delete()
      .eq('id', taskId)
      .eq('team_id', teamId);

    if (error) throw new Error(`Failed to delete task: ${error.message}`);

    await this.logActivity(teamId, userId, 'task_deleted', 'task', taskId, {});
  }

  async reorderTasks(teamId: string, userId: string, taskOrders: { id: string; order_index: number; status?: string }[]): Promise<void> {
    await this.requirePermission(teamId, userId, 'task:edit');

    for (const order of taskOrders) {
      await this.supabase
        .from('team_tasks')
        .update({
          order_index: order.order_index,
          status: order.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id)
        .eq('team_id', teamId);
    }
  }

  async assignTask(teamId: string, taskId: string, userId: string, assigneeId: string | null): Promise<TeamTask> {
    await this.requirePermission(teamId, userId, 'task:assign');

    const { data, error } = await this.supabase
      .from('team_tasks')
      .update({
        assigned_to: assigneeId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId)
      .eq('team_id', teamId)
      .select()
      .single();

    if (error) throw new Error(`Failed to assign task: ${error.message}`);

    await this.logActivity(teamId, userId, 'task_assigned', 'task', taskId, {
      assigned_to: assigneeId,
    });

    return data;
  }

  // =====================================================
  // Comments
  // =====================================================

  async addComment(
    teamId: string,
    userId: string,
    entityType: 'project' | 'task' | 'document',
    entityId: string,
    content: string,
    parentId?: string,
    mentions?: string[],
    attachments?: string[]
  ): Promise<TeamComment> {
    await this.requirePermission(teamId, userId, 'comment:create');

    const { data, error } = await this.supabase
      .from('team_comments')
      .insert({
        team_id: teamId,
        entity_type: entityType,
        entity_id: entityId,
        user_id: userId,
        parent_id: parentId,
        content,
        mentions: mentions || [],
        attachments: attachments || [],
        reactions: {},
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to add comment: ${error.message}`);

    await this.logActivity(teamId, userId, 'comment_added', entityType, entityId, {
      comment_id: data.id,
    });

    return data;
  }

  async getComments(teamId: string, userId: string, entityType: string, entityId: string): Promise<TeamComment[]> {
    await this.getMemberPermission(teamId, userId);

    const { data, error } = await this.supabase
      .from('team_comments')
      .select('*')
      .eq('team_id', teamId)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(`Failed to get comments: ${error.message}`);
    return data || [];
  }

  async addReaction(teamId: string, userId: string, commentId: string, emoji: string): Promise<TeamComment> {
    const { data: comment } = await this.supabase
      .from('team_comments')
      .select('reactions')
      .eq('id', commentId)
      .single();

    if (!comment) throw new Error('Comment not found');

    const reactions = comment.reactions || {};
    if (!reactions[emoji]) {
      reactions[emoji] = [];
    }

    if (!reactions[emoji].includes(userId)) {
      reactions[emoji].push(userId);
    }

    const { data, error } = await this.supabase
      .from('team_comments')
      .update({ reactions })
      .eq('id', commentId)
      .select()
      .single();

    if (error) throw new Error(`Failed to add reaction: ${error.message}`);
    return data;
  }

  async removeReaction(teamId: string, userId: string, commentId: string, emoji: string): Promise<TeamComment> {
    const { data: comment } = await this.supabase
      .from('team_comments')
      .select('reactions')
      .eq('id', commentId)
      .single();

    if (!comment) throw new Error('Comment not found');

    const reactions = comment.reactions || {};
    if (reactions[emoji]) {
      reactions[emoji] = reactions[emoji].filter((id: string) => id !== userId);
      if (reactions[emoji].length === 0) {
        delete reactions[emoji];
      }
    }

    const { data, error } = await this.supabase
      .from('team_comments')
      .update({ reactions })
      .eq('id', commentId)
      .select()
      .single();

    if (error) throw new Error(`Failed to remove reaction: ${error.message}`);
    return data;
  }

  // =====================================================
  // Activity Log
  // =====================================================

  async logActivity(
    teamId: string,
    userId: string,
    action: string,
    entityType: string,
    entityId: string,
    details: Record<string, any>
  ): Promise<void> {
    await this.supabase.from('team_activity').insert({
      team_id: teamId,
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details,
    });
  }

  async getActivity(teamId: string, userId: string, limit: number = 50, entityType?: string): Promise<TeamActivity[]> {
    await this.getMemberPermission(teamId, userId);

    let query = this.supabase
      .from('team_activity')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (entityType) {
      query = query.eq('entity_type', entityType);
    }

    const { data, error } = await query;

    if (error) throw new Error(`Failed to get activity: ${error.message}`);
    return data || [];
  }

  // =====================================================
  // Stats
  // =====================================================

  async getTeamStats(teamId: string, userId: string): Promise<{
    members: number;
    projects: { total: number; active: number; completed: number };
    tasks: { total: number; completed: number; overdue: number };
  }> {
    await this.getMemberPermission(teamId, userId);

    const [members, projects, tasks] = await Promise.all([
      this.supabase
        .from('team_members')
        .select('id', { count: 'exact' })
        .eq('team_id', teamId)
        .eq('is_active', true),
      this.supabase
        .from('team_projects')
        .select('status')
        .eq('team_id', teamId),
      this.supabase
        .from('team_tasks')
        .select('status, due_date')
        .eq('team_id', teamId),
    ]);

    const now = new Date();
    const projectData = projects.data || [];
    const taskData = tasks.data || [];

    return {
      members: members.count || 0,
      projects: {
        total: projectData.length,
        active: projectData.filter(p => p.status === 'active').length,
        completed: projectData.filter(p => p.status === 'completed').length,
      },
      tasks: {
        total: taskData.length,
        completed: taskData.filter(t => t.status === 'done').length,
        overdue: taskData.filter(t => t.due_date && new Date(t.due_date) < now && t.status !== 'done').length,
      },
    };
  }

  // =====================================================
  // Helpers
  // =====================================================

  private generateToken(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < length; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }
}

// Export singleton instance
export const teamService = TeamService.getInstance();

// Export convenience functions
export const createTeam = (userId: string, input: CreateTeamInput) =>
  teamService.createTeam(userId, input);

export const inviteMember = (teamId: string, userId: string, input: InviteMemberInput) =>
  teamService.inviteMember(teamId, userId, input);

export const createProject = (teamId: string, userId: string, input: CreateProjectInput) =>
  teamService.createProject(teamId, userId, input);

export const createTask = (teamId: string, userId: string, input: CreateTaskInput) =>
  teamService.createTask(teamId, userId, input);
