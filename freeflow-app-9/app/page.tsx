import { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "FreeflowZee - AI-Powered Creative Platform",
  description: "Generate creative assets with AI, share files like WeTransfer, manage projects with escrow payments, and build your creative business - all in one revolutionary platform.",
  keywords: "AI, creative platform, file sharing, project management, escrow payments, freelance",
  authors: [{ name: "FreeflowZee Team" }],
  creator: "FreeflowZee"
};

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section 
          className="container flex flex-col items-center justify-center gap-4 py-24 md:py-32"
          data-testid="hero-section"
        >
          <h1 
            className="text-center text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl"
            data-testid="hero-heading"
          >
            Create, Share & Get Paid
          </h1>
          <p className="mx-auto max-w-[700px] text-center text-gray-500 md:text-xl">
            Generate creative assets with AI, share files like WeTransfer, manage projects with escrow payments
          </p>
          <div className="flex gap-4">
            <Button asChild size="lg">
              <Link href="/login?redirect=/dashboard">Creator Login</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/demo">Watch Demo</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/payment">View Projects</Link>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
