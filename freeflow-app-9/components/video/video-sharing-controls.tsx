'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Share2, 
  Copy,
  Globe, 
  Lock,
  Code,
  CheckCircle,
  AlertCircle,
  Twitter,
  Linkedin,
  Facebook,
  Mail,
  Link2,
  Palette,
  Shield
} from 'lucide-react';

interface VideoSharingControlsProps {
  videoId: string;
  title?: string;
  description?: string;
  isPublic?: boolean;
  passwordProtected?: boolean;
  allowEmbedding?: boolean;
  allowDownload?: boolean;
  onSettingsChange?: (settings: VideoSharingSettings) => Promise<void>;
  className?: string;
}

interface VideoSharingSettings {
  isPublic: boolean;
  passwordProtected: boolean;
  password?: string;
  allowEmbedding: boolean;
  allowDownload: boolean;
  embedTheme: 'dark' | 'light';
  embedAutoplay: boolean;
  embedControls: boolean;
}

interface ShareLink {
  label: string;
  url: string;
  description: string;
  icon: React.ReactNode;
}

export function VideoSharingControls({
  videoId, title = 'Untitled Video', description = '', isPublic = false, passwordProtected = false, allowEmbedding = true, allowDownload = false, onSettingsChange, className
}: VideoSharingControlsProps) {
  const [settings, setSettings] = useState<VideoSharingSettings>({
    isPublic,
    passwordProtected,
    allowEmbedding,
    allowDownload,
    embedTheme: 'dark',
    embedAutoplay: false,
    embedControls: true
  });
  
  const [copyStates, setCopyStates] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<any>(false);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://freeflow.app';

  // Generate different share URLs
  const shareLinks: ShareLink[] = [
    {
      label: 'Public Share Link',
      url: `${baseUrl}/share/${videoId}`,
      description: 'Full-featured public video page with comments and creator info',
      icon: <Globe className="h-4 w-4" />
    },
    {
      label: 'Short Link',
      url: `${baseUrl}/v/${videoId}`,
      description: 'Shortened URL for easy sharing',
      icon: <Link2 className="h-4 w-4" />
    }
  ];

  // Generate embed code
  const generateEmbedCode = useCallback((width: number | string = 640, height: number | string = 360) => {
    const embedUrl = `${baseUrl}/embed/${videoId}`;
    const autoplayParam = settings.embedAutoplay ? '&autoplay=1' : '';
    const controlsParam = settings.embedControls ? '&controls=1' : '&controls=0';
    const themeParam = `&theme=${settings.embedTheme}`;
    
    return `<iframe src="${embedUrl}?embedded=1${autoplayParam}${controlsParam}${themeParam}" width="${width}" height="${height}" frameborder="0" allowfullscreen allow="autoplay; fullscreen; picture-in-picture"></iframe>`;
  }, [videoId, settings, baseUrl]);

  // Generate social sharing URLs
  const socialLinks = [
    {
      label: 'Twitter',
      icon: <Twitter className="h-4 w-4" />,
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(`${baseUrl}/share/${videoId}`)}&text=${encodeURIComponent(`Check out "${title}" on FreeFlow`)}`
    },
    {
      label: 'LinkedIn',
      icon: <Linkedin className="h-4 w-4" />,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${baseUrl}/share/${videoId}`)}`
    },
    {
      label: 'Facebook',
      icon: <Facebook className="h-4 w-4" />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${baseUrl}/share/${videoId}`)}`
    },
    {
      label: 'Email',
      icon: <Mail className="h-4 w-4" />,
      url: `mailto:?subject=${encodeURIComponent(`Check out "${title}"`)}body=${encodeURIComponent(`I thought you might find this video interesting:\n\n"${title}"\n\n${baseUrl}/share/${videoId}`)}`
    }
  ];

  // Copy to clipboard handler
  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStates(prev => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopyStates(prev => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  // Settings change handler
  const handleSettingsChange = async (newSettings: Partial<VideoSharingSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    if (onSettingsChange) {
      setSaving(true);
      try {
        await onSettingsChange(updatedSettings);
      } catch (error) {
        console.error('Failed to save settings:', error);
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Video Sharing
        </CardTitle>
        <CardDescription>
          Control how your video is shared and embedded across the web
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="sharing" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="sharing">Share Links</TabsTrigger>
            <TabsTrigger value="embed">Embed Code</TabsTrigger>
            <TabsTrigger value="social">Social Media</TabsTrigger>
            <TabsTrigger value="settings">Privacy</TabsTrigger>
          </TabsList>

          {/* Share Links Tab */}
          <TabsContent value="sharing" className="space-y-4 mt-6">
            {!settings.isPublic ? (
              <Alert>
                <Lock className="h-4 w-4" />
                <AlertDescription>
                  This video is private. Enable public sharing in the Privacy tab to generate share links.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {shareLinks.map((link, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="text-muted-foreground">
                      {link.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{link.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {link.description}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono bg-muted rounded px-2 py-1 mt-1">
                        {link.url}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(link.url, link.label)}
                      className="shrink-0"
                    >
                      {copyStates[link.label] ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Embed Code Tab */}
          <TabsContent value="embed" className="space-y-4 mt-6">
            {!settings.isPublic || !settings.allowEmbedding ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {!settings.isPublic 
                    ? "Video must be public to generate embed codes."
                    : "Embedding is disabled. Enable it in Privacy settings."
                  }
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {/* Embed Options */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Palette className="h-3 w-3" />
                      Theme
                    </Label>
                    <div className="flex gap-2">
                      <Button
                        variant={settings.embedTheme === 'dark' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleSettingsChange({ embedTheme: 'dark' })}
                      >
                        Dark
                      </Button>
                      <Button
                        variant={settings.embedTheme === 'light' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleSettingsChange({ embedTheme: 'light' })}
                      >
                        Light
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Player Options</Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Show Controls</span>
                        <Switch
                          checked={settings.embedControls}
                          onCheckedChange={(checked) => handleSettingsChange({ embedControls: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Autoplay</span>
                        <Switch
                          checked={settings.embedAutoplay}
                          onCheckedChange={(checked) => handleSettingsChange({ embedAutoplay: checked })}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Embed Code */}
                <div className="space-y-2">
                  <Label>Embed Code</Label>
                  <div className="relative">
                    <Textarea
                      value={generateEmbedCode()}
                      readOnly
                      className="font-mono text-sm min-h-[80px]"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(generateEmbedCode(), 'embed')}
                    >
                      {copyStates.embed ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Responsive Embed Code */}
                <div className="space-y-2">
                  <Label>Responsive Embed (16:9)</Label>
                  <div className="relative">
                    <Textarea
                      value={`<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
  ${generateEmbedCode('100%', '100%').replace('width="100%" height="100%"', 'style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"')}
