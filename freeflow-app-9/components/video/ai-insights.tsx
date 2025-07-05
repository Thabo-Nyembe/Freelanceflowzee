'use client';

import { useState, useTransition } from 'react';
import { Video } from '@/lib/types/video';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2 } from 'lucide-react';
import { generateAiMetadataAction } from '@/lib/actions/ai';
import { useToast } from '@/components/ui/use-toast';

interface AiInsightsProps {
  video: Pick<Video, 'id' | 'ai_metadata'>;
}

export function AiInsights({ video }: AiInsightsProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const aiMetadata = video.ai_metadata as { summary?: string; tags?: string[] };

  const handleGenerate = () => {
    startTransition(async () => {
      const result = await generateAiMetadataAction(video.id);
      if (result?.error) {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: result.success });
      }
    });
  };

  if (aiMetadata?.summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <span>AI-Powered Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Summary</h3>
            <p className="text-sm text-muted-foreground">{aiMetadata.summary}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {aiMetadata.tags?.map((tag) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col items-center justify-center p-6 text-center">
      <Sparkles className="h-8 w-8 text-muted-foreground mb-4" />
      <CardTitle className="mb-2">Unlock AI Insights</CardTitle>
      <p className="text-sm text-muted-foreground mb-4">
        Generate a summary and relevant tags from your video's transcript automatically.
      </p>
      <Button onClick={handleGenerate} disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          'Generate Insights'
        )}
      </Button>
    </Card>
  );
} 