'use client'

import { useEffect, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function JavaScriptDisabledFallback() {
  const [hasJavaScript, setHasJavaScript] = useState<any>(true)

  useEffect(() => {
    setHasJavaScript(true)
  }, [])

  // This will only be rendered on the server and when JavaScript is disabled
  if (hasJavaScript) {
    return null
  }

  return (
    <noscript>
      <div className="fixed inset-0 flex items-center justify-center p-4 bg-background/80 backdrop-blur" data-testid="js-disabled-fallback">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>JavaScript is Required</AlertTitle>
            <AlertDescription>
              <p className="text-lg text-gray-600 mb-4">
                Please enable JavaScript in your browser to use all features of KAZI.
              </p>
              <div className="mt-4">
                <h3 className="font-semibold">Limited Functionality Available:</h3>
                <ul className="list-disc list-inside mt-2">
                  <li>View basic content</li>
                  <li>Access static pages</li>
                  <li>Read documentation</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </noscript>
  )
} 