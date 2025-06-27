import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { GetServerSideProps } from 'next'
 progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 300))
      setDownloadProgress(progress)
    }

    // Trigger actual download
    const link = document.createElement('a')'
    link.href = file.downloadUrl
    link.download = file.fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setIsDownloading(false)
    setDownloadProgress(0)

    toast({
      title: "Download Started! 🚀",
      description: `${file.fileName} is downloading to your device.`,
    })
  }

  const copyShareLink = async () => {
    if (!file) return

    try {
      await navigator.clipboard.writeText(file.shareUrl)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
      
      toast({
        title: "Link Copied! 📋",
        description: "Share this link with others to let them download the file.",
      })
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy link to clipboard.",
        variant: "destructive"
      })
    }
  }

  const shareNatively = async () => {
    if (!file || !navigator.share) return

    try {
      await navigator.share({
        title: file.seoTitle,
        text: file.seoDescription,
        url: file.shareUrl
      })
    } catch (error) {
      copyShareLink()
    }
  }

  if (error || !file) {
    return (
      <>
        <Head>
          <title>File Not Found - FreeflowZee</title>
          <meta name= "description" content= "The requested file could not be found or has expired." />
          <meta name= "robots" content= "noindex" />
        </Head>
        
        <div className= "min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/30 to-violet-50/40 flex items-center justify-center p-4">
          <Card className= "w-full max-w-md">
            <CardContent className= "p-8 text-center">
              <div className= "h-16 w-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
                <FileText className= "h-8 w-8 text-destructive" />
              </div>
              <h1 className= "text-xl font-semibold mb-2">File Not Found</h1>
              <p className= "text-muted-foreground mb-6">
                {error || 'The file you\'re looking for doesn\'t exist or has expired.'}
              </p>
              <Button onClick={() => window.location.href = &apos;/'}>'
                Go to Homepage
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>{file.seoTitle}</title>
        <meta name= "description" content={file.seoDescription} />
        <meta name= "keywords" content={file.seoKeywords} />
        
        {/* Open Graph */}
        <meta property= "og:title" content={file.seoTitle} />
        <meta property= "og:description" content={file.seoDescription} />
        <meta property= "og:url" content={file.shareUrl} />
        <meta property= "og:type" content= "website" />
        <meta property= "og:site_name" content= "FreeflowZee" />
        {file.thumbnailUrl && <meta property= "og:image" content={file.thumbnailUrl} />}
        
        {/* Twitter Card */}
        <meta name= "twitter:card" content= "summary_large_image" />
        <meta name= "twitter:title" content={file.seoTitle} />
        <meta name= "twitter:description" content={file.seoDescription} />
        {file.thumbnailUrl && <meta name= "twitter:image" content={file.thumbnailUrl} />}
        
        {/* Additional SEO */}
        <meta name= "author" content= "FreeflowZee" />
        <meta name= "robots" content= "index, follow" />
        <link rel= "canonical" href={file.shareUrl} />
        
        {/* JSON-LD Structured Data */}
        <script
          type= "application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org", "@type": "MediaObject", "name": file.fileName, "description": file.seoDescription, "contentUrl": file.downloadUrl, "encodingFormat": file.fileType, "contentSize": file.fileSize, "uploadDate": file.uploadedAt, "publisher": {
                "@type": "Organization", "name": "FreeflowZee", "url": "https://freeflowzee.com"
              }
            })
          }}
        />
      </Head>

      <div className= "min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/30 to-violet-50/40">
        {/* Header */}
        <header className= "border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className= "container mx-auto px-4 py-4">
            <div className= "flex items-center justify-between">
              <div className= "flex items-center gap-2">
                <Zap className= "h-8 w-8 text-primary" />
                <span className= "text-xl font-bold">FreeflowZee</span>
              </div>
              <Button variant= "outline" onClick={() => window.location.href = &apos;/'}>'
                Create Your Own
              </Button>
            </div>
          </div>
        </header>

        <main className= "container mx-auto px-4 py-8">
          <div className= "max-w-4xl mx-auto space-y-8">
            {/* Main File Card */}
            <Card className= "overflow-hidden">
              <CardContent className= "p-8">
                {!isUnlocked ? (
                  /* Password Protection */
                  <div className= "text-center space-y-6">
                    <div className= "flex items-center justify-center h-20 w-20 mx-auto bg-primary/10 rounded-full">
                      <Lock className= "h-10 w-10 text-primary" />
                    </div>
                    <div>
                      <h1 className= "text-2xl font-bold mb-2">Protected File</h1>
                      <p className= "text-muted-foreground">
                        This file is password protected. Enter the password to access it.
                      </p>
                    </div>
                    <form onSubmit={handlePasswordSubmit} className= "max-w-sm mx-auto space-y-4">
                      <div>
                        <Label htmlFor= "password">Password</Label>
                        <Input
                          id= "password"
                          type= "password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder= "Enter password"
                          required
                        />
                      </div>
                      <Button type= "submit" className= "w-full">
                        Unlock File
                      </Button>
                    </form>
                  </div>
                ) : (
                  /* File Access */
                  <div className= "space-y-6">
                    {/* File Header */}
                    <div className= "flex items-start gap-4">
                      <div className= "flex items-center justify-center h-16 w-16 bg-primary/10 rounded-xl">
                        {getFileIcon(file.fileType)}
                      </div>
                      <div className= "flex-1 space-y-2">
                        <h1 className= "text-2xl font-bold">{file.fileName}</h1>
                        <div className= "flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{formatFileSize(file.fileSize)}</span>
                          <Badge variant= "outline" className= "gap-1">
                            <Eye className= "h-3 w-3" />
                            {file.views} views
                          </Badge>
                          <Badge variant= "outline" className= "gap-1">
                            <Download className= "h-3 w-3" />
                            {file.totalDownloads} downloads
                          </Badge>
                          {file.isPublic && (
                            <Badge variant= "outline" className= "gap-1">
                              <Globe className= "h-3 w-3" />
                              Public
                            </Badge>
                          )}
                        </div>
                        <div className= "flex items-center gap-2 text-sm">
                          <Clock className= "h-4 w-4" />
                          <span>Uploaded {file.uploadedAt.toLocaleDateString()}</span>
                          {file.expiresAt && (
                            <>
                              <span>•</span>
                              <span>Expires {file.expiresAt.toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Custom Message */}
                    {file.customMessage && (
                      <div className= "bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                        <div className= "flex items-start gap-3">
                          <MessageCircle className= "h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <p className= "font-medium text-blue-900 dark:text-blue-100 mb-1">
                              Message from sender:
                            </p>
                            <p className= "text-blue-800 dark:text-blue-200">{file.customMessage}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Download Section */}
                    <div className= "space-y-4">
                      {isDownloading ? (
                        <div className= "space-y-3">
                          <div className= "flex items-center justify-between">
                            <span className= "font-medium">Downloading...</span>
                            <span className= "text-sm text-muted-foreground">{downloadProgress}%</span>
                          </div>
                          <Progress value={downloadProgress} className= "h-3" />
                        </div>
                      ) : (
                        <Button 
                          onClick={handleDownload}
                          size= "lg"
                          className= "w-full gap-2 h-12 text-lg"
                        >
                          <Download className= "h-5 w-5" />
                          Download {file.fileName}
                        </Button>
                      )}

                      <div className= "flex gap-2">
                        <Button 
                          variant= "outline" 
                          onClick={copyShareLink}
                          className= "flex-1 gap-2"
                        >
                          {copiedLink ? (
                            <Check className= "h-4 w-4" />
                          ) : (
                            <Copy className= "h-4 w-4" />
                          )}
                          {copiedLink ? 'Copied!' : 'Copy Link'}
                        </Button>
                        <Button 
                          variant= "outline" 
                          onClick={shareNatively}
                          className= "flex-1 gap-2"
                        >
                          <Share2 className= "h-4 w-4" />
                          Share
                        </Button>
                      </div>
                    </div>

                    {/* Download Limit Warning */}
                    {file.downloadsRemaining !== undefined && (
                      <div className= "bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg">
                        <p className= "text-sm text-amber-800 dark:text-amber-200">
                          <strong>Note:</strong> {file.downloadsRemaining} downloads remaining before this link expires.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Features Showcase */}
            <div className= "grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className= "p-6 text-center">
                  <Shield className= "h-8 w-8 mx-auto mb-3 text-primary" />
                  <h3 className= "font-semibold mb-2">Secure & Private</h3>
                  <p className= "text-sm text-muted-foreground">
                    End-to-end encryption and password protection for all your files.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className= "p-6 text-center">
                  <Zap className= "h-8 w-8 mx-auto mb-3 text-primary" />
                  <h3 className= "font-semibold mb-2">Lightning Fast</h3>
                  <p className= "text-sm text-muted-foreground">
                    Upload and share files at blazing speed with our optimized infrastructure.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className= "p-6 text-center">
                  <Users className= "h-8 w-8 mx-auto mb-3 text-primary" />
                  <h3 className= "font-semibold mb-2">Easy Sharing</h3>
                  <p className= "text-sm text-muted-foreground">
                    Share with anyone, anywhere. No registration required for recipients.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* CTA Section */}
            <Card className= "bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
              <CardContent className= "p-8 text-center">
                <Star className= "h-12 w-12 mx-auto mb-4 text-primary" />
                <h2 className= "text-2xl font-bold mb-3">
                  Love this file sharing experience?
                </h2>
                <p className= "text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Join thousands of users who trust FreeflowZee for secure, fast, and reliable file sharing. 
                  Create your own shareable links in seconds - no registration required!
                </p>
                <div className= "flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size= "lg" onClick={() => window.location.href = &apos;/'}>'
                    <Zap className= "h-5 w-5 mr-2" />
                    Start Sharing for Free
                  </Button>
                  <Button variant= "outline" size= "lg">
                    <TrendingUp className= "h-5 w-5 mr-2" />
                    View Pricing
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Trust Indicators */}
            <div className= "flex flex-wrap justify-center items-center gap-8 py-8 opacity-60">
              <div className= "flex items-center gap-2">
                <Monitor className= "h-5 w-5" />
                <span className= "text-sm">Desktop & Mobile</span>
              </div>
              <div className= "flex items-center gap-2">
                <Shield className= "h-5 w-5" />
                <span className= "text-sm">SSL Encrypted</span>
              </div>
              <div className= "flex items-center gap-2">
                <Heart className= "h-5 w-5" />
                <span className= "text-sm">Loved by 100K+ Users</span>
              </div>
              <div className= "flex items-center gap-2">
                <Smartphone className= "h-5 w-5" />
                <span className= "text-sm">Works Everywhere</span>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className= "border-t bg-white/80 backdrop-blur-sm mt-16">
          <div className= "container mx-auto px-4 py-8">
            <div className= "flex flex-col md:flex-row items-center justify-between">
              <div className= "flex items-center gap-2 mb-4 md:mb-0">
                <Zap className= "h-6 w-6 text-primary" />
                <span className= "font-semibold">FreeflowZee</span>
                <span className= "text-muted-foreground">• Secure File Sharing</span>
              </div>
              <div className= "flex items-center gap-6 text-sm text-muted-foreground">
                <a href= "/privacy" className= "hover:text-primary">Privacy</a>
                <a href= "/terms" className= "hover:text-primary">Terms</a>
                <a href= "/contact" className= "hover:text-primary">Contact</a>
                <a href= "/help" className= "hover:text-primary">Help</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { fileId } = context.params!
  
  try {
    // In a real app, fetch from your database
    // This is a mock implementation
    const mockFile: SharedFile = {
      id: fileId as string,
      fileName: `sample-file-${fileId}.zip`,
      fileSize: 15728640, // 15MB
      fileType: 'application/zip',
      downloadUrl: `/api/files/${fileId}/download`,
      shareUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://freeflowzee.com'}/share/${fileId}`,
      seoTitle: `Download sample-file-${fileId}.zip - Free Secure File Sharing | FreeflowZee`,
      seoDescription: `Download sample-file-${fileId}.zip (15 MB) for free. Fast, secure file sharing with FreeflowZee. No registration required. Share files easily with direct download links.`,
      seoKeywords: 'file sharing, download, secure, free, fast, file transfer, cloud storage, FreeflowZee',
      uploadedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      totalDownloads: Math.floor(Math.random() * 1000),
      views: Math.floor(Math.random() * 5000),
      isPublic: true,
      requiresPassword: false,
      customMessage: 'Thanks for checking out this file! Feel free to download and share.',
      uploaderName: 'FreeflowZee Demo'
    }

    return {
      props: {
        file: JSON.parse(JSON.stringify(mockFile)) // Serialize dates
      }
    }
  } catch (error) {
    return {
      props: {
        file: null,
        error: 'File not found or has expired'
      }
    }
  }
} 