import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export const authOptions: NextAuthOptions = {
  // Configure authentication providers
  providers: [
    // Email/Password authentication
    CredentialsProvider({
      id: 'credentials',
      name: 'Email and Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Email and password are required')
          }

          // Query user from Supabase
          const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', credentials.email.toLowerCase())
            .single()

          if (error || !user) {
            throw new Error('Invalid email or password')
          }

          // Verify password
          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.password_hash
          )

          if (!isValidPassword) {
            throw new Error('Invalid email or password')
          }

          // Check if email is verified (skip in development or for test users)
          const isTestUser = user.email.startsWith('test-')
          const isDevelopment = process.env.NODE_ENV === 'development'
          if (!user.email_verified && !isTestUser && !isDevelopment) {
            throw new Error('Please verify your email before logging in')
          }

          // Return user object for session
          return {
            id: user.id,
            email: user.email,
            name: user.name || user.email,
            role: user.role || 'user',
            image: user.avatar_url || null,
            emailVerified: user.email_verified,
          }
        } catch (error) {
          console.error('Authentication error:', error)
          return null
        }
      }
    }),

    // Google OAuth (if configured)
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
              params: {
                prompt: 'consent',
                access_type: 'offline',
                response_type: 'code'
              }
            }
          })
        ]
      : []),

    // GitHub OAuth (if configured)
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? [
          GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET
          })
        ]
      : [])
  ],

  // Database adapter configuration
  // Note: Using Supabase directly instead of Prisma adapter for flexibility
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // For OAuth providers, create or update user in Supabase
        if (account?.provider !== 'credentials') {
          const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('email', user.email!)
            .single()

          if (!existingUser) {
            // Create new user for OAuth
            await supabase.from('users').insert({
              email: user.email,
              name: user.name,
              avatar_url: user.image,
              email_verified: true,
              oauth_provider: account.provider,
              oauth_id: account.providerAccountId,
              role: 'user',
              created_at: new Date().toISOString()
            })
          } else {
            // Update existing user
            await supabase
              .from('users')
              .update({
                name: user.name,
                avatar_url: user.image,
                email_verified: true,
                last_login: new Date().toISOString()
              })
              .eq('email', user.email!)
          }
        }

        return true
      } catch (error) {
        console.error('Sign in callback error:', error)
        return false
      }
    },

    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.role = user.role || 'user'
        token.picture = user.image
      }

      // Refresh user data from database on each token refresh
      if (token.email) {
        const { data: dbUser } = await supabase
          .from('users')
          .select('id, email, name, role, avatar_url')
          .eq('email', token.email)
          .single()

        if (dbUser) {
          token.id = dbUser.id
          token.role = dbUser.role
          token.name = dbUser.name
          token.picture = dbUser.avatar_url
        }
      }

      return token
    },

    async session({ session, token }) {
      // Add custom fields to session
      if (session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.role = token.role as string
        session.user.image = token.picture as string
      }

      return session
    },

    async redirect({ url, baseUrl }) {
      // Redirect to dashboard after successful login
      if (url.startsWith('/')) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return `${baseUrl}/dashboard`
    }
  },

  // Custom pages
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
    verifyRequest: '/verify-email',
    newUser: '/onboarding'
  },

  // Session configuration
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60 // Update session every 24 hours
  },

  // JWT configuration
  jwt: {
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },

  // Security options
  secret: process.env.NEXTAUTH_SECRET,

  // Enable debug in development
  debug: process.env.NODE_ENV === 'development',

  // Events for logging
  events: {
    async signIn({ user, account, profile }) {
      console.log(`User signed in: ${user.email}`)

      // Update last login timestamp
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('email', user.email!)
    },
    async signOut({ token }) {
      console.log(`User signed out: ${token.email}`)
    },
    async createUser({ user }) {
      console.log(`New user created: ${user.email}`)
    }
  }
}

// Helper function to get session on server side
export async function getServerSession() {
  const { getServerSession: nextGetServerSession } = await import('next-auth')
  return nextGetServerSession(authOptions)
}
