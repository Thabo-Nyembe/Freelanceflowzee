import { Metadata } from 'next';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { PlayCircle } from 'lucide-react';

export const metadata: Metadata = {
    title: "Live Demo | KAZI",
    description: "Watch how KAZI transforms freelance businesses with AI, payments, and project management tools in action.",
};

export default function DemoPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <AuroraBackground className="h-[40vh] min-h-[300px]">
                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-20">
                    <Badge className="mb-4 bg-orange-100 text-orange-700 border-none px-4 py-1.5">
                        Watch KAZI in Action
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                        See How We Do It
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        A 2-minute walkthrough of the features that are changing the game for freelancers.
                    </p>
                </div>
            </AuroraBackground>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-12 relative z-20">
                {/* Video Placeholder */}
                <div className="aspect-video w-full bg-black rounded-2xl shadow-2xl overflow-hidden relative group cursor-pointer border-4 border-white dark:border-gray-800">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <PlayCircle className="w-10 h-10 text-white fill-white" />
                        </div>
                    </div>
                    {/* In a real app, embed YouTube/Vimeo/Mux here */}
                    <div className="absolute bottom-8 left-8 text-white">
                        <h3 className="text-2xl font-bold">The KAZI Walkthrough</h3>
                        <p className="opacity-80">Hosted by our Product Lead</p>
                    </div>
                </div>

                {/* Schedule Section */}
                <div className="mt-20 grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Want a personal tour?</h2>
                        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                            Our team is happy to show you around and answer specific questions about how KAZI fits your workflow.
                        </p>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold">1</div>
                                <div>
                                    <h4 className="font-semibold">Workflow Audit</h4>
                                    <p className="text-gray-500">We'll look at your current tools and spending.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">2</div>
                                <div>
                                    <h4 className="font-semibold">Custom Demo</h4>
                                    <p className="text-gray-500">See the exact features relevant to your industry.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold">3</div>
                                <div>
                                    <h4 className="font-semibold">Migration Plan</h4>
                                    <p className="text-gray-500">We'll show you how to move your data in minutes.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 text-center">
                        <h3 className="text-xl font-bold mb-6">Book a Live Session</h3>
                        {/* Embed Scheduler Widget Here */}
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg h-12">
                            Schedule 30 Minutes
                        </Button>
                        <p className="mt-4 text-sm text-gray-500">No pressure, just a friendly chat.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
