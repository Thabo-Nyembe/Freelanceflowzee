/**
 * React hooks for Clients API
 *
 * Uses TanStack Query for caching, loading states, and error handling
 * Replaces useEffect + setTimeout patterns
 *
 * Caching Strategy:
 * - Clients list: 5 min staleTime (user data)
 * - Single client: 5 min staleTime (user data)
 * - Client stats: 2 min staleTime (analytics)
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'
import { clientsClient, type Client, type CreateClientData, type UpdateClientData, type ClientFilters } from './clients-client'
import { toast } from 'sonner'
import { STALE_TIMES, userDataQueryOptions, analyticsQueryOptions, invalidationPatterns } from '@/lib/query-client'

/**
 * Get all clients with pagination and filters
 */
export function useClients(
  page: number = 1,
  pageSize: number = 10,
  filters?: ClientFilters,
  options?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['clients', page, pageSize, filters],
    queryFn: async () => {
      const response = await clientsClient.getClients(page, pageSize, filters)

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch clients')
      }

      return response.data
    },
    staleTime: STALE_TIMES.USER_DATA,
    ...userDataQueryOptions,
    ...options
  })
}

/**
 * Get single client by ID
 */
export function useClient(id: string) {
  return useQuery({
    queryKey: ['client', id],
    queryFn: async () => {
      const response = await clientsClient.getClient(id)

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch client')
      }

      return response.data
    },
    enabled: !!id,
    staleTime: STALE_TIMES.USER_DATA,
    ...userDataQueryOptions
  })
}

/**
 * Create new client
 */
export function useCreateClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateClientData) => {
      const response = await clientsClient.createClient(data)

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create client')
      }

      return response.data
    },
    onSuccess: (client) => {
      // Use centralized invalidation pattern
      invalidationPatterns.clients(queryClient)

      // Optimistically update cache
      queryClient.setQueryData(['client', client.id], client)

      toast.success('Client created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

/**
 * Update existing client
 */
export function useUpdateClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: UpdateClientData }) => {
      const response = await clientsClient.updateClient(id, updates)

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update client')
      }

      return response.data
    },
    onSuccess: (client) => {
      // Use centralized invalidation pattern
      invalidationPatterns.clients(queryClient)
      queryClient.setQueryData(['client', client.id], client)

      toast.success('Client updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

/**
 * Delete client
 */
export function useDeleteClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await clientsClient.deleteClient(id)

      if (!response.success) {
        throw new Error(response.error || 'Failed to delete client')
      }

      return id
    },
    onSuccess: (deletedId) => {
      // Use centralized invalidation pattern
      invalidationPatterns.clients(queryClient)
      // Remove the specific client from cache
      queryClient.removeQueries({ queryKey: ['client', deletedId] })
      toast.success('Client deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

/**
 * Get client statistics
 */
export function useClientStats() {
  return useQuery({
    queryKey: ['client-stats'],
    queryFn: async () => {
      const response = await clientsClient.getClientStats()

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch client stats')
      }

      return response.data
    },
    staleTime: STALE_TIMES.ANALYTICS,
    ...analyticsQueryOptions,
    refetchInterval: 60000 // Refetch every minute
  })
}

/**
 * Record client contact
 */
export function useRecordContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (clientId: string) => {
      const response = await clientsClient.recordContact(clientId)

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to record contact')
      }

      return response.data
    },
    onSuccess: (client) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      queryClient.setQueryData(['client', client.id], client)
      toast.success('Contact recorded')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

/**
 * Update client financial metrics
 */
export function useUpdateClientFinancials() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      clientId,
      metrics
    }: {
      clientId: string
      metrics: {
        lifetime_value?: number
        total_projects?: number
        total_invoices?: number
        outstanding_balance?: number
      }
    }) => {
      const response = await clientsClient.updateFinancials(clientId, metrics)

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update financials')
      }

      return response.data
    },
    onSuccess: (client) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      queryClient.invalidateQueries({ queryKey: ['client-stats'] })
      queryClient.setQueryData(['client', client.id], client)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

/**
 * Example component showing how to use these hooks:
 *
 * ```tsx
 * function ClientsList() {
 *   const { data, isLoading, error } = useClients(1, 10, { status: ['active'] })
 *   const createClient = useCreateClient()
 *   const updateClient = useUpdateClient()
 *   const deleteClient = useDeleteClient()
 *   const recordContact = useRecordContact()
 *
 *   if (isLoading) return <Skeleton />
 *   if (error) return <ErrorMessage error={error} />
 *
 *   return (
 *     <div>
 *       {data.data.map(client => (
 *         <ClientCard
 *           key={client.id}
 *           client={client}
 *           onUpdate={(updates) => updateClient.mutate({ id: client.id, updates })}
 *           onDelete={() => deleteClient.mutate(client.id)}
 *           onContact={() => recordContact.mutate(client.id)}
 *         />
 *       ))}
 *
 *       <Button onClick={() => createClient.mutate({ name: 'New Client', email: 'client@example.com' })}>
 *         Add Client
 *       </Button>
 *     </div>
 *   )
 * }
 * ```
 */
