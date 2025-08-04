"use client"

import React, { useReducer, useCallback, useRef } from 'react'
import { Shield, Upload, Image, Video, Music, FileText, Archive, Check, Unlock, X, Copy, Eye, Lock, Globe, Clock, Star, Download, Share2, Heart, TrendingUp, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  publicUrl: string;
  thumbnailUrl?: string;
  shareableLink: string;
  downloadUrl: string;
  escrowProtected: boolean;
  escrowAmount?: number;
  escrowStatus?: 'pending' | 'active' | 'released' | 'cancelled' | 'none';
  accessLevel?: 'public' | 'password' | 'escrow';
  unlockPrice?: number;
  seo?: {
    title: string;
    description: string;
  };
  uploadedAt: Date;
  expiresAt?: Date;
  downloadCount?: number;
  views?: number;
}

interface UploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
  result?: UploadedFile;
}

interface EscrowSettings {
  enabled: boolean;
  amount: number;
  currency: string;
  projectId?: string;
  requireClientConfirmation: boolean;
  autoReleaseConditions: string[];
  protectionLevel: 'basic' | 'standard' | 'premium';
}

interface UploadState {
  uploads: UploadProgress[];
  completedFiles: UploadedFile[];
  isDragging: boolean;
  copiedLink: string | null;
  uploadSettings: {
    isPublic: boolean;
    allowDownload: boolean;
    requirePassword: boolean;
    password: string;
    customMessage: string;
    enableNotifications: boolean;
    generateSEO: boolean;
    trackAnalytics: boolean;
    enableEscrow: boolean;
    escrowSettings: EscrowSettings;
  };
  escrowState: {
    totalEscrowValue: number;
    activeEscrows: number;
    pendingReleases: number;
    completedProjects: number;
  };
  sharingStats: {
    totalShares: number;
    totalViews: number;
    conversionRate: number;
  };
}

type UploadAction =
    { type: 'SET_DRAGGING'; payload: boolean }
  | { type: 'ADD_UPLOAD'; payload: UploadProgress }
  | { type: 'UPDATE_UPLOAD_PROGRESS'; payload: { file: File; progress: number } }
  | { type: 'COMPLETE_UPLOAD'; payload: { file: File; result: UploadedFile } }
  | { type: 'ERROR_UPLOAD'; payload: { file: File; error: string } }
  | { type: 'REMOVE_UPLOAD'; payload: File }
  | { type: 'CLEAR_COMPLETED' }
  | { type: 'SET_COPIED_LINK'; payload: string | null }
  | { type: 'UPDATE_UPLOAD_SETTINGS'; payload: Partial<UploadState['uploadSettings']> }
  | { type: 'UPDATE_ESCROW_SETTINGS'; payload: Partial<EscrowSettings> }
  | { type: 'UPDATE_ESCROW_STATE'; payload: Partial<UploadState['escrowState']> }
  | { type: 'UPDATE_SHARING_STATS'; payload: Partial<UploadState['sharingStats']> }

// Context7 Reducer Pattern
function uploadReducer(state: UploadState, action: UploadAction): UploadState {
  switch (action.type) {
    case 'SET_DRAGGING':
      return { ...state, isDragging: action.payload }
    case 'ADD_UPLOAD':
      return { ...state, uploads: [...state.uploads, action.payload] }
    case 'UPDATE_UPLOAD_PROGRESS':
      return {
        ...state,
        uploads: state.uploads.map(upload =>
          upload.file === action.payload.file
            ? { ...upload, progress: action.payload.progress }
            : upload
        )
      }
    case 'COMPLETE_UPLOAD':
      return {
        ...state,
        uploads: state.uploads.map(upload =>
          upload.file === action.payload.file
            ? { ...upload, status: 'completed', result: action.payload.result }
            : upload
        ),
        completedFiles: [...state.completedFiles, action.payload.result]
      }
    case 'ERROR_UPLOAD':
      return {
        ...state,
        uploads: state.uploads.map(upload =>
          upload.file === action.payload.file
            ? { ...upload, status: 'error', error: action.payload.error }
            : upload
        )
      }
    case 'REMOVE_UPLOAD':
      return {
        ...state,
        uploads: state.uploads.filter(upload => upload.file !== action.payload)
      }
    case 'CLEAR_COMPLETED':
      return {
        ...state,
        uploads: state.uploads.filter(upload => upload.status !== 'completed')
      }
    case 'SET_COPIED_LINK':
      return { ...state, copiedLink: action.payload }
    case 'UPDATE_UPLOAD_SETTINGS':
      return {
        ...state,
        uploadSettings: { ...state.uploadSettings, ...action.payload }
      }
    case 'UPDATE_ESCROW_SETTINGS':
      return {
        ...state,
        uploadSettings: {
          ...state.uploadSettings,
          escrowSettings: { ...state.uploadSettings.escrowSettings, ...action.payload }
        }
      }
    case 'UPDATE_ESCROW_STATE':
      return {
        ...state,
        escrowState: { ...state.escrowState, ...action.payload }
      }
    case 'UPDATE_SHARING_STATS':
      return {
        ...state,
        sharingStats: { ...state.sharingStats, ...action.payload }
      }
    default:
      return state
  }
}

