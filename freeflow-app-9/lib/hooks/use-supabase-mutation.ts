// Base hook for Supabase mutations (Create, Update, Delete)
// Created: December 14, 2024

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'sonner'

interface UseSupabaseMutationOptions {
  table: string
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export function useSupabaseMutation({
  table,
  onSuccess,
  onError
}: UseSupabaseMutationOptions) {
  const [loading, setLoading] = useState(false)
  const supabase = createClientComponentClient()

  const create = async <T extends Record<string, any>>(data: T) => {
    try {
      setLoading(true)
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single()

      if (error) throw error

      toast.success('Created successfully')
      onSuccess?.()
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create')
      toast.error(error.message)
      onError?.(error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const update = async <T extends Record<string, any>>(id: string, data: T) => {
    try {
      setLoading(true)
      const { data: result, error } = await supabase
        .from(table)
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      toast.success('Updated successfully')
      onSuccess?.()
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update')
      toast.error(error.message)
      onError?.(error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const remove = async (id: string, hardDelete = false) => {
    try {
      setLoading(true)

      if (hardDelete) {
        // Permanent deletion
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('id', id)

        if (error) throw error
      } else {
        // Soft delete
        const { error } = await supabase
          .from(table)
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', id)

        if (error) throw error
      }

      toast.success('Deleted successfully')
      onSuccess?.()
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete')
      toast.error(error.message)
      onError?.(error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return { create, update, remove, loading }
}
