'use client'

/**
 * Guest Upload Wizard Component
 *
 * One-time paid file upload without subscription
 * Perfect for sharing large files occasionally
 */

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Upload,
  CreditCard,
  Download,
  Check,
  File,
  DollarSign,
  Clock,
  Shield,
  Zap,
  Copy
} from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('GuestUploadWizard')

type Step = 'info' | 'payment' | 'upload' | 'complete'

export function GuestUploadWizard() {
  const [step, setStep] = useState<Step>('info')
  const [email, setEmail] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploadLink, setUploadLink] = useState('')
  const [amount, setAmount] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [downloadLink, setDownloadLink] = useState('')

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file size (max 25GB)
      const maxSize = 25 * 1024 * 1024 * 1024
      if (selectedFile.size > maxSize) {
        toast.error('File size exceeds 25GB limit')
        return
      }
      setFile(selectedFile)
      logger.info('File selected', {
        fileName: selectedFile.name,
        fileSize: selectedFile.size
      })
    }
  }

  const handleInitiateUpload = async () => {
    if (!file || !email) {
      toast.error('Please provide email and select a file')
      return
    }

    setIsProcessing(true)

    try {
      const response = await fetch('/api/guest-upload/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          fileSize: file.size,
          fileName: file.name
        })
      })

      const data = await response.json()

      if (data.success) {
        setUploadLink(data.uploadLink)
        setAmount(data.amount)
        setStep('payment')

        logger.info('Upload initiated', {
          uploadLink: data.uploadLink,
          amount: data.amount
        })

        toast.success(`Ready to upload! Price: $${data.amount}`)
      } else {
        toast.error(data.error || 'Failed to initiate upload')
      }
    } catch (error) {
      logger.error('Failed to initiate upload', { error })
      toast.error('Failed to initiate upload')
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePaymentAndUpload = async () => {
    if (!file || !uploadLink) return

    setIsProcessing(true)
    setStep('upload')

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Upload file
      const formData = new FormData()
      formData.append('file', file)
      formData.append('uploadLink', uploadLink)

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch('/api/guest-upload/upload', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const data = await response.json()

      if (data.success) {
        setDownloadLink(data.downloadLink)
        setStep('complete')

        logger.info('Upload completed successfully', {
          downloadLink: data.downloadLink
        })

        toast.success('Upload complete! Share your link now.')
      } else {
        toast.error(data.error || 'Upload failed')
        setStep('payment')
      }
    } catch (error) {
      logger.error('Upload failed', { error })
      toast.error('Upload failed')
      setStep('payment')
    } finally {
      setIsProcessing(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
  }

  const copyLink = () => {
    navigator.clipboard.writeText(downloadLink)
    toast.success('Link copied to clipboard!')
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="shadow-2xl border-2">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">Guest File Upload</CardTitle>
              <CardDescription className="text-base">
                Share large files with one-time payment - No subscription needed
              </CardDescription>
            </div>
          </div>

          {/* Step Indicators */}
          <div className="flex justify-between mt-6">
            {['info', 'payment', 'upload', 'complete'].map((s, index) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`flex items-center ${index === 0 ? '' : 'w-full'}`}>
                  {index > 0 && (
                    <div className={`flex-1 h-1 ${step === s || ['payment', 'upload', 'complete'].indexOf(step) > ['info', 'payment', 'upload', 'complete'].indexOf(s) ? 'bg-blue-500' : 'bg-gray-300'}`} />
                  )}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === s ? 'bg-blue-500 text-white' : ['payment', 'upload', 'complete'].indexOf(step) > index ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                    {['payment', 'upload', 'complete'].indexOf(step) > index ? <Check className="w-5 h-5" /> : index + 1}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {/* Step 1: Info */}
          {step === 'info' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-base">Your Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="mt-2 text-base"
                    required
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    We'll send the download link to this email
                  </p>
                </div>

                <div>
                  <Label htmlFor="file" className="text-base">Select File *</Label>
                  <div className="mt-2">
                    <Input
                      id="file"
                      type="file"
                      onChange={handleFileSelect}
                      className="cursor-pointer"
                      required
                    />
                  </div>
                  {file && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg flex items-center gap-3">
                      <File className="w-8 h-8 text-blue-500" />
                      <div className="flex-1">
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing Info */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 p-6 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Pricing - One-Time Payment
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { range: '1GB - 6GB', price: 'FREE! 🎉', validity: '7 days', highlight: true },
                    { range: '6GB - 10GB', price: '$5', validity: '30 days', highlight: false },
                    { range: '10GB - 15GB', price: '$10', validity: '30 days', highlight: false },
                    { range: '15GB - 20GB', price: '$15', validity: '30 days', highlight: false },
                    { range: '20GB - 25GB', price: '$20', validity: '30 days', highlight: false },
                    { range: '25GB+', price: '$25', validity: '30 days', highlight: false }
                  ].map((tier) => (
                    <div key={tier.range} className={`${tier.highlight ? 'bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 border-2 border-green-500' : 'bg-white dark:bg-gray-900'} p-3 rounded-lg`}>
                      <p className="text-sm font-medium">{tier.range}</p>
                      <p className={`text-2xl font-bold ${tier.highlight ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}>{tier.price}</p>
                      <p className="text-xs text-muted-foreground mt-1">{tier.validity}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Clock, text: 'Up to 30 days' },
                  { icon: Download, text: '10 downloads' },
                  { icon: Shield, text: 'Secure storage' },
                  { icon: Zap, text: 'Instant access' }
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <feature.icon className="w-4 h-4 text-green-500" />
                    <span>{feature.text}</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleInitiateUpload}
                disabled={!file || !email || isProcessing}
                className="w-full text-lg py-6 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                size="lg"
              >
                {isProcessing ? 'Processing...' : 'Continue to Payment'}
              </Button>
            </motion.div>
          )}

          {/* Step 2: Payment */}
          {step === 'payment' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 text-center"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
                <CreditCard className="w-10 h-10 text-white" />
              </div>

              <div>
                {amount === 0 ? (
                  <>
                    <h3 className="text-3xl font-bold mb-2 text-green-600 dark:text-green-400">FREE! 🎉</h3>
                    <p className="text-muted-foreground">No payment required</p>
                  </>
                ) : (
                  <>
                    <h3 className="text-3xl font-bold mb-2">${amount}</h3>
                    <p className="text-muted-foreground">One-time payment</p>
                  </>
                )}
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <p className="text-sm"><strong>File:</strong> {file?.name}</p>
                <p className="text-sm"><strong>Size:</strong> {file && formatFileSize(file.size)}</p>
                <p className="text-sm"><strong>Valid for:</strong> {amount === 0 ? '7 days' : '30 days'}</p>
                <p className="text-sm"><strong>Max downloads:</strong> 10</p>
              </div>

              {amount === 0 ? (
                <Alert>
                  <AlertDescription>
                    🎉 <strong>This upload is FREE!</strong> Your file will be valid for 7 days with up to 10 downloads.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert>
                  <AlertDescription>
                    💡 For demo purposes, payment is simulated. In production, Stripe payment would be integrated here.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep('info')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handlePaymentAndUpload}
                  disabled={isProcessing}
                  className={`flex-1 ${amount === 0 ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600' : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'}`}
                >
                  {isProcessing ? 'Processing...' : amount === 0 ? 'Upload for Free' : `Pay $${amount} & Upload`}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Uploading */}
          {step === 'upload' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6 text-center py-8"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <Upload className="w-10 h-10 text-white" />
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-2">Uploading Your File...</h3>
                <p className="text-muted-foreground">Please wait while we upload your file securely</p>
              </div>

              <div className="max-w-md mx-auto">
                <Progress value={uploadProgress} className="h-3" />
                <p className="text-sm text-muted-foreground mt-2">{uploadProgress}% complete</p>
              </div>
            </motion.div>
          )}

          {/* Step 4: Complete */}
          {step === 'complete' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 text-center"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-10 h-10 text-white" />
              </div>

              <div>
                <h3 className="text-3xl font-bold mb-2">Upload Complete!</h3>
                <p className="text-muted-foreground text-lg">Your file is ready to share</p>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 p-6 rounded-lg border-2 border-green-200 dark:border-green-800">
                <Label className="text-base font-semibold mb-3 block">Shareable Download Link</Label>
                <div className="flex gap-2">
                  <Input
                    value={downloadLink}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button onClick={copyLink} size="icon" variant="outline">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-center gap-4 mt-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Expires in {amount === 0 ? '7 days' : '30 days'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    10 downloads max
                  </span>
                </div>
              </div>

              <Alert>
                <AlertDescription>
                  ✅ A confirmation email with the download link has been sent to <strong>{email}</strong>
                </AlertDescription>
              </Alert>

              <Button
                onClick={() => {
                  setStep('info')
                  setFile(null)
                  setEmail('')
                  setUploadLink('')
                  setAmount(0)
                  setUploadProgress(0)
                  setDownloadLink('')
                }}
                variant="outline"
                className="w-full"
              >
                Upload Another File
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
