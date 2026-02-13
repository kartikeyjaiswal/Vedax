import Link from 'next/link';

export default function Navbar() {
    return (
        <nav className="fixed w-full z-50 bg-background/80 backdrop-blur-md border-b border-primary/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="text-2xl font-bold text-primary flex items-center gap-2">
                            <span>🌿</span>
                            <span>Vedax</span>
                        </Link>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            <Link href="/learn" className="hover:text-primary transition-colors px-3 py-2 rounded-md text-sm font-medium">
                                Learn
                            </Link>
                            <Link href="/challenges" className="hover:text-primary transition-colors px-3 py-2 rounded-md text-sm font-medium">
                                Challenges
                            </Link>
                            <Link href="/leaderboard" className="hover:text-primary transition-colors px-3 py-2 rounded-md text-sm font-medium">
                                Leaderboard
                            </Link>
                        </div>
                    </div>
                    <div>
                        <Link href="/login" className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-full text-sm font-medium transition-colors">
                            Get Started
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
