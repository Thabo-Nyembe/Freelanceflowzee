import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ShortVideoPage({ params }: PageProps) {
  const { id } = await params;
  
  // Redirect to the main share page
  redirect(`/share/${id}`);
} 