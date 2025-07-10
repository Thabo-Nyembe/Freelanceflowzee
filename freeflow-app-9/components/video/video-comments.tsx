'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Clock, Reply, ThumbsUp, User, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface VideoComment {
  id: string;
  user_id: string;
  video_id: string;
  content: string;
  timestamp_seconds?: number;
  parent_comment_id?: string;
  likes_count: number;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
  replies?: VideoComment[];
  is_liked?: boolean;
}

interface VideoCommentsProps {
  videoId: string;
  currentUserId?: string;
  currentTime?: number;
  onSeekToTimestamp?: (timestamp: number) => void;
  className?: string;
}

export function VideoComments({ 
  videoId: unknown, currentUserId: unknown, currentTime = 0: unknown, onSeekToTimestamp: unknown, className 
}: VideoCommentsProps) {
  const [comments, setComments] = useState<VideoComment[]>([]);
  const [loading, setLoading] = useState<any>(true);
  const [newComment, setNewComment] = useState<any>('');
  const [useTimestamp, setUseTimestamp] = useState<any>(false);

  useEffect(() => {
    loadComments();
  }, [videoId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/video/${videoId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !currentUserId) return;

    try {
      const commentData = {
        content: newComment,
        timestamp_seconds: useTimestamp ? Math.floor(currentTime) : undefined
      };

      const response = await fetch(`/api/video/${videoId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commentData),
      });

      if (response.ok) {
        const newCommentData = await response.json();
        setComments(prev => [newCommentData.comment, ...prev]);
        setNewComment('');
        setUseTimestamp(false);
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const CommentCard = ({ comment }: { comment: VideoComment }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.user.avatar_url} alt={comment.user.display_name || 'User'} />
            <AvatarFallback>
              {comment.user.display_name?.charAt(0) || <User className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-sm">{comment.user.display_name}</span>
              
              {comment.timestamp_seconds !== undefined && (
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover:bg-blue-50"
                  onClick={() => onSeekToTimestamp?.(comment.timestamp_seconds!)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Jump to timestamp ${formatTimestamp(comment.timestamp_seconds)}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onSeekToTimestamp?.(comment.timestamp_seconds!)
                    }
                  }}
                >
                  <Clock className="h-3 w-3 mr-1" />
                  {formatTimestamp(comment.timestamp_seconds)}
                </Badge>
              )}
              
              <span className="text-xs text-muted-foreground">
                {new Date(comment.created_at).toLocaleDateString()}
              </span>
            </div>
            
            <p className="text-sm mb-3 whitespace-pre-wrap">{comment.content}</p>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <ThumbsUp className="h-3 w-3 mr-1" />
                {comment.likes_count || 0}
              </Button>
              
              {currentUserId && (
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <Reply className="h-3 w-3 mr-1" />
                  Reply
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {currentUserId && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="useTimestamp"
                checked={useTimestamp}
                onChange={(e) => setUseTimestamp(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="useTimestamp" className="text-sm">
                Comment at current time ({formatTimestamp(currentTime)})
              </label>
            </div>
            
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[100px] resize-none"
            />
            
            <div className="flex justify-between items-center">
              <div className="text-xs text-muted-foreground">
                {useTimestamp && `Will be posted at ${formatTimestamp(currentTime)}`}
              </div>
              <Button
                onClick={handleSubmitComment}
                disabled={!newComment.trim()}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                Comment
              </Button>
            </div>
          </div>
        )}

        <Separator />

        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex gap-3">
                    <div className="h-8 w-8 bg-gray-200 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4" />
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <CommentCard key={comment.id} comment={comment} />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
