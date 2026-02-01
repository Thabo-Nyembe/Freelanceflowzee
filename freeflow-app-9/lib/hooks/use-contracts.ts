// Hook for Contracts management
// Created: December 14, 2024
// Enhanced: Real database operations for signatures, versions, and sharing

import { useSupabaseQuery } from './use-supabase-query'
import { useSupabaseMutation } from './use-supabase-mutation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

// Demo mode detection
function isDemoModeEnabled(): boolean {
  if (typeof window === 'undefined') return false
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('demo') === 'true') return true
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'demo_mode' && value === 'true') return true
  }
  return false
}

export type ContractType = 'service' | 'product' | 'employment' | 'nda' | 'partnership' | 'license' | 'lease' | 'custom'
export type ContractStatus = 'draft' | 'pending-review' | 'pending-signature' | 'active' | 'completed' | 'cancelled' | 'expired' | 'terminated' | 'renewed'

export interface ContractSignature {
  id: string
  contract_id: string
  signer_id: string
  signer_name: string
  signer_email: string
  signer_role: 'party_a' | 'party_b' | 'witness' | 'notary'
  signature_data: string | null
  signature_type: 'drawn' | 'typed' | 'uploaded' | 'digital'
  ip_address: string | null
  user_agent: string | null
  signed_at: string | null
  status: 'pending' | 'signed' | 'declined'
  decline_reason: string | null
  created_at: string
}

export interface ContractVersion {
  id: string
  contract_id: string
  version_number: number
  change_summary: string | null
  content_snapshot: any
  created_by: string
  created_at: string
}

export interface ContractShare {
  id: string
  contract_id: string
  shared_by: string
  shared_with_email: string
  shared_with_user_id: string | null
  permission_level: 'view' | 'comment' | 'edit' | 'sign'
  public_link: string | null
  expires_at: string | null
  is_active: boolean
  access_count: number
  created_at: string
}

export interface Contract {
  id: string
  user_id: string
  organization_id: string | null
  client_id: string | null
  project_id: string | null
  contract_number: string
  title: string
  description: string | null
  contract_type: ContractType
  status: ContractStatus
  contract_value: number
  payment_schedule: string | null
  currency: string
  start_date: string
  end_date: string | null
  signed_date: string | null
  effective_date: string | null
  termination_date: string | null
  renewal_date: string | null
  party_a_name: string | null
  party_a_email: string | null
  party_a_address: string | null
  party_a_signature: string | null
  party_a_signed_at: string | null
  party_b_name: string | null
  party_b_email: string | null
  party_b_address: string | null
  party_b_signature: string | null
  party_b_signed_at: string | null
  terms: string
  clauses: any
  deliverables: any
  milestones: any
  is_auto_renewable: boolean
  renewal_notice_period_days: number
  termination_notice_period_days: number
  termination_clause: string | null
  is_template: boolean
  template_id: string | null
  version: number
  parent_contract_id: string | null
  attachments: any
  has_attachments: boolean
  document_url: string | null
  requires_legal_review: boolean
  legal_review_status: string | null
  legal_reviewer_id: string | null
  legal_review_date: string | null
  notes: string | null
  internal_notes: string | null
  metadata: any
  tags: any
  created_at: string
  updated_at: string
  deleted_at: string | null
}

interface UseContractsOptions {
  status?: ContractStatus | 'all'
  contractType?: ContractType | 'all'
  limit?: number
}

export function useContracts(options: UseContractsOptions = {}) {
  const { status, contractType, limit } = options

  const filters: Record<string, any> = {}
  if (status && status !== 'all') filters.status = status
  if (contractType && contractType !== 'all') filters.contract_type = contractType

  const queryOptions: any = {
    table: 'contracts',
    filters,
    orderBy: { column: 'created_at', ascending: false },
    realtime: true
  }
  if (limit !== undefined) queryOptions.limit = limit

  const { data, loading, error, refetch } = useSupabaseQuery<Contract>(queryOptions)

  const { create, update, remove, loading: mutating } = useSupabaseMutation({
    table: 'contracts',
    onSuccess: refetch
  })

  return {
    contracts: data,
    loading,
    error,
    mutating,
    createContract: create,
    updateContract: update,
    deleteContract: remove,
    refetch
  }
}

// ============================================
// EXTENDED CONTRACT MUTATIONS HOOK
// ============================================

