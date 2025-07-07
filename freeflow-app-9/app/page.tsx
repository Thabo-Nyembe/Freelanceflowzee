import { Metadata } from "next";
import { HomePageClient } from "@/app/home-page-client";

export const metadata: Metadata = {
  title: "FreeflowZee - AI-Powered Creative Platform",
  description: "Generate creative assets with AI, share files like WeTransfer, manage projects with escrow payments, and build your creative business - all in one revolutionary platform.",
  keywords: "AI, creative platform, file sharing, project management, escrow payments, freelance",
  authors: [{ name: "FreeflowZee Team" }],
  creator: "FreeflowZee"
};

export default function Home() {
  return <HomePageClient />;
}
