import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Video Studio | FreeFlow',
  description: 'Professional screen recording and video management for freelancers',
};

export default function VideoStudioLayout({
  children, }: {
  children: React.ReactNode;
}) {
  return children;
} 