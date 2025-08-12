import { NextAuthOptions, User, getServerSession } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/db';
import { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from 'next';
import { AdapterUser } from 'next-auth/adapters';
import { JWT } from 'next-auth/jwt';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import EmailProvider from 'next-auth/providers/email';

/**
 * Extended session type with user information
 */
export interface ExtendedSession {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
    role?: 'user' | 'admin' | 'premium';
    subscriptionTier?: 'free' | 'pro' | 'enterprise';
    organizationId?: string;
  };
  expires: string;
}

/**
 * Extended user type with additional fields
 */
export interface ExtendedUser extends User {
  id: string;
  role?: 'user' | 'admin' | 'premium';
  subscriptionTier?: 'free' | 'pro' | 'enterprise';
  organizationId?: string;
}

/**
 * NextAuth options configuration
 */
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
        }
      }
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || '',
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD
        }
      },
      from: process.env.EMAIL_FROM || 'noreply@kazi.app',
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/onboarding'
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        // Find or create user profile
        const userProfile = await prisma.profile.findUnique({
          where: { userId: user.id }
        });

        if (!userProfile) {
          await prisma.profile.create({
            data: {
              userId: user.id,
              name: user.name || '',
              email: user.email || '',
              image: user.image || '',
            }
          });
        }

        // Get user role and subscription info
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true, subscriptionTier: true, organizationId: true }
        });

        return {
          ...token,
          id: user.id,
          role: dbUser?.role || 'user',
          subscriptionTier: dbUser?.subscriptionTier || 'free',
          organizationId: dbUser?.organizationId || null
        };
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session as ExtendedSession).user = {
          ...session.user,
          id: token.id as string,
          role: token.role as 'user' | 'admin' | 'premium',
          subscriptionTier: token.subscriptionTier as 'free' | 'pro' | 'enterprise',
          organizationId: token.organizationId as string | undefined
        };
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

/**
 * Helper to get server session
 */
export function getServerAuthSession(ctx: {
  req: GetServerSidePropsContext['req'];
  res: GetServerSidePropsContext['res'];
}) {
  return getServerSession(ctx.req, ctx.res, authOptions);
}

/**
 * Helper to get server session for API routes
 */
export function getApiAuthSession(req: NextApiRequest, res: NextApiResponse) {
  return getServerSession(req, res, authOptions);
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(
  req: NextApiRequest | GetServerSidePropsContext['req'],
  res: NextApiResponse | GetServerSidePropsContext['res']
): Promise<boolean> {
  const session = await getServerSession(req, res, authOptions);
  return !!session;
}

/**
 * Check if user has required role
 */
export async function hasRole(
  req: NextApiRequest | GetServerSidePropsContext['req'],
  res: NextApiResponse | GetServerSidePropsContext['res'],
  role: 'user' | 'admin' | 'premium'
): Promise<boolean> {
  const session = await getServerSession(req, res, authOptions) as ExtendedSession | null;
  
  if (!session) return false;
  
  if (role === 'admin') {
    return session.user.role === 'admin';
  }
  
  if (role === 'premium') {
    return session.user.role === 'admin' || session.user.role === 'premium';
  }
  
  return true; // All authenticated users have 'user' role
}

/**
 * Check if user has required subscription tier
 */
export async function hasSubscription(
  req: NextApiRequest | GetServerSidePropsContext['req'],
  res: NextApiResponse | GetServerSidePropsContext['res'],
  tier: 'free' | 'pro' | 'enterprise'
): Promise<boolean> {
  const session = await getServerSession(req, res, authOptions) as ExtendedSession | null;
  
  if (!session) return false;
  
  if (tier === 'enterprise') {
    return session.user.subscriptionTier === 'enterprise';
  }
  
  if (tier === 'pro') {
    return session.user.subscriptionTier === 'enterprise' || session.user.subscriptionTier === 'pro';
  }
  
  return true; // All users have at least 'free' tier
}

/**
 * Get current user profile
 */
export async function getCurrentUser(
  req: NextApiRequest | GetServerSidePropsContext['req'],
  res: NextApiResponse | GetServerSidePropsContext['res']
): Promise<ExtendedUser | null> {
  const session = await getServerSession(req, res, authOptions) as ExtendedSession | null;
  
  if (!session) return null;
  
  return session.user as ExtendedUser;
}

export default authOptions;
