'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useCollaboration } from '@/hooks/use-collaboration';
import { CursorOverlay } from './cursor-overlay';
import { SelectionOverlay } from './selection-overlay';
import { CommentThread } from './comment-thread';
import { UserPresence } from './presence';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, MessageSquare, Edit2, Eye, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface RealTimeCollaborationProps {
  documentId: string;
  currentUser: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  children?: React.ReactNode;
}

export default function RealTimeCollaboration({ documentId, currentUser, children }: RealTimeCollaborationProps) {
  const [mounted, setMounted] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [connected, setConnected] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const { toast } = useToast();

  // Use the collaboration hook with all callbacks wired
  const collaboration = useCollaboration({
    projectId: documentId,
    userId: currentUser.id,
    userName: currentUser.name,
    userEmail: currentUser.email,
    userAvatar: currentUser.avatar,
    onUserJoin: useCallback((user) => {
      toast({
        title: 'User joined',
        description: `${user.name} joined the collaboration`,
      });
    }, [toast]),
    onUserLeave: useCallback((user) => {
      toast({
        title: 'User left',
        description: `${user.name} left the collaboration`,
        variant: 'destructive',
      });
    }, [toast]),
    onComment: useCallback((comment) => {
      toast({
        title: 'New comment',
        description: `New comment added to the document`,
      });
    }, [toast]),
    onError: useCallback((error) => {
      toast({
        title: 'Collaboration error',
        description: error.message,
        variant: 'destructive',
      });
    }, [toast]),
    onConnectionStateChange: useCallback((isConnected) => {
      setConnected(isConnected);
    }, []),
  });

  // Poll state from collaboration hook
  useEffect(() => {
    const interval = setInterval(() => {
      if (collaboration) {
        setUsers(collaboration.getUsers());
        setComments(collaboration.getComments());
        setConnected(collaboration.isConnected());
        setLastSynced(collaboration.getLastSynced());
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [collaboration]);

  // Build cursors and selections from users
  const cursors = useMemo(() => {
    const cursorMap: Record<string, { x: number; y: number; color: string; name: string }> = {};
    users.forEach((user) => {
      if (user.cursor && user.id !== currentUser.id) {
        cursorMap[user.id] = {
          x: user.cursor.x,
          y: user.cursor.y,
          color: user.color || '#FF6B6B',
          name: user.name,
        };
      }
    });
    return cursorMap;
  }, [users, currentUser.id]);

  const selections = useMemo(() => {
    const selectionMap: Record<string, { start: number; end: number; blockId: string; color: string }> = {};
    users.forEach((user) => {
      if (user.selection && user.id !== currentUser.id) {
        selectionMap[user.id] = {
          ...user.selection,
          color: user.color || '#FF6B6B',
        };
      }
    });
    return selectionMap;
  }, [users, currentUser.id]);

  // Handle mouse move for cursor tracking
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (connected && collaboration) {
      const rect = e.currentTarget.getBoundingClientRect();
      collaboration.updateCursor(
        e.clientX - rect.left,
        e.clientY - rect.top
      );
    }
  }, [connected, collaboration]);

  // Handle text selection for selection tracking
  const handleSelectionChange = useCallback(() => {
    if (!connected || !collaboration) return;
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const blockId = range.startContainer.parentElement?.id || 'main';
      collaboration.updateSelection(
        range.startOffset,
        range.endOffset,
        blockId
      );
    }
  }, [connected, collaboration]);

  // Handle reconnect
  const handleReconnect = useCallback(() => {
    if (collaboration) {
      collaboration.disconnect();
      collaboration.connect();
      toast({
        title: 'Reconnecting',
        description: 'Attempting to reconnect to collaboration session...',
      });
    }
  }, [collaboration, toast]);

  // Handle add comment
  const handleAddComment = useCallback(async (blockId: string, content: string) => {
    if (collaboration) {
      return collaboration.addComment(blockId, content);
    }
    return null;
  }, [collaboration]);

  // Handle resolve comment
  const handleResolveComment = useCallback(async (commentId: string) => {
    if (collaboration) {
      await collaboration.resolveComment(commentId);
    }
  }, [collaboration]);

  useEffect(() => {
    setMounted(true);
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [handleSelectionChange]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="relative min-h-screen">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Real-Time Collaboration</span>
            <div className="flex items-center gap-2">
              {!connected && (
                <Button variant="outline" size="sm" onClick={handleReconnect}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reconnect
                </Button>
              )}
              <Badge variant={connected ? "success" : "destructive"}>
                {connected ? "Connected" : "Disconnected"}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center flex-wrap gap-4 mb-4">
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              <span>{users.length} Active Users</span>
            </div>
            <div className="flex items-center">
              <MessageSquare className="w-4 h-4 mr-2" />
              <span>{comments.length} Comments</span>
            </div>
            <div className="flex items-center">
              <Edit2 className="w-4 h-4 mr-2" />
              <span>{Object.keys(selections).length} Selections</span>
            </div>
            <div className="flex items-center">
              <Eye className="w-4 h-4 mr-2" />
              <span>{Object.keys(cursors).length} Cursors</span>
            </div>
            {lastSynced && (
              <div className="text-xs text-muted-foreground">
                Last synced: {new Date(lastSynced).toLocaleTimeString()}
              </div>
            )}
          </div>

          <UserPresence users={users} />
        </CardContent>
      </Card>

      <div
        className="relative border rounded-lg p-4 min-h-[500px]"
        onMouseMove={handleMouseMove}
      >
        {/* User content goes here */}
        {children}

        {/* Collaboration overlays */}
        <CursorOverlay cursors={cursors} />
        <SelectionOverlay selections={selections} />
        <CommentThread
          comments={comments}
          onAddComment={handleAddComment}
          onResolveComment={handleResolveComment}
          currentUser={currentUser}
        />
      </div>
    </div>
  );
}
