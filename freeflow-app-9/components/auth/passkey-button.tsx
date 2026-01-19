'use client'

/**
 * Passkey Authentication Components
 *
 * Provides UI for WebAuthn/Passkey authentication:
 * - PasskeyLoginButton: Sign in with passkey
 * - PasskeyRegisterButton: Register a new passkey
 * - PasskeyManager: Manage existing passkeys
 * - BackupCodesDialog: Generate and view backup codes
 */

import { useState, useCallback } from 'react'
import { Fingerprint, Key, Plus, Trash2, Edit2, Shield, Copy, Check, Loader2, Smartphone, Monitor, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

// Types
interface Passkey {
  id: string
  name: string
  deviceType: 'platform' | 'cross-platform'
  backedUp: boolean
  createdAt: string
  lastUsedAt: string | null
}

interface PasskeyLoginButtonProps {
  onSuccess?: (user: { id: string; email: string; name: string }) => void
  onError?: (error: string) => void
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  email?: string
}

interface PasskeyRegisterButtonProps {
  onSuccess?: () => void
  onError?: (error: string) => void
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
}

interface PasskeyManagerProps {
  className?: string
}

// Helper: Check WebAuthn support
function isWebAuthnSupported(): boolean {
  return typeof window !== 'undefined' &&
    window.PublicKeyCredential !== undefined &&
    typeof window.PublicKeyCredential === 'function'
}

// Helper: Base64URL encode/decode
function base64URLEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let str = ''
  for (let i = 0; i < bytes.length; i++) {
    str += String.fromCharCode(bytes[i])
  }
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function base64URLDecode(str: string): ArrayBuffer {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '='.repeat((4 - base64.length % 4) % 4)
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

/**
 * Passkey Login Button
 * Initiates WebAuthn authentication flow
 */
export function PasskeyLoginButton({
  onSuccess,
  onError,
  className,
  variant = 'outline',
  size = 'default',
  email
}: PasskeyLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = useCallback(async () => {
    if (!isWebAuthnSupported()) {
      const error = 'Passkeys are not supported on this device'
      toast.error(error)
      onError?.(error)
      return
    }

    setIsLoading(true)

    try {
      // Start authentication
      const startResponse = await fetch('/api/auth/passkeys/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const startData = await startResponse.json()

      if (!startData.success) {
        throw new Error(startData.error || 'Failed to start authentication')
      }

      const { options, challengeId } = startData

      // Convert options for WebAuthn API
      const publicKeyOptions: PublicKeyCredentialRequestOptions = {
        challenge: base64URLDecode(options.challenge),
        timeout: options.timeout,
        rpId: options.rpId,
        userVerification: options.userVerification as UserVerificationRequirement,
        allowCredentials: options.allowCredentials?.map((cred: { id: string; type: string; transports?: string[] }) => ({
          id: base64URLDecode(cred.id),
          type: cred.type as PublicKeyCredentialType,
          transports: cred.transports as AuthenticatorTransport[]
        }))
      }

      // Get credential
      const credential = await navigator.credentials.get({
        publicKey: publicKeyOptions
      }) as PublicKeyCredential

      if (!credential) {
        throw new Error('No credential returned')
      }

      const response = credential.response as AuthenticatorAssertionResponse

      // Complete authentication
      const verifyResponse = await fetch('/api/auth/passkeys/authenticate', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId,
          response: {
            id: credential.id,
            rawId: base64URLEncode(credential.rawId),
            response: {
              clientDataJSON: base64URLEncode(response.clientDataJSON),
              authenticatorData: base64URLEncode(response.authenticatorData),
              signature: base64URLEncode(response.signature),
              userHandle: response.userHandle ? base64URLEncode(response.userHandle) : undefined
            },
            type: credential.type,
            clientExtensionResults: credential.getClientExtensionResults(),
            authenticatorAttachment: (credential as PublicKeyCredential & { authenticatorAttachment?: string }).authenticatorAttachment
          }
        })
      })

      const verifyData = await verifyResponse.json()

      if (!verifyData.success) {
        throw new Error(verifyData.error || 'Authentication failed')
      }

      toast.success('Signed in successfully!')
      onSuccess?.(verifyData.user)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed'

      // Handle user cancellation gracefully
      if (message.includes('NotAllowedError') || message.includes('cancelled')) {
        toast.info('Authentication cancelled')
        return
      }

      toast.error(message)
      onError?.(message)
    } finally {
      setIsLoading(false)
    }
  }, [email, onSuccess, onError])

  if (!isWebAuthnSupported()) {
    return null
  }

  return (
    <Button
      onClick={handleLogin}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={className}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Fingerprint className="h-4 w-4 mr-2" />
      )}
      Sign in with Passkey
    </Button>
  )
}

