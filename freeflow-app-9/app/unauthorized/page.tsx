import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Home, ArrowLeft, FileText } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Logo/Brand */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            FreeflowZee
          </span>
        </div>

        <Card className="border-red-200">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-red-500" />
            </div>
            <CardTitle className="text-red-800">Access Denied</CardTitle>
            <CardDescription className="text-red-600">
              You don&apos;t have permission to access this resource. This could be because:
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600 space-y-2">
              <ul className="list-disc list-inside space-y-1 text-left">
                <li>You&apos;re not logged in</li>
                <li>Your session has expired</li>
                <li>You don&apos;t have the required permissions</li>
                <li>The content is private</li>
              </ul>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              <Button asChild>
                <Link href="/login" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Sign In
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/" className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Go Home
                </Link>
              </Button>
            </div>
            
            <p className="text-xs text-gray-500">
              If you believe this is an error, please{' '}
              <Link href="/contact" className="text-blue-600 hover:underline">
                contact support
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 