export function useContractMutations() {
  const supabase = createClient()
  const isDemo = isDemoModeEnabled()

  // Get user ID helper
  const getUserId = async (): Promise<string | null> => {
    if (isDemo) return '00000000-0000-0000-0000-000000000001'
    const { data: { user } } = await supabase.auth.getUser()
    return user?.id || null
  }

  // ============================================
  // SIGNATURE OPERATIONS
  // ============================================

  const recordSignature = async (
    contractId: string,
    signatureData: {
      signerName: string
      signerEmail: string
      signerRole: 'party_a' | 'party_b' | 'witness' | 'notary'
      signatureType: 'drawn' | 'typed' | 'uploaded' | 'digital'
      signatureContent?: string
    }
  ): Promise<ContractSignature> => {
    if (isDemo) {
      toast.info('Demo mode: Signature recording simulated')
      return {} as ContractSignature
    }
    const userId = await getUserId()
    if (!userId) {
      throw new Error('User not authenticated')
    }

    // Create signature record
    const { data: signature, error: sigError } = await supabase
      .from('contract_signatures')
      .insert({
        contract_id: contractId,
        signer_id: userId,
        signer_name: signatureData.signerName,
        signer_email: signatureData.signerEmail,
        signer_role: signatureData.signerRole,
        signature_type: signatureData.signatureType,
        signature_data: signatureData.signatureContent || null,
        ip_address: null, // Could capture from request headers
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        signed_at: new Date().toISOString(),
        status: 'signed'
      })
      .select()
      .single()

    if (sigError) {
      throw new Error(`Failed to record signature: ${sigError.message}`)
    }

    // Update contract with signature info based on role
    const updateData: Record<string, any> = {}
    if (signatureData.signerRole === 'party_a') {
      updateData.party_a_signature = signatureData.signatureContent
      updateData.party_a_signed_at = new Date().toISOString()
    } else if (signatureData.signerRole === 'party_b') {
      updateData.party_b_signature = signatureData.signatureContent
      updateData.party_b_signed_at = new Date().toISOString()
    }

    // Check if both parties have signed
    const { data: contract } = await supabase
      .from('contracts')
      .select('party_a_signed_at, party_b_signed_at')
      .eq('id', contractId)
      .single()

    const partyASigned = contract?.party_a_signed_at || (signatureData.signerRole === 'party_a')
    const partyBSigned = contract?.party_b_signed_at || (signatureData.signerRole === 'party_b')

    if (partyASigned && partyBSigned) {
      updateData.status = 'active'
      updateData.signed_date = new Date().toISOString()
      updateData.effective_date = new Date().toISOString()
    }

    await supabase
      .from('contracts')
      .update(updateData)
      .eq('id', contractId)

    toast.success('Signature recorded', {
      description: `${signatureData.signerName} has signed the contract`
    })

    return signature
  }

  const getContractSignatures = async (contractId: string): Promise<ContractSignature[]> => {
    if (isDemo) return []
    const { data, error } = await supabase
      .from('contract_signatures')
      .select('*')
      .eq('contract_id', contractId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Failed to get signatures:', error)
      return []
    }

    return data || []
  }

  // ============================================
  // VERSION CONTROL OPERATIONS
  // ============================================

  const createVersion = async (
    contractId: string,
    changeSummary?: string
  ): Promise<ContractVersion> => {
    if (isDemo) {
      toast.info('Demo mode: Version creation simulated')
      return {} as ContractVersion
    }
    const userId = await getUserId()
    if (!userId) {
      throw new Error('User not authenticated')
    }

    // Get current contract data for snapshot
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', contractId)
      .single()

    if (contractError || !contract) {
      throw new Error('Contract not found')
    }

    const newVersionNumber = (contract.version || 1) + 1

    // Create version record with content snapshot
    const { data: version, error: versionError } = await supabase
      .from('contract_versions')
      .insert({
        contract_id: contractId,
        version_number: newVersionNumber,
        change_summary: changeSummary || `Version ${newVersionNumber}`,
        content_snapshot: {
          title: contract.title,
          terms: contract.terms,
          clauses: contract.clauses,
          contract_value: contract.contract_value,
          party_a_name: contract.party_a_name,
          party_b_name: contract.party_b_name,
          updated_at: new Date().toISOString()
        },
        created_by: userId
      })
      .select()
      .single()

    if (versionError) {
      throw new Error(`Failed to create version: ${versionError.message}`)
    }

    // Update contract version number
    await supabase
      .from('contracts')
      .update({ version: newVersionNumber })
      .eq('id', contractId)

    toast.success('New version created', {
      description: `Version ${newVersionNumber} saved`
    })

    return version
  }

  const getContractVersions = async (contractId: string): Promise<ContractVersion[]> => {
    if (isDemo) return []
    const { data, error } = await supabase
      .from('contract_versions')
      .select('*')
      .eq('contract_id', contractId)
      .order('version_number', { ascending: false })

    if (error) {
      console.error('Failed to get versions:', error)
      return []
    }

    return data || []
  }

  const restoreVersion = async (
    contractId: string,
    versionId: string
  ): Promise<Contract> => {
    if (isDemo) {
      toast.info('Demo mode: Version restore simulated')
      return {} as Contract
    }
    const userId = await getUserId()
    if (!userId) {
      throw new Error('User not authenticated')
    }

    // Get the version to restore
    const { data: version, error: versionError } = await supabase
      .from('contract_versions')
      .select('*')
      .eq('id', versionId)
      .single()

    if (versionError || !version) {
      throw new Error('Version not found')
    }

    // Create a new version before restoring (to preserve current state)
    await createVersion(contractId, `Backup before restoring to version ${version.version_number}`)

    // Restore contract from version snapshot
    const snapshot = version.content_snapshot
    const { data: updatedContract, error: updateError } = await supabase
      .from('contracts')
      .update({
        title: snapshot.title,
        terms: snapshot.terms,
        clauses: snapshot.clauses,
        contract_value: snapshot.contract_value,
        party_a_name: snapshot.party_a_name,
        party_b_name: snapshot.party_b_name,
        updated_at: new Date().toISOString()
      })
      .eq('id', contractId)
      .select()
      .single()

    if (updateError) {
      throw new Error(`Failed to restore version: ${updateError.message}`)
    }

    toast.success('Version restored', {
      description: `Restored to version ${version.version_number}`
    })

    return updatedContract
  }

  // ============================================
  // SHARING OPERATIONS
  // ============================================

  const shareContract = async (
    contractId: string,
    options: {
      email: string
      permissionLevel?: 'view' | 'comment' | 'edit' | 'sign'
      expiresAt?: string
      createPublicLink?: boolean
    }
  ): Promise<ContractShare> => {
    if (isDemo) {
      toast.info('Demo mode: Contract sharing simulated')
      return {} as ContractShare
    }
    const userId = await getUserId()
    if (!userId) {
      throw new Error('User not authenticated')
    }

    const shareData: Record<string, unknown> = {
      contract_id: contractId,
      shared_by: userId,
      shared_with_email: options.email,
      permission_level: options.permissionLevel || 'view',
      is_active: true,
      access_count: 0
    }

    if (options.expiresAt) {
      shareData.expires_at = options.expiresAt
    }

    if (options.createPublicLink) {
      // Generate a random public link
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      let link = ''
      for (let i = 0; i < 32; i++) {
        link += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      shareData.public_link = link
    }

    const { data, error } = await supabase
      .from('contract_shares')
      .insert(shareData)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to share contract: ${error.message}`)
    }

    toast.success('Contract shared', {
      description: `Shared with ${options.email}`
    })

    // Copy link to clipboard if public link was created
    if (data.public_link) {
      const shareUrl = `${window.location.origin}/contracts/share/${data.public_link}`
      navigator.clipboard.writeText(shareUrl).catch(() => {})
    }

    return data
  }

  const getContractShares = async (contractId: string): Promise<ContractShare[]> => {
    if (isDemo) return []
    const { data, error } = await supabase
      .from('contract_shares')
      .select('*')
      .eq('contract_id', contractId)
      .eq('is_active', true)

    if (error) {
      console.error('Failed to get shares:', error)
      return []
    }

    return data || []
  }

  const revokeShare = async (shareId: string): Promise<void> => {
    if (isDemo) {
      toast.info('Demo mode: Revoke simulated')
      return
    }
    const { error } = await supabase
      .from('contract_shares')
      .update({ is_active: false })
      .eq('id', shareId)

    if (error) {
      throw new Error(`Failed to revoke share: ${error.message}`)
    }

    toast.success('Share revoked')
  }

  // ============================================
  // SEND FOR SIGNATURE
  // ============================================

  const sendForSignature = async (
    contractId: string,
    recipients: Array<{ name: string; email: string; role: 'party_a' | 'party_b' | 'witness' | 'notary' }>
  ): Promise<void> => {
    if (isDemo) {
      toast.info('Demo mode: Send for signature simulated')
      return
    }
    const userId = await getUserId()
    if (!userId) {
      throw new Error('User not authenticated')
    }

    // Update contract status
    await supabase
      .from('contracts')
      .update({
        status: 'pending-signature',
        updated_at: new Date().toISOString()
      })
      .eq('id', contractId)

    // Create pending signature records for each recipient
    for (const recipient of recipients) {
      await supabase
        .from('contract_signatures')
        .insert({
          contract_id: contractId,
          signer_id: userId, // Will be updated when actual signer signs
          signer_name: recipient.name,
          signer_email: recipient.email,
          signer_role: recipient.role,
          signature_type: 'pending',
          status: 'pending'
        })
    }

    // Create share for each recipient
    for (const recipient of recipients) {
      await shareContract(contractId, {
        email: recipient.email,
        permissionLevel: 'sign'
      })
    }

    toast.success('Contract sent for signature', {
      description: `Sent to ${recipients.length} recipient${recipients.length > 1 ? 's' : ''}`
    })
  }

  // ============================================
  // DOCUMENT UPLOAD FOR CONTRACT
  // ============================================

  const uploadContractDocument = async (
    contractId: string,
    file: File
  ): Promise<string> => {
    if (isDemo) {
      toast.info('Demo mode: Document upload simulated')
      return ''
    }
    const userId = await getUserId()
    if (!userId) {
      throw new Error('User not authenticated')
    }

    const timestamp = Date.now()
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const storagePath = `contracts/${userId}/${contractId}/${timestamp}_${sanitizedFileName}`

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('contracts')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('contracts')
      .getPublicUrl(storagePath)

    // Update contract with document URL
    await supabase
      .from('contracts')
      .update({
        document_url: urlData.publicUrl,
        has_attachments: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', contractId)

    toast.success('Document uploaded', {
      description: `"${file.name}" attached to contract`
    })

    return urlData.publicUrl
  }

  // ============================================
  // DOWNLOAD CONTRACT
  // ============================================

  const downloadContract = async (contractId: string): Promise<void> => {
    if (isDemo) {
      toast.info('Demo mode: Download simulated')
      return
    }
    // Get contract details
    const { data: contract, error } = await supabase
      .from('contracts')
      .select('document_url, title')
      .eq('id', contractId)
      .single()

    if (error || !contract?.document_url) {
      // Generate a text file with contract details if no document attached
      const { data: fullContract } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', contractId)
        .single()

      if (fullContract) {
        const content = `
CONTRACT DOCUMENT
=====================================

Contract: ${fullContract.title}
Contract Number: ${fullContract.contract_number}
Type: ${fullContract.contract_type}
Status: ${fullContract.status}
Value: ${fullContract.currency} ${fullContract.contract_value?.toLocaleString() || 0}

=====================================
PARTIES
-------------------------------------
Party A: ${fullContract.party_a_name || 'TBD'}
Email: ${fullContract.party_a_email || 'TBD'}
${fullContract.party_a_signed_at ? `Signed: ${new Date(fullContract.party_a_signed_at).toLocaleDateString()}` : 'Status: Awaiting Signature'}

Party B: ${fullContract.party_b_name || 'TBD'}
Email: ${fullContract.party_b_email || 'TBD'}
${fullContract.party_b_signed_at ? `Signed: ${new Date(fullContract.party_b_signed_at).toLocaleDateString()}` : 'Status: Awaiting Signature'}

=====================================
TERMS AND CONDITIONS
-------------------------------------
${fullContract.terms || 'No terms specified'}

=====================================
Generated: ${new Date().toLocaleString()}
        `.trim()

        const blob = new Blob([content], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${fullContract.title.replace(/\s+/g, '_')}_contract.txt`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        toast.success('Contract downloaded')
        return
      }

      throw new Error('Contract not found')
    }

    // Download from storage
    const storagePath = contract.document_url.split('/contracts/')[1]
    if (storagePath) {
      const { data: downloadData, error: downloadError } = await supabase.storage
        .from('contracts')
        .createSignedUrl(storagePath, 60)

      if (downloadError || !downloadData?.signedUrl) {
        throw new Error('Failed to generate download link')
      }

      const link = document.createElement('a')
      link.href = downloadData.signedUrl
      link.download = contract.title || 'contract'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    toast.success('Download started')
  }

  return {
    // Signature operations
    recordSignature,
    getContractSignatures,
    // Version operations
    createVersion,
    getContractVersions,
    restoreVersion,
    // Share operations
    shareContract,
    getContractShares,
    revokeShare,
    // Send for signature
    sendForSignature,
    // Document operations
    uploadContractDocument,
    downloadContract
  }
}
