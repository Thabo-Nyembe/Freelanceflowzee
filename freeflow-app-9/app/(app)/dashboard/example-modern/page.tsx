/**
 * Example Modern Next.js 14 Server Component Page
 *
 * Demonstrates latest patterns from Next.js 14.3.0:
 * - Server Components by default
 * - React.cache() for data deduplication
 * - Parallel data fetching with Promise.all
 * - Proper error handling
 * - Streaming with Suspense
 * - Type safety
 */

import { Suspense } from 'react'
import { getUser, getProjects, getDashboardData, preloadUser } from '@/lib/data-fetching'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { HeroImage, ContentImage } from '@/components/ui/optimized-image-v2'
import { Skeleton } from '@/components/ui/skeleton'

// This is a Server Component (no 'use client')
export default async function ModernDashboardPage() {
  // Example user ID - in production, get from auth
  const userId = 'demo-user-123'

  // Preload data early to start fetching
  preloadUser(userId)

  // Fetch dashboard data in parallel
  const { user, projects, notifications } = await getDashboardData(userId)

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Hero Section with Priority Image */}
      <section className="relative rounded-lg overflow-hidden">
        <HeroImage
          src="/hero-dashboard.jpg"
          alt="Dashboard Hero"
          width={1920}
          height={400}
          priority // LCP image - loads immediately
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <h1 className="text-4xl font-bold text-white">
            Welcome back, {user?.name || 'User'}!
          </h1>
        </div>
      </section>

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          {user ? (
            <div className="space-y-2">
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Member since:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          ) : (
            <p className="text-muted-foreground">User data not available</p>
          )}
        </CardContent>
      </Card>

      {/* Projects Section with Streaming */}
      <Suspense fallback={<ProjectsSkeleton />}>
        <ProjectsList userId={userId} />
      </Suspense>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length > 0 ? (
            <ul className="space-y-2">
              {notifications.slice(0, 5).map((notification: any) => (
                <li key={notification.id} className="border-b pb-2">
                  <p className="font-medium">{notification.title}</p>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No new notifications</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Separate Server Component for Projects
 * This component can be streamed independently
 */
async function ProjectsList({ userId }: { userId: string }) {
  // This fetch is memoized by React.cache()
  // If already called above, it returns the cached result
  const projects = await getProjects(userId)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Projects ({projects.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {projects.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project: any) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No projects yet</p>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Project Card Component
 */
function ProjectCard({ project }: { project: any }) {
  return (
    <Card>
      <CardContent className="p-4">
        {project.thumbnail && (
          <ContentImage
            src={project.thumbnail}
            alt={project.name}
            width={300}
            height={200}
            className="rounded-md mb-3"
          />
        )}
        <h3 className="font-semibold">{project.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {project.description}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {project.status}
          </span>
          <span className="text-xs font-medium">
            {project.progress}% complete
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Loading skeleton for projects section
 */
function ProjectsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Metadata for SEO
 * Next.js 14 Metadata API
 */
export const metadata = {
  title: 'Modern Dashboard | KAZI Platform',
  description: 'Your modern dashboard with real-time data and analytics',
}

/**
 * Revalidation configuration
 * Revalidate this page every 60 seconds
 */
export const revalidate = 60
