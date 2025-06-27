// Context7 Enhanced Smart Download Button with External Links & Monetization
'use client

import React, { useState, useCallback } from 'react
import { Button } from '@/components/ui/button'
 progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 200))
      setDownloadProgress(progress)
    }

    // Trigger actual download
    const link = document.createElement('a')
    link.href = file.url
    link.download = file.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Track download completion
    if (trackingEnabled) {
      await trackEvent('download_completed', { 
        fileId: file.id, 
        fileName: file.name,
        fileSize: file.size,
        revenue: file.price || 0
      })
    }

    setIsDownloading(false)
    setDownloadProgress(0)
    onDownload?.(file.id)

    toast({
      title: "Download Started! 🚀",
      description: `${file.name} is downloading to your device.`,
    })
  }

  // Copy external link to clipboard
  const copyExternalLink = async () => {
    const link = generateExternalShareLink()
    
    try {
      await navigator.clipboard.writeText(link)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)

      // Track link copy
      if (trackingEnabled) {
        await trackEvent('link_copied', { fileId: file.id, linkType: 'external_share' })
      }

      toast({
        title: "External Link Copied! 📋",
        description: "Share this SEO-optimized link anywhere. It works like WeTransfer!",
      })
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy link to clipboard.",
        variant: "destructive
      })
    }
  }

  // Share to social platforms with tracking
  const shareToSocial = async (platform: string) => {
    const link = generateExternalShareLink()
    const text = encodeURIComponent(`Check out this file: ${file.name}`)
    
    let shareUrl = 
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(link)}
        break
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}
        break
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}
        break
      case 'email':
        const subject = encodeURIComponent(`Download: ${file.name}`)
        const body = encodeURIComponent(`Please download the file using this link: ${link}`)
        shareUrl = `mailto:?subject=${subject}&body=${body}
        break
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400')
      
      // Track social share
      if (trackingEnabled) {
        await trackEvent('social_share', { 
          fileId: file.id, 
          platform,
          linkType: 'external_share
        })
        
        // Update metrics
        setShareMetrics(prev => ({
          ...prev,
          totalShares: prev.totalShares + 1,
          platformBreakdown: {
            ...prev.platformBreakdown,
            social: prev.platformBreakdown.social + 1
          }
        }))
      }

      onShare?.(file.id, platform)
      setShareDialogOpen(false)

      toast({
        title: `Shared to ${platform}! 🎉`,
        description: "Your file link has been shared successfully.",
      })
    }
  }

  // Track events for analytics
  const trackEvent = async (eventName: string, data: unknown) => {
    try {
      await fetch('/api/analytics/track-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: eventName,
          data,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          referrer: document.referrer
        })
      })
    } catch (error) {
      console.error('Analytics tracking failed:', error)
    }
  }

  // Handle payment for premium files
  const handlePayment = async () => {
    if (!file.price) return

    // Track payment initiation
    if (trackingEnabled) {
      await trackEvent('payment_initiated', { 
        fileId: file.id, 
        amount: file.price, 
        currency: file.currency 
      })
    }

    onPayment?.(file.id, file.price)
    setPaymentDialogOpen(false)

    toast({
      title: "Processing Payment... 💳",
      description: "Redirecting to secure payment gateway.",
    })
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  // Format currency
  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount)
  }

  return (
    <div className= "space-y-4">
      {/* Main Download Button */}
      <div className= "flex gap-2">
        <Button
          onClick={handleDownload}
          disabled={isDownloading}
          className={`flex-1 gap-2 ${
            variant === 'premium' ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700' :
            variant === 'freemium' ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' :
            
          }`}
        >
          {isDownloading ? (
            <>
              <div className= "animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              Downloading... {downloadProgress}%
            </>
          ) : (
            <>
              <Download className= "h-4 w-4" />
              {file.requiresPayment ? `Download - ${formatCurrency(file.price || 0, file.currency)}` : 'Download'}
              {variant === 'premium' && <Star className= "h-4 w-4" />}
            </>
          )}
        </Button>

        <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
          <DialogTrigger asChild>
            <Button variant= "outline" size= "icon">
              <Share2 className= "h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className= "sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Share File - WeTransfer Style</DialogTitle>
              <DialogDescription>
                Generate an external link that works like WeTransfer, Dropbox, or Pixelset
              </DialogDescription>
            </DialogHeader>
            
            {/* External Link */}
            <div className= "space-y-4">
              <div className= "space-y-2">
                <Label>External Share Link (SEO Optimized)</Label>
                <div className= "flex gap-2">
                  <Input
                    value={generateExternalShareLink()}
                    readOnly
                    className= "flex-1
                  />
                  <Button
                    size= "icon
                    variant= "outline
                    onClick={copyExternalLink}
                  >
                    {copiedLink ? <Check className= "h-4 w-4" /> : <Copy className= "h-4 w-4" />}
                  </Button>
                </div>
                <p className= "text-xs text-muted-foreground">
                  This link includes UTM tracking and works on any device without login
                </p>
              </div>

              {/* Social Sharing */}
              <div className= "space-y-2">
                <Label>Share on Social Media</Label>
                <div className= "grid grid-cols-2 gap-2">
                  <Button
                    variant= "outline
                    onClick={() => shareToSocial('twitter')}
                    className= "gap-2
                  >
                    <Twitter className= "h-4 w-4" />
                    Twitter
                  </Button>
                  <Button
                    variant= "outline
                    onClick={() => shareToSocial('facebook')}
                    className= "gap-2
                  >
                    <Facebook className= "h-4 w-4" />
                    Facebook
                  </Button>
                  <Button
                    variant= "outline
                    onClick={() => shareToSocial('linkedin')}
                    className= "gap-2
                  >
                    <Linkedin className= "h-4 w-4" />
                    LinkedIn
                  </Button>
                  <Button
                    variant= "outline
                    onClick={() => shareToSocial('email')}
                    className= "gap-2
                  >
                    <Mail className= "h-4 w-4" />
                    Email
                  </Button>
                </div>
              </div>

              {/* Sharing Analytics */}
              {showAnalytics && (
                <Card>
                  <CardContent className= "p-4">
                    <div className= "space-y-3">
                      <div className= "flex items-center justify-between text-sm">
                        <span>Total Shares</span>
                        <Badge variant= "secondary">{shareMetrics.totalShares}</Badge>
                      </div>
                      <div className= "flex items-center justify-between text-sm">
                        <span>Conversion Rate</span>
                        <Badge variant= "outline">{shareMetrics.conversionRate}%</Badge>
                      </div>
                      <div className= "flex items-center justify-between text-sm">
                        <span>Revenue Generated</span>
                        <Badge className= "bg-green-100 text-green-800">
                          {formatCurrency(shareMetrics.revenueGenerated)}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Download Progress */}
      {isDownloading && (
        <div className= "space-y-2">
          <Progress value={downloadProgress} className= "h-2" />
          <div className= "flex justify-between text-xs text-muted-foreground">
            <span>Downloading {file.name}</span>
            <span>{formatFileSize(file.size)}</span>
          </div>
        </div>
      )}

      {/* File Info & Stats */}
      <Card className= "bg-gradient-to-r from-slate-50 to-blue-50/30">
        <CardContent className= "p-4">
          <div className= "grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className= "text-lg font-bold text-blue-600">{file.downloadCount || 0}</div>
              <p className= "text-xs text-muted-foreground">Downloads</p>
            </div>
            <div>
              <div className= "text-lg font-bold text-green-600">{file.viewCount || 0}</div>
              <p className= "text-xs text-muted-foreground">Views</p>
            </div>
            <div>
              <div className= "text-lg font-bold text-purple-600">{shareMetrics.totalShares}</div>
              <p className= "text-xs text-muted-foreground">Shares</p>
            </div>
            <div>
              <div className= "text-lg font-bold text-emerald-600">{formatCurrency(shareMetrics.revenueGenerated)}</div>
              <p className= "text-xs text-muted-foreground">Revenue</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Premium Download</DialogTitle>
            <DialogDescription>
              This file requires payment to download
            </DialogDescription>
          </DialogHeader>
          
          <div className= "space-y-4">
            <Card>
              <CardContent className= "p-4">
                <div className= "flex items-center justify-between">
                  <div>
                    <p className= "font-medium">{file.name}</p>
                    <p className= "text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                  <div className= "text-right">
                    <p className= "text-2xl font-bold">{formatCurrency(file.price || 0, file.currency)}</p>
                    <p className= "text-sm text-muted-foreground">One-time payment</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className= "flex gap-2">
              <Button onClick={handlePayment} className= "flex-1">
                <DollarSign className= "h-4 w-4 mr-2" />
                Pay & Download
              </Button>
              <Button variant= "outline" onClick={() => setPaymentDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Premium Features Upsell */}
      {enableMonetization && variant === 'freemium' && (
        <Card className= "bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardContent className= "p-4">
            <div className= "flex items-center gap-3">
              <Star className= "h-8 w-8 text-purple-600" />
              <div className= "flex-1">
                <p className= "font-medium">Upgrade to Premium</p>
                <p className= "text-sm text-muted-foreground">
                  Get advanced analytics, unlimited downloads, and priority support
                </p>
              </div>
              <Button size= "sm" className= "bg-purple-600 hover:bg-purple-700">
                <Zap className= "h-4 w-4 mr-2" />
                Upgrade
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}