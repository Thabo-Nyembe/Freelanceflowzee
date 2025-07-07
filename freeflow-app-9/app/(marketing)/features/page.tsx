import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function FeaturesPage() {
  return (
    <main className="max-w-3xl mx-auto py-16 px-6">
      <h1 className="text-4xl font-bold mb-6 text-center">Platform Features</h1>
      <p className="text-lg text-gray-700 mb-8 text-center">
        Explore the core capabilities that make FreeflowZee the one-stop workspace for modern creators.
      </p>

      <section className="grid gap-8 md:grid-cols-2">
        <article className="p-6 rounded-xl border bg-white/70 backdrop-blur-xl shadow">
          <h2 className="text-2xl font-semibold mb-2">AI-Powered Asset Generation</h2>
          <p className="text-gray-600 mb-4">
            Generate images, copy and video transcripts with a single prompt. Powered by the latest OpenAI &amp; Anthropic models.
          </p>
          <Button asChild size="sm">
            <Link href="/dashboard/ai-create">Try AI Create</Link>
          </Button>
        </article>

        <article className="p-6 rounded-xl border bg-white/70 backdrop-blur-xl shadow">
          <h2 className="text-2xl font-semibold mb-2">Secure Escrow Payments</h2>
          <p className="text-gray-600 mb-4">
            Built-in escrow keeps funds safe until milestones are approved – no plugins required.
          </p>
          <Button asChild size="sm">
            <Link href="/dashboard/escrow">Learn More</Link>
          </Button>
        </article>

        <article className="p-6 rounded-xl border bg-white/70 backdrop-blur-xl shadow">
          <h2 className="text-2xl font-semibold mb-2">WeTransfer-Style File Sharing</h2>
          <p className="text-gray-600 mb-4">
            Send large assets (up to 5 GB) with expiring links, previews and analytics.
          </p>
          <Button asChild size="sm">
            <Link href="/dashboard/files-hub">Upload a File</Link>
          </Button>
        </article>

        <article className="p-6 rounded-xl border bg-white/70 backdrop-blur-xl shadow">
          <h2 className="text-2xl font-semibold mb-2">Real-Time Collaboration</h2>
          <p className="text-gray-600 mb-4">
            Comment, annotate and co-edit with clients – all synced in milliseconds.
          </p>
          <Button asChild size="sm">
            <Link href="/dashboard/collaboration">Start Collaborating</Link>
          </Button>
        </article>
      </section>
    </main>
  );
} 