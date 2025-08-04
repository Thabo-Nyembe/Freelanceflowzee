'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Share2, Link as LinkIcon, Code, Check } from 'lucide-react'
import { toast } from 'sonner'

interface VideoShareActionsProps {
  videoId: string
  currentUrl: string
  embedUrl: string
  title?: string
}

export function VideoShareActions({ videoId, currentUrl, embedUrl, title }: VideoShareActionsProps) {
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedEmbed, setCopiedEmbed] = useState(false)

  const copyToClipboard = async (text: string, type: 'link' | 'embed') => {
    try {
      await navigator.clipboard.writeText(text)
      
      if (type === 'link') {
        setCopiedLink(true)
        setTimeout(() => setCopiedLink(false), 2000)
        toast.success('Link copied to clipboard!')
      } else {
        setCopiedEmbed(true)
        setTimeout(() => setCopiedEmbed(false), 2000)
        toast.success('Embed code copied to clipboard!')
      }
    } catch (error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const handleShareLink = () => {
    copyToClipboard(currentUrl, 'link')
  }

  const handleShareEmbed = () => {
    const embedCode = `<iframe src="${embedUrl}" width="640" height="360" frameborder="0" allowfullscreen></iframe>`
    copyToClipboard(embedCode, 'embed')
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'Video',
          url: currentUrl,
        })
      } catch (error) {
        // User canceled share or share failed
        handleShareLink()
      }
    } else {
      handleShareLink()
    }
  }

  return (
    <div className="space-y-3">
      <Button 
        variant="outline" 
        className="w-full justify-start"
        onClick={handleShareLink}
        disabled={copiedLink}
      >
        {copiedLink ? (
          <>
            <Check className="h-4 w-4 mr-2" />
            Copied!
          </>
        ) : (
          <>
            <LinkIcon className="h-4 w-4 mr-2" />
            Copy Link
          </>
        )}
      </Button>
      
      <Button 
        variant="outline" 
        className="w-full justify-start"
        onClick={handleShareEmbed}
        disabled={copiedEmbed}
      >
        {copiedEmbed ? (
          <>
            <Check className="h-4 w-4 mr-2" />
            Copied!
          </>
        ) : (
          <>
            <Code className="h-4 w-4 mr-2" />
            Copy Embed Code
          </>
        )}
      </Button>

      {navigator.share && (
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={handleNativeShare}
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      )}
    </div>
  )
}