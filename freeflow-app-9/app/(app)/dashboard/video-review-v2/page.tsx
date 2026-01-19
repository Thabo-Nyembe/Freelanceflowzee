/**
 * Video Review Dashboard - FreeFlow A+++ Implementation
 * Frame.io-style video review with frame-accurate comments and collaboration
 */

import { Metadata } from 'next';
import { VideoReviewClient } from './video-review-client';

export const metadata: Metadata = {
  title: 'Video Review | FreeFlow',
  description: 'Review videos with frame-accurate comments, annotations, and collaborative approval workflows',
};

export default function VideoReviewPage() {
  return <VideoReviewClient />;
}
