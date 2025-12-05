'use client'

/**
 * Secure File Upload Component
 *
 * Features:
 * - Drag-and-drop interface
 * - Upload progress tracking
 * - File preview thumbnails
 * - Delivery options form
 * - Password protection
 * - Payment settings
 * - Escrow integration
 * - Download limits
 * - Expiration dates
 */

import { useState, useCallback, useRef } from 'react'
import { Upload, Lock, DollarSign, Shield, Calendar, Users, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

export interface UploadedFile {
  id: string
  key: string
  url: string
  name: string
  size: number
  type: string
  uploadedAt: string
}

export interface DeliveryOptions {
  password?: string
  requiresPayment: boolean
  paymentAmount?: number
  escrowEnabled: boolean
  maxDownloads?: number
  expiresAt?: Date
  recipientEmails?: string[]
  isPublic: boolean
}

export interface SecureFileUploadProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSuccess?: () => void
  onUploadComplete?: (file: UploadedFile) => void
  onDeliveryCreated?: (delivery: any) => void
  defaultOptions?: Partial<DeliveryOptions>
  collectionId?: string
  folder?: string
}

interface UploadState {
  file: File | null
  uploading: boolean
  uploadProgress: number
  uploadedFile: UploadedFile | null
  creatingDelivery: boolean
  delivery: any | null
  error: string | null
}

