'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Shield, Lock } from 'lucide-react'
import { GlowEffect } from './glow-effect'
import { BorderTrail } from './border-trail'
import { createFeatureLogger } from '@/lib/logger'
import { toast } from '@/components/ui/enhanced-toast'

const logger = createFeatureLogger('RouteGuard')

/**
 * Route Guard
 * Protects routes with authentication/authorization checks
 */
interface RouteGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  requiredRole?: string
  fallbackUrl?: string
  checkAuth?: () => boolean | Promise<boolean>
}

export function RouteGuard({
  children,
  requireAuth = false,
  requiredRole,
  fallbackUrl = '/login',
  checkAuth
}: RouteGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    async function checkAuthorization() {
      setIsChecking(true)

      try {
        // Custom auth check
        if (checkAuth) {
          const authorized = await checkAuth()
          setIsAuthorized(authorized)

          if (!authorized) {
            router.push(fallbackUrl)
          }
          return
        }

        // Default auth check using Supabase
        if (requireAuth) {
          const { createClient } = await import('@/lib/supabase/client')
          const supabase = createClient()
          const { data: { user } } = await supabase.auth.getUser()
          const isAuthenticated = !!user

          setIsAuthorized(isAuthenticated)

          if (!isAuthenticated) {
            router.push(fallbackUrl)
            return
          }
        }

        // Role check using Supabase user metadata
        if (requiredRole) {
          const { createClient } = await import('@/lib/supabase/client')
          const supabase = createClient()
          const { data: { user } } = await supabase.auth.getUser()
          const userRole = user?.user_metadata?.role || user?.app_metadata?.role || 'user'
          const hasRole = userRole === requiredRole || userRole === 'admin'

          setIsAuthorized(hasRole)

          if (!hasRole) {
            router.push('/unauthorized')
            return
          }
        }

        setIsAuthorized(true)
      } catch (error) {
        logger.error('Auth check failed', {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          pathname,
          requireAuth,
          requiredRole
        });

        const errorId = `err-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        setIsAuthorized(false)
        router.push(fallbackUrl)

        // Use enhanced error toast
        toast.error('Authorization Failed', 'Please log in to access this page', errorId);
      } finally {
        setIsChecking(false)
      }
    }

    checkAuthorization()
  }, [pathname, requireAuth, requiredRole, fallbackUrl, checkAuth, router])

  // Loading state
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative"
        >
          <GlowEffect className="absolute -inset-8 bg-gradient-to-r from-purple-500/30 to-blue-500/30 rounded-full blur-2xl" />
          <div className="relative bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
            <BorderTrail className="bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500" size={60} duration={6} />

            <div className="flex flex-col items-center gap-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Shield className="w-12 h-12 text-purple-400" />
              </motion.div>

              <p className="text-sm font-medium bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Verifying access...
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // Unauthorized state
  if (isAuthorized === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative"
        >
          <GlowEffect className="absolute -inset-8 bg-gradient-to-r from-red-500/30 to-orange-500/30 rounded-full blur-2xl" />
          <div className="relative bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border border-red-700/50 max-w-md">
            <BorderTrail className="bg-gradient-to-r from-red-500 via-orange-500 to-red-500" size={60} duration={6} />

            <div className="flex flex-col items-center gap-4 text-center">
              <div className="p-3 bg-red-500/10 rounded-full">
                <Lock className="w-8 h-8 text-red-400" />
              </div>

              <h2 className="text-xl font-bold text-white">Access Denied</h2>

              <p className="text-sm text-gray-400">
                You don't have permission to access this page. Redirecting...
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // Authorized - render children
  return <>{children}</>
}

/**
 * Role Badge
 * Display user role with premium styling
 */
export function RoleBadge({ role, className }: { role: string; className?: string }) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={className}
    >
      <div className="relative group">
        <GlowEffect className="absolute -inset-1 bg-gradient-to-r from-purple-500/30 to-blue-500/30 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative px-3 py-1 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full border border-purple-500/30">
          <span className="text-xs font-medium bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            {role}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export default RouteGuard
