'use client';

import { useEffect, useState } from 'react';
import { useCollaboration } from '@/hooks/use-collaboration';
import { CursorOverlay } from './cursor-overlay';
import { SelectionOverlay } from './selection-overlay';
import { CommentThread } from './comment-thread';
import { UserPresence } from './presence';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, MessageSquare, Edit2, Eye } from 'lucide-react';

interface RealTimeCollaborationProps {
  documentId: string;
  currentUser: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

export default function RealTimeCollaboration({ documentId, currentUser }: RealTimeCollaborationProps) {
  const [mounted, setMounted] = useState(false);
  
  const {
    state,
    isConnected,
    updateCursor,
    updateSelection,
    addComment,
    resolveComment,
  } = useCollaboration({
    projectId: documentId,
    userId: currentUser.id,
    userName: currentUser.name,
    userEmail: currentUser.email,
    userAvatar: currentUser.avatar,
    onUserJoin: (user) => {
      console.log('User joined:', user.name);
    },
    onUserLeave: (user) => {
      console.log('User left:', user.name);
    },
    onError: (error) => {
      console.error('Collaboration error:', error);
    }
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="relative min-h-screen">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Real-Time Collaboration</span>
            <Badge variant={isConnected ? "success" : "destructive"}>
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              <span>{state.users.length} Active Users</span>
            </div>
            <div className="flex items-center">
              <MessageSquare className="w-4 h-4 mr-2" />
              <span>{state.comments.length} Comments</span>
            </div>
            <div className="flex items-center">
              <Edit2 className="w-4 h-4 mr-2" />
              <span>{Object.keys(state.selections).length} Selections</span>
            </div>
            <div className="flex items-center">
              <Eye className="w-4 h-4 mr-2" />
              <span>{Object.keys(state.cursors).length} Cursors</span>
            </div>
          </div>

          <UserPresence users={state.users} />
        </CardContent>
      </Card>

      <div className="relative border rounded-lg p-4 min-h-[500px]">
        {/* Content goes here */}
        <CursorOverlay cursors={state.cursors} />
        <SelectionOverlay selections={state.selections} />
        <CommentThread 
          comments={state.comments}
          onAddComment={addComment}
          onResolveComment={resolveComment}
          currentUser={currentUser}
        />
      </div>
    </div>
  );
}