export function SecureFileUpload({
  open = true,
  onOpenChange,
  onSuccess,
  onUploadComplete,
  onDeliveryCreated,
  defaultOptions = {},
  collectionId,
  folder = 'uploads'
}: SecureFileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)

  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    uploading: false,
    uploadProgress: 0,
    uploadedFile: null,
    creatingDelivery: false,
    delivery: null,
    error: null
  })

  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOptions>({
    requiresPayment: defaultOptions.requiresPayment || false,
    paymentAmount: defaultOptions.paymentAmount || 0,
    escrowEnabled: defaultOptions.escrowEnabled || false,
    isPublic: defaultOptions.isPublic || false,
    password: defaultOptions.password,
    maxDownloads: defaultOptions.maxDownloads,
    recipientEmails: defaultOptions.recipientEmails || []
  })

  const [recipientEmailInput, setRecipientEmailInput] = useState('')

  // Drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileSelect = (file: File) => {
    setUploadState(prev => ({
      ...prev,
      file,
      error: null
    }))
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const uploadFile = async () => {
    if (!uploadState.file) return

    setUploadState(prev => ({ ...prev, uploading: true, uploadProgress: 0, error: null }))

    try {
      const formData = new FormData()
      formData.append('file', uploadState.file)
      formData.append('folder', folder)
      formData.append('isPublic', deliveryOptions.isPublic.toString())

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Upload failed')
      }

      setUploadState(prev => ({
        ...prev,
        uploading: false,
        uploadProgress: 100,
        uploadedFile: data.file
      }))

      onUploadComplete?.(data.file)
    } catch (error: any) {
      setUploadState(prev => ({
        ...prev,
        uploading: false,
        uploadProgress: 0,
        error: error.message
      }))
    }
  }

  const createDelivery = async () => {
    if (!uploadState.uploadedFile) return

    setUploadState(prev => ({ ...prev, creatingDelivery: true, error: null }))

    try {
      const response = await fetch('/api/files/delivery/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId: uploadState.uploadedFile.id,
          password: deliveryOptions.password,
          requiresPayment: deliveryOptions.requiresPayment,
          paymentAmount: deliveryOptions.requiresPayment ? deliveryOptions.paymentAmount : undefined,
          escrowEnabled: deliveryOptions.escrowEnabled,
          maxDownloads: deliveryOptions.maxDownloads,
          expiresAt: deliveryOptions.expiresAt?.toISOString(),
          recipientEmails: deliveryOptions.recipientEmails,
          isPublic: deliveryOptions.isPublic,
          collectionId
        })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create delivery')
      }

      setUploadState(prev => ({
        ...prev,
        creatingDelivery: false,
        delivery: data.delivery
      }))

      onDeliveryCreated?.(data.delivery)
      onSuccess?.()
    } catch (error: any) {
      setUploadState(prev => ({
        ...prev,
        creatingDelivery: false,
        error: error.message
      }))
    }
  }

  const addRecipient = () => {
    if (recipientEmailInput.trim()) {
      setDeliveryOptions(prev => ({
        ...prev,
        recipientEmails: [...(prev.recipientEmails || []), recipientEmailInput.trim()]
      }))
      setRecipientEmailInput('')
    }
  }

  const removeRecipient = (email: string) => {
    setDeliveryOptions(prev => ({
      ...prev,
      recipientEmails: prev.recipientEmails?.filter(e => e !== email)
    }))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const reset = () => {
    setUploadState({
      file: null,
      uploading: false,
      uploadProgress: 0,
      uploadedFile: null,
      creatingDelivery: false,
      delivery: null,
      error: null
    })
    setDeliveryOptions({
      requiresPayment: false,
      paymentAmount: 0,
      escrowEnabled: false,
      isPublic: false,
      recipientEmails: []
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Success state
  if (uploadState.delivery) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
        <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-500" />
            Delivery Created Successfully!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Access URL</Label>
            <div className="flex gap-2">
              <Input
                value={uploadState.delivery.accessUrl}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(uploadState.delivery.accessUrl)
                }}
              >
                Copy
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            {uploadState.delivery.requiresPassword && (
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <span>Password Protected</span>
              </div>
            )}
            {uploadState.delivery.requiresPayment && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span>Payment Required</span>
              </div>
            )}
            {uploadState.delivery.escrowEnabled && (
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span>Escrow Protected</span>
              </div>
            )}
            {uploadState.delivery.expiresAt && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Expires: {new Date(uploadState.delivery.expiresAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          <Button onClick={() => {
            reset()
            onOpenChange?.(false)
          }} className="w-full">
            Done
          </Button>
        </CardContent>
      </Card>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Secure File</DialogTitle>
          <DialogDescription>
            Upload and configure secure file delivery with password protection, payments, and escrow
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
      {/* File Upload Area */}
      {!uploadState.uploadedFile && (
        <Card>
          <CardHeader>
            <CardTitle>Upload File</CardTitle>
            <CardDescription>
              Drag and drop your file or click to browse
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              {uploadState.file ? (
                <div className="space-y-2">
                  <p className="font-medium">{uploadState.file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(uploadState.file.size)}
                  </p>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      uploadFile()
                    }}
                    disabled={uploadState.uploading}
                    className="mt-4"
                  >
                    {uploadState.uploading ? 'Uploading...' : 'Upload File'}
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="text-lg font-medium">Drop your file here</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Max size: 100MB
                  </p>
                </div>
              )}
            </div>

            {uploadState.uploading && (
              <div className="mt-4 space-y-2">
                <Progress value={uploadState.uploadProgress} />
                <p className="text-sm text-center text-muted-foreground">
                  Uploading... {uploadState.uploadProgress}%
                </p>
              </div>
            )}

            {uploadState.error && (
              <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-md">
                {uploadState.error}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Delivery Options */}
      {uploadState.uploadedFile && !uploadState.delivery && (
        <Card>
          <CardHeader>
            <CardTitle>Configure Delivery</CardTitle>
            <CardDescription>
              Set access controls and delivery options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Info */}
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-medium">{uploadState.uploadedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(uploadState.uploadedFile.size)}
              </p>
            </div>

            {/* Public Access */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Public Access</Label>
                <p className="text-sm text-muted-foreground">
                  Anyone with the link can access
                </p>
              </div>
              <Switch
                checked={deliveryOptions.isPublic}
                onCheckedChange={(checked) =>
                  setDeliveryOptions(prev => ({ ...prev, isPublic: checked }))
                }
              />
            </div>

            {/* Password Protection */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <Label>Password Protection</Label>
              </div>
              <Input
                type="password"
                placeholder="Enter password (optional)"
                value={deliveryOptions.password || ''}
                onChange={(e) =>
                  setDeliveryOptions(prev => ({ ...prev, password: e.target.value }))
                }
              />
            </div>

            {/* Payment Settings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <Label>Require Payment</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Charge for file access
                  </p>
                </div>
                <Switch
                  checked={deliveryOptions.requiresPayment}
                  onCheckedChange={(checked) =>
                    setDeliveryOptions(prev => ({ ...prev, requiresPayment: checked }))
                  }
                />
              </div>

              {deliveryOptions.requiresPayment && (
                <div className="space-y-4 pl-6 border-l-2">
                  <div className="space-y-2">
                    <Label>Payment Amount ($)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={deliveryOptions.paymentAmount || ''}
                      onChange={(e) =>
                        setDeliveryOptions(prev => ({
                          ...prev,
                          paymentAmount: parseFloat(e.target.value) || 0
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        <Label>Enable Escrow</Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Hold payment until you release it
                      </p>
                    </div>
                    <Switch
                      checked={deliveryOptions.escrowEnabled}
                      onCheckedChange={(checked) =>
                        setDeliveryOptions(prev => ({ ...prev, escrowEnabled: checked }))
                      }
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Download Limit */}
            <div className="space-y-2">
              <Label>Download Limit (optional)</Label>
              <Input
                type="number"
                min="1"
                placeholder="Unlimited"
                value={deliveryOptions.maxDownloads || ''}
                onChange={(e) =>
                  setDeliveryOptions(prev => ({
                    ...prev,
                    maxDownloads: parseInt(e.target.value) || undefined
                  }))
                }
              />
            </div>

            {/* Expiration Date */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <Label>Expiration Date (optional)</Label>
              </div>
              <Input
                type="datetime-local"
                onChange={(e) =>
                  setDeliveryOptions(prev => ({
                    ...prev,
                    expiresAt: e.target.value ? new Date(e.target.value) : undefined
                  }))
                }
              />
            </div>

            {/* Recipients */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <Label>Recipients (optional)</Label>
              </div>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={recipientEmailInput}
                  onChange={(e) => setRecipientEmailInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addRecipient()
                    }
                  }}
                />
                <Button onClick={addRecipient} variant="outline">
                  Add
                </Button>
              </div>
              {deliveryOptions.recipientEmails && deliveryOptions.recipientEmails.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {deliveryOptions.recipientEmails.map((email) => (
                    <Badge key={email} variant="secondary">
                      {email}
                      <X
                        className="h-3 w-3 ml-1 cursor-pointer"
                        onClick={() => removeRecipient(email)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button
                onClick={createDelivery}
                disabled={uploadState.creatingDelivery}
                className="flex-1"
              >
                {uploadState.creatingDelivery ? 'Creating...' : 'Create Delivery'}
              </Button>
              <Button onClick={reset} variant="outline">
                Cancel
              </Button>
            </div>

            {uploadState.error && (
              <div className="p-4 bg-destructive/10 text-destructive rounded-md">
                {uploadState.error}
              </div>
            )}
          </CardContent>
        </Card>
      )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