interface EnhancedUploadProgressProps {
  onUploadComplete?: (files: UploadedFile[]) => void
  maxFiles?: number
  maxSize?: number
  allowedTypes?: string[]
  enableSEO?: boolean
  enableAnalytics?: boolean
  enableEscrow?: boolean
  brandName?: string
  projectId?: string
}

export function EnhancedUploadProgress({
  onUploadComplete, maxFiles = 10, maxSize = 100 * 1024 * 1024, // 100MB
  allowedTypes = ['image/*', 'video/*', 'audio/*', 'application/*', 'text/*'], enableSEO = true, enableAnalytics = true, enableEscrow = true, brandName = 'KAZI', projectId
}: EnhancedUploadProgressProps) {

  // Context7 Pattern: Central State Management
  const [state, dispatch] = useReducer(uploadReducer, {
    uploads: [],
    completedFiles: [],
    isDragging: false,
    copiedLink: null,
    uploadSettings: {
      isPublic: true,
      allowDownload: true,
      requirePassword: false,
      password: '',
      customMessage: '',
      enableNotifications: false,
      generateSEO: enableSEO,
      trackAnalytics: enableAnalytics,
      enableEscrow: enableEscrow,
      escrowSettings: {
        enabled: false,
        amount: 0,
        currency: 'USD',
        projectId,
        requireClientConfirmation: true,
        autoReleaseConditions: [],
        protectionLevel: 'basic'
      }
    },
    escrowState: {
      totalEscrowValue: 13500,
      activeEscrows: 2,
      pendingReleases: 1,
      completedProjects: 8
    },
    sharingStats: {
      totalShares: 47,
      totalViews: 312,
      conversionRate: 15.1
    }
  })
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Generate SEO optimized metadata
  const generateSEOOptimizedData = useCallback((file: File) => {
    const fileType = file.type.split('/')[0]
    const fileName = file.name.replace(/\.[^/.]+$/, "")
    
    return {
      title: `Download ${fileName} - Premium ${fileType} by ${brandName}`,
      description: `High-quality ${fileType} file: ${fileName}. Professional work by ${brandName}. Secure download with client protection.`
    }
  }, [brandName])

  // Generate shareable link with UTM tracking
  const generateShareableLink = useCallback((fileId: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://freeflow-app-9.vercel.app'
    return `${baseUrl}/files/${fileId}?utm_source=freeflow&utm_medium=share&utm_campaign=file_sharing`
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Context7 Pattern: Enhanced Upload Simulation with Escrow
  const simulateUpload = async (file: File): Promise<UploadedFile> => {
    const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const result: UploadedFile = {
          id: fileId,
          name: file.name,
          size: file.size,
          type: file.type,
          url: `/api/files/${fileId}`,
          downloadUrl: `/api/files/${fileId}/download`,
          publicUrl: `/files/${fileId}`,
          shareableLink: generateShareableLink(fileId),
          seo: generateSEOOptimizedData(file),
          uploadedAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          downloadCount: 0,
          views: Math.floor(Math.random() * 50),
          escrowProtected: state.uploadSettings.enableEscrow && state.uploadSettings.escrowSettings.enabled,
          escrowAmount: state.uploadSettings.escrowSettings.enabled ? state.uploadSettings.escrowSettings.amount : undefined,
          escrowStatus: state.uploadSettings.escrowSettings.enabled ? 'pending' : 'none',
          accessLevel: state.uploadSettings.escrowSettings.enabled ? 'escrow' : 
                      state.uploadSettings.requirePassword ? 'password' : 'public',
          unlockPrice: state.uploadSettings.escrowSettings.enabled ? state.uploadSettings.escrowSettings.amount : undefined
        }
        resolve(result)
      }, 1500)
    })
  }

  // Context7 Pattern: Enhanced Upload Handler
  const uploadFile = useCallback(async (file: File) => {
    // Add to uploads with initial progress
    dispatch({
      type: 'ADD_UPLOAD',
      payload: { file, progress: 0, status: 'uploading' }
    })

    try {
      // Simulate progressive upload
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 200))
        dispatch({
          type: 'UPDATE_UPLOAD_PROGRESS',
          payload: { file, progress }
        })
      }

      // Complete upload
      const result = await simulateUpload(file)
      
      dispatch({
        type: 'COMPLETE_UPLOAD',
        payload: { file, result }
      })

      // Update escrow state if enabled
      if (state.uploadSettings.escrowSettings.enabled) {
        dispatch({
          type: 'UPDATE_ESCROW_STATE',
          payload: {
            totalEscrowValue: state.escrowState.totalEscrowValue + state.uploadSettings.escrowSettings.amount,
            activeEscrows: state.escrowState.activeEscrows + 1
          }
        })
      }

      toast({
        title: "Upload Complete! 🎉",
        description: `${file.name} uploaded successfully${result.escrowProtected ? ' with escrow protection.' : '.'}`,
      })

      onUploadComplete?.([result])
    } catch (error) {
      dispatch({
        type: 'ERROR_UPLOAD',
        payload: { file, error: 'Upload failed' }
      })
      
      toast({
        title: "Upload Failed",
        description: `Failed to upload ${file.name}. Please try again.`,
        variant: "destructive",
      })
    }
  }, [state.uploadSettings, state.escrowState, onUploadComplete, toast, simulateUpload])

  // File selection and validation
  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return

    const validFiles = Array.from(files).filter(file => {
      // Size validation
      if (file.size > maxSize) {
        toast({
          title: "File Too Large",
          description: `${file.name} exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit.`,
          variant: "destructive",
        })
        return false
      }

      // Type validation
      const isValidType = allowedTypes.some(type => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.replace('/*', '/'))
        }
        return file.type === type
      })

      if (!isValidType) {
        toast({
          title: "Invalid File Type",
          description: `${file.name} type is not supported.`,
          variant: "destructive",
        })
        return false
      }

      return true
    })

    // Upload limit check
    if (state.uploads.length + validFiles.length > maxFiles) {
      toast({
        title: "Too Many Files",
        description: `Maximum ${maxFiles} files allowed.`,
        variant: "destructive",
      })
      return
    }

    // Upload each valid file
    validFiles.forEach(uploadFile)
  }, [maxSize, maxFiles, allowedTypes, state.uploads.length, toast, uploadFile, simulateUpload])

  // Drag and drop handlers
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    dispatch({ type: 'SET_DRAGGING', payload: false })
    handleFileSelect(e.dataTransfer.files)
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    dispatch({ type: 'SET_DRAGGING', payload: true })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    dispatch({ type: 'SET_DRAGGING', payload: false })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Copy to clipboard with enhanced feedback
  const copyToClipboard = useCallback(async (text: string, fileId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      dispatch({ type: 'SET_COPIED_LINK', payload: fileId })
      setTimeout(() => dispatch({ type: 'SET_COPIED_LINK', payload: null }), 2000)
      
      toast({
        title: "Link Copied! 📋",
        description: "Share link has been copied to your clipboard.",
      })
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy link to clipboard.",
        variant: "destructive",
      })
    }
  }, [toast])

  const clearCompleted = useCallback(() => {
    dispatch({ type: 'CLEAR_COMPLETED' })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image
    if (type.startsWith('video/')) return Video
    if (type.startsWith('audio/')) return Music
    if (type.includes('pdf') || type.includes('document')) return FileText
    return Archive
  }

  return (
    <div className= "space-y-8" data-testid= "enhanced-upload-progress">
      {/* Escrow Protection Overview */}
      {enableEscrow && (
        <Card className= "bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-emerald-200" data-testid= "escrow-overview">
          <CardHeader>
            <CardTitle className= "flex items-center gap-2 text-emerald-800">
              <Shield className= "h-5 w-5" />
              Escrow Protection Active
            </CardTitle>
            <CardDescription className= "text-emerald-600">
              Your file uploads are protected by our enterprise-grade escrow system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className= "grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className= "text-center">
                <div className= "text-2xl font-bold text-emerald-700">${state.escrowState.totalEscrowValue.toLocaleString()}</div>
                <div className= "text-sm text-emerald-600">Total Protected</div>
              </div>
              <div className= "text-center">
                <div className= "text-2xl font-bold text-emerald-700">{state.escrowState.activeEscrows}</div>
                <div className= "text-sm text-emerald-600">Active Escrows</div>
              </div>
              <div className= "text-center">
                <div className= "text-2xl font-bold text-emerald-700">{state.escrowState.pendingReleases}</div>
                <div className= "text-sm text-emerald-600">Pending Releases</div>
              </div>
              <div className= "text-center">
                <div className= "text-2xl font-bold text-emerald-700">{state.escrowState.completedProjects}</div>
                <div className= "text-sm text-emerald-600">Completed Projects</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Zone */}
      <Card data-testid= "upload-zone-card">
        <CardHeader>
          <CardTitle className= "flex items-center gap-2">
            <Upload className= "h-5 w-5 text-primary" />
            Upload & Share Files
          </CardTitle>
          <CardDescription>
            Drag and drop files or click to browse. {enableEscrow ? 'Escrow protection available.' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className= "space-y-6">
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              state.isDragging 
                ? "border-primary bg-primary/5" 
                : 'border-muted-foreground/25 hover:border-primary/50'
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            data-testid="upload-drop-zone"
          >
            <Upload className= "h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className= "text-lg font-semibold mb-2">
              {state.isDragging ? "Drop files here" : "Choose files to upload"}
            </h3>
            <p className= "text-muted-foreground mb-4">
              Support for images, videos, audio, documents and more
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              data-testid="browse-files-btn"
            >
              Browse Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={allowedTypes.join(',')}
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
              data-testid="file-input"
            />
          </div>

          {/* Upload Settings */}
          <div className= "grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className= "space-y-4">
              <h4 className= "font-semibold text-sm">Upload Settings</h4>
              
              <div className= "flex items-center justify-between">
                <Label htmlFor= "public-upload">Public Upload</Label>
                <Switch
                  id= "public-upload"
                  checked={state.uploadSettings.isPublic}
                  onCheckedChange={(checked) => 
                    dispatch({ type: 'UPDATE_UPLOAD_SETTINGS', payload: { isPublic: checked } })
                  }
                />
              </div>
              
              <div className= "flex items-center justify-between">
                <Label htmlFor= "require-password">Require Password</Label>
                <Switch
                  id= "require-password"
                  checked={state.uploadSettings.requirePassword}
                  onCheckedChange={(checked) => 
                    dispatch({ type: 'UPDATE_UPLOAD_SETTINGS', payload: { requirePassword: checked } })
                  }
                />
              </div>

              <div className= "flex items-center justify-between">
                <Label htmlFor= "enable-escrow">Enable Escrow Protection</Label>
                <Switch
                  id= "enable-escrow"
                  checked={state.uploadSettings.enableEscrow}
                  onCheckedChange={(checked) => 
                    dispatch({ type: 'UPDATE_UPLOAD_SETTINGS', payload: { enableEscrow: checked } })
                  }
                />
              </div>

              {state.uploadSettings.requirePassword && (
                <div>
                  <Label htmlFor= "password">Access Password</Label>
                  <Input
                    id= "password"
                    type="password"
                    value={state.uploadSettings.password}
                    onChange={(e) => 
                      dispatch({ type: 'UPDATE_UPLOAD_SETTINGS', payload: { password: e.target.value } })
                    }
                    placeholder="Enter password"
                  />
                </div>
              )}
            </div>

            {/* Escrow Settings */}
            {state.uploadSettings.enableEscrow && (
              <div className= "space-y-4">
                <h4 className= "font-semibold text-sm flex items-center gap-2">
                  <Shield className= "h-4 w-4 text-emerald-600" />
                  Escrow Settings
                </h4>
                
                <div className= "flex items-center justify-between">
                  <Label htmlFor= "escrow-enabled">Enable for this upload</Label>
                  <Switch
                    id= "escrow-enabled"
                    checked={state.uploadSettings.escrowSettings.enabled}
                    onCheckedChange={(enabled) => 
                      dispatch({ type: 'UPDATE_ESCROW_SETTINGS', payload: { enabled } })
                    }
                  />
                </div>

                {state.uploadSettings.escrowSettings.enabled && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor= "escrow-amount">Amount</Label>
                        <Input
                          id= "escrow-amount"
                          type="number"
                          value={state.uploadSettings.escrowSettings.amount}
                          onChange={(e) => 
                            dispatch({ type: 'UPDATE_ESCROW_SETTINGS', payload: { amount: Number(e.target.value) } })
                          }
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor= "escrow-currency">Currency</Label>
                        <Select
                          value={state.uploadSettings.escrowSettings.currency}
                          onValueChange={(currency) => 
                            dispatch({ type: 'UPDATE_ESCROW_SETTINGS', payload: { currency } })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value= "USD">USD</SelectItem>
                            <SelectItem value= "EUR">EUR</SelectItem>
                            <SelectItem value= "GBP">GBP</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor= "protection-level">Protection Level</Label>
                      <Select
                        value={state.uploadSettings.escrowSettings.protectionLevel}
                        onValueChange={(protectionLevel: 'basic' | 'standard' | 'premium') => 
                          dispatch({ type: 'UPDATE_ESCROW_SETTINGS', payload: { protectionLevel } })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value= "basic">Basic ($1.99)</SelectItem>
                          <SelectItem value= "standard">Premium ($4.99)</SelectItem>
                          <SelectItem value= "premium">Enterprise ($9.99)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>
            )}

            <div className= "space-y-4">
              <h4 className= "font-semibold text-sm">Message Settings</h4>
              
              <div>
                <Label htmlFor= "custom-message">Custom Message for Recipients</Label>
                <Textarea
                  id= "custom-message"
                  value={state.uploadSettings.customMessage}
                  onChange={(e) => 
                    dispatch({ type: 'UPDATE_UPLOAD_SETTINGS', payload: { customMessage: e.target.value } })
                  }
                  placeholder="Add a personal message..."
                  rows={3}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {state.uploads.length > 0 && (
        <Card data-testid= "upload-progress-section">
          <CardHeader className= "flex flex-row items-center justify-between">
            <div>
              <CardTitle className= "flex items-center gap-2">
                <Clock className= "h-5 w-5 text-primary" />
                Upload Progress
              </CardTitle>
              <CardDescription>
                {state.uploads.filter(u => u.status === 'uploading').length} uploading, {state.uploads.filter(u => u.status === 'completed').length} completed
              </CardDescription>
            </div>
            <Button 
              variant= "outline" 
              size= "sm" 
              onClick={clearCompleted}
              disabled={state.uploads.filter(u => u.status === 'completed').length === 0}
              data-testid="clear-completed-btn"
            >
              Clear Completed
            </Button>
          </CardHeader>
          <CardContent className= "space-y-4">
            {state.uploads.map((upload, index) => {
              const FileIcon = getFileIcon(upload.file.type)
              return (
                <div key={index} className= "flex items-center gap-4 p-4 border rounded-lg">
                  <FileIcon className= "h-8 w-8 text-muted-foreground flex-shrink-0" />
                  <div className= "flex-1 min-w-0">
                    <div className= "flex items-center justify-between mb-2">
                      <p className= "font-medium truncate">{upload.file.name}</p>
                      <Badge variant={
                        upload.status === 'completed' ? 'default' :
                        upload.status === 'error' ? 'destructive' :
                        upload.status === 'uploading' ? 'secondary' : 'outline'
                      }>
                        {upload.status === 'uploading' && `${upload.progress}%`}
                        {upload.status === 'completed' && 'Complete'}
                        {upload.status === 'error' && 'Error'}
                      </Badge>
                    </div>
                    {upload.status === 'uploading' && (
                      <Progress value={upload.progress} className= "h-2" />
                    )}
                    {upload.status === 'error' && (
                      <p className= "text-sm text-destructive">{upload.error}</p>
                    )}
                    {upload.status === 'completed' && upload.result?.escrowProtected && (
                      <div className= "flex items-center gap-2 mt-2">
                        <Shield className= "h-4 w-4 text-emerald-600" />
                        <span className= "text-sm text-emerald-600">
                          Protected by ${upload.result.escrowAmount} escrow
                        </span>
                      </div>
                    )}
                  </div>
                  {upload.status === 'uploading' && (
                    <Button
                      variant="ghost"
                      size= "sm"
                      onClick={() => dispatch({ type: 'REMOVE_UPLOAD', payload: upload.file })}
                    >
                      <X className= "h-4 w-4" />
                    </Button>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Completed Files & Share Links */}
      {state.completedFiles.length > 0 && (
        <Card data-testid= "completed-files-section">
          <CardHeader>
            <CardTitle className= "flex items-center gap-2">
              <Star className= "h-5 w-5 text-primary" />
              Share Your Files
            </CardTitle>
            <CardDescription>
              Files are ready to share! Copy links and track performance.
            </CardDescription>
          </CardHeader>
          <CardContent className= "space-y-6">
            {state.completedFiles.map((file) => (
              <div key={file.id} className= "border rounded-lg p-6 space-y-4">
                <div className= "flex items-start justify-between">
                  <div className= "flex items-center gap-3">
                    {React.createElement(getFileIcon(file.type), { className: "h-8 w-8 text-primary" })}
                    <div>
                      <h4 className= "font-semibold">{file.name}</h4>
                      <p className= "text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB • Uploaded {file.uploadedAt.toLocaleDateString()}
                      </p>
                      {file.escrowProtected && (
                        <div className= "flex items-center gap-2 mt-1">
                          <Shield className= "h-4 w-4 text-emerald-600" />
                          <Badge variant= "outline" className= "text-emerald-600 border-emerald-200">
                            ${file.escrowAmount} Escrow Protected
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className= "flex items-center gap-2 text-sm text-muted-foreground">
                    <Eye className= "h-4 w-4" />
                    {file.views} views
                  </div>
                </div>

                {/* Access Level Indicator */}
                <div className= "flex items-center gap-2">
                  {file.accessLevel === 'escrow' && (
                    <Badge className= "bg-emerald-100 text-emerald-800">
                      <Shield className="h-3 w-3 mr-1" />
                      Escrow Protected
                    </Badge>
                  )}
                  {file.accessLevel === 'password' && (
                    <Badge className= "bg-amber-100 text-amber-800">
                      <Lock className= "h-3 w-3 mr-1" />
                      Password Protected
                    </Badge>
                  )}
                  {file.accessLevel === 'public' && (
                    <Badge className= "bg-green-100 text-green-800">
                      <Globe className= "h-3 w-3 mr-1" />
                      Public Access
                    </Badge>
                  )}
                </div>

                {/* Share Links */}
                <div className= "space-y-3">
                  <div className= "flex items-center gap-2">
                    <Input
                      value={file.shareableLink}
                      readOnly
                      className="flex-1"
                      data-testid={`share-link-${file.id}`}
                    />
                    <Button
                      size= "sm"
                      variant="outline"
                      onClick={() => copyToClipboard(file.shareableLink, file.id)}
                      className="shrink-0"
                      data-testid={`copy-share-btn-${file.id}`}
                    >
                      {state.copiedLink === file.id ? (
                        <Check className= "h-4 w-4" />
                      ) : (
                        <Copy className= "h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  <div className= "flex items-center gap-2">
                    <Input
                      value={file.downloadUrl}
                      readOnly
                      className="flex-1"
                      data-testid={`download-link-${file.id}`}
                    />
                    <Button
                      size= "sm"
                      variant="outline"
                      onClick={() => copyToClipboard(file.downloadUrl, file.id)}
                      className="shrink-0"
                      data-testid={`copy-download-btn-${file.id}`}
                    >
                      {state.copiedLink === file.id ? (
                        <Check className= "h-4 w-4" />
                      ) : (
                        <Copy className= "h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* SEO Preview */}
                {state.uploadSettings.generateSEO && (
                  <div className= "bg-muted/50 p-3 rounded-md space-y-2">
                    <h5 className= "font-medium text-sm">SEO Preview:</h5>
                    <div className= "text-sm">
                      <p className= "font-medium text-primary">{file.seo?.title}</p>
                      <p className= "text-muted-foreground text-xs">{file.seo?.description}</p>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className= "flex items-center gap-2 mt-4">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="outline" size="sm" className="ml-auto">
                    <Heart className="h-4 w-4 mr-2" />
                    Like
                  </Button>
                </div>

                {/* File Analytics */}
                <div className= "border-t pt-4">
                  <h5 className= "font-medium text-sm mb-3">File Analytics</h5>
                  <div className= "grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <p className= "font-bold text-lg">{file.views}</p>
                      <p className= "text-xs text-muted-foreground">Views</p>
                    </div>
                    <div>
                      <p className= "font-bold text-lg">{file.downloadCount}</p>
                      <p className= "text-xs text-muted-foreground">Downloads</p>
                    </div>
                    <div>
                      <p className= "font-bold text-lg">{(file.views && file.downloadCount) ? ((file.downloadCount / file.views) * 100).toFixed(1) : 0}%</p>
                      <p className= "text-xs text-muted-foreground">Conversion</p>
                    </div>
                    <div>
                      <div className= "flex items-center justify-center text-lg font-bold text-green-600">
                        <TrendingUp className="h-5 w-5 mr-1" />
                        <span>+5%</span>
                      </div>
                      <p className= "text-xs text-muted-foreground">vs last week</p>
                    </div>
                  </div>
                </div>

                {/* Advanced Options */}
                <div className= "border-t pt-4">
                  <h5 className= "font-medium text-sm mb-3">Advanced Options</h5>
                  <Button variant="destructive" size="sm">
                    <Zap className="h-4 w-4 mr-2" />
                    Delete File Permanently
                  </Button>
                </div>

                {/* Escrow Release Button */}
                {file.escrowStatus === 'pending' && (
                  <Button 
                    size= "sm" 
                    variant= "outline" 
                    className="flex-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  >
                    <Unlock className= "h-4 w-4 mr-2" />
                    Release Escrow
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Marketing Footer */}
      <Card className= "bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-purple-200">
        <CardContent className= "p-6">
          <div className= "text-center space-y-4">
            <div className= "flex justify-center items-center gap-2">
              <Heart className= "h-5 w-5 text-red-500" />
              <span className= "font-semibold">Powered by {brandName}</span>
            </div>
            <p className= "text-sm text-muted-foreground">
              Professional file sharing with enterprise-grade security and escrow protection
            </p>
            <div className= "flex justify-center items-center gap-6 text-sm">
              <div className= "flex items-center gap-1">
                <TrendingUp className= "h-4 w-4 text-green-600" />
                <span>{state.sharingStats.totalShares} shares</span>
              </div>
              <div className= "flex items-center gap-1">
                <Zap className= "h-4 w-4 text-yellow-600" />
                <span>{state.sharingStats.conversionRate}% conversion</span>
              </div>
              <div className= "flex items-center gap-1">
                <Shield className= "h-4 w-4 text-emerald-600" />
                <span>Escrow Protected</span>
              </div>
            </div>
            <Button size= "sm" variant= "outline" className= "mt-4">
              Upgrade to Premium
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 