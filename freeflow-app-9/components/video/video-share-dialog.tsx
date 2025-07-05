'use client';

import { useState } from 'react';
import { useVideoSecurity } from '@/hooks/use-video-security';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PermissionLevel } from '@/lib/types/video-security';
import { Copy, Link, Send } from 'lucide-react';

export function VideoShareDialog({ videoId }: { videoId: string }) {
  const { grantPermission, createShareLink, isLoading } = useVideoSecurity(videoId);
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<PermissionLevel>('view');
  const [shareUrl, setShareUrl] = useState('');

  const handleGrantPermission = async () => {
    if (!email) return;
    await grantPermission({ email, permission_level: permission });
    setEmail('');
  };

  const handleCreateLink = async () => {
    const url = await createShareLink({});
    if (url) {
      setShareUrl(url);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Share</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Video & Manage Access</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Invite by email */}
          <div className="space-y-2">
            <Label>Invite people by email</Label>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter email address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Select value={permission} onValueChange={(v) => setPermission(v as PermissionLevel)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">Can view</SelectItem>
                  <SelectItem value="comment">Can comment</SelectItem>
                  <SelectItem value="edit">Can edit</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleGrantPermission} disabled={isLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Manage existing permissions (List would go here) */}
          
          {/* Create share link */}
          <div className="space-y-2">
            <Label>Get a shareable link</Label>
            {shareUrl ? (
              <div className="flex gap-2">
                <Input value={shareUrl} readOnly />
                <Button variant="outline" onClick={() => navigator.clipboard.writeText(shareUrl)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button onClick={handleCreateLink} disabled={isLoading} variant="outline" className="w-full">
                <Link className="mr-2 h-4 w-4" />
                Create share link
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 