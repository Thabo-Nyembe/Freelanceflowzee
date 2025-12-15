'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState, useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'

// Types
export interface UserRole {
  id: string
  user_id: string
  role_code: string
  name: string
  description: string | null
  type: 'admin' | 'manager' | 'user' | 'viewer' | 'custom'
  status: 'active' | 'inactive' | 'deprecated'
  access_level: 'full' | 'write' | 'read' | 'restricted'
  permissions: string[]
  can_delegate: boolean
  is_default: boolean
  is_system: boolean
  total_users: number
  active_users: number
  created_by: string | null
  last_modified_by: string | null
  tags: string[]
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface RoleAssignment {
  id: string
  role_id: string
  assigned_user_id: string
  assigned_by: string | null
  assigned_at: string
  expires_at: string | null
  is_active: boolean
  deactivated_at: string | null
  deactivated_by: string | null
  notes: string | null
  created_at: string
}

export interface RolePermission {
  id: string
  user_id: string
  permission_key: string
  display_name: string
  description: string | null
  category: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface RoleStats {
  totalRoles: number
  activeRoles: number
  inactiveRoles: number
  customRoles: number
  systemRoles: number
  totalAssignments: number
  activeAssignments: number
  totalPermissions: number
}

export function useRoles() {
  const supabase = createClientComponentClient()
  const { toast } = useToast()
  const [roles, setRoles] = useState<UserRole[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch roles
  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      setRoles(data || [])
    } catch (err: any) {
      setError(err.message)
      toast({ title: 'Error', description: 'Failed to fetch roles', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [supabase, toast])

  // Create role
  const createRole = async (role: Partial<UserRole>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('user_roles')
        .insert([{ ...role, user_id: user.id, created_by: user.id }])
        .select()
        .single()

      if (error) throw error
      setRoles(prev => [data, ...prev])
      toast({ title: 'Success', description: 'Role created successfully' })
      return data
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  // Update role
  const updateRole = async (id: string, updates: Partial<UserRole>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('user_roles')
        .update({ ...updates, last_modified_by: user?.id })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setRoles(prev => prev.map(r => r.id === id ? data : r))
      toast({ title: 'Success', description: 'Role updated successfully' })
      return data
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  // Delete role (soft delete)
  const deleteRole = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      setRoles(prev => prev.filter(r => r.id !== id))
      toast({ title: 'Success', description: 'Role deleted successfully' })
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  // Activate role
  const activateRole = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .update({ status: 'active' })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setRoles(prev => prev.map(r => r.id === id ? data : r))
      toast({ title: 'Success', description: 'Role activated' })
      return data
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  // Deactivate role
  const deactivateRole = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .update({ status: 'inactive' })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setRoles(prev => prev.map(r => r.id === id ? data : r))
      toast({ title: 'Success', description: 'Role deactivated' })
      return data
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  // Set as default
  const setAsDefault = async (id: string) => {
    try {
      // First, unset all defaults
      await supabase
        .from('user_roles')
        .update({ is_default: false })
        .eq('is_default', true)

      // Then set the new default
      const { data, error } = await supabase
        .from('user_roles')
        .update({ is_default: true })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setRoles(prev => prev.map(r => ({
        ...r,
        is_default: r.id === id
      })))
      toast({ title: 'Success', description: 'Default role updated' })
      return data
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  // Clone role
  const cloneRole = async (id: string, newName: string) => {
    try {
      const roleToClone = roles.find(r => r.id === id)
      if (!roleToClone) throw new Error('Role not found')

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('user_roles')
        .insert([{
          user_id: user.id,
          name: newName,
          description: `Clone of ${roleToClone.name}`,
          type: 'custom',
          status: 'active',
          access_level: roleToClone.access_level,
          permissions: roleToClone.permissions,
          can_delegate: roleToClone.can_delegate,
          is_default: false,
          is_system: false,
          created_by: user.id
        }])
        .select()
        .single()

      if (error) throw error
      setRoles(prev => [data, ...prev])
      toast({ title: 'Success', description: 'Role cloned successfully' })
      return data
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  // Update permissions
  const updatePermissions = async (id: string, permissions: string[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('user_roles')
        .update({ permissions, last_modified_by: user?.id })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setRoles(prev => prev.map(r => r.id === id ? data : r))
      toast({ title: 'Success', description: 'Permissions updated' })
      return data
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  // Calculate stats
  const getStats = useCallback((): RoleStats => {
    return {
      totalRoles: roles.length,
      activeRoles: roles.filter(r => r.status === 'active').length,
      inactiveRoles: roles.filter(r => r.status === 'inactive').length,
      customRoles: roles.filter(r => r.type === 'custom').length,
      systemRoles: roles.filter(r => r.is_system).length,
      totalAssignments: roles.reduce((sum, r) => sum + r.total_users, 0),
      activeAssignments: roles.reduce((sum, r) => sum + r.active_users, 0),
      totalPermissions: roles.reduce((sum, r) => sum + r.permissions.length, 0)
    }
  }, [roles])

  // Real-time subscription
  useEffect(() => {
    fetchRoles()

    const channel = supabase
      .channel('roles-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_roles' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setRoles(prev => [payload.new as UserRole, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          setRoles(prev => prev.map(r => r.id === payload.new.id ? payload.new as UserRole : r))
        } else if (payload.eventType === 'DELETE') {
          setRoles(prev => prev.filter(r => r.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchRoles, supabase])

  return {
    roles,
    loading,
    error,
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
    activateRole,
    deactivateRole,
    setAsDefault,
    cloneRole,
    updatePermissions,
    getStats
  }
}

// Hook for role assignments
export function useRoleAssignments(roleId: string) {
  const supabase = createClientComponentClient()
  const { toast } = useToast()
  const [assignments, setAssignments] = useState<RoleAssignment[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch assignments
  const fetchAssignments = useCallback(async () => {
    if (!roleId) return
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('role_assignments')
        .select('*')
        .eq('role_id', roleId)
        .order('assigned_at', { ascending: false })

      if (error) throw error
      setAssignments(data || [])
    } catch (err) {
      console.error('Failed to fetch role assignments:', err)
    } finally {
      setLoading(false)
    }
  }, [roleId, supabase])

  // Assign role to user
  const assignRole = async (userId: string, notes?: string, expiresAt?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('role_assignments')
        .insert([{
          role_id: roleId,
          assigned_user_id: userId,
          assigned_by: user?.id,
          notes,
          expires_at: expiresAt
        }])
        .select()
        .single()

      if (error) throw error
      setAssignments(prev => [data, ...prev])
      toast({ title: 'Success', description: 'Role assigned successfully' })
      return data
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  // Revoke assignment
  const revokeAssignment = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('role_assignments')
        .update({
          is_active: false,
          deactivated_at: new Date().toISOString(),
          deactivated_by: user?.id
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setAssignments(prev => prev.map(a => a.id === id ? data : a))
      toast({ title: 'Success', description: 'Role revoked' })
      return data
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  // Reactivate assignment
  const reactivateAssignment = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('role_assignments')
        .update({
          is_active: true,
          deactivated_at: null,
          deactivated_by: null
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setAssignments(prev => prev.map(a => a.id === id ? data : a))
      toast({ title: 'Success', description: 'Assignment reactivated' })
      return data
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  // Delete assignment
  const deleteAssignment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('role_assignments')
        .delete()
        .eq('id', id)

      if (error) throw error
      setAssignments(prev => prev.filter(a => a.id !== id))
      toast({ title: 'Success', description: 'Assignment deleted' })
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  useEffect(() => {
    fetchAssignments()

    if (roleId) {
      const channel = supabase
        .channel(`role-assignments-${roleId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'role_assignments',
          filter: `role_id=eq.${roleId}`
        }, (payload) => {
          if (payload.eventType === 'INSERT') {
            setAssignments(prev => [payload.new as RoleAssignment, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setAssignments(prev => prev.map(a => a.id === payload.new.id ? payload.new as RoleAssignment : a))
          } else if (payload.eventType === 'DELETE') {
            setAssignments(prev => prev.filter(a => a.id !== payload.old.id))
          }
        })
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [fetchAssignments, roleId, supabase])

  return {
    assignments,
    loading,
    fetchAssignments,
    assignRole,
    revokeAssignment,
    reactivateAssignment,
    deleteAssignment
  }
}

// Hook for role permissions
export function useRolePermissions() {
  const supabase = createClientComponentClient()
  const { toast } = useToast()
  const [permissions, setPermissions] = useState<RolePermission[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch permissions
  const fetchPermissions = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('role_permissions')
        .select('*')
        .eq('user_id', user.id)
        .order('category', { ascending: true })

      if (error) throw error
      setPermissions(data || [])
    } catch (err) {
      console.error('Failed to fetch permissions:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Create permission
  const createPermission = async (permission: Partial<RolePermission>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('role_permissions')
        .insert([{ ...permission, user_id: user.id }])
        .select()
        .single()

      if (error) throw error
      setPermissions(prev => [...prev, data])
      toast({ title: 'Success', description: 'Permission created' })
      return data
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  // Update permission
  const updatePermission = async (id: string, updates: Partial<RolePermission>) => {
    try {
      const { data, error } = await supabase
        .from('role_permissions')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setPermissions(prev => prev.map(p => p.id === id ? data : p))
      return data
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  // Delete permission
  const deletePermission = async (id: string) => {
    try {
      const { error } = await supabase
        .from('role_permissions')
        .delete()
        .eq('id', id)

      if (error) throw error
      setPermissions(prev => prev.filter(p => p.id !== id))
      toast({ title: 'Success', description: 'Permission deleted' })
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
      throw err
    }
  }

  useEffect(() => {
    fetchPermissions()
  }, [fetchPermissions])

  return {
    permissions,
    loading,
    fetchPermissions,
    createPermission,
    updatePermission,
    deletePermission
  }
}
