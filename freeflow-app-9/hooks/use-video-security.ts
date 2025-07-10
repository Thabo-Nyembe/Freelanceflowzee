import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import {
  VideoPermission,
  SecureShareToken,
  GrantPermissionInput,
  CreateShareTokenInput,
  UpdatePermissionInput,
} from '@/lib/types/video-security';

export function useVideoSecurity(videoId: string) {
  const { toast } = useToast();
  const [permissions, setPermissions] = useState<VideoPermission[]>([]);
  const [shareTokens, setShareTokens] = useState<SecureShareToken[]>([]);
  const [isLoading, setIsLoading] = useState<any>(false);

  const fetchPermissions = async () => {
    // ... logic to fetch permissions for the video
  };

  const grantPermission = async (input: Omit<GrantPermissionInput, 'video_id'>) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/video/${videoId}/permissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...input, video_id: videoId }),
      });
      if (!response.ok) throw new Error('Failed to grant permission');
      const newPermission = await response.json();
      setPermissions((prev) => [...prev, newPermission]);
      toast({ title: 'Permission granted successfully' });
    } catch (error) {
      toast({ title: 'Error granting permission', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const revokePermission = async (permissionId: string) => {
    // ... logic to call a DELETE endpoint
  };
  
  const updatePermission = async (input: UpdatePermissionInput) => {
      // ... logic to call a PUT/PATCH endpoint
  };

  const createShareLink = async (input: Omit<CreateShareTokenInput, 'video_id'>) => {
    try {
        setIsLoading(true);
        const response = await fetch(`/api/video/${videoId}/share`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...input, video_id: videoId }),
        });
        if (!response.ok) throw new Error('Failed to create share link');
        const newShareToken = await response.json();
        setShareTokens((prev) => [...prev, newShareToken]);
        toast({ title: 'Share link created successfully' });
        return newShareToken.shareUrl;
    } catch (error) {
        toast({ title: 'Error creating share link', variant: 'destructive' });
    } finally {
        setIsLoading(false);
    }
  };

  return {
    permissions,
    shareTokens,
    isLoading,
    fetchPermissions,
    grantPermission,
    revokePermission,
    updatePermission,
    createShareLink,
  };
} 