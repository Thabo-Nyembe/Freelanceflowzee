'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { FaApple, FaGithub, FaGoogle, FaLinkedin, FaSlack } from 'react-icons/fa'
import { SiFigma, SiGitlab, SiNotion, SiZoom } from 'react-icons/si'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

type Provider =
  | 'apple'
  | 'figma'
  | 'github'
  | 'gitlab'
  | 'google'
  | 'linkedin'
  | 'notion'
  | 'zoom'
  | 'slack'

interface ProviderConfig {
  name: string
  icon: React.ReactNode
  color: string
  hoverColor: string
}

const PROVIDERS: Record<Provider, ProviderConfig> = {
  google: {
    name: 'Google',
    icon: <FaGoogle className="w-5 h-5" />,
    color: 'bg-white hover:bg-gray-50 text-gray-800 border border-gray-300',
    hoverColor: 'hover:border-gray-400',
  },
  github: {
    name: 'GitHub',
    icon: <FaGithub className="w-5 h-5" />,
    color: 'bg-[#24292e] hover:bg-[#1a1e22] text-white',
    hoverColor: '',
  },
  linkedin: {
    name: 'LinkedIn',
    icon: <FaLinkedin className="w-5 h-5" />,
    color: 'bg-[#0077b5] hover:bg-[#006399] text-white',
    hoverColor: '',
  },
  apple: {
    name: 'Apple',
    icon: <FaApple className="w-5 h-5" />,
    color: 'bg-black hover:bg-gray-900 text-white',
    hoverColor: '',
  },
  figma: {
    name: 'Figma',
    icon: <SiFigma className="w-5 h-5" />,
    color: 'bg-white hover:bg-gray-50 text-[#F24E1E] border border-gray-300',
    hoverColor: 'hover:border-[#F24E1E]',
  },
  gitlab: {
    name: 'GitLab',
    icon: <SiGitlab className="w-5 h-5" />,
    color: 'bg-[#FC6D26] hover:bg-[#E24329] text-white',
    hoverColor: '',
  },
  notion: {
    name: 'Notion',
    icon: <SiNotion className="w-5 h-5" />,
    color: 'bg-white hover:bg-gray-50 text-black border border-gray-300',
    hoverColor: 'hover:border-gray-400',
  },
  zoom: {
    name: 'Zoom',
    icon: <SiZoom className="w-5 h-5" />,
    color: 'bg-[#2D8CFF] hover:bg-[#1976D2] text-white',
    hoverColor: '',
  },
  slack: {
    name: 'Slack',
    icon: <FaSlack className="w-5 h-5" />,
    color: 'bg-[#4A154B] hover:bg-[#350d36] text-white',
    hoverColor: '',
  },
}

export function OAuthProviders() {
  const [loading, setLoading] = useState<Provider | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  const signInWithProvider = async (provider: Provider) => {
    try {
      setLoading(provider)

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) {
        throw error
      }

      // OAuth redirect will happen automatically
    } catch (error) {
      console.error(`${provider} OAuth error:`, error)
      toast({
        title: 'Authentication Error',
        description: error.message || `Failed to sign in with ${PROVIDERS[provider].name}`,
        variant: 'destructive',
      })
      setLoading(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">Or continue with</span>
        </div>
      </div>

      {/* Primary Providers (Most Popular) */}
      <div className="grid grid-cols-3 gap-3">
        {(['google', 'github', 'linkedin'] as Provider[]).map((provider) => (
          <Button
            key={provider}
            type="button"
            variant="outline"
            onClick={() => signInWithProvider(provider)}
            disabled={loading !== null}
            className={`${PROVIDERS[provider].color} ${PROVIDERS[provider].hoverColor} transition-colors duration-200`}
          >
            {loading === provider ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              PROVIDERS[provider].icon
            )}
          </Button>
        ))}
      </div>

      {/* Secondary Providers */}
      <div className="grid grid-cols-3 gap-3">
        {(['apple', 'figma', 'gitlab'] as Provider[]).map((provider) => (
          <Button
            key={provider}
            type="button"
            variant="outline"
            onClick={() => signInWithProvider(provider)}
            disabled={loading !== null}
            className={`${PROVIDERS[provider].color} ${PROVIDERS[provider].hoverColor} transition-colors duration-200`}
          >
            {loading === provider ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              PROVIDERS[provider].icon
            )}
          </Button>
        ))}
      </div>

      {/* Tertiary Providers */}
      <div className="grid grid-cols-3 gap-3">
        {(['notion', 'zoom', 'slack'] as Provider[]).map((provider) => (
          <Button
            key={provider}
            type="button"
            variant="outline"
            onClick={() => signInWithProvider(provider)}
            disabled={loading !== null}
            className={`${PROVIDERS[provider].color} ${PROVIDERS[provider].hoverColor} transition-colors duration-200`}
          >
            {loading === provider ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              PROVIDERS[provider].icon
            )}
          </Button>
        ))}
      </div>

      {/* Provider Names (Optional) */}
      <div className="text-center text-xs text-gray-500 space-y-1">
        <p>Google • GitHub • LinkedIn</p>
        <p>Apple • Figma • GitLab</p>
        <p>Notion • Zoom • Slack</p>
      </div>

      {/* Legal Disclaimer */}
      <div className="text-center text-xs text-gray-400 mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
        <p>
          Third-party logos and trademarks are property of their respective owners.
          By connecting, you agree to their respective terms of service and privacy policies.
        </p>
      </div>
    </div>
  )
}

// Alternative: Buttons with text labels
export function OAuthProvidersWithLabels() {
  const [loading, setLoading] = useState<Provider | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  const signInWithProvider = async (provider: Provider) => {
    try {
      setLoading(provider)

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        throw error
      }
    } catch (error) {
      console.error(`${provider} OAuth error:`, error)
      toast({
        title: 'Authentication Error',
        description: error.message || `Failed to sign in with ${PROVIDERS[provider].name}`,
        variant: 'destructive',
      })
      setLoading(null)
    }
  }

  return (
    <div className="space-y-3">
      {(Object.keys(PROVIDERS) as Provider[]).map((provider) => (
        <Button
          key={provider}
          type="button"
          variant="outline"
          onClick={() => signInWithProvider(provider)}
          disabled={loading !== null}
          className={`w-full ${PROVIDERS[provider].color} ${PROVIDERS[provider].hoverColor} transition-colors duration-200`}
        >
          {loading === provider ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <span className="mr-2">{PROVIDERS[provider].icon}</span>
          )}
          Continue with {PROVIDERS[provider].name}
        </Button>
      ))}
    </div>
  )
}
