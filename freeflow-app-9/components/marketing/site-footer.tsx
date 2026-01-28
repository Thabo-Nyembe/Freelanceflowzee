import Link from 'next/link'
import { Sparkles, Linkedin, Twitter, Github, ArrowUpRight } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

export function SiteFooter() {
    return (
        <footer className="bg-black text-white py-24 border-t border-white/10 relative overflow-hidden">
            <div className="max-w-[1400px] mx-auto px-6 sm:px-8 relative z-10">
                {/* Massive Architectural Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20">
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                            <span className="text-blue-500 font-mono text-sm tracking-widest uppercase">System Status: Operational</span>
                        </div>
                        <h2 className="text-[12vw] leading-[0.8] font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 select-none">
                            KAZI
                        </h2>
                    </div>
                    <div className="mt-10 md:mt-0 flex flex-col items-start md:items-end">
                        <p className="text-xl md:text-2xl font-light text-white/60 max-w-md text-left md:text-right leading-relaxed">
                            The operating system for the modern creative economy. Built for speed, designed for scale.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8 mb-24 border-t border-white/10 pt-16">
                    <div className="space-y-6">
                        <h3 className="font-mono text-xs uppercase tracking-widest text-white/40 mb-8">Product</h3>
                        <FooterLink href="/features">Features</FooterLink>
                        <FooterLink href="/pricing">Pricing</FooterLink>
                        <FooterLink href="/demo-features">Live Demo</FooterLink>
                        <FooterLink href="/roadmap">Changelog</FooterLink>
                    </div>

                    <div className="space-y-6">
                        <h3 className="font-mono text-xs uppercase tracking-widest text-white/40 mb-8">Solutions</h3>
                        <FooterLink href="/for/freelance-designers">Designers</FooterLink>
                        <FooterLink href="/for/agencies">Agencies</FooterLink>
                        <FooterLink href="/for/writers">Writers</FooterLink>
                        <FooterLink href="/for/video-creators">Video Pros</FooterLink>
                    </div>

                    <div className="space-y-6">
                        <h3 className="font-mono text-xs uppercase tracking-widest text-white/40 mb-8">Compare</h3>
                        <FooterLink href="/compare/kazi-vs-upwork">vs Upwork</FooterLink>
                        <FooterLink href="/compare/kazi-vs-fiverr">vs Fiverr</FooterLink>
                        <FooterLink href="/compare/kazi-vs-monday">vs Monday</FooterLink>
                        <FooterLink href="/compare/kazi-vs-clickup">vs ClickUp</FooterLink>
                    </div>

                    <div className="space-y-6">
                        <h3 className="font-mono text-xs uppercase tracking-widest text-white/40 mb-8">Connect</h3>
                        <div className="flex gap-4">
                            <SocialLink href="#" icon={<Twitter className="w-5 h-5" />} />
                            <SocialLink href="#" icon={<Linkedin className="w-5 h-5" />} />
                            <SocialLink href="#" icon={<Github className="w-5 h-5" />} />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center text-white/40 text-sm gap-4 border-t border-white/10 pt-8 font-mono">
                    <p>© 2025 KAZI. Engineered in South Africa 🇿🇦</p>
                    <div className="flex gap-8">
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                        <Link href="/security" className="hover:text-white transition-colors">Security</Link>
                    </div>
                </div>
            </div>

            {/* Ambient Background Glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-blue-900/20 blur-[120px] pointer-events-none" />
        </footer>
    )
}

const FooterLink = ({ href, children }: { href: string, children: React.ReactNode }) => (
    <Link href={href} className="group flex items-center gap-2 text-white/60 hover:text-white transition-colors duration-200">
        <span className="text-lg">{children}</span>
        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1 group-hover:-translate-y-1 text-blue-400" />
    </Link>
)

const SocialLink = ({ href, icon }: { href: string, icon: React.ReactNode }) => (
    <Link href={href} className="w-10 h-10 flex items-center justify-center rounded-full border border-white/10 hover:bg-white hover:text-black hover:border-white transition-all duration-300">
        {icon}
    </Link>
)