/**
 * Passkey Register Button
 * Initiates WebAuthn registration flow
 */
export function PasskeyRegisterButton({
  onSuccess,
  onError,
  className,
  variant = 'default',
  size = 'default'
}: PasskeyRegisterButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [deviceName, setDeviceName] = useState('')

  const handleRegister = useCallback(async () => {
    if (!isWebAuthnSupported()) {
      const error = 'Passkeys are not supported on this device'
      toast.error(error)
      onError?.(error)
      return
    }

    setIsLoading(true)

    try {
      // Start registration
      const startResponse = await fetch('/api/auth/passkeys/register', {
        method: 'POST'
      })

      const startData = await startResponse.json()

      if (!startData.success) {
        throw new Error(startData.error || 'Failed to start registration')
      }

      const { options, challengeId } = startData

      // Convert options for WebAuthn API
      const publicKeyOptions: PublicKeyCredentialCreationOptions = {
        challenge: base64URLDecode(options.challenge),
        rp: options.rp,
        user: {
          id: base64URLDecode(options.user.id),
          name: options.user.name,
          displayName: options.user.displayName
        },
        pubKeyCredParams: options.pubKeyCredParams,
        timeout: options.timeout,
        attestation: options.attestation as AttestationConveyancePreference,
        authenticatorSelection: options.authenticatorSelection,
        excludeCredentials: options.excludeCredentials?.map((cred: { id: string; type: string; transports?: string[] }) => ({
          id: base64URLDecode(cred.id),
          type: cred.type as PublicKeyCredentialType,
          transports: cred.transports as AuthenticatorTransport[]
        }))
      }

      // Create credential
      const credential = await navigator.credentials.create({
        publicKey: publicKeyOptions
      }) as PublicKeyCredential

      if (!credential) {
        throw new Error('No credential returned')
      }

      const response = credential.response as AuthenticatorAttestationResponse

      // Complete registration
      const verifyResponse = await fetch('/api/auth/passkeys/register', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId,
          deviceName: deviceName || undefined,
          response: {
            id: credential.id,
            rawId: base64URLEncode(credential.rawId),
            response: {
              clientDataJSON: base64URLEncode(response.clientDataJSON),
              attestationObject: base64URLEncode(response.attestationObject),
              transports: response.getTransports?.() || []
            },
            type: credential.type,
            clientExtensionResults: credential.getClientExtensionResults(),
            authenticatorAttachment: (credential as PublicKeyCredential & { authenticatorAttachment?: string }).authenticatorAttachment
          }
        })
      })

      const verifyData = await verifyResponse.json()

      if (!verifyData.success) {
        throw new Error(verifyData.error || 'Registration failed')
      }

      toast.success('Passkey registered successfully!')
      setIsDialogOpen(false)
      setDeviceName('')
      onSuccess?.()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed'

      // Handle user cancellation gracefully
      if (message.includes('NotAllowedError') || message.includes('cancelled')) {
        toast.info('Registration cancelled')
        return
      }

      toast.error(message)
      onError?.(message)
    } finally {
      setIsLoading(false)
    }
  }, [deviceName, onSuccess, onError])

  if (!isWebAuthnSupported()) {
    return null
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Plus className="h-4 w-4 mr-2" />
          Add Passkey
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Register a Passkey
          </DialogTitle>
          <DialogDescription>
            Passkeys let you sign in without a password using your device&apos;s
            fingerprint, face, or screen lock.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="device-name">Device Name (optional)</Label>
            <Input
              id="device-name"
              placeholder="e.g., MacBook Pro, iPhone"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Give this passkey a name to help you identify it later.
            </p>
          </div>

          <div className="rounded-lg bg-muted p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Shield className="h-4 w-4 text-green-600" />
              Security Benefits
            </div>
            <ul className="text-sm text-muted-foreground space-y-1 ml-6">
              <li>Phishing-resistant authentication</li>
              <li>No passwords to remember or steal</li>
              <li>Works across your devices when synced</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleRegister} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Fingerprint className="h-4 w-4 mr-2" />
            )}
            Create Passkey
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Passkey Manager
 * Lists and manages user's passkeys
 */
