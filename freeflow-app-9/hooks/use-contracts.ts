'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type ContractStatus = 'draft' | 'pending_signature' | 'active' | 'completed' | 'expired' | 'cancelled'
export type ContractType = 'service' | 'nda' | 'employment' | 'freelance' | 'partnership' | 'license'

export interface Contract {
  id: string
  title: string
  type: ContractType
  clientId: string
  clientName: string
  status: ContractStatus
  startDate: string
  endDate: string
  value: number
  currency: string
  content: string
  terms: string[]
  signatories: ContractSignatory[]
  attachments: ContractAttachment[]
  renewalDate?: string
  autoRenew: boolean
  version: number
  parentContractId?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface ContractSignatory {
  id: string
  name: string
  email: string
  role: string
  signedAt?: string
  signature?: string
}

export interface ContractAttachment {
  id: string
  name: string
  url: string
  size: number
  type: string
}

export interface ContractTemplate {
  id: string
  name: string
  type: ContractType
  content: string
  variables: string[]
}

export interface ContractStats {
  totalContracts: number
  activeContracts: number
  pendingSignatures: number
  totalValue: number
  expiringThisMonth: number
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockContracts: Contract[] = [
  { id: 'contract-1', title: 'Website Development Agreement', type: 'service', clientId: 'client-1', clientName: 'Acme Corp', status: 'active', startDate: '2024-01-01', endDate: '2024-12-31', value: 50000, currency: 'USD', content: 'Full website development services...', terms: ['Payment terms: Net 30', 'Scope changes require written approval'], signatories: [{ id: 's1', name: 'John Doe', email: 'john@acme.com', role: 'Client', signedAt: '2024-01-01' }, { id: 's2', name: 'Jane Smith', email: 'jane@company.com', role: 'Provider', signedAt: '2024-01-01' }], attachments: [], autoRenew: true, version: 1, createdAt: '2023-12-15', updatedAt: '2024-01-01' },
  { id: 'contract-2', title: 'Non-Disclosure Agreement', type: 'nda', clientId: 'client-2', clientName: 'Tech Solutions', status: 'active', startDate: '2024-02-01', endDate: '2025-02-01', value: 0, currency: 'USD', content: 'Confidentiality agreement...', terms: ['3-year confidentiality period'], signatories: [{ id: 's3', name: 'Mike Johnson', email: 'mike@techsol.com', role: 'Client', signedAt: '2024-02-01' }], attachments: [], autoRenew: false, version: 1, createdAt: '2024-01-25', updatedAt: '2024-02-01' },
  { id: 'contract-3', title: 'Freelance Design Contract', type: 'freelance', clientId: 'client-3', clientName: 'StartUp Inc', status: 'pending_signature', startDate: '2024-04-01', endDate: '2024-06-30', value: 15000, currency: 'USD', content: 'Design services agreement...', terms: ['Deliverables due bi-weekly'], signatories: [{ id: 's4', name: 'Sarah Lee', email: 'sarah@startup.io', role: 'Client' }], attachments: [], autoRenew: false, version: 1, createdAt: '2024-03-15', updatedAt: '2024-03-15' },
  { id: 'contract-4', title: 'Annual Retainer Agreement', type: 'service', clientId: 'client-1', clientName: 'Acme Corp', status: 'draft', startDate: '2024-05-01', endDate: '2025-04-30', value: 120000, currency: 'USD', content: 'Annual retainer for ongoing services...', terms: ['Monthly fee: $10,000', '40 hours/month included'], signatories: [], attachments: [], autoRenew: true, version: 1, createdAt: '2024-03-20', updatedAt: '2024-03-20' }
]

const mockStats: ContractStats = {
  totalContracts: 4,
  activeContracts: 2,
  pendingSignatures: 1,
  totalValue: 185000,
  expiringThisMonth: 0
}

const mockTemplates: ContractTemplate[] = [
  { id: 'tpl-1', name: 'Standard Service Agreement', type: 'service', content: 'Service agreement template...', variables: ['clientName', 'projectScope', 'startDate', 'endDate', 'value'] },
  { id: 'tpl-2', name: 'Basic NDA', type: 'nda', content: 'NDA template...', variables: ['partyA', 'partyB', 'duration'] },
  { id: 'tpl-3', name: 'Freelance Contract', type: 'freelance', content: 'Freelance contract template...', variables: ['clientName', 'scope', 'rate', 'duration'] }
]

// ============================================================================
// HOOK
// ============================================================================

interface UseContractsOptions {
  
