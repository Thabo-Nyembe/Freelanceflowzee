/**
 * Screen Recording Page - FreeFlow A+++ Implementation
 * Loom-style screen recording with webcam overlay
 */

import { Metadata } from 'next';
import { ScreenRecordingClient } from './screen-recording-client';

export const metadata: Metadata = {
  title: 'Screen Recording | FreeFlow',
  description: 'Record your screen with webcam overlay, share instantly with a link',
};

export default function ScreenRecordingPage() {
  return <ScreenRecordingClient />;
}