export function PasskeyManager({ className }: PasskeyManagerProps) {
  const [passkeys, setPasskeys] = useState<Passkey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  // Fetch passkeys
  const fetchPasskeys = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/passkeys')
      const data = await response.json()

      if (data.success) {
        setPasskeys(data.passkeys)
      }
    } catch (error) {
      console.error('Failed to fetch passkeys:', error)
      toast.error('Failed to load passkeys')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load passkeys on mount
  useState(() => {
    fetchPasskeys()
  })

  // Rename passkey
  const handleRename = async (id: string) => {
    if (!editName.trim()) return

    try {
      const response = await fetch(`/api/auth/passkeys/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName })
      })

      const data = await response.json()

      if (data.success) {
        setPasskeys(pks => pks.map(pk =>
          pk.id === id ? { ...pk, name: editName } : pk
        ))
        toast.success('Passkey renamed')
      } else {
        toast.error(data.error || 'Failed to rename')
      }
    } catch (error) {
      console.error('Rename error:', error)
      toast.error('Failed to rename passkey')
    } finally {
      setEditingId(null)
      setEditName('')
    }
  }

  // Delete passkey
  const handleDelete = async () => {
    if (!deleteId) return

    try {
      const response = await fetch(`/api/auth/passkeys/${deleteId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        setPasskeys(pks => pks.filter(pk => pk.id !== deleteId))
        toast.success('Passkey deleted')
      } else {
        toast.error(data.error || 'Failed to delete')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete passkey')
    } finally {
      setDeleteId(null)
    }
  }

  // Generate backup codes
  const handleGenerateBackupCodes = async () => {
    try {
      const response = await fetch('/api/auth/passkeys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate_backup_codes' })
      })

      const data = await response.json()

      if (data.success) {
        setBackupCodes(data.backupCodes)
      } else {
        toast.error(data.error || 'Failed to generate codes')
      }
    } catch (error) {
      console.error('Backup codes error:', error)
      toast.error('Failed to generate backup codes')
    }
  }

  // Copy backup code
  const copyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  if (!isWebAuthnSupported()) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            Passkeys Not Supported
          </CardTitle>
          <CardDescription>
            Your browser or device doesn&apos;t support passkeys.
            Try using a modern browser like Chrome, Safari, or Firefox.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Passkeys
              </CardTitle>
              <CardDescription>
                Manage your passkeys for passwordless sign-in
              </CardDescription>
            </div>
            <PasskeyRegisterButton
              onSuccess={fetchPasskeys}
              variant="outline"
              size="sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : passkeys.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Fingerprint className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No passkeys registered yet</p>
              <p className="text-sm mt-1">
                Add a passkey to sign in without a password
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {passkeys.map((passkey) => (
                <div
                  key={passkey.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {passkey.deviceType === 'platform' ? (
                      <Monitor className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Smartphone className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      {editingId === passkey.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="h-7 w-40"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleRename(passkey.id)
                              if (e.key === 'Escape') {
                                setEditingId(null)
                                setEditName('')
                              }
                            }}
                            autoFocus
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRename(passkey.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <p className="font-medium">{passkey.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {passkey.backedUp && (
                              <span className="text-green-600 mr-2">Synced</span>
                            )}
                            Created {new Date(passkey.createdAt).toLocaleDateString()}
                            {passkey.lastUsedAt && (
                              <span> · Last used {new Date(passkey.lastUsedAt).toLocaleDateString()}</span>
                            )}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingId(passkey.id)
                        setEditName(passkey.name)
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(passkey.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Backup Codes Section */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-5 w-5" />
            Backup Codes
          </CardTitle>
          <CardDescription>
            Generate recovery codes in case you lose access to your passkeys
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={handleGenerateBackupCodes}>
                Generate Backup Codes
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Your Backup Codes</DialogTitle>
                <DialogDescription>
                  Save these codes in a secure place. Each code can only be used once.
                </DialogDescription>
              </DialogHeader>
              {backupCodes && (
                <div className="grid grid-cols-2 gap-2 py-4">
                  {backupCodes.map((code, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 font-mono text-sm bg-muted rounded"
                    >
                      <span>{code}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyCode(code, index)}
                      >
                        {copiedIndex === index ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (backupCodes) {
                      navigator.clipboard.writeText(backupCodes.join('\n'))
                      toast.success('All codes copied!')
                    }
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy All
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Passkey?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. You won&apos;t be able to sign in with
              this passkey anymore.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// Export all components
export default {
  PasskeyLoginButton,
  PasskeyRegisterButton,
  PasskeyManager
}
