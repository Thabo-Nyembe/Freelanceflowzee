'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { StorageProvider } from '@/lib/storage/providers'
import { Cloud, CloudCog, Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

interface StorageConnectionDialogProps {
  onConnectionComplete?: () => void
}

interface ProviderInfo {
  id: StorageProvider
  name: string
  icon: string
  color: string
  description: string
  authUrl: string
}

const PROVIDERS: ProviderInfo[] = [
  {
    id: 'google-drive',
    name: 'Google Drive',
    icon: '📁',
    color: 'bg-blue-500',
    description: 'Connect to Google Drive for seamless file access',
    authUrl: '/api/storage/auth/google-drive'
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    icon: '📦',
    color: 'bg-blue-600',
    description: 'Sync files from your Dropbox account',
    authUrl: '/api/storage/auth/dropbox'
  },
  {
    id: 'onedrive',
    name: 'OneDrive',
    icon: '☁️',
    color: 'bg-blue-700',
    description: 'Access Microsoft OneDrive files',
    authUrl: '/api/storage/auth/onedrive'
  },
  {
    id: 'box',
    name: 'Box',
    icon: '📂',
    color: 'bg-blue-800',
    description: 'Connect to Box for enterprise file storage',
    authUrl: '/api/storage/auth/box'
  },
  {
    id: 'icloud',
    name: 'iCloud Drive',
    icon: '☁️',
    color: 'bg-gray-600',
    description: 'Access your Apple iCloud files',
    authUrl: '/api/storage/auth/icloud'
  }
]

export function StorageConnectionDialog({ onConnectionComplete }: StorageConnectionDialogProps) {
  const [open, setOpen] = useState(false)
  const [connecting, setConnecting] = useState<StorageProvider | null>(null)

  const handleConnect = async (provider: ProviderInfo) => {
    setConnecting(provider.id)

    try {
      // Redirect to OAuth provider
      const redirectUrl = `${window.location.origin}/api/storage/callback`
      const state = btoa(JSON.stringify({
        provider: provider.id,
        returnTo: window.location.pathname
      }))

      // Build OAuth URL based on provider
      let authUrl = ''

      switch (provider.id) {
        case 'google-drive':
          authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
            `client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&` +
            `redirect_uri=${encodeURIComponent(redirectUrl)}&` +
            `response_type=code&` +
            `scope=${encodeURIComponent('https://www.googleapis.com/auth/drive.readonly')}&` +
            `state=${state}&` +
            `access_type=offline&` +
            `prompt=consent`
          break

        case 'dropbox':
          authUrl = `https://www.dropbox.com/oauth2/authorize?` +
            `client_id=${process.env.NEXT_PUBLIC_DROPBOX_APP_KEY}&` +
            `redirect_uri=${encodeURIComponent(redirectUrl)}&` +
            `response_type=code&` +
            `state=${state}&` +
            `token_access_type=offline`
          break

        case 'onedrive':
          authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
            `client_id=${process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID}&` +
            `redirect_uri=${encodeURIComponent(redirectUrl)}&` +
            `response_type=code&` +
            `scope=${encodeURIComponent('Files.Read.All offline_access')}&` +
            `state=${state}`
          break

        default:
          toast.error(`${provider.name} integration coming soon!`)
          setConnecting(null)
          return
      }

      // Redirect to OAuth provider
      window.location.href = authUrl
    } catch (error) {
      console.error('Connection error:', error)
      toast.error(`Failed to connect to ${provider.name}`)
      setConnecting(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <CloudCog className="w-4 h-4" />
          Connect Storage
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Cloud className="w-6 h-6 text-blue-500" />
            Connect Storage Providers
          </DialogTitle>
          <DialogDescription>
            Connect your cloud storage accounts to access all your files in one place.
            Your credentials are encrypted and secure.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {PROVIDERS.map((provider) => (
            <button
              key={provider.id}
              onClick={() => handleConnect(provider)}
              disabled={connecting !== null}
              className="group relative overflow-hidden rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-all p-4 text-left hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-lg ${provider.color} flex items-center justify-center text-2xl flex-shrink-0`}>
                  {provider.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {provider.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {provider.description}
                  </p>
                </div>
              </div>

              {connecting === provider.id && (
                <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Secure Authentication</p>
              <p className="text-blue-700">
                We use OAuth 2.0 for secure authentication. We never store your passwords,
                and you can revoke access at any time from your provider's settings.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
