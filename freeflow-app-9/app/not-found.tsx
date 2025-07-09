import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, ArrowLeft, Search, FileText } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center space-y-8">
        {/* Logo/Brand */}
        <div className="flex items-center gap-3 mb-6">
          <img 
            src="/kazi-brand/logo.svg" 
            alt="KAZI" 
            className="h-8 w-auto"
          />
          <span className="text-2xl font-bold text-purple-600">KAZI</span>
        </div>

        {/* 404 Error */}
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-gray-800">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700">Page Not Found</h2>
          <p className="text-gray-600 text-lg">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved, deleted, or the URL might be incorrect.
          </p>
        </div>

        {/* Actions */}
        <Card className="p-6">
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button asChild className="w-full">
                <Link href="/" className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Go Home
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/dashboard" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Dashboard
                </Link>
              </Button>
            </div>
            
            <div className="pt-4 border-t">
              <h3 className="font-semibold text-gray-700 mb-3">Try these popular pages:</h3>
              <div className="space-y-2">
                <Button variant="ghost" asChild className="w-full justify-start">
                  <Link href="/video-studio">AI Video Studio</Link>
                </Button>
                <Button variant="ghost" asChild className="w-full justify-start">
                  <Link href="/dashboard/projects-hub">Projects Hub</Link>
                </Button>
                <Button variant="ghost" asChild className="w-full justify-start">
                  <Link href="/community">Community</Link>
                </Button>
                <Button variant="ghost" asChild className="w-full justify-start">
                  <Link href="/features">Features</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help Text */}
        <p className="text-sm text-gray-500">
          If you believe this is an error, please{' '}
          <Link href="/contact" className="text-blue-600 hover:underline">
            contact support
          </Link>
          {' '}for assistance.
        </p>
      </div>
    </div>
  )
} 