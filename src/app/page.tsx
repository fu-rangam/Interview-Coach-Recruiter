import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function Home() {
    return (
        <div className="flex flex-col items-center justify-between min-h-[100dvh] bg-background font-sans p-6 md:p-12">

            {/* Top Spacer / decorative (optional, can be empty) */}
            <div className="flex-1" />

            {/* Main Content */}
            <div className="w-full max-w-2xl flex flex-col items-center text-center space-y-12">

                {/* Brand Lockup */}
                <div className="flex flex-col items-center gap-1">

                    {/* Hero Logo (Orb) */}
                    <div className="relative w-24 h-24 mb-6 drop-shadow-2xl">
                        <Image
                            src="/r2w-logo.webp"
                            alt="Ready2Work Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>

                    <h1 className="text-6xl md:text-8xl font-bold tracking-tighter font-display pb-4 leading-none select-none">
                        <span className="text-[#3b82f6]">Ready</span>
                        <span className="text-[#F95500]">2</span>
                        <span className="text-brand-deep">Work</span>
                    </h1>

                    {/* Tagline Lockup */}
                    <div className="flex flex-row items-center justify-center gap-[0.4rem] text-lg md:text-xl text-muted-foreground/80 font-medium tracking-wide">
                        <span className="uppercase text-md md:text-base tracking-[0.2em] opacity-80 translate-y-[1px]">
                            Workforce Readiness Powered By
                        </span>
                        <div className="relative h-5 w-20 md:h-6 md:w-24">
                            <Image
                                src="/rangam-logo.webp"
                                alt="Rangam"
                                fill
                                className="object-contain"
                            />
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="w-full max-w-sm space-y-8">
                    <Link href="/recruiter" className="w-full block">
                        <Button className="w-full h-14 text-lg rounded-full shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 hover:-translate-y-0.5 transition-all" size="lg">
                            Continue as Recruiter
                        </Button>
                    </Link>

                    <div className="space-y-4 pt-4">
                        <div className="flex items-center gap-4 text-xs font-medium uppercase tracking-widest text-muted-foreground/60 w-full">
                            <span className="h-px bg-border flex-1" />
                            <span>Candidate Access</span>
                            <span className="h-px bg-border flex-1" />
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                            Candidates must use the unique invitation link sent to their email.
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom Spacer */}
            <div className="flex-1" />

        </div>
    );
}