  clientId?: string
  status?: ContractStatus
}

export function useContracts(options: UseContractsOptions = {}) {
  const {  clientId, status } = options

  const [contracts, setContracts] = useState<Contract[]>([])
  const [currentContract, setCurrentContract] = useState<Contract | null>(null)
  const [templates, setTemplates] = useState<ContractTemplate[]>([])
  const [stats, setStats] = useState<ContractStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchContracts = useCallback(async (filters?: { status?: string; type?: string; clientId?: string; search?: string }) => {
    try {
      const params = new URLSearchParams()
      if (filters?.status || status) params.set('status', filters?.status || status || '')
      if (filters?.type) params.set('type', filters.type)
      if (filters?.clientId || clientId) params.set('clientId', filters?.clientId || clientId || '')
      if (filters?.search) params.set('search', filters.search)

      const response = await fetch(`/api/contracts?${params}`)
      const result = await response.json()
      if (result.success) {
        setContracts(Array.isArray(result.contracts) ? result.contracts : [])
        setTemplates(Array.isArray(result.templates) ? result.templates : [])
        setStats(Array.isArray(result.stats) ? result.stats : [])
        return result.contracts
      }
      setContracts([])
      setStats(null)
      return []
    } catch (err) {
      setContracts([])
      setTemplates([])
      setStats(null)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [ clientId, status])

  const createContract = useCallback(async (data: Omit<Contract, 'id' | 'signatories' | 'attachments' | 'version' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await response.json()
      if (result.success) {
        await fetchContracts()
        return { success: true, contract: result.contract }
      }
      return { success: false, error: result.error }
    } catch (err) {
      const newContract: Contract = { ...data, id: `contract-${Date.now()}`, signatories: [], attachments: [], version: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      setContracts(prev => [newContract, ...prev])
      return { success: true, contract: newContract }
    }
  }, [fetchContracts])

  const updateContract = useCallback(async (contractId: string, updates: Partial<Contract>) => {
    try {
      const response = await fetch(`/api/contracts/${contractId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      const result = await response.json()
      if (result.success) {
        setContracts(prev => prev.map(c => c.id === contractId ? { ...c, ...updates, updatedAt: new Date().toISOString(), version: c.version + 1 } : c))
      }
      return result
    } catch (err) {
      setContracts(prev => prev.map(c => c.id === contractId ? { ...c, ...updates } : c))
      return { success: true }
    }
  }, [])

  const deleteContract = useCallback(async (contractId: string) => {
    try {
      await fetch(`/api/contracts/${contractId}`, { method: 'DELETE' })
      setContracts(prev => prev.filter(c => c.id !== contractId))
      return { success: true }
    } catch (err) {
      setContracts(prev => prev.filter(c => c.id !== contractId))
      return { success: true }
    }
  }, [])

  const sendForSignature = useCallback(async (contractId: string, signatories: Omit<ContractSignatory, 'id' | 'signedAt' | 'signature'>[]) => {
    try {
      const response = await fetch(`/api/contracts/${contractId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signatories })
      })
      const result = await response.json()
      if (result.success) {
        const newSignatories: ContractSignatory[] = signatories.map((s, i) => ({ ...s, id: `sig-${Date.now()}-${i}` }))
        setContracts(prev => prev.map(c => c.id === contractId ? { ...c, status: 'pending_signature' as const, signatories: newSignatories } : c))
      }
      return result
    } catch (err) {
      setContracts(prev => prev.map(c => c.id === contractId ? { ...c, status: 'pending_signature' as const } : c))
      return { success: true }
    }
  }, [])

  const signContract = useCallback(async (contractId: string, signatoryId: string, signature: string) => {
    try {
      const response = await fetch(`/api/contracts/${contractId}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signatoryId, signature })
      })
      const result = await response.json()
      if (result.success) {
        setContracts(prev => prev.map(c => {
          if (c.id !== contractId) return c
          const updatedSignatories = c.signatories.map(s => s.id === signatoryId ? { ...s, signedAt: new Date().toISOString(), signature } : s)
          const allSigned = updatedSignatories.every(s => s.signedAt)
          return { ...c, signatories: updatedSignatories, status: allSigned ? 'active' as const : c.status }
        }))
      }
      return result
    } catch (err) {
      setContracts(prev => prev.map(c => {
        if (c.id !== contractId) return c
        const updatedSignatories = c.signatories.map(s => s.id === signatoryId ? { ...s, signedAt: new Date().toISOString(), signature } : s)
        return { ...c, signatories: updatedSignatories }
      }))
      return { success: true }
    }
  }, [])

  const duplicateContract = useCallback(async (contractId: string) => {
    const contract = contracts.find(c => c.id === contractId)
    if (contract) {
      const newContract: Contract = { ...contract, id: `contract-${Date.now()}`, title: `${contract.title} (Copy)`, status: 'draft', signatories: [], version: 1, parentContractId: contract.id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      setContracts(prev => [newContract, ...prev])
      return { success: true, contract: newContract }
    }
    return { success: false, error: 'Contract not found' }
  }, [contracts])

  const renewContract = useCallback(async (contractId: string, newEndDate: string) => {
    const contract = contracts.find(c => c.id === contractId)
    if (contract) {
      const renewedContract: Contract = { ...contract, id: `contract-${Date.now()}`, status: 'draft', startDate: contract.endDate, endDate: newEndDate, signatories: [], version: 1, parentContractId: contract.id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      setContracts(prev => [renewedContract, ...prev])
      return { success: true, contract: renewedContract }
    }
    return { success: false, error: 'Contract not found' }
  }, [contracts])

  const downloadPdf = useCallback(async (contractId: string) => {
    try {
      const response = await fetch(`/api/contracts/${contractId}/pdf`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `contract-${contractId}.pdf`
      a.click()
      return { success: true }
    } catch (err) {
      return { success: false, error: 'Failed to download PDF' }
    }
  }, [])

  const search = useCallback((query: string) => {
    setSearchQuery(query)
    fetchContracts({ search: query })
  }, [fetchContracts])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchContracts()
  }, [fetchContracts])

  useEffect(() => { refresh() }, [refresh])

  const activeContracts = useMemo(() => contracts.filter(c => c.status === 'active'), [contracts])
  const pendingContracts = useMemo(() => contracts.filter(c => c.status === 'pending_signature'), [contracts])
  const draftContracts = useMemo(() => contracts.filter(c => c.status === 'draft'), [contracts])
  const expiringContracts = useMemo(() => {
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    return activeContracts.filter(c => new Date(c.endDate) <= thirtyDaysFromNow)
  }, [activeContracts])
  const totalValue = useMemo(() => contracts.filter(c => c.status === 'active').reduce((sum, c) => sum + c.value, 0), [contracts])
  const contractsByType = useMemo(() => {
    const grouped: Record<string, Contract[]> = {}
    contracts.forEach(c => {
      if (!grouped[c.type]) grouped[c.type] = []
      grouped[c.type].push(c)
    })
    return grouped
  }, [contracts])

  return {
    contracts, currentContract, templates, stats, activeContracts, pendingContracts, draftContracts, expiringContracts, totalValue, contractsByType,
    isLoading, error, searchQuery,
    refresh, fetchContracts, createContract, updateContract, deleteContract, sendForSignature, signContract, duplicateContract, renewContract, downloadPdf, search,
    setCurrentContract
  }
}

export default useContracts