</div>`}
                      readOnly
                      className="font-mono text-sm min-h-[100px]"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(`<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">\n  ${generateEmbedCode('100%', '100%').replace('width="100%" height="100%"', 'style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"')}\n</div>`, 'responsive-embed')}
                    >
                      {copyStates['responsive-embed'] ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Social Media Tab */}
          <TabsContent value="social" className="space-y-4 mt-6">
            {!settings.isPublic ? (
              <Alert>
                <Lock className="h-4 w-4" />
                <AlertDescription>
                  Video must be public to share on social media.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {socialLinks.map((social) => (
                  <Button
                    key={social.label}
                    variant="outline"
                    className="justify-start h-auto p-3"
                    asChild
                  >
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3"
                    >
                      {social.icon}
                      <span>Share on {social.label}</span>
                    </a>
                  </Button>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Privacy Settings Tab */}
          <TabsContent value="settings" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-medium">
                    {settings.isPublic ? (
                      <Globe className="h-4 w-4 text-green-600" />
                    ) : (
                      <Lock className="h-4 w-4 text-red-600" />
                    )}
                    Public Video
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Allow anyone with the link to view this video
                  </p>
                </div>
                <Switch
                  checked={settings.isPublic}
                  onCheckedChange={(checked) => handleSettingsChange({ isPublic: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-medium">
                    <Code className="h-4 w-4" />
                    Allow Embedding
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Let others embed this video on their websites
                  </p>
                </div>
                <Switch
                  checked={settings.allowEmbedding}
                  onCheckedChange={(checked) => handleSettingsChange({ allowEmbedding: checked })}
                  disabled={!settings.isPublic}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-medium">
                    <Shield className="h-4 w-4" />
                    Password Protection
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Require a password to view this video
                  </p>
                </div>
                <Switch
                  checked={settings.passwordProtected}
                  onCheckedChange={(checked) => handleSettingsChange({ passwordProtected: checked })}
                  disabled={!settings.isPublic}
                />
              </div>

              {settings.passwordProtected && (
                <div className="space-y-2">
                  <Label htmlFor="password">Video Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password for video access"
                    value={settings.password || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, password: e.target.value }))}
                  />
                </div>
              )}
            </div>

            {onSettingsChange && (
              <Button 
                onClick={() => onSettingsChange(settings)}
                disabled={saving}
                className="w-full"
              >
                {saving ? 'Saving...' : 'Save Privacy Settings'}
              </Button>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